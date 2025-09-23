import React, { useState, useMemo } from 'react';
import type { Tache, TacheStatut } from '../types';
import TaskCard from './TaskCard';

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

const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({ tasks, onSelectTask, onUpdateTaskStatus }) => {
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [overColumn, setOverColumn] = useState<TacheStatut | null>(null);

    const tasksByStatus = useMemo(() => {
        return KANBAN_COLUMNS.reduce((acc, status) => {
            acc[status] = tasks.filter(task => task.statut === status);
            return acc;
        }, {} as Record<TacheStatut, Tache[]>);
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
            {KANBAN_COLUMNS.map(status => (
                <div
                    key={status}
                    className={`w-72 flex-shrink-0 bg-gray-100 rounded-lg flex flex-col transition-colors ${overColumn === status ? 'bg-blue-100' : ''}`}
                    onDrop={(e) => handleDrop(e, status)}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setOverColumn(status)}
                    onDragLeave={() => setOverColumn(null)}
                >
                    <div className={`p-3 border-t-4 ${COLUMN_COLORS[status]} rounded-t-lg`}>
                        <h3 className="font-semibold text-gray-700">{status} <span className="text-sm font-normal text-gray-500">({tasksByStatus[status].length})</span></h3>
                    </div>
                    <div className="flex-1 p-2 overflow-y-auto space-y-2">
                        {tasksByStatus[status].map(task => (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                onSelectTask={onSelectTask}
                                onDragStart={(e) => handleDragStart(e, task.id)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskKanbanBoard;