import React, { useState, useMemo } from 'react';
import type { Incident, IncidentStatut } from '../types';
import IncidentCard from './IncidentCard';

interface IncidentKanbanBoardProps {
    incidents: Incident[];
    onSelectIncident: (incident: Incident) => void;
    onUpdateIncidentStatus: (incidentId: string, newStatus: IncidentStatut) => void;
}

const KANBAN_COLUMNS: IncidentStatut[] = ['Nouveau', 'En cours', 'Suspendu', 'Clôturé'];
const COLUMN_COLORS: Record<IncidentStatut, string> = {
    'Nouveau': 'border-t-blue-500',
    'En cours': 'border-t-yellow-500',
    'Suspendu': 'border-t-purple-500',
    'Clôturé': 'border-t-green-500'
};

const IncidentKanbanBoard: React.FC<IncidentKanbanBoardProps> = ({ incidents, onSelectIncident, onUpdateIncidentStatus }) => {
    const [draggedIncidentId, setDraggedIncidentId] = useState<string | null>(null);
    const [overColumn, setOverColumn] = useState<IncidentStatut | null>(null);

    const incidentsByStatus = useMemo(() => {
        return KANBAN_COLUMNS.reduce((acc, status) => {
            acc[status] = incidents.filter(inc => inc.statut === status);
            return acc;
        }, {} as Record<IncidentStatut, Incident[]>);
    }, [incidents]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, incidentId: string) => {
        setDraggedIncidentId(incidentId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: IncidentStatut) => {
        e.preventDefault();
        if (draggedIncidentId) {
            onUpdateIncidentStatus(draggedIncidentId, newStatus);
        }
        setDraggedIncidentId(null);
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
                        <h3 className="font-semibold text-gray-700">{status} <span className="text-sm font-normal text-gray-500">({incidentsByStatus[status].length})</span></h3>
                    </div>
                    <div className="flex-1 p-2 overflow-y-auto space-y-2">
                        {incidentsByStatus[status].map(incident => (
                            <IncidentCard 
                                key={incident.id} 
                                incident={incident} 
                                onSelectIncident={onSelectIncident}
                                onDragStart={(e) => handleDragStart(e, incident.id)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default IncidentKanbanBoard;