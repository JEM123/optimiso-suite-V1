import React, { useState, useMemo } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Actualite } from '../types';
import { Plus, Search, Edit, Trash2, Bell } from 'lucide-react';
import NewsFormModal from './NewsFormModal';
import NewsDetailModal from './NewsDetailModal';

const STATUT_COLORS: Record<Actualite['statut'], string> = {
    'brouillon': 'bg-gray-200 text-gray-800',
    'publie': 'bg-green-100 text-green-800',
    'archive': 'bg-red-100 text-red-800',
    'en_cours': 'bg-yellow-100 text-yellow-800', 'valide': 'bg-green-100 text-green-800', 'à_créer': 'bg-cyan-100 text-cyan-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800', 'gelé': 'bg-purple-100 text-purple-800', 'figé': 'bg-indigo-100 text-indigo-800', 'planifié': 'bg-blue-100 text-blue-800', 'terminé': 'bg-green-100 text-green-800', 'non-conforme': 'bg-red-200 text-red-900', 'clôturé': 'bg-gray-300 text-gray-800', 'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-200 text-red-900', 'en_validation': 'bg-yellow-100 text-yellow-800', 'rejete': 'bg-red-100 text-red-800',
};

const NewsPage: React.FC = () => {
    const { data, actions } = useDataContext();
    const { actualites, categoriesActualites, personnes } = data as { actualites: Actualite[], categoriesActualites: any[], personnes: any[] };

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<Partial<Actualite> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ categoryId: string, statut: string }>({ categoryId: 'all', statut: 'all' });
    const [selectedNews, setSelectedNews] = useState<Actualite | null>(null);

    const filteredNews = useMemo(() => {
        return actualites.filter(actu =>
            (actu.nom.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.categoryId === 'all' || actu.categorieId === filters.categoryId) &&
            (filters.statut === 'all' || actu.statut === filters.statut)
        ).sort((a, b) => new Date(b.datePublication).getTime() - new Date(a.datePublication).getTime());
    }, [actualites, searchTerm, filters]);

    const handleOpenFormModal = (actu?: Actualite) => {
        setEditingNews(actu || { statut: 'brouillon' });
        setIsFormModalOpen(true);
    };

    const handleSaveNews = async (actuToSave: Actualite) => {
        await actions.saveActualite(actuToSave);
        setIsFormModalOpen(false);
    };

    const handleDeleteNews = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette actualité ?")) {
            await actions.deleteActualite(id);
        }
    };

    const isExpired = (actu: Actualite) => {
        return actu.dateExpiration && new Date(actu.dateExpiration) < new Date();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-white flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                    <Bell className="h-8 w-8 text-gray-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Actualités</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenFormModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium">
                        <Plus className="h-4 w-4" /><span>Nouvelle Actualité</span>
                    </button>
                </div>
            </div>

            <div className="p-2 border-b bg-white flex flex-wrap items-center gap-2">
                <div className="relative flex-grow max-w-xs">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Rechercher par titre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/>
                </div>
                <select onChange={e => setFilters(f => ({...f, categoryId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm">
                    <option value="all">Toutes les catégories</option>
                    {categoriesActualites.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
                <select onChange={e => setFilters(f => ({...f, statut: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm">
                    <option value="all">Tous les statuts</option>
                    {['brouillon', 'publie', 'archive'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.map(actu => {
                        const categorie = categoriesActualites.find(c => c.id === actu.categorieId);
                        const auteur = personnes.find(p => p.id === actu.auteurId);
                        const expired = isExpired(actu);
                        const inactive = expired || actu.statut === 'archive';
                        const statusText = actu.statut === 'archive' ? 'Archivée' : expired ? 'Expirée' : null;

                        return (
                        <div 
                            key={actu.id}
                            onClick={() => setSelectedNews(actu)}
                            className={`bg-white rounded-lg shadow-sm border flex flex-col group transition-all duration-300 cursor-pointer ${inactive ? 'opacity-70' : 'hover:shadow-lg hover:-translate-y-1'}`}
                        >
                            <div className="relative">
                                <img src={actu.imageURL} alt={actu.nom} className={`w-full h-40 object-cover rounded-t-lg bg-gray-200 ${inactive ? 'filter grayscale' : ''}`} />
                                {statusText && (
                                    <span className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
                                        {statusText}
                                    </span>
                                )}
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${STATUT_COLORS[actu.statut]}`}>{actu.statut}</span>
                                    <span className="text-xs text-gray-500">{categorie?.nom}</span>
                                </div>
                                <h3 className="font-semibold text-gray-800">{actu.nom}</h3>
                                <p className="text-sm text-gray-600 mt-2 flex-grow line-clamp-3">{actu.resume}</p>
                                <div className="text-xs text-gray-500 mt-4 pt-2 border-t">
                                    Publié le {new Date(actu.datePublication).toLocaleDateString('fr-FR')} par {auteur ? `${auteur.prenom} ${auteur.nom}` : 'Inconnu'}
                                </div>
                            </div>
                            <div className="p-2 bg-gray-50/50 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenFormModal(actu); }} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteNews(actu.id); }} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                            </div>
                        </div>
                    )})}
                </div>
            </div>

            <NewsFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={handleSaveNews} actualite={editingNews} />

            {selectedNews && <NewsDetailModal actualite={selectedNews} onClose={() => setSelectedNews(null)} />}
        </div>
    );
};

export default NewsPage;
