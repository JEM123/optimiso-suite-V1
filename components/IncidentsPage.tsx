import React, { useState, useMemo } from 'react';
import { mockData } from '../constants';
import type { Incident, IncidentStatut, IncidentTask, IncidentCategorie, IncidentPriorite } from '../types';
import { Plus, List, LayoutGrid, LayoutDashboard } from 'lucide-react';
import IncidentKanbanBoard from './IncidentKanban';
import IncidentDetailPanel from './IncidentDetailPanel';
import IncidentFormModal from './IncidentFormModal';
import IncidentList from './IncidentList';
import IncidentsDashboard from './IncidentsDashboard';

interface IncidentsPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
}

const newIncidentTemplate = (): Partial<Incident> => {
    const now = new Date();
    const slaHours = 24;
    const echeanceSLA = new Date(now.getTime() + slaHours * 60 * 60 * 1000);
    return {
        titre: '', description: '', categorie: 'Qualité', priorite: 'Moyenne', gravite: 'Mineure',
        statut: 'Nouveau', dateOuverture: now, declarantId: 'pers-1', SLA_Cible: slaHours,
        echeanceSLA: echeanceSLA, depassementSLA: false, taches: []
    };
};

const IncidentsPage: React.FC<IncidentsPageProps> = ({ onShowRelations }) => {
    const [incidents, setIncidents] = useState<Incident[]>(mockData.incidents);
    const [view, setView] = useState<'kanban' | 'list' | 'dashboard'>('dashboard');
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIncident, setEditingIncident] = useState<Partial<Incident> | null>(null);
    const [filters, setFilters] = useState<{ category: string, priority: string }>({ category: 'all', priority: 'all' });

    const filteredIncidents = useMemo(() => {
        return incidents.filter(i => 
            (filters.category === 'all' || i.categorie === filters.category) &&
            (filters.priority === 'all' || i.priorite === filters.priority)
        );
    }, [incidents, filters]);

    const handleOpenModal = (incident?: Incident) => {
        setEditingIncident(incident || newIncidentTemplate());
        setIsModalOpen(true);
    };

    const handleSaveIncident = (incidentToSave: Incident) => {
        if (incidentToSave.id) {
            const updated = { ...incidents.find(i => i.id === incidentToSave.id), ...incidentToSave, dateModification: new Date() } as Incident;
            setIncidents(incidents.map(i => i.id === incidentToSave.id ? updated : i));
            if (selectedIncident?.id === updated.id) setSelectedIncident(updated);
        } else {
            const newIncident = { ...incidentToSave, id: `inc-${Date.now()}`, reference: `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}` } as Incident;
            setIncidents([...incidents, newIncident]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteIncident = (incidentId: string) => {
        setIncidents(incidents.filter(i => i.id !== incidentId));
        if (selectedIncident?.id === incidentId) setSelectedIncident(null);
    };

    const updateIncidentStatus = (incidentId: string, newStatus: IncidentStatut) => {
        const updatedIncidents = incidents.map(inc => inc.id === incidentId ? { ...inc, statut: newStatus } : inc);
        setIncidents(updatedIncidents);
        if (selectedIncident?.id === incidentId) {
            setSelectedIncident(updatedIncidents.find(i => i.id === incidentId) || null);
        }
    };

    const handleSaveTask = (incidentId: string, taskToSave: IncidentTask) => {
        setIncidents(prevIncidents => prevIncidents.map(inc => {
            if (inc.id === incidentId) {
                const newTasks = taskToSave.id && inc.taches.some(t => t.id === taskToSave.id)
                    ? inc.taches.map(t => t.id === taskToSave.id ? { ...t, ...taskToSave, dateModification: new Date() } : t)
                    : [...inc.taches, { ...taskToSave, id: `inc-task-${Date.now()}` }];
                const updatedIncident = { ...inc, taches: newTasks };
                if (selectedIncident?.id === incidentId) setSelectedIncident(updatedIncident);
                return updatedIncident;
            }
            return inc;
        }));
    };

    const handleDeleteTask = (incidentId: string, taskId: string) => {
        setIncidents(prevIncidents => prevIncidents.map(inc => {
            if (inc.id === incidentId) {
                const newTasks = inc.taches.filter(t => t.id !== taskId);
                const updatedIncident = { ...inc, taches: newTasks };
                if (selectedIncident?.id === incidentId) setSelectedIncident(updatedIncident);
                return updatedIncident;
            }
            return inc;
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
                             <select onChange={e => setFilters(f => ({...f, category: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm bg-white"><option value="all">Toutes catégories</option>{['Sécurité', 'Qualité', 'SI', 'RH', 'Environnement'].map(c=><option key={c} value={c}>{c}</option>)}</select>
                             <select onChange={e => setFilters(f => ({...f, priority: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm bg-white"><option value="all">Toutes priorités</option>{['Faible', 'Moyenne', 'Élevée', 'Critique'].map(p=><option key={p} value={p}>{p}</option>)}</select>
                        </div>}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm"><Plus className="h-4 w-4" /><span>Déclarer un incident</span></button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    {view === 'dashboard' && <IncidentsDashboard incidents={incidents} />}
                    {view === 'kanban' && <IncidentKanbanBoard incidents={filteredIncidents} onSelectIncident={setSelectedIncident} onUpdateIncidentStatus={updateIncidentStatus} />}
                    {view === 'list' && <IncidentList incidents={filteredIncidents} onSelectIncident={setSelectedIncident} onEdit={handleOpenModal} onDelete={handleDeleteIncident} />}
                </div>
            </div>
            {selectedIncident && <IncidentDetailPanel incident={selectedIncident} onClose={() => setSelectedIncident(null)} onEdit={handleOpenModal} onShowRelations={onShowRelations} onSaveTask={handleSaveTask} onDeleteTask={handleDeleteTask} />}
            <IncidentFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveIncident} incident={editingIncident} />
        </div>
    );
};

export default IncidentsPage;