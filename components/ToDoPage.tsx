import React, { useState, useMemo, useEffect } from 'react';
import { useDataContext, useAppContext } from '../context/AppContext';
import type { Tache, TachePriorite, TacheStatut, Personne } from '../types';
import { Plus, Search, List, LayoutGrid, Calendar, SlidersHorizontal, GanttChartSquare, Edit, Trash2, Link as LinkIcon, ArrowUp } from 'lucide-react';
import TaskKanbanBoard from './TaskKanbanBoard';
import TaskCalendar from './TaskCalendar';
import TaskDetailPanel from './TaskDetailPanel';
import TaskFormModal from './TaskFormModal';
import TaskGanttChart from './TaskGanttChart';

const newAdHocTaskTemplate = (userId: string): Partial<Tache> => ({
    titre: '', statut: 'A faire', priorite: 'Normale', sourceModule: 'AdHoc',
    dateCreation: new Date(), dateEcheance: new Date(new Date().setDate(new Date().getDate() + 7)),
    createur: userId,
    assigneA: userId
});

const PRIORITY_STYLES: Record<TachePriorite, string> = {
    'Basse': 'bg-gray-100 text-gray-800', 'Normale': 'bg-blue-100 text-blue-800',
    'Haute': 'bg-yellow-100 text-yellow-800', 'Critique': 'bg-red-100 text-red-800'
};

const STATUS_STYLES: Record<TacheStatut, string> = {
    'A faire': 'bg-blue-100 text-blue-800', 'En cours': 'bg-yellow-100 text-yellow-800',
    'En attente': 'bg-purple-100 text-purple-800', 'Bloquee': 'bg-red-100 text-red-800',
    'Fait': 'bg-green-100 text-green-800', 'Annulee': 'bg-gray-100 text-gray-800'
};


interface ToDoPageProps {
    notifiedItemId: string | null;
    onShowRelations: (entity: any, entityType: string) => void;
}

