import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useDataContext, useAppContext } from '../context/AppContext';
import type { Tache, TacheStatut } from '../types';
import { Plus, Search, List, LayoutGrid, Calendar, SlidersHorizontal, Eye } from 'lucide-react';
import TaskKanbanBoard from './TaskKanbanBoard';
import TaskCalendar from './TaskCalendar';
import TaskDetailPanel from './TaskDetailPanel';
import TaskFormModal from './TaskFormModal';
import PageHeader from './PageHeader';

const newAdHocTaskTemplate = (userId: string): Partial<Tache> => ({ titre: '', statut: 'A faire', priorite: 'Normale', sourceModule: 'AdHoc', dateCreation: new Date(), dateEcheance: new Date(new Date().setDate(new Date().getDate() + 7)), createur: userId });

interface ToDoPageProps { notifiedItemId: string | null; }

const ToDoPage: React.FC<ToDoPageProps> = ({ notifiedItemId }) => {
    const { data, actions } = useDataContext();
    const { user, clearNotifiedTarget } = useAppContext();
    const { taches, personnes } = data;

    const [view, setView] = useState<'kanban' | 'list' | 'calendar'>('kanban');
    const [selectedTask, setSelectedTask] = useState<Tache | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Tache> | null>(null);
    const [filters, setFilters] = useState<{ assignee: string, priority: string, status: string }>({ assignee: 'all', priority: 'all', status: 'all' });

    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dividerPosition, setDividerPosition] = useState(50);

    useEffect(() => {
        if (notifiedItemId) {
            const taskToSelect = (taches as Tache[]).find(t => t.id === notifiedItemId);
            if (taskToSelect) { setSelectedTask(taskToSelect); setView('list'); }
            clearNotifiedTarget();
        }
    }, [notifiedItemId, taches, clearNotifiedTarget]);

    const filteredTasks = useMemo(() => {
        return (taches as Tache[]).filter(t =>
            (filters.assignee === 'all' || t.assigneA === filters.assignee) &&
            (filters.priority === 'all' || t.priorite === filters.priority) &&
            (filters.status === 'all' || t.statut === filters.status)
        );
    }, [taches, filters]);

    const handleOpenModal = (task?: Tache) => { setEditingTask(task || newAdHocTaskTemplate(user.id)); setIsModalOpen(true); };
    const handleSaveTask = (taskToSave: Tache) => { actions.saveTache(taskToSave); setIsModalOpen(false); };
    const updateTaskStatus = (taskId: string, newStatus: TacheStatut) => {
        const task = (taches as Tache[]).find(t => t.id === taskId);
        if(task) actions.saveTache({ ...task, statut: newStatus });
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
                <select onChange={e => setFilters(f=>({...f, assignee: e.target.value}))} className="border rounded p-1 text-sm"><option value="all">Tous</option>{(personnes as any[]).map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}</select>
                <select onChange={e => setFilters(f=>({...f, priority: e.target.value}))} className="border rounded p-1 text-sm"><option value="all">Toutes priorités</option>{['Basse', 'Normale', 'Haute', 'Critique'].map(p=><option key={p}>{p}</option>)}</select>
                <select onChange={e => setFilters(f=>({...f, status: e.target.value}))} className="border rounded p-1 text-sm"><option value="all">Tous statuts</option>{['A faire', 'En cours', 'En attente', 'Bloquee', 'Fait', 'Annulee'].map(s=><option key={s}>{s}</option>)}</select>
            </div>
            <div className="flex-1 overflow-auto">
                 {filteredTasks.map(task => <div key={task.id} onClick={() => setSelectedTask(task)} className={`p-3 border-b cursor-pointer ${selectedTask?.id === task.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}><p>{task.titre}</p></div>)}
            </div>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col">
            <PageHeader title="ToDo Manager" icon={Calendar}>
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button onClick={() => setView('kanban')} className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${view === 'kanban' ? 'bg-white shadow-sm' : ''}`}><LayoutGrid className="h-4 w-4"/>Kanban</button>
                        <button onClick={() => setView('list')} className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${view === 'list' ? 'bg-white shadow-sm' : ''}`}><List className="h-4 w-4"/>Liste</button>
                        <button onClick={() => setView('calendar')} className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${view === 'calendar' ? 'bg-white shadow-sm' : ''}`}><Calendar className="h-4 w-4"/>Calendrier</button>
                    </div>
                    <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm"><Plus className="h-4 w-4" /><span>Ajouter</span></button>
                </div>
            </PageHeader>
            <div className="flex-1 overflow-auto bg-gray-50">
                 {view === 'kanban' && <div className="p-4"><TaskKanbanBoard tasks={filteredTasks} onSelectTask={setSelectedTask} onUpdateTaskStatus={updateTaskStatus} /></div>}
                 {view === 'calendar' && <div className="p-4 h-full"><TaskCalendar tasks={filteredTasks} onSelectTask={setSelectedTask} /></div>}
                 {view === 'list' && (
                     <div ref={containerRef} className="flex h-full">
                        <div style={{ width: `${dividerPosition}%` }} className="h-full flex-shrink-0">{listPanel}</div>
                        <div onMouseDown={handleMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors flex-shrink-0" />
                        <div style={{ width: `${100 - dividerPosition}%` }} className="h-full flex-shrink-0 overflow-y-auto">
                            {selectedTask ? (
                                <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} onEdit={handleOpenModal} />
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-gray-500 bg-white"><p>Sélectionnez une tâche pour voir ses détails.</p></div>
                            )}
                        </div>
                    </div>
                 )}
            </div>
            {selectedTask && view !== 'list' && <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} onEdit={handleOpenModal} />}
            <TaskFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} task={editingTask} />
        </div>
    );
};

export default ToDoPage;