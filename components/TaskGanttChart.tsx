import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { Tache } from '../types';
import { ClipboardList, AlertCircle } from 'lucide-react';

const dayInMillis = 1000 * 60 * 60 * 24;

const daysBetween = (date1: Date, date2: Date): number => {
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / dayInMillis));
};

const TaskBar: React.FC<{ task: Tache; startDate: Date; totalDays: number; y: number; height: number, setRef: (el: HTMLDivElement | null) => void }> = ({ task, startDate, totalDays, y, height, setRef }) => {
    const taskStart = new Date(task.dateCreation);
    const taskEnd = new Date(task.dateEcheance);

    const startOffsetDays = daysBetween(taskStart, startDate);
    const durationDays = daysBetween(taskEnd, taskStart) + 1;

    const left = (startOffsetDays / totalDays) * 100;
    const width = (durationDays / totalDays) * 100;

    const statusColors = {
        'Fait': 'bg-green-500',
        'En cours': 'bg-blue-500',
        'A faire': 'bg-blue-300',
        'En attente': 'bg-gray-400',
        'Bloquee': 'bg-red-500',
        'Annulee': 'bg-gray-300',
    };
    
    return (
        <div
            ref={setRef}
            className="absolute rounded group"
            style={{
                top: `${y}px`,
                left: `${left}%`,
                width: `${width}%`,
                height: `${height}px`,
            }}
        >
            <div className={`w-full h-full rounded ${statusColors[task.statut]} opacity-80 flex items-center px-2`}>
                 <p className="text-white text-xs font-medium truncate">{task.titre}</p>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                {task.titre}
            </div>
        </div>
    );
};