const ToDoPage: React.FC<ToDoPageProps> = ({ notifiedItemId, onShowRelations }) => {
    const { data, actions } = useDataContext();
    const { personnes } = data;
    const { clearNotifiedTarget, user } = useAppContext();
    const [tasks, setTasks] = useState<Tache[]>(data.taches as Tache[]);

    useEffect(() => {
        setTasks(data.taches as Tache[]);
    }, [data.taches]);
    
    const [view, setView] = useState<'kanban' | 'list' | 'calendar' | 'gantt'>('kanban');
    const [selectedTask, setSelectedTask] = useState<Tache | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Tache> | null>(null);
    const [filters, setFilters] = useState<{ assignee: string, priority: string, status: string, procedureInstance: string }>({ assignee: 'all', priority: 'all', status: 'all', procedureInstance: 'all' });
    const [sortConfig, setSortConfig] = useState<{ key: keyof Tache; direction: 'ascending' | 'descending' }>({ key: 'dateEcheance', direction: 'ascending' });

    const procedureInstances = useMemo(() => {
        const instances = new Set(tasks.map(t => t.procedureInstanceName).filter(Boolean));
        return Array.from(instances);
    }, [tasks]);

    useEffect(() => {
        if (notifiedItemId) {
            const taskToSelect = tasks.find(t => t.id === notifiedItemId);
            if (taskToSelect) {
                setSelectedTask(taskToSelect);
            }
            clearNotifiedTarget();
        }
    }, [notifiedItemId, tasks, clearNotifiedTarget]);

    const requestSort = (key: keyof Tache) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredTasks = useMemo(() => {
        let filtered = tasks.filter(t =>
            (filters.assignee === 'all' || t.assigneA === filters.assignee) &&
            (filters.priority === 'all' || t.priorite === filters.priority) &&
            (filters.status === 'all' || t.statut === filters.status) &&
            (filters.procedureInstance === 'all' || t.procedureInstanceName === filters.procedureInstance)
        );

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                if (valA! < valB!) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA! > valB!) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [tasks, filters, sortConfig]);

    const handleOpenModal = (task?: Tache) => {
        setEditingTask(task || newAdHocTaskTemplate(user.id));
        setIsModalOpen(true);
    };

    const handleSaveTask = async (taskToSave: Tache) => {
        await actions.saveTache(taskToSave);
        if (selectedTask?.id === taskToSave.id) {
           const updatedTask = (data.taches as Tache[]).find(t => t.id === taskToSave.id);
           setSelectedTask(updatedTask || null);
        }
        setIsModalOpen(false);
    };
    
    const handleDeleteTask = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
            await actions.deleteTache(id);
            if (selectedTask?.id === id) setSelectedTask(null);
        }
    };


    const updateTaskStatus = async (taskId: string, newStatus: TacheStatut) => {
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (!taskToUpdate) return;
    
        const updatedTask = { ...taskToUpdate, statut: newStatus };
        await actions.saveTache(updatedTask);
    
        // Dependency unlocking logic
        if (newStatus === 'Fait') {
            const optimisticTasksList = tasks.map(t => t.id === taskId ? updatedTask : t);
    
            const dependentTasks = optimisticTasksList.filter(t => t.predecessorIds?.includes(taskId));
    
            for (const dependentTask of dependentTasks) {
                if (dependentTask.statut !== 'En attente') continue;
    
                const allPredecessorsDone = dependentTask.predecessorIds?.every(predecessorId => {
                    const predecessor = optimisticTasksList.find(t => t.id === predecessorId);
                    return predecessor?.statut === 'Fait';
                });
    
                if (allPredecessorsDone) {
                    await actions.saveTache({ ...dependentTask, statut: 'A faire' });
                }
            }
        }
    };

    return (
        <div className="flex h-[calc(100vh-150px)]">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b bg-white flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><LayoutGrid className="h-4 w-4"/>Kanban</button>
                            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><List className="h-4 w-4"/>Liste</button>
                            <button onClick={() => setView('calendar')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><Calendar className="h-4 w-4"/>Calendrier</button>
                            <button onClick={() => setView('gantt')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'gantt' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><GanttChartSquare className="h-4 w-4"/>Gantt</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                             <button className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900"><SlidersHorizontal className="h-4 w-4" /><span>Filtres</span></button>
                             <div className="absolute right-0 top-full mt-1 w-64 bg-white border rounded-lg shadow-lg p-4 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity z-10 space-y-2">
                                <label className="block text-sm">Assigné à: <select onChange={e => setFilters(f=>({...f, assignee: e.target.value}))} className="w-full border rounded p-1"><option value="all">Tous</option>{(personnes as any[]).map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}</select></label>
                                <label className="block text-sm">Priorité: <select onChange={e => setFilters(f=>({...f, priority: e.target.value}))} className="w-full border rounded p-1"><option value="all">Toutes</option>{['Basse', 'Normale', 'Haute', 'Critique'].map(p=><option key={p}>{p}</option>)}</select></label>
                                <label className="block text-sm">Statut: <select onChange={e => setFilters(f=>({...f, status: e.target.value}))} className="w-full border rounded p-1"><option value="all">Tous</option>{['A faire', 'En cours', 'En attente', 'Bloquee', 'Fait', 'Annulee'].map(s=><option key={s}>{s}</option>)}</select></label>
                                {procedureInstances.length > 0 && (
                                    <label className="block text-sm">Instance de procédure: <select onChange={e => setFilters(f=>({...f, procedureInstance: e.target.value}))} className="w-full border rounded p-1"><option value="all">Toutes les instances</option>{procedureInstances.map(name=><option key={name} value={name}>{name}</option>)}</select></label>
                                )}
                            </div>
                        </div>
                        <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm"><Plus className="h-4 w-4" /><span>Ajouter une tâche</span></button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    {view === 'kanban' && <TaskKanbanBoard tasks={sortedAndFilteredTasks} onSelectTask={setSelectedTask} onUpdateTaskStatus={updateTaskStatus} />}
                    {view === 'calendar' && <TaskCalendar tasks={sortedAndFilteredTasks} onSelectTask={setSelectedTask} />}
                    {view === 'list' && (
                        <div className="bg-white border rounded-lg">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[{key: 'titre', label: 'Titre'}, {key: 'priorite', label: 'Priorité'}, {key: 'statut', label: 'Statut'}, {key: 'dateEcheance', label: 'Échéance'}, {key: 'assigneA', label: 'Assigné à'}].map(h => 
                                            <th key={h.key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                <button onClick={() => requestSort(h.key as keyof Tache)} className="flex items-center gap-1 hover:text-gray-800">
                                                    {h.label}
                                                    {sortConfig.key === h.key && <ArrowUp className={`h-3 w-3 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />}
                                                </button>
                                            </th>
                                        )}
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {sortedAndFilteredTasks.map(task => {
                                        const assignee = (personnes as Personne[]).find(p => p.id === task.assigneA);
                                        return (
                                        <tr key={task.id} onClick={() => setSelectedTask(task)} className={`hover:bg-gray-50 cursor-pointer ${selectedTask?.id === task.id ? 'bg-blue-50' : ''}`}>
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900 max-w-xs truncate" title={task.titre}>{task.titre}</td>
                                            <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${PRIORITY_STYLES[task.priorite]}`}>{task.priorite}</span></td>
                                            <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[task.statut]}`}>{task.statut}</span></td>
                                            <td className="px-4 py-2 text-sm text-gray-500">{new Date(task.dateEcheance).toLocaleDateString('fr-FR')}</td>
                                            <td className="px-4 py-2 text-sm text-gray-500">{assignee ? `${assignee.prenom} ${assignee.nom}` : 'N/A'}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={(e) => { e.stopPropagation(); onShowRelations(task, 'taches'); }} title="Voir les relations" className="p-1 hover:bg-gray-200 rounded"><LinkIcon className="h-4 w-4 text-gray-500"/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(task); }} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {view === 'gantt' && <TaskGanttChart tasks={sortedAndFilteredTasks} />}
                </div>
            </div>
            {selectedTask && <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} onEdit={handleOpenModal} />}
            <TaskFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} task={editingTask} />
        </div>
    );
};

export default ToDoPage;