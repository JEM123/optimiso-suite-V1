import React, { useState, useMemo } from 'react';
import type { Tache, TacheStatut } from '../types';
import TaskCard from './TaskCard';
import { ClipboardList } from 'lucide-react';

interface TaskKanbanBoardProps {
    tasks: Tache[];
    onSelectTask: (task: Tache) => void;
    onUpdateTaskStatus: (taskId: string, newStatus: TacheStatut) => void;
}

const KANBAN_COLUMNS: TacheStatut[] = ['A faire', 'En cours', 'En attente', 'Bloquee', 'Fait', 'Annulee'];
const COLUMN_COLORS: Record<TacheStatut, string> = {
    'A faire': 'border-t-blue-500',
    'En cours': 'border-t-yellow-500',
    'En attente': 'border-t-purple-500',
    'Bloquee': 'border-t-red-500',
    'Fait': 'border-t-green-500',
    'Annulee': 'border-t-gray-500'
};

interface TasksByStatus {
    procedureTasks: Record<string, Tache[]>;
    adHocTasks: Tache[];
}

const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({ tasks, onSelectTask, onUpdateTaskStatus }) => {
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [overColumn, setOverColumn] = useState<TacheStatut | null>(null);

    const tasksByStatus = useMemo(() => {
        return KANBAN_COLUMNS.reduce((acc, status) => {
            const tasksInColumn = tasks.filter(task => task.statut === status);
            const groupedTasks: TasksByStatus = {
                procedureTasks: {},
                adHocTasks: []
            };

            tasksInColumn.forEach(task => {
                if (task.procedureInstanceName) {
                    if (!groupedTasks.procedureTasks[task.procedureInstanceName]) {
                        groupedTasks.procedureTasks[task.procedureInstanceName] = [];
                    }
                    groupedTasks.procedureTasks[task.procedureInstanceName].push(task);
                } else {
                    groupedTasks.adHocTasks.push(task);
                }
            });

            acc[status] = groupedTasks;
            return acc;
        }, {} as Record<TacheStatut, TasksByStatus>);
    }, [tasks]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TacheStatut) => {
        e.preventDefault();
        if (draggedTaskId) {
            onUpdateTaskStatus(draggedTaskId, newStatus);
        }
        setDraggedTaskId(null);
        setOverColumn(null);
    };
    
    return (
        <div className="flex space-x-4 h-full overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map(status => {
                const columnData = tasksByStatus[status];
                const totalTasks = Object.values(columnData.procedureTasks).flat().length + columnData.adHocTasks.length;

                return (
                    <div
                        key={status}
                        className={`w-72 flex-shrink-0 bg-gray-100 rounded-lg flex flex-col transition-colors ${overColumn === status ? 'bg-blue-100' : ''}`}
                        onDrop={(e) => handleDrop(e, status)}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={() => setOverColumn(status)}
                        onDragLeave={() => setOverColumn(null)}
                    >
                        <div className={`p-3 border-t-4 ${COLUMN_COLORS[status]} rounded-t-lg`}>
                            <h3 className="font-semibold text-gray-700">{status} <span className="text-sm font-normal text-gray-500">({totalTasks})</span></h3>
                        </div>
                        <div className="flex-1 p-2 overflow-y-auto space-y-3">
                            {/* FIX: Replaced Object.entries with Object.keys to fix TS error with type inference. */}
                            {Object.keys(columnData.procedureTasks).map(instanceName => {
                                const instanceTasks = columnData.procedureTasks[instanceName];
                                return (
                                <div key={instanceName} className="bg-white/50 rounded-md p-2 border border-dashed">
                                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-600 px-1">
                                        <ClipboardList className="h-4 w-4" />
                                        <span className="truncate" title={instanceName}>{instanceName}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {instanceTasks.map(task => (
                                            <TaskCard 
                                                key={task.id} 
                                                task={task} 
                                                onSelectTask={onSelectTask}
                                                onDragStart={(e) => handleDragStart(e, task.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )})}

                            {Object.keys(columnData.procedureTasks).length > 0 && columnData.adHocTasks.length > 0 && (
                                <hr className="border-t-2 border-gray-200 border-dashed my-3" />
                            )}

                            {columnData.adHocTasks.map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    onSelectTask={onSelectTask}
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TaskKanbanBoard;
