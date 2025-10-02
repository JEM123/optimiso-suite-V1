

import React, { useState, useMemo, useEffect } from 'react';
import { mockData } from '../constants';
import type { Poste, Entite, Personne, Competence, Role, RACI, OccupationHistory } from '../types';
import { Users, Edit, Plus, ChevronDown, List, Workflow, Search, Trash2, Briefcase, Info, BookOpen, UserCheck, Link as LinkIcon, Download, X, History, Building, FileSpreadsheet, Image } from 'lucide-react';
import PosteDetailPanel from './PosteDetailPanel';
import { PosteFormModal } from './PosteFormModal';

// --- UTILITY FUNCTIONS & CONSTANTS ---

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

const buildPosteTree = (postes: Poste[], parentId?: string): (Poste & { children: any[] })[] => {
  return postes
    .filter(poste => poste.posteParentId === parentId)
    .map(poste => ({ ...poste, children: buildPosteTree(postes, poste.id) }));
};

const POST_STATUS_COLORS: Record<Poste['statut'], string> = {
    'brouillon': 'bg-gray-100 text-gray-800',
    'valide': 'bg-green-100 text-green-800',
    'archive': 'bg-red-100 text-red-800',
    'à_créer': 'bg-blue-100 text-blue-800',
    'en_recrutement': 'bg-yellow-100 text-yellow-800',
    'gelé': 'bg-purple-100 text-purple-800',
    'en_cours': 'bg-yellow-100 text-yellow-800',
    'figé': 'bg-indigo-100 text-indigo-800',
    'planifié': 'bg-cyan-100 text-cyan-800',
    'terminé': 'bg-green-100 text-green-800',
    'non-conforme': 'bg-red-200 text-red-900',
    'clôturé': 'bg-gray-300 text-gray-800',
    'a_faire': 'bg-yellow-100 text-yellow-800',
    'en_retard': 'bg-red-200 text-red-900',
    'en_validation': 'bg-yellow-100 text-yellow-800',
    'publie': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800',
};

const newPostTemplate = (parentId?: string, entiteId?: string): Partial<Poste> => ({
    intitule: '',
    reference: '',
    mission: '',
    entiteId: entiteId || '',
    posteParentId: parentId,
    occupantsIds: [],
    effectifCible: 1,
    statut: 'brouillon',
    confidentialite: 'publique',
    dateCreation: new Date(),
    dateModification: new Date(),
    auteurId: 'pers-1'
});

interface PostesPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
}

// --- SUB-COMPONENTS ---

