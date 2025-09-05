import React from 'react';
import type { Tache } from '../types';

interface TaskCalendarProps {
    tasks: Tache[];
    onSelectTask: (task: Tache) => void;
}

const PRIORITY_BORDER_COLORS: Record<Tache['priorite'], string> = {
    'Basse': 'border-l-gray-400',
    'Normale': 'border-l-blue-500',
    'Haute': 'border-l-yellow-500',
    'Critique': 'border-l-red-500'
};


const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks, onSelectTask }) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i); // Adjust for Sunday start

    const tasksByDay: Record<number, Tache[]> = {};
    tasks.forEach(task => {
        const taskDate = new Date(task.dateEcheance);
        if (taskDate.getFullYear() === year && taskDate.getMonth() === month) {
            const day = taskDate.getDate();
            if (!tasksByDay[day]) {
                tasksByDay[day] = [];
            }
            tasksByDay[day].push(task);
        }
    });

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border h-full flex flex-col">
            <h2 className="text-lg font-semibold text-center mb-4">
                {today.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="grid grid-cols-7 flex-1 text-sm text-center">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="font-bold text-gray-600 p-2 border-b">{day}</div>
                ))}
                {blanks.map(b => <div key={`b-${b}`} className="border-r border-b"></div>)}
                {days.map(day => {
                    const dayTasks = tasksByDay[day] || [];
                    const isToday = day === today.getDate();
                    return (
                        <div key={day} className="border-r border-b relative p-1 min-h-[100px] flex flex-col">
                            <div className={`font-semibold ${isToday ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                                {day}
                            </div>
                            <div className="flex-1 mt-1 space-y-1 overflow-y-auto">
                                {dayTasks.map(task => (
                                    <button
                                        key={task.id}
                                        onClick={() => onSelectTask(task)}
                                        className={`w-full text-left p-1 text-xs bg-gray-50 hover:bg-blue-100 rounded border-l-4 ${PRIORITY_BORDER_COLORS[task.priorite]}`}
                                    >
                                        <p className="truncate">{task.titre}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskCalendar;
