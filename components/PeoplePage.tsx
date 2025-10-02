import React, { useState, useMemo } from 'react';
import type { Personne, Poste, ValidationError } from '../types';
import { Plus, Search, Trash2, Edit, Users, Link as LinkIcon, Download, FileSpreadsheet, Upload } from 'lucide-react';
import PersonDetailPanel from './PersonDetailPanel';
import PersonFormModal from './PersonFormModal';
import { useDataContext, useAppContext } from '../context/AppContext';
import ImportModal from './ImportModal';
import { generateExcelTemplate } from '../utils/importUtils';
import { v4 as uuidv4 } from 'uuid';

const exportToCsv = (filename: string, rows: object[]) => {
    if (!rows || rows.length === 0) {
        alert("Aucune donnée à exporter.");
        return;
    }
    const separator = ';';
    const keys = Object.keys(rows[0]);
    const csvContent =
        keys.join(separator) +
        '\n' +
        rows.map(row => {
            return keys.map(k => {
                let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
                cell = String(cell).replace(/"/g, '""');
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(separator);
        }).join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const PERSON_STATUS_COLORS: Record<Personne['statut'], string> = {
    'brouillon': 'bg-gray-200 text-gray-800', 'en_cours': 'bg-yellow-100 text-yellow-800',
    'valide': 'bg-green-100 text-green-800', 'archive': 'bg-red-100 text-red-800',
    'à_créer': 'bg-cyan-100 text-cyan-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800',
    'gelé': 'bg-purple-100 text-purple-800', 'figé': 'bg-indigo-100 text-indigo-800',
    'planifié': 'bg-blue-100 text-blue-800', 'terminé': 'bg-green-100 text-green-800',
    'non-conforme': 'bg-red-200 text-red-900', 'clôturé': 'bg-gray-300 text-gray-800',
    'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-100 text-red-800',
    'en_validation': 'bg-yellow-100 text-yellow-800',
    'publie': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800',
};

interface PeoplePageProps {
    onShowRelations: (entity: any, entityType: string) => void;
    setActiveModule: (moduleId: string) => void;
}

const PeoplePage: React.FC<PeoplePageProps> = ({ onShowRelations, setActiveModule }) => {
    const { data, actions } = useDataContext();
    const { user } = useAppContext();
    const { personnes } = data;

    const [selectedPerson, setSelectedPerson] = useState<Personne | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Partial<Personne> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ profil: string, statut: string }>({ profil: 'all', statut: 'all' });
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);


    const filteredPeople = useMemo(() => {
        return (personnes as Personne[]).filter(p => 
            (p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) || p.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.profil === 'all' || p.profil === filters.profil) &&
            (filters.statut === 'all' || p.statut === filters.statut)
        );
    }, [personnes, searchTerm, filters]);

    const handleOpenModal = (person?: Personne) => { 
        setEditingPerson(person || {}); 
        setIsModalOpen(true); 
    };

    const handleSavePerson = async (personToSave: Personne) => {
        await actions.savePerson(personToSave);
        setIsModalOpen(false);
    };

    const handleDeletePerson = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette personne ?")) {
            await actions.deletePerson(id);
            if (selectedPerson?.id === id) setSelectedPerson(null);
        }
    };
    
    const handleExportCsv = () => {
        const dataToExport = filteredPeople.map(person => ({
            Reference: person.reference,
            Prenom: person.prenom,
            Nom: person.nom,
            Email: person.email,
            Profil: person.profil,
            Statut: person.statut,
        }));
        exportToCsv('export_personnes.csv', dataToExport);
    };

    // --- IMPORT LOGIC ---
    const handleGenerateTemplate = () => {
        const headers = ["reference", "nom", "prenom", "email", "profil", "poste_references"];
        const exampleRow = ["LBE", "Bernard", "Lucie", "lucie.bernard@entreprise.com", "lecteur", "COMPTA-1,RH-SPEC"];
        generateExcelTemplate("template_personnes.xlsx", headers, [exampleRow]);
    };

    const handleValidateData = (dataToValidate: any[]): ValidationError[] => {
        const errors: ValidationError[] = [];
        const { postes } = data;
        const existingPosteRefs = new Set((postes as Poste[]).map(p => p.reference));
        const validProfils = ['administrateur', 'editeur', 'acteur', 'lecteur'];

        dataToValidate.forEach((row, index) => {
            if (!row.nom) errors.push({ row: index + 2, column: 'nom', message: 'Le nom est obligatoire.' });
            if (!row.prenom) errors.push({ row: index + 2, column: 'prenom', message: 'Le prénom est obligatoire.' });
            if (!row.email) errors.push({ row: index + 2, column: 'email', message: 'L\'email est obligatoire.' });
            if (row.profil && !validProfils.includes(row.profil)) {
                errors.push({ row: index + 2, column: 'profil', message: `Profil invalide. Doit être l'un de : ${validProfils.join(', ')}` });
            }
            if (row.poste_references) {
                const posteRefs = String(row.poste_references).split(',').map(ref => ref.trim());
                for (const ref of posteRefs) {
                    if (!existingPosteRefs.has(ref)) {
                        errors.push({ row: index + 2, column: 'poste_references', message: `Le poste avec la référence '${ref}' n'existe pas.` });
                    }
                }
            }
        });
        return errors;
    };

    const handleImportData = async (dataToImport: any[]): Promise<{ created: number, updated: number, errors: number }> => {
        let created = 0;
        const { postes } = data;
        const posteRefMap = new Map((postes as Poste[]).map(p => [p.reference, p.id]));

        for (const row of dataToImport) {
            const posteIds = row.poste_references
                ? String(row.poste_references).split(',').map(ref => posteRefMap.get(ref.trim())).filter(Boolean)
                : [];
            
            const newPersonne: Personne = {
                id: uuidv4(),
                reference: row.reference || `${row.nom.substring(0,1)}${row.prenom.substring(0,2)}`.toUpperCase(),
                nom: row.nom,
                prenom: row.prenom,
                email: row.email,
                profil: row.profil || 'lecteur',
                posteIds: posteIds as string[],
                entiteIds: [],
                roleIds: [],
                synchroniseAzureAD: false,
                statut: 'valide',
                dateCreation: new Date(),
                dateModification: new Date(),
                auteurId: user.id,
            };
            await actions.savePerson(newPersonne);
            created++;
        }
        return { created, updated: 0, errors: 0 };
    };

    return (
        <div className="flex h-[calc(100vh-150px)]">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b bg-white flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                        <Users className="h-8 w-8 text-gray-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Personnes</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium"><Plus className="h-4 w-4" /><span>Ajouter</span></button>
                        <button onClick={() => setIsImportModalOpen(true)} className="flex items-center space-x-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm"><Upload className="h-4 w-4"/>Importer</button>
                         <div className="relative group">
                            <button className="flex items-center space-x-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm"><Download className="h-4 w-4" /><span>Exporter</span></button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity z-10">
                                <button onClick={handleExportCsv} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm"><FileSpreadsheet className="h-4 w-4 text-green-600"/>Exporter la liste (CSV)</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-2 border-b bg-white flex flex-wrap items-center gap-2">
                    <div className="relative flex-grow max-w-xs"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                    <select onChange={e => setFilters(f => ({...f, profil: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les profils</option>{['administrateur', 'editeur', 'acteur', 'lecteur'].map((p: string) => <option key={p} value={p}>{p}</option>)}</select>
                    <select onChange={e => setFilters(f => ({...f, statut: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les statuts</option>{Object.keys(PERSON_STATUS_COLORS).map((s: string) => <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>)}</select>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    <div className="bg-white border rounded-lg">
                        <table className="min-w-full">
                            <thead className="bg-gray-50"><tr>{['Nom', 'Email', 'Profil', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPeople.map(person => (
                                <tr key={person.id} onClick={() => setSelectedPerson(person)} className={`hover:bg-gray-50 cursor-pointer ${selectedPerson?.id === person.id ? 'bg-blue-50' : ''}`}>
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{person.prenom} {person.nom}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{person.email}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500 capitalize">{person.profil}</td>
                                    <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${PERSON_STATUS_COLORS[person.statut]}`}>{person.statut.replace(/_/g, ' ')}</span></td>
                                    <td className="px-4 py-2"><div className="flex items-center space-x-2">
                                        <button onClick={(e) => { e.stopPropagation(); onShowRelations(person, 'personnes'); }} title="Voir les relations" className="p-1 hover:bg-gray-200 rounded"><LinkIcon className="h-4 w-4 text-gray-500"/></button>
                                        <button onClick={(e) => {e.stopPropagation(); handleOpenModal(person)}} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                        <button onClick={(e) => {e.stopPropagation(); handleDeletePerson(person.id)}} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                                    </div></td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {selectedPerson && <PersonDetailPanel person={selectedPerson} onClose={() => setSelectedPerson(null)} onEdit={handleOpenModal} onNavigate={setActiveModule} onShowRelations={onShowRelations}/>}
            <PersonFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSavePerson} person={editingPerson} />
            <ImportModal
                moduleName="Personnes"
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onGenerateTemplate={handleGenerateTemplate}
                onValidate={handleValidateData}
                onImport={handleImportData}
            />
        </div>
    );
};

export default PeoplePage;