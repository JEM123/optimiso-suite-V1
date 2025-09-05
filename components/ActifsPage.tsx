import React, { useState, useMemo } from 'react';
import { mockData } from '../constants';
import type { Actif, ActifType, ActifStatutCycleVie } from '../types';
import { Plus, Search, Shield } from 'lucide-react';
import ActifDetailPanel from './ActifDetailPanel';
import ActifFormModal from './ActifFormModal';
import MaintenanceLogModal from './MaintenanceLogModal';

const ActifsPage: React.FC = () => {
    const [actifs, setActifs] = useState<Actif[]>(mockData.actifs);
    const [selectedActif, setSelectedActif] = useState<Actif | null>(null);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingActif, setEditingActif] = useState<Partial<Actif> | null>(null);
    const [isMaintModalOpen, setMaintModalOpen] = useState(false);
    const [maintActifId, setMaintActifId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ type: string, category: string, status: string }>({ type: 'all', category: 'all', status: 'all' });

    const filteredActifs = useMemo(() => {
        return actifs.filter(a =>
            (a.nom.toLowerCase().includes(searchTerm.toLowerCase()) || a.reference.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.type === 'all' || a.type === filters.type) &&
            (filters.category === 'all' || a.categorieId === filters.category) &&
            (filters.status === 'all' || a.statutCycleVie === filters.status)
        );
    }, [actifs, searchTerm, filters]);

    const handleOpenFormModal = (actif?: Actif) => {
        setEditingActif(actif || {});
        setFormModalOpen(true);
    };

    const handleSaveActif = (actifToSave: Actif) => {
        if (actifToSave.id) {
            const updated = { ...actifToSave, dateModification: new Date() } as Actif;
            setActifs(actifs.map(a => a.id === actifToSave.id ? updated : a));
            if(selectedActif?.id === updated.id) setSelectedActif(updated);
        } else {
            const newActif = { ...actifToSave, id: `actif-${Date.now()}` } as Actif;
            setActifs([...actifs, newActif]);
        }
        setFormModalOpen(false);
    };

    const handleOpenMaintModal = (actifId: string) => {
        setMaintActifId(actifId);
        setMaintModalOpen(true);
    };

    return (
        <div className="flex h-[calc(100vh-150px)]">
            <div className="flex-1 flex flex-col min-w-0 bg-white border rounded-lg">
                <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                        <Shield className="h-8 w-8 text-gray-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des Actifs</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenFormModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium"><Plus className="h-4 w-4" /><span>Nouvel Actif</span></button>
                    </div>
                </div>
                <div className="p-2 border-b flex flex-wrap items-center gap-2">
                    <div className="relative flex-grow max-w-xs"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                    <select onChange={e => setFilters(f => ({...f, type: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous Types</option>{['Matériel', 'Logiciel', 'Service', 'Donnée', 'Autre'].map(t=><option key={t}>{t}</option>)}</select>
                    <select onChange={e => setFilters(f => ({...f, category: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Toutes Catégories</option>{mockData.actifCategories.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select>
                    <select onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous Statuts</option>{['En service', 'En stock', 'En maintenance', 'Obsolète', 'Retiré'].map(s=><option key={s}>{s}</option>)}</select>
                </div>
                <div className="flex-1 overflow-y-auto">
                     <table className="min-w-full">
                        <thead className="bg-gray-50 sticky top-0"><tr>{['Nom', 'Type', 'Catégorie', 'Propriétaire', 'Statut'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredActifs.map(actif => {
                                const owner = mockData.personnes.find(p => p.id === actif.proprietaireId);
                                const category = mockData.actifCategories.find(c => c.id === actif.categorieId);
                                return (
                                <tr key={actif.id} onClick={() => setSelectedActif(actif)} className={`hover:bg-gray-50 cursor-pointer ${selectedActif?.id === actif.id ? 'bg-blue-50' : ''}`}>
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{actif.nom}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{actif.type}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{category?.nom}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{owner ? `${owner.prenom} ${owner.nom}` : 'N/A'}</td>
                                    <td className="px-4 py-2 text-sm">{actif.statutCycleVie}</td>
                                </tr>);
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedActif && <ActifDetailPanel actif={selectedActif} onClose={() => setSelectedActif(null)} onEdit={handleOpenFormModal} onAddMaintenance={handleOpenMaintModal}/>}
            <ActifFormModal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} onSave={handleSaveActif} actif={editingActif} />
            {maintActifId && <MaintenanceLogModal isOpen={isMaintModalOpen} onClose={() => setMaintModalOpen(false)} onSave={()=>{}} actifId={maintActifId} />}
        </div>
    );
};

export default ActifsPage;