const TaskGanttChart: React.FC<{ tasks: Tache[] }> = ({ tasks }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const taskBarRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [dependencyLines, setDependencyLines] = useState<React.ReactNode[]>([]);
    const [containerHeight, setContainerHeight] = useState(0);

    const groupedTasks = useMemo(() => {
        const procedureTasks: Record<string, Tache[]> = {};
        const adHocTasks: Tache[] = [];
        tasks.forEach(task => {
            if (task.procedureInstanceName) {
                if (!procedureTasks[task.procedureInstanceName]) {
                    procedureTasks[task.procedureInstanceName] = [];
                }
                procedureTasks[task.procedureInstanceName].push(task);
            } else {
                adHocTasks.push(task);
            }
        });
        return { procedureTasks, adHocTasks };
    }, [tasks]);

    const { startDate, endDate, totalDays } = useMemo(() => {
        if (tasks.length === 0) {
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);
            return { startDate: today, endDate: tomorrow, totalDays: 1 };
        }
        const startDates = tasks.map(t => new Date(t.dateCreation));
        const endDates = tasks.map(t => new Date(t.dateEcheance));
        const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));
        minDate.setHours(0, 0, 0, 0);
        maxDate.setHours(23, 59, 59, 999);
        const diffDays = daysBetween(maxDate, minDate) + 1;
        return { startDate: minDate, endDate: maxDate, totalDays: diffDays < 1 ? 1 : diffDays };
    }, [tasks]);

    useEffect(() => {
        const calculateLines = () => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const lines: React.ReactNode[] = [];

            tasks.forEach(task => {
                if (!task.predecessorIds) return;
                const targetEl = taskBarRefs.current[task.id];
                if (!targetEl) return;
                const targetRect = targetEl.getBoundingClientRect();

                task.predecessorIds.forEach(predId => {
                    const sourceEl = taskBarRefs.current[predId];
                    if (!sourceEl) return;
                    const sourceRect = sourceEl.getBoundingClientRect();

                    const sourceX = sourceRect.right - containerRect.left;
                    const sourceY = sourceRect.top - containerRect.top + sourceRect.height / 2;
                    const targetX = targetRect.left - containerRect.left;
                    const targetY = targetRect.top - containerRect.top + targetRect.height / 2;
                    
                    if(targetX > sourceX) {
                        const pathD = `M ${sourceX} ${sourceY} L ${sourceX + 10} ${sourceY} L ${sourceX + 10} ${targetY} L ${targetX} ${targetY}`;
                        lines.push(<path key={`${predId}-${task.id}`} d={pathD} stroke="#4b5563" strokeWidth="1" fill="none" markerEnd="url(#arrow)" />);
                    }
                });
            });
            setDependencyLines(lines);
        };
        
        // Timeout to ensure refs are set and layout is stable
        const timer = setTimeout(calculateLines, 100);
        return () => clearTimeout(timer);
    }, [tasks, startDate, totalDays, containerHeight]);
    
    useEffect(() => {
        if (containerRef.current) {
            setContainerHeight(containerRef.current.scrollHeight);
        }
    }, [groupedTasks]);

    if (tasks.length === 0) {
        return <div className="text-center p-8 text-gray-500">Aucune tâche à afficher dans la vue Gantt.</div>;
    }

    const BAR_HEIGHT = 20;
    const BAR_MARGIN = 10;
    const GROUP_HEADER_HEIGHT = 30;
    const GROUP_PADDING = 10;

    let currentY = GROUP_PADDING;
    const taskPositions: Record<string, number> = {};

    // FIX: Changed Object.values(...).forEach to Object.keys(...).forEach to avoid type errors.
    Object.keys(groupedTasks.procedureTasks).forEach(instanceName => {
        const instanceTasks = groupedTasks.procedureTasks[instanceName];
        currentY += GROUP_HEADER_HEIGHT;
        instanceTasks.forEach(task => {
            taskPositions[task.id] = currentY;
            currentY += BAR_HEIGHT + BAR_MARGIN;
        });
        currentY += GROUP_PADDING;
    });
    if (groupedTasks.adHocTasks.length > 0) {
        currentY += GROUP_HEADER_HEIGHT;
        groupedTasks.adHocTasks.forEach(task => {
            taskPositions[task.id] = currentY;
            currentY += BAR_HEIGHT + BAR_MARGIN;
        });
    }

    return (
        <div className="bg-white p-4 rounded-lg border relative" ref={containerRef} style={{ height: `${containerHeight}px` }}>
            <svg width="100%" height={containerHeight} className="absolute top-0 left-0 pointer-events-none z-0">
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563" />
                    </marker>
                </defs>
                {dependencyLines}
            </svg>

            <div className="relative z-10">
                {/* FIX: Changed Object.entries(...).map to Object.keys(...).map to avoid type errors. */}
                {Object.keys(groupedTasks.procedureTasks).map(instanceName => {
                    const instanceTasks = groupedTasks.procedureTasks[instanceName];
                    const firstTaskY = taskPositions[instanceTasks[0].id] ?? 0;
                    return (
                        <div key={instanceName} className="mb-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 h-6" style={{ top: `${firstTaskY - GROUP_HEADER_HEIGHT}px` }}>
                                <ClipboardList className="h-4 w-4" />
                                <span className="truncate">{instanceName}</span>
                            </div>
                            {instanceTasks.map(task => (
                                <TaskBar
                                    key={task.id}
                                    task={task}
                                    startDate={startDate}
                                    totalDays={totalDays}
                                    y={taskPositions[task.id]}
                                    height={BAR_HEIGHT}
                                    setRef={el => taskBarRefs.current[task.id] = el}
                                />
                            ))}
                        </div>
                    );
                })}

                {groupedTasks.adHocTasks.length > 0 && (
                     <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 h-6">
                            <AlertCircle className="h-4 w-4" />
                            <span>Tâches Ad-Hoc</span>
                        </div>
                        {groupedTasks.adHocTasks.map(task => (
                            <TaskBar
                                key={task.id}
                                task={task}
                                startDate={startDate}
                                totalDays={totalDays}
                                y={taskPositions[task.id]}
                                height={BAR_HEIGHT}
                                setRef={el => taskBarRefs.current[task.id] = el}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskGanttChart;
