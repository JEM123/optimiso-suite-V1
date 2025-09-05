import React, { useState, useMemo } from 'react';
import { mockData } from '../constants';
import type { Amelioration, AmeliorationStatut, AmeliorationAction } from '../types';
import { Plus, List, LayoutGrid, LayoutDashboard } from 'lucide-react';
import AmeliorationKanban from './AmeliorationKanban';
import AmeliorationList from './AmeliorationList';
import AmeliorationDetailPanel from './AmeliorationDetailPanel';
import AmeliorationFormModal from './AmeliorationFormModal';
import AmeliorationsDashboard from './AmeliorationsDashboard';

interface AmeliorationsPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
}

const newAmeliorationTemplate = (): Partial<Amelioration> => ({
    titre: '', description: '', type: 'Corrective', priorite: 'moyenne', statut: 'Nouveau',
    piloteId: '', origine: [], objectifMesurable: '', echeanceCible: new Date(),
    dateCreation: new Date(), dateModification: new Date(), actions: [],
    confidentialite: 'publique',
});

const AmeliorationsPage: React.FC<AmeliorationsPageProps> = ({ onShowRelations }) => {
    const [ameliorations, setAmeliorations] = useState<Amelioration[]>(mockData.ameliorations);
    const [view, setView] = useState<'dashboard' | 'kanban' | 'list'>('dashboard');
    const [selectedAmelioration, setSelectedAmelioration] = useState<Amelioration | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAmelioration, setEditingAmelioration] = useState<Partial<Amelioration> | null>(null);
    const [filters, setFilters] = useState<{ type: string, priority: string, status: string }>({ type: 'all', priority: 'all', status: 'all' });

    const filteredAmeliorations = useMemo(() => {
        return ameliorations.filter(a => 
            (filters.type === 'all' || a.type === filters.type) &&
            (filters.priority === 'all' || a.priorite === filters.priority) &&
            (filters.status === 'all' || a.statut === filters.status)
        );
    }, [ameliorations, filters]);

    const handleOpenModal = (amelioration?: Amelioration) => {
        setEditingAmelioration(amelioration || newAmeliorationTemplate());
        setIsModalOpen(true);
    };

    const handleSaveAmelioration = (ameliorationToSave: Amelioration) => {
        if (ameliorationToSave.id) {
            const updated = { ...ameliorations.find(a => a.id === ameliorationToSave.id), ...ameliorationToSave, dateModification: new Date() } as Amelioration;
            setAmeliorations(ameliorations.map(a => a.id === ameliorationToSave.id ? updated : a));
            if (selectedAmelioration?.id === updated.id) setSelectedAmelioration(updated);
        } else {
            const newAmel = { ...ameliorationToSave, id: `amel-${Date.now()}`, reference: `AMEL-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}` } as Amelioration;
            setAmeliorations([...ameliorations, newAmel]);
        }
        setIsModalOpen(false);
    };
    
    const handleDeleteAmelioration = (id: string) => {
        setAmeliorations(ameliorations.filter(a => a.id !== id));
        if(selectedAmelioration?.id === id) setSelectedAmelioration(null);
    };

    const updateAmeliorationStatus = (id: string, newStatus: AmeliorationStatut) => {
        const updatedAmeliorations = ameliorations.map(a => a.id === id ? { ...a, statut: newStatus } : a);
        setAmeliorations(updatedAmeliorations);
        if (selectedAmelioration?.id === id) {
            setSelectedAmelioration(updatedAmeliorations.find(a => a.id === id) || null);
        }
    };
    
    const handleSaveAction = (ameliorationId: string, actionToSave: AmeliorationAction) => {
        setAmeliorations(prev => prev.map(amel => {
            if (amel.id === ameliorationId) {
                const newActions = actionToSave.id && amel.actions.some(a => a.id === actionToSave.id)
                    ? amel.actions.map(a => a.id === actionToSave.id ? { ...a, ...actionToSave } : a)
                    : [...amel.actions, { ...actionToSave, id: `act-${Date.now()}` }];
                const updatedAmel = { ...amel, actions: newActions };
                if (selectedAmelioration?.id === ameliorationId) setSelectedAmelioration(updatedAmel);
                return updatedAmel;
            }
            return amel;
        }));
    };

    const handleDeleteAction = (ameliorationId: string, actionId: string) => {
        setAmeliorations(prev => prev.map(amel => {
            if (amel.id === ameliorationId) {
                const newActions = amel.actions.filter(a => a.id !== actionId);
                const updatedAmel = { ...amel, actions: newActions };
                if (selectedAmelioration?.id === ameliorationId) setSelectedAmelioration(updatedAmel);
                return updatedAmel;
            }
            return amel;
        }));
    };


    return (
        <div className="flex h-[calc(100vh-150px)]">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b bg-white flex flex-wrap items-center justify-between gap-2">
                     <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={() => setView('dashboard')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><LayoutDashboard className="h-4 w-4"/>Dashboard</button>
                            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><LayoutGrid className="h-4 w-4"/>Kanban</button>
                            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><List className="h-4 w-4"/>Liste</button>
                        </div>
                         {view !== 'dashboard' && <div className="flex items-center gap-2">
                             <select onChange={e => setFilters(f => ({...f, type: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm bg-white"><option value="all">Tous types</option>{['Corrective', 'Préventive', 'Opportunité'].map(c=><option key={c} value={c}>{c}</option>)}</select>
                             <select onChange={e => setFilters(f => ({...f, priority: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm bg-white"><option value="all">Toutes priorités</option>{['basse', 'moyenne', 'haute', 'critique'].map(p=><option key={p} value={p} className="capitalize">{p}</option>)}</select>
                             <select onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm bg-white"><option value="all">Tous statuts</option>{['Nouveau', 'En cours', 'Suspendu', 'Clôturé'].map(s=><option key={s} value={s}>{s}</option>)}</select>
                        </div>}
                    </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm"><Plus className="h-4 w-4" /><span>Annoncer une amélioration</span></button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    {view === 'dashboard' && <AmeliorationsDashboard ameliorations={ameliorations} />}
                    {view === 'kanban' && <AmeliorationKanban ameliorations={filteredAmeliorations} onSelectAmelioration={setSelectedAmelioration} onUpdateStatus={updateAmeliorationStatus} />}
                    {view === 'list' && <AmeliorationList ameliorations={filteredAmeliorations} onSelectAmelioration={setSelectedAmelioration} onEdit={handleOpenModal} onDelete={handleDeleteAmelioration} />}
                </div>
            </div>
            {selectedAmelioration && <AmeliorationDetailPanel amelioration={selectedAmelioration} onClose={() => setSelectedAmelioration(null)} onEdit={handleOpenModal} onShowRelations={onShowRelations} onSaveAction={handleSaveAction} onDeleteAction={handleDeleteAction}/>}
            <AmeliorationFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAmelioration} amelioration={editingAmelioration} />
        </div>
    );
};

export default AmeliorationsPage;
