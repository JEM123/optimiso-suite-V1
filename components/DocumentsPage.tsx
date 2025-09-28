import React, { useState, useMemo, useEffect } from 'react';
import type { Document, ValidationInstance } from '../types';
import { Plus, Search, Trash2, Edit, FileText, Link as LinkIcon, Download, FileSpreadsheet } from 'lucide-react';
import DocumentDetailPanel from './DocumentDetailPanel';
import DocumentFormModal from './DocumentFormModal';
import { useDataContext, useAppContext, usePermissions } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

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

const DOC_STATUS_COLORS: Record<Document['statut'], string> = {
    'brouillon': 'bg-gray-200 text-gray-800',
    'en_cours': 'bg-yellow-100 text-yellow-800',
    'valide': 'bg-green-100 text-green-800',
    'archive': 'bg-red-100 text-red-800',
    'à_créer': 'bg-cyan-100 text-cyan-800',
    'en_recrutement': 'bg-yellow-100 text-yellow-800',
    'gelé': 'bg-purple-100 text-purple-800',
    'figé': 'bg-indigo-100 text-indigo-800',
    'planifié': 'bg-blue-100 text-blue-800',
    'terminé': 'bg-green-100 text-green-800',
    'non-conforme': 'bg-red-200 text-red-900',
    'clôturé': 'bg-gray-300 text-gray-800',
    'a_faire': 'bg-yellow-100 text-yellow-800',
    'en_retard': 'bg-red-100 text-red-800',
    'en_validation': 'bg-yellow-100 text-yellow-800',
    'publie': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800',
};

const newDocumentTemplate = (user: any): Partial<Document> => ({
    nom: '', reference: '', statut: 'brouillon', source: 'Fichier',
    categorieIds: [], processusIds: [], entiteIds: [],
    version: 'v1.0',
    dateCreation: new Date(), dateModification: new Date(), auteurId: user.id
});

interface DocumentsPageProps {
    onShowValidation: (doc: Document) => void;
    onShowRelations: (entity: any, entityType: string) => void;
    notifiedItemId: string | null;
}

