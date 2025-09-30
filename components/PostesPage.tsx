import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useDataContext, usePermissions, useAppContext } from '../context/AppContext';
import type { Poste, Entite } from '../types';
import { Plus, Search, Trash2, Edit, Briefcase, Eye } from 'lucide-react';
import PosteDetailPanel from './PosteDetailPanel';
import { PosteFormModal } from './PosteFormModal';
import PageHeader from './PageHeader';

const POST_STATUS_COLORS: Record<Poste['statut'], string> = { 'brouillon': 'bg-gray-100 text-gray-800', 'valide': 'bg-green-100 text-green-800', 'archive': 'bg-red-100 text-red-800', 'à_créer': 'bg-blue-100 text-blue-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800', 'gelé': 'bg-purple-100 text-purple-800', 'en_cours': 'bg-yellow-100 text-yellow-800', 'figé': 'bg-indigo-100 text-indigo-800', 'planifié': 'bg-cyan-100 text-cyan-800', 'terminé': 'bg-green-100 text-green-800', 'non-conforme': 'bg-red-200 text-red-900', 'clôturé': 'bg-gray-300 text-gray-800', 'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-200 text-red-900', 'en_validation': 'bg-yellow-100 text-yellow-800', 'publie': 'bg-green-100 text-green-800', 'rejete': 'bg-red-100 text-red-800', };
const newPostTemplate = (): Partial<Poste> => ({ intitule: '', reference: '', mission: '', entiteId: '', occupantsIds: [], effectifCible: 1, statut: 'brouillon', confidentialite: 'publique', dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1' });

interface PostesPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
    onShowImpactAnalysis: (entity: any, entityType: string) => void;
}

const PostesPage: React.FC<PostesPageProps> = ({ onShowRelations, onShowImpactAnalysis }) => {
    const { data, actions } = useDataContext();
    const { setActiveModule } = useAppContext();
    const { can } = usePermissions();
    const { postes, entites } = data as { postes: Poste[], entites: Entite[] };

    const [viewMode, setViewMode] = useState<'list-fiche' | 'list'>('list-fiche');
    const [selectedPoste, setSelectedPoste] = useState<Poste | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ entiteId: string, statut: string }>({ entiteId: 'all', statut: 'all' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPoste, setEditingPoste] = useState<Partial<Poste> | null>(null);
    
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dividerPosition, setDividerPosition] = useState(40);

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
        actions.savePoste(posteToSave).then(() => {
            if(selectedPoste?.id === posteToSave.id) setSelectedPoste(posteToSave);
        });
        setIsModalOpen(false);
    };

    const handleDeletePoste = (id: string) => {
        if(window.confirm("Êtes-vous sûr de vouloir supprimer ce poste ?")){
            actions.deletePoste(id);
            if(selectedPoste?.id === id) setSelectedPoste(null);
        }
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
                <select onChange={e => setFilters(f => ({...f, entiteId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Toutes les entités</option>{entites.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}</select>
                <select onChange={e => setFilters(f => ({...f, statut: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les statuts</option>{Object.keys(POST_STATUS_COLORS).map(s => <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>)}</select>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0"><tr>{['Intitulé', 'Entité', 'Occupants', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredPostes.map(poste => (
                            <tr key={poste.id} onClick={() => setSelectedPoste(poste)} className={`hover:bg-gray-50 cursor-pointer ${selectedPoste?.id === poste.id ? 'bg-blue-50' : ''}`}>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{poste.intitule}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{entites.find(e => e.id === poste.entiteId)?.nom || '-'}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{poste.occupantsIds.length} / {poste.effectifCible}</td>
                                <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs rounded-full capitalize ${POST_STATUS_COLORS[poste.statut]}`}>{poste.statut.replace(/_/g, ' ')}</span></td>
                                <td className="px-4 py-2"><div className="flex items-center space-x-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(poste); }} className="p-1 hover:bg-gray-200 rounded" disabled={!can('U', 'postes')}><Edit className="h-4 w-4 text-blue-600"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeletePoste(poste.id); }} className="p-1 hover:bg-gray-200 rounded" disabled={!can('D', 'postes')}><Trash2 className="h-4 w-4 text-red-600"/></button>
                                </div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="Postes"
                icon={Briefcase}
                description="Gérez les fiches de poste de votre organisation."
            >
                <div className="flex items-center gap-4">
                     <div className="flex bg-gray-100 rounded-lg p-1">
                        <button onClick={() => setViewMode(viewMode === 'list' ? 'list-fiche' : 'list')} className={`px-3 py-1 rounded-md text-sm font-medium`}>Liste</button>
                        <button onClick={() => setActiveModule('organigramme')} className={`px-3 py-1 rounded-md text-sm font-medium`}>Organigramme</button>
                    </div>
                    <button onClick={() => handleOpenModal()} disabled={!can('C', 'postes')} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:bg-blue-300">
                        <Plus className="h-4 w-4" />
                        <span>Nouveau Poste</span>
                    </button>
                </div>
            </PageHeader>
             <div ref={containerRef} className="flex-1 flex overflow-hidden">
                {viewMode === 'list' && <div className="w-full h-full">{listPanel}</div>}
                {viewMode === 'list-fiche' && (
                    <>
                        <div style={{ width: `${dividerPosition}%` }} className="h-full flex-shrink-0">{listPanel}</div>
                        <div onMouseDown={handleMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors flex-shrink-0" />
                        <div style={{ width: `${100 - dividerPosition}%` }} className="h-full flex-shrink-0 overflow-y-auto">
                            {selectedPoste ? (
                                <PosteDetailPanel poste={selectedPoste} onClose={() => setSelectedPoste(null)} onEdit={handleOpenModal} onShowRelations={onShowRelations} onShowImpactAnalysis={onShowImpactAnalysis} />
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-gray-500 bg-white"><p>Sélectionnez un poste pour voir ses détails.</p></div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <PosteFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSavePoste} poste={editingPoste} />
        </div>
    );
};

export default PostesPage;
