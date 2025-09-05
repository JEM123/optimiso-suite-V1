import React, { useState, useMemo } from 'react';
import type { Amelioration, AmeliorationStatut } from '../types';
import AmeliorationCard from './AmeliorationCard';

interface AmeliorationKanbanProps {
    ameliorations: Amelioration[];
    onSelectAmelioration: (amelioration: Amelioration) => void;
    onUpdateStatus: (id: string, newStatus: AmeliorationStatut) => void;
}

const KANBAN_COLUMNS: AmeliorationStatut[] = ['Nouveau', 'En cours', 'Suspendu', 'Clôturé'];
const COLUMN_COLORS: Record<AmeliorationStatut, string> = {
    'Nouveau': 'border-t-blue-500',
    'En cours': 'border-t-yellow-500',
    'Suspendu': 'border-t-purple-500',
    'Clôturé': 'border-t-green-500'
};

const AmeliorationKanban: React.FC<AmeliorationKanbanProps> = ({ ameliorations, onSelectAmelioration, onUpdateStatus }) => {
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [overColumn, setOverColumn] = useState<AmeliorationStatut | null>(null);

    const itemsByStatus = useMemo(() => {
        return KANBAN_COLUMNS.reduce((acc, status) => {
            acc[status] = ameliorations.filter(item => item.statut === status);
            return acc;
        }, {} as Record<AmeliorationStatut, Amelioration[]>);
    }, [ameliorations]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: AmeliorationStatut) => {
        e.preventDefault();
        if (draggedId) {
            onUpdateStatus(draggedId, newStatus);
        }
        setDraggedId(null);
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
                        <h3 className="font-semibold text-gray-700">{status} <span className="text-sm font-normal text-gray-500">({itemsByStatus[status].length})</span></h3>
                    </div>
                    <div className="flex-1 p-2 overflow-y-auto space-y-2">
                        {itemsByStatus[status].map(item => (
                            <AmeliorationCard 
                                key={item.id} 
                                amelioration={item} 
                                onSelectAmelioration={onSelectAmelioration}
                                onDragStart={(e) => handleDragStart(e, item.id)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AmeliorationKanban;