// --- MAIN PAGE COMPONENT ---
const DocumentsPage: React.FC<DocumentsPageProps> = ({ onShowValidation, onShowRelations, notifiedItemId }) => {
    const { data, actions } = useDataContext();
    const { user, clearNotifiedTarget } = useAppContext();
    const { can } = usePermissions();
    const { documents, categoriesDocuments } = data;
    
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Partial<Document> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ categorieId: string, statut: string }>({ categorieId: 'all', statut: 'all' });

    useEffect(() => {
        if (notifiedItemId) {
            const docToSelect = documents.find(d => d.id === notifiedItemId);
            if (docToSelect) {
                setSelectedDocument(docToSelect);
            }
            clearNotifiedTarget();
        }
    }, [notifiedItemId, documents, clearNotifiedTarget]);

    const filteredDocuments = useMemo(() => {
        return documents.filter(d => 
            (d.nom.toLowerCase().includes(searchTerm.toLowerCase()) || d.reference.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.categorieId === 'all' || d.categorieIds.includes(filters.categorieId)) &&
            (filters.statut === 'all' || d.statut === filters.statut)
        );
    }, [documents, searchTerm, filters]);

    const handleOpenModal = (doc?: Partial<Document>) => { 
        setEditingDocument(doc || newDocumentTemplate(user)); 
        setIsModalOpen(true); 
    };

    const handleSaveDocument = async (docToSave: Document) => {
        await actions.saveDocument(docToSave);
        setIsModalOpen(false); 
        setEditingDocument(null);
    };

    const handleDeleteDocument = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
            await actions.deleteDocument(id);
            if (selectedDocument?.id === id) setSelectedDocument(null);
        }
    };
    
    const handleSubmitForValidation = (doc: Document) => {
        if (window.confirm("Êtes-vous sûr de vouloir soumettre ce document pour validation ? Il ne sera plus modifiable.")) {
            const validationInstanceId = `val-${uuidv4()}`;
            const newValidationInstance: ValidationInstance = {
                id: validationInstanceId,
                fluxDefinitionId: 'flux-doc-simple',
                elementId: doc.id,
                elementModule: 'Documents',
                statut: 'En cours',
                etapeActuelle: 1,
                demandeurId: user.id,
                dateDemande: new Date(),
                historique: [],
            };
            actions.saveValidationInstance(newValidationInstance);
    
            const updatedDoc = { ...doc, statut: 'en_validation' as const, validationInstanceId: validationInstanceId };
            actions.saveDocument(updatedDoc);
            
            if (selectedDocument?.id === doc.id) {
                setSelectedDocument(updatedDoc);
            }
        }
    };
    
    const handleCreateNewVersion = (doc: Document) => {
        if (doc.statut !== 'publie' && doc.statut !== 'valide') {
            alert("Vous ne pouvez créer une nouvelle version qu'à partir d'un document publié ou validé.");
            return;
        }
        const majorVersion = parseInt(doc.version.match(/(\d+)/)?.[0] || '1') + 1;
        const newVersion: Partial<Document> = {
            ...JSON.parse(JSON.stringify(doc)), // Deep copy
            id: undefined, // Will be assigned on save
            originalId: doc.originalId || doc.id,
            nom: `${doc.nom.replace(/ \(v\d+\.\d+\)$/, '')}`,
            reference: `${doc.reference}-V${majorVersion}`,
            version: `v${majorVersion}.0`,
            statut: 'brouillon',
            validationInstanceId: undefined,
            versionHistory: [
                { version: doc.version, date: new Date(), authorId: doc.auteurId, notes: 'Version précédente.' },
                ...(doc.versionHistory || [])
            ],
            dateCreation: new Date(),
            dateModification: new Date(),
            auteurId: user.id,
        };
        handleOpenModal(newVersion);
    };

    const handleExportCsv = () => {
        const dataToExport = filteredDocuments.map(doc => ({
            Reference: doc.reference,
            Nom: doc.nom,
            Version: doc.version,
            Statut: doc.statut.replace(/_/g, ' '),
            Source: doc.source,
            DateEcheance: doc.champsLibres?.dateEcheance ? new Date(doc.champsLibres.dateEcheance).toLocaleDateString('fr-FR') : '',
            DateModification: doc.dateModification.toLocaleDateString('fr-FR'),
        }));
        exportToCsv('export_documents.csv', dataToExport);
    };
    
    return (
        <div className="flex h-[calc(100vh-150px)]">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b bg-white flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-gray-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                    </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModal()} disabled={!can('C', 'documents')} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:bg-blue-300 disabled:cursor-not-allowed"><Plus className="h-4 w-4" /><span>Nouveau Document</span></button>
                         <div className="relative group">
                            <button className="flex items-center space-x-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm"><Download className="h-4 w-4" /><span>Exporter</span></button>
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity z-10">
                                <button onClick={handleExportCsv} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm"><FileSpreadsheet className="h-4 w-4 text-green-600"/>Exporter la liste (CSV)</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-2 border-b bg-white flex flex-wrap items-center gap-2">
                    <div className="relative flex-grow max-w-xs"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                    <select onChange={e => setFilters(f => ({...f, categorieId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Toutes les catégories</option>{categoriesDocuments.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select>
                    <select onChange={e => setFilters(f => ({...f, statut: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les statuts</option>{Object.keys(DOC_STATUS_COLORS).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    <div className="bg-white border rounded-lg">
                        <table className="min-w-full">
                            <thead className="bg-gray-50"><tr>{['Titre', 'Version', 'Échéance', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredDocuments.map(doc => (
                                <tr key={doc.id} onClick={() => setSelectedDocument(doc)} className={`hover:bg-gray-50 cursor-pointer ${selectedDocument?.id === doc.id ? 'bg-blue-50' : ''}`}>
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{doc.nom}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{doc.version}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{doc.champsLibres?.dateEcheance ? new Date(doc.champsLibres.dateEcheance).toLocaleDateString('fr-FR') : '-'}</td>
                                    <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${DOC_STATUS_COLORS[doc.statut]}`}>{doc.statut.replace(/_/g, ' ')}</span></td>
                                    <td className="px-4 py-2"><div className="flex items-center space-x-2">
                                        <button onClick={(e) => { e.stopPropagation(); onShowRelations(doc, 'documents'); }} title="Voir les relations" className="p-1 hover:bg-gray-200 rounded"><LinkIcon className="h-4 w-4 text-gray-500"/></button>
                                        <button onClick={(e) => {e.stopPropagation(); handleOpenModal(doc)}} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                        <button onClick={(e) => {e.stopPropagation(); handleDeleteDocument(doc.id)}} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                                    </div></td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {selectedDocument && <DocumentDetailPanel document={selectedDocument} onClose={() => setSelectedDocument(null)} onEdit={handleOpenModal} onShowValidation={onShowValidation} onShowRelations={onShowRelations} onSubmitForValidation={handleSubmitForValidation} onCreateNewVersion={handleCreateNewVersion} />}
            <DocumentFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveDocument} document={editingDocument} />
        </div>
    );
};

export default DocumentsPage;