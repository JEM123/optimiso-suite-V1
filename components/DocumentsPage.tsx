import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Document, ValidationInstance } from '../types';
import { Plus, Search, Trash2, Edit, FileText, Link as LinkIcon, Eye } from 'lucide-react';
import DocumentDetailPanel from './DocumentDetailPanel';
import DocumentFormModal from './DocumentFormModal';
import { useDataContext, useAppContext, usePermissions } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import PageHeader from './PageHeader';

const DOC_STATUS_COLORS: Record<Document['statut'], string> = { 'brouillon': 'bg-gray-200 text-gray-800', 'en_cours': 'bg-yellow-100 text-yellow-800', 'valide': 'bg-green-100 text-green-800', 'archive': 'bg-red-100 text-red-800', 'à_créer': 'bg-cyan-100 text-cyan-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800', 'gelé': 'bg-purple-100 text-purple-800', 'figé': 'bg-indigo-100 text-indigo-800', 'planifié': 'bg-blue-100 text-blue-800', 'terminé': 'bg-green-100 text-green-800', 'non-conforme': 'bg-red-200 text-red-900', 'clôturé': 'bg-gray-300 text-gray-800', 'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-100 text-red-800', 'en_validation': 'bg-yellow-100 text-yellow-800', 'publie': 'bg-green-100 text-green-800', 'rejete': 'bg-red-100 text-red-800', };
const newDocumentTemplate = (user: any): Partial<Document> => ({ nom: '', reference: '', statut: 'brouillon', source: 'Fichier', categorieIds: [], processusIds: [], entiteIds: [], version: 'v1.0', dateCreation: new Date(), dateModification: new Date(), auteurId: user.id });

