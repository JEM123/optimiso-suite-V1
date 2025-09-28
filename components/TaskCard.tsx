
import React from 'react';
import type { Tache, Personne } from '../types';
import { useDataContext } from '../context/AppContext';

interface TaskCardProps {
    task: Tache;
    onSelectTask: (task: Tache) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

const PRIORITY_COLORS: Record<Tache['priorite'], string> = {
    'Basse': 'bg-gray-400',
    'Normale': 'bg-blue-500',
    'Haute': 'bg-yellow-500',
    'Critique': 'bg-red-500'
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onSelectTask, onDragStart }) => {
    const { data } = useDataContext();
    const assignee = (data.personnes as Personne[]).find(p => p.id === task.assigneA);
    const assigneeInitials = assignee ? `${assignee.prenom[0]}${assignee.nom[0]}` : '?';

    return (
        <div
            className="p-3 bg-white rounded-md shadow-sm border hover:shadow-md cursor-pointer"
            onClick={() => onSelectTask(task)}
            draggable
            onDragStart={onDragStart}
        >
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-800 pr-2">{task.titre}</p>
                <div 
                    className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${PRIORITY_COLORS[task.priorite]}`} 
                    title={`Priorité: ${task.priorite}`}
                />
            </div>
            <div className="flex justify-between items-center mt-3">
                <div className="text-xs text-gray-500">
                    Échéance: {new Date(task.dateEcheance).toLocaleDateString('fr-FR')}
                </div>
                <div 
                    className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600"
                    title={assignee ? `${assignee.prenom} ${assignee.nom}` : 'Non assigné'}
                >
                    {assigneeInitials}
                </div>
            </div>
        </div>
    );
};

export default React.memo(TaskCard);
