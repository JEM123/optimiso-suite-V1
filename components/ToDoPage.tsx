import React, { useState, useMemo, useEffect } from 'react';
import { useDataContext, useAppContext } from '../context/AppContext';
import type { Tache, TachePriorite, TacheStatut } from '../types';
import { Plus, Search, List, LayoutGrid, Calendar, SlidersHorizontal, Users, GanttChartSquare } from 'lucide-react';
import TaskKanbanBoard from './TaskKanbanBoard';
import TaskCalendar from './TaskCalendar';
import TaskDetailPanel from './TaskDetailPanel';
import TaskFormModal from './TaskFormModal';
import TaskGanttChart from './TaskGanttChart';

const newAdHocTaskTemplate = (): Partial<Tache> => ({
    titre: '', statut: 'A faire', priorite: 'Normale', sourceModule: 'AdHoc',
    dateCreation: new Date(), dateEcheance: new Date(new Date().setDate(new Date().getDate() + 7)),
    createur: 'pers-1' // Assume current user is pers-1
});

interface ToDoPageProps {
    notifiedItemId: string | null;
}

const ToDoPage: React.FC<ToDoPageProps> = ({ notifiedItemId }) => {
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

    const filteredTasks = useMemo(() => {
        return tasks.filter(t =>
            (filters.assignee === 'all' || t.assigneA === filters.assignee) &&
            (filters.priority === 'all' || t.priorite === filters.priority) &&
            (filters.status === 'all' || t.statut === filters.status) &&
            (filters.procedureInstance === 'all' || t.procedureInstanceName === filters.procedureInstance)
        );
    }, [tasks, filters]);

    const handleOpenModal = (task?: Tache) => {
        setEditingTask(task || newAdHocTaskTemplate());
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

    const updateTaskStatus = async (taskId: string, newStatus: TacheStatut) => {
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (!taskToUpdate) return;
    
        const updatedTask = { ...taskToUpdate, statut: newStatus };
        await actions.saveTache(updatedTask);
    
        // Dependency unlocking logic
        if (newStatus === 'Fait') {
            // Create a temporarily updated list for checking dependencies to avoid stale state
            const optimisticTasksList = tasks.map(t => t.id === taskId ? updatedTask : t);
    
            // Find tasks that depend on the one just completed
            const dependentTasks = optimisticTasksList.filter(t => t.predecessorIds?.includes(taskId));
    
            for (const dependentTask of dependentTasks) {
                if (dependentTask.statut !== 'En attente') continue;
    
                // Check if all of its predecessors are now 'Fait'
                const allPredecessorsDone = dependentTask.predecessorIds?.every(predecessorId => {
                    const predecessor = optimisticTasksList.find(t => t.id === predecessorId);
                    return predecessor?.statut === 'Fait';
                });
    
                if (allPredecessorsDone) {
                    // All prerequisites are met, unlock the task
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
                    {view === 'kanban' && <TaskKanbanBoard tasks={filteredTasks} onSelectTask={setSelectedTask} onUpdateTaskStatus={updateTaskStatus} />}
                    {view === 'calendar' && <TaskCalendar tasks={filteredTasks} onSelectTask={setSelectedTask} />}
                    {view === 'list' && <div className="text-center p-8">Vue Liste en construction.</div>}
                    {view === 'gantt' && <TaskGanttChart tasks={filteredTasks} />}
                </div>
            </div>
            {selectedTask && <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} onEdit={handleOpenModal} />}
            <TaskFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} task={editingTask} />
        </div>
    );
};

export default ToDoPage;