
import React from 'react';
import type { Incident } from '../types';
import { mockData } from '../constants';
import { AlertTriangle, Clock } from 'lucide-react';

interface IncidentCardProps {
    incident: Incident;
    onSelectIncident: (incident: Incident) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

const PRIORITY_COLORS: Record<Incident['priorite'], string> = {
    'Faible': 'border-l-gray-400',
    'Moyenne': 'border-l-blue-500',
    'Élevée': 'border-l-yellow-500',
    'Critique': 'border-l-red-500'
};

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onSelectIncident, onDragStart }) => {
    const assignee = mockData.personnes.find(p => p.id === incident.assigneAId);
    const assigneeInitials = assignee ? `${assignee.prenom[0]}${assignee.nom[0]}` : '?';
    const isSlaBreached = new Date(incident.echeanceSLA) < new Date() && incident.statut !== 'Clôturé';

    return (
        <div
            className={`p-3 bg-white rounded-md shadow-sm border-l-4 hover:shadow-md cursor-pointer ${PRIORITY_COLORS[incident.priorite]}`}
            onClick={() => onSelectIncident(incident)}
            draggable
            onDragStart={onDragStart}
        >
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-800 pr-2">{incident.titre}</p>
                 {/* FIX: The `title` prop is not valid on lucide-react icons. Wrapped in a span to provide a tooltip. */}
                 {isSlaBreached && <span title="SLA dépassé"><AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" /></span>}
            </div>
             <p className="text-xs text-gray-500 mt-1">{incident.reference}</p>
            <div className="flex justify-between items-center mt-3">
                 <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(incident.echeanceSLA).toLocaleDateString('fr-FR')}
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

export default IncidentCard;