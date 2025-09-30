import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Actualite } from '../types';
import { Plus, Search, Edit, Trash2, Bell, LayoutGrid, List } from 'lucide-react';
import NewsFormModal from './NewsFormModal';
import NewsDetailModal from './NewsDetailModal';
import PageHeader from './PageHeader';
import NewsDetailPanel from './NewsDetailPanel';

const STATUT_COLORS: Record<Actualite['statut'], string> = { 'brouillon': 'bg-gray-200 text-gray-800', 'publie': 'bg-green-100 text-green-800', 'archive': 'bg-red-100 text-red-800', 'en_cours': 'bg-yellow-100 text-yellow-800', 'valide': 'bg-green-100 text-green-800', 'à_créer': 'bg-cyan-100 text-cyan-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800', 'gelé': 'bg-purple-100 text-purple-800', 'figé': 'bg-indigo-100 text-indigo-800', 'planifié': 'bg-blue-100 text-blue-800', 'terminé': 'bg-green-100 text-green-800', 'non-conforme': 'bg-red-200 text-red-900', 'clôturé': 'bg-gray-300 text-gray-800', 'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-200 text-red-900', 'en_validation': 'bg-yellow-100 text-yellow-800', 'rejete': 'bg-red-100 text-red-800', };

const NewsPage: React.FC = () => {
    const { data, actions } = useDataContext();
    const { actualites, categoriesActualites, personnes } = data as { actualites: Actualite[], categoriesActualites: any[], personnes: any[] };

    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<Partial<Actualite> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ categoryId: string, statut: string }>({ categoryId: 'all', statut: 'all' });
    const [selectedNews, setSelectedNews] = useState<Actualite | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dividerPosition, setDividerPosition] = useState(40);

    const filteredNews = useMemo(() => {
        return actualites.filter(actu =>
            (actu.nom.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.categoryId === 'all' || actu.categorieId === filters.categoryId) &&
            (filters.statut === 'all' || actu.statut === filters.statut)
        ).sort((a, b) => new Date(b.datePublication).getTime() - new Date(a.datePublication).getTime());
    }, [actualites, searchTerm, filters]);

    const handleOpenFormModal = (actu?: Actualite) => { setEditingNews(actu || { statut: 'brouillon' }); setIsFormModalOpen(true); };
    const handleSaveNews = async (actuToSave: Actualite) => { await actions.saveActualite(actuToSave); setIsFormModalOpen(false); };
    const handleDeleteNews = async (id: string) => { if (window.confirm("Supprimer cette actualité ?")) await actions.deleteActualite(id); };
    const handleSelectNews = (actu: Actualite) => { if (view === 'list') { setSelectedNews(actu); } else { setSelectedNews(actu); setIsDetailModalOpen(true); }};
    const isExpired = (actu: Actualite) => actu.dateExpiration && new Date(actu.dateExpiration) < new Date();

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
                <select onChange={e => setFilters(f => ({...f, categoryId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Toutes catégories</option>{categoriesActualites.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select>
                <select onChange={e => setFilters(f => ({...f, statut: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous statuts</option>{['brouillon', 'publie', 'archive'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}</select>
            </div>
            <div className="flex-1 overflow-auto">
                {filteredNews.map(actu => <div key={actu.id} onClick={() => handleSelectNews(actu)} className={`p-3 border-b cursor-pointer ${selectedNews?.id === actu.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}><p>{actu.nom}</p></div>)}
            </div>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Actualités" icon={Bell}>
                 <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button onClick={() => setView('grid')} className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${view === 'grid' ? 'bg-white shadow-sm' : ''}`}><LayoutGrid className="h-4 w-4"/>Grille</button>
                        <button onClick={() => setView('list')} className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${view === 'list' ? 'bg-white shadow-sm' : ''}`}><List className="h-4 w-4"/>Liste</button>
                    </div>
                    <button onClick={() => handleOpenFormModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm"><Plus className="h-4 w-4" /><span>Nouveau</span></button>
                </div>
            </PageHeader>
            <div className="flex-1 overflow-auto bg-gray-50">
                {view === 'grid' && <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.map(actu => {
                        const inactive = isExpired(actu) || actu.statut === 'archive';
                        return (
                        <div key={actu.id} onClick={() => handleSelectNews(actu)} className={`bg-white rounded-lg shadow-sm border flex flex-col group transition-all duration-300 cursor-pointer ${inactive ? 'opacity-70' : 'hover:shadow-lg hover:-translate-y-1'}`}>
                            <div className="relative"><img src={actu.imageURL} alt={actu.nom} className={`w-full h-40 object-cover rounded-t-lg bg-gray-200 ${inactive ? 'filter grayscale' : ''}`} /></div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-semibold text-gray-800">{actu.nom}</h3>
                                <div className="text-xs text-gray-500 mt-4 pt-2 border-t">Publié le {new Date(actu.datePublication).toLocaleDateString('fr-FR')}</div>
                            </div>
                        </div>
                    )})}
                </div>}
                {view === 'list' && (
                     <div ref={containerRef} className="flex h-full">
                        <div style={{ width: `${dividerPosition}%` }} className="h-full flex-shrink-0">{listPanel}</div>
                        <div onMouseDown={handleMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors flex-shrink-0" />
                        <div style={{ width: `${100 - dividerPosition}%` }} className="h-full flex-shrink-0 overflow-y-auto">
                            {selectedNews ? (
                                <NewsDetailPanel actualite={selectedNews} onClose={() => setSelectedNews(null)} onEdit={handleOpenFormModal} />
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-gray-500 bg-white"><p>Sélectionnez une actualité pour voir ses détails.</p></div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <NewsFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={handleSaveNews} actualite={editingNews} />
            {selectedNews && isDetailModalOpen && <NewsDetailModal actualite={selectedNews} onClose={() => setIsDetailModalOpen(false)} />}
        </div>
    );
};

export default NewsPage;