const PosteNode: React.FC<{ node: Poste & { children: any[] }; onSelect: (p: Poste) => void; selectedId?: string; }> = ({ node, onSelect, selectedId }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const occupants = mockData.personnes.filter(p => node.occupantsIds.includes(p.id));
    return (
        <div className="relative pl-8 py-1">
            <div className="absolute top-0 left-4 w-px h-full bg-gray-200"></div>
            <div className="absolute top-1/2 left-4 w-4 h-px bg-gray-200"></div>
            <div className="flex items-center space-x-2 relative group">
                <div onClick={() => onSelect(node)} className={`flex-grow p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 flex items-center ${node.confidentialite === 'restreinte' ? 'border-red-500' : 'border-blue-500'} ${selectedId === node.id ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-white'}`}>
                    <Briefcase className="h-5 w-5 mx-2 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{node.intitule}</p>
                        <div className="flex items-center text-xs text-gray-500"><Users className="h-3 w-3 mr-1" /><span>{occupants.length} / {node.effectifCible}</span></div>
                    </div>
                    {node.children.length > 0 && <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="ml-2 text-gray-400 hover:text-gray-700 p-1"><ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} /></button>}
                </div>
            </div>
            {isExpanded && node.children.length > 0 && <div className="mt-1">{node.children.map(child => <PosteNode key={child.id} node={child} onSelect={onSelect} selectedId={selectedId}/>)}</div>}
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---

export const PostesPage: React.FC<PostesPageProps> = ({ onShowRelations }) => {
    const [view, setView] = useState<'list' | 'organigram'>('list');
    const [selectedPoste, setSelectedPoste] = useState<Poste | null>(null);
    const [postes, setPostes] = useState<Poste[]>(mockData.postes);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ entiteId: string, statut: string }>({ entiteId: 'all', statut: 'all' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPoste, setEditingPoste] = useState<Partial<Poste> | null>(null);

    const posteTree = useMemo(() => buildPosteTree(postes), [postes]);
    
    const filteredPostes = useMemo(() => {
        return postes.filter(p => 
            (p.intitule.toLowerCase().includes(searchTerm.toLowerCase()) || (p.reference && p.reference.toLowerCase().includes(searchTerm.toLowerCase()))) &&
            (filters.entiteId === 'all' || p.entiteId === filters.entiteId) &&
            (filters.statut === 'all' || p.statut === filters.statut)
        );
    }, [postes, searchTerm, filters]);

    const handleOpenModal = (poste?: Poste) => {
        setEditingPoste(poste || newPostTemplate());
        setIsModalOpen(true);
    };

    const handleSavePoste = (posteToSave: Poste) => {
        if (posteToSave.id) {
            setPostes(postes.map(p => p.id === posteToSave.id ? { ...p, ...posteToSave, dateModification: new Date() } : p));
        } else {
            setPostes([...postes, { ...posteToSave, id: `pos-${Date.now()}`, reference: posteToSave.reference || `P${Date.now()}` } as Poste]);
        }
        setIsModalOpen(false);
        setEditingPoste(null);
    };

    const handleDeletePoste = (id: string) => {
        setPostes(postes.filter(p => p.id !== id));
        if(selectedPoste?.id === id) setSelectedPoste(null);
    };
    
    const handleExportCsv = () => {
        const dataToExport = filteredPostes.map(poste => {
            const entite = mockData.entites.find(e => e.id === poste.entiteId);
            const occupants = mockData.personnes.filter(p => poste.occupantsIds.includes(p.id));
            return {
                Intitule: poste.intitule,
                Reference: poste.reference,
                Entite: entite?.nom || '',
                Occupants: occupants.map(o => `${o.prenom} ${o.nom}`).join(', '),
                Effectif_Cible: poste.effectifCible,
                Statut: poste.statut.replace(/_/g, ' '),
            };
        });
        exportToCsv('export_postes.csv', dataToExport);
    };
    
    const handleExportPng = () => {
        alert("La fonctionnalité d'export PNG est en cours de développement.");
    };

    return (
        <div className="flex flex-col md:flex-row bg-gray-50 h-[calc(100vh-150px)] rounded-lg border relative overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b bg-white flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                         <div className="flex items-center space-x-3">
                            <Briefcase className="h-8 w-8 text-gray-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Postes</h1>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={() => setView('list')} className={`px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><List className="h-4 w-4"/>Liste</button>
                            <button onClick={() => setView('organigram')} className={`px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 ${view === 'organigram' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><Workflow className="h-4 w-4"/>Organigramme</button>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium"><Plus className="h-4 w-4" /><span>Ajouter un poste</span></button>
                        <div className="relative group">
                            <button className="flex items-center space-x-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm"><Download className="h-4 w-4" /><span>Exporter</span></button>
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity z-10">
                                <button onClick={handleExportCsv} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm"><FileSpreadsheet className="h-4 w-4 text-green-600"/>Exporter la liste (CSV)</button>
                                {view === 'organigram' && 
                                    <button onClick={handleExportPng} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm"><Image className="h-4 w-4 text-blue-600"/>Exporter l'arbre (PNG)</button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                 {view === 'list' && (
                    <div className="p-2 border-b bg-white flex flex-wrap items-center gap-2">
                        <div className="relative flex-grow max-w-xs"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                        <select onChange={e => setFilters(f => ({...f, entiteId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Toutes les entités</option>{mockData.entites.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}</select>
                        <select onChange={e => setFilters(f => ({...f, statut: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les statuts</option>{Object.keys(POST_STATUS_COLORS).map(s => <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>)}</select>
                    </div>
                )}
                <div className="flex-1 overflow-auto p-4">
                    {view === 'organigram' && posteTree.map(rootNode => <PosteNode key={rootNode.id} node={rootNode} onSelect={setSelectedPoste} selectedId={selectedPoste?.id} />)}
                    {view === 'list' && (
                        <div className="bg-white border rounded-lg">
                            <table className="min-w-full">
                                <thead className="bg-gray-50"><tr>{['Intitulé', 'Entité', 'Occupants', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredPostes.map(poste => {
                                        const entite = mockData.entites.find(e => e.id === poste.entiteId);
                                        return (
                                            <tr key={poste.id} onClick={() => setSelectedPoste(poste)} className={`hover:bg-gray-50 cursor-pointer ${selectedPoste?.id === poste.id ? 'bg-blue-50' : ''}`}>
                                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{poste.intitule}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{entite?.nom || '-'}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{poste.occupantsIds.length} / {poste.effectifCible}</td>
                                                <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs rounded-full capitalize ${POST_STATUS_COLORS[poste.statut]}`}>{poste.statut.replace(/_/g, ' ')}</span></td>
                                                <td className="px-4 py-2"><div className="flex items-center space-x-2">
                                                    <button onClick={(e) => { e.stopPropagation(); onShowRelations(poste, 'postes') }} title="Voir les relations" className="p-1 hover:bg-gray-200 rounded"><LinkIcon className="h-4 w-4 text-gray-500"/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(poste); }} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeletePoste(poste.id); }} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                                                </div></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            {selectedPoste && <PosteDetailPanel poste={selectedPoste} onClose={() => setSelectedPoste(null)} onEdit={handleOpenModal} onShowRelations={onShowRelations} />}
            <PosteFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSavePoste} poste={editingPoste} />
        </div>
    );
};

export default PostesPage;