interface DocumentsPageProps {
    onShowValidation: (doc: Document) => void;
    onShowRelations: (entity: any, entityType: string) => void;
    notifiedItemId: string | null;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ onShowValidation, onShowRelations, notifiedItemId }) => {
    const { data, actions } = useDataContext();
    const { user, clearNotifiedTarget } = useAppContext();
    const { can } = usePermissions();
    const { documents, categoriesDocuments } = data;
    
    const [viewMode, setViewMode] = useState<'list-fiche' | 'list'>('list-fiche');
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Partial<Document> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ categorieId: string, statut: string }>({ categorieId: 'all', statut: 'all' });
    
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dividerPosition, setDividerPosition] = useState(40);

    useEffect(() => {
        if (notifiedItemId) {
            const docToSelect = (documents as Document[]).find(d => d.id === notifiedItemId);
            if (docToSelect) {
                setSelectedDocument(docToSelect);
                setViewMode('list-fiche');
            }
            clearNotifiedTarget();
        }
    }, [notifiedItemId, documents, clearNotifiedTarget]);

    const filteredDocuments = useMemo(() => {
        return (documents as Document[]).filter(d => 
            (d.nom.toLowerCase().includes(searchTerm.toLowerCase()) || d.reference.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.categorieId === 'all' || d.categorieIds.includes(filters.categorieId)) &&
            (filters.statut === 'all' || d.statut === filters.statut)
        );
    }, [documents, searchTerm, filters]);

    const handleOpenModal = (doc?: Partial<Document>) => { setEditingDocument(doc || newDocumentTemplate(user)); setIsModalOpen(true); };
    const handleSaveDocument = async (docToSave: Document) => {
        await actions.saveDocument(docToSave);
        if (selectedDocument?.id === docToSave.id) setSelectedDocument(docToSave);
        setIsModalOpen(false); 
    };
    const handleDeleteDocument = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
            await actions.deleteDocument(id);
            if (selectedDocument?.id === id) setSelectedDocument(null);
        }
    };
    const handleSubmitForValidation = (doc: Document) => {
        if (window.confirm("Soumettre pour validation ? Le document sera verrouillé.")) {
            const validationInstanceId = `val-${uuidv4()}`;
            const newValidationInstance: ValidationInstance = { id: validationInstanceId, fluxDefinitionId: 'flux-doc-simple', elementId: doc.id, elementModule: 'Documents', statut: 'En cours', etapeActuelle: 1, demandeurId: user.id, dateDemande: new Date(), historique: [], };
            actions.saveValidationInstance(newValidationInstance);
            const updatedDoc = { ...doc, statut: 'en_validation' as const, validationInstanceId };
            actions.saveDocument(updatedDoc);
            if (selectedDocument?.id === doc.id) setSelectedDocument(updatedDoc);
        }
    };
    const handleCreateNewVersion = (doc: Document) => {
        const majorVersion = parseInt(doc.version.match(/(\d+)/)?.[0] || '1') + 1;
        const newVersion: Partial<Document> = { ...JSON.parse(JSON.stringify(doc)), id: undefined, originalId: doc.originalId || doc.id, nom: `${doc.nom.replace(/ \(v\d+\.\d+\)$/, '')}`, reference: `${doc.reference}-V${majorVersion}`, version: `v${majorVersion}.0`, statut: 'brouillon', validationInstanceId: undefined, versionHistory: [{ version: doc.version, date: new Date(), authorId: doc.auteurId, notes: 'Version précédente.' }, ...(doc.versionHistory || [])], dateCreation: new Date(), dateModification: new Date(), auteurId: user.id, };
        handleOpenModal(newVersion);
    };

    const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); setIsResizing(true); };
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const newPos = ((e.clientX - rect.left) / rect.width) * 100;
            if (newPos > 20 && newPos < 80) { setDividerPosition(newPos); }
        }
    }, [isResizing]);
    const handleMouseUp = useCallback(() => setIsResizing(false), []);
    
    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);
    
    const listPanel = (
        <div className="bg-white flex flex-col h-full border-r">
            <div className="p-2 border-b flex flex-wrap items-center gap-2">
                <div className="relative flex-grow max-w-xs"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                <select onChange={e => setFilters(f => ({...f, categorieId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Toutes les catégories</option>{(categoriesDocuments as any[]).map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select>
                <select onChange={e => setFilters(f => ({...f, statut: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les statuts</option>{Object.keys(DOC_STATUS_COLORS).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0"><tr>{['Titre', 'Version', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredDocuments.map(doc => (
                        <tr key={doc.id} onClick={() => setSelectedDocument(doc)} className={`hover:bg-gray-50 cursor-pointer ${selectedDocument?.id === doc.id ? 'bg-blue-50' : ''}`}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{doc.nom}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{doc.version}</td>
                            <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${DOC_STATUS_COLORS[doc.statut]}`}>{doc.statut.replace(/_/g, ' ')}</span></td>
                            <td className="px-4 py-2"><div className="flex items-center space-x-2">
                                <button onClick={(e) => { e.stopPropagation(); onShowRelations(doc, 'documents'); }} title="Voir les relations" className="p-1 hover:bg-gray-200 rounded"><LinkIcon className="h-4 w-4 text-gray-500"/></button>
                                <button onClick={(e) => {e.stopPropagation(); handleOpenModal(doc)}} className="p-1 hover:bg-gray-200 rounded" disabled={!can('U', 'documents')}><Edit className="h-4 w-4 text-blue-600"/></button>
                                <button onClick={(e) => {e.stopPropagation(); handleDeleteDocument(doc.id)}} className="p-1 hover:bg-gray-200 rounded" disabled={!can('D', 'documents')}><Trash2 className="h-4 w-4 text-red-600"/></button>
                            </div></td>
                        </tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="Documents" icon={FileText}
                actions={[
                    { label: 'Nouveau Document', icon: Plus, onClick: () => handleOpenModal(), variant: 'primary', disabled: !can('C', 'documents') },
                    { label: viewMode === 'list' ? 'Liste + Fiche' : 'Liste', icon: Eye, onClick: () => setViewMode(v => v === 'list' ? 'list-fiche' : 'list'), variant: 'secondary' }
                ]}
            />
            <div ref={containerRef} className="flex-1 flex overflow-hidden">
                {viewMode === 'list' && <div className="w-full h-full">{listPanel}</div>}
                {viewMode === 'list-fiche' && (
                    <>
                        <div style={{ width: `${dividerPosition}%` }} className="h-full flex-shrink-0">{listPanel}</div>
                        <div onMouseDown={handleMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors flex-shrink-0" />
                        <div style={{ width: `${100 - dividerPosition}%` }} className="h-full flex-shrink-0 overflow-y-auto">
                            {selectedDocument ? (
                                <DocumentDetailPanel document={selectedDocument} onClose={() => setSelectedDocument(null)} onEdit={handleOpenModal} onShowValidation={onShowValidation} onShowRelations={onShowRelations} onSubmitForValidation={handleSubmitForValidation} onCreateNewVersion={handleCreateNewVersion} />
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-gray-500 bg-white"><p>Sélectionnez un document pour voir ses détails.</p></div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <DocumentFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveDocument} document={editingDocument} />
        </div>
    );
};

export default DocumentsPage;
