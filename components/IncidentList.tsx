import React from 'react';
import type { Incident } from '../types';
import { mockData } from '../constants';
import { Edit, Trash2 } from 'lucide-react';

interface IncidentListProps {
    incidents: Incident[];
    onSelectIncident: (incident: Incident) => void;
    onEdit: (incident: Incident) => void;
    onDelete: (incidentId: string) => void;
}

const PRIORITY_COLORS: Record<Incident['priorite'], string> = {
    'Faible': 'bg-gray-100 text-gray-800', 'Moyenne': 'bg-blue-100 text-blue-800',
    'Élevée': 'bg-yellow-100 text-yellow-800', 'Critique': 'bg-red-100 text-red-800'
};

const STATUS_COLORS: Record<Incident['statut'], string> = {
    'Nouveau': 'bg-blue-100 text-blue-800', 'En cours': 'bg-yellow-100 text-yellow-800',
    'Suspendu': 'bg-purple-100 text-purple-800', 'Clôturé': 'bg-green-100 text-green-800'
};

const IncidentList: React.FC<IncidentListProps> = ({ incidents, onSelectIncident, onEdit, onDelete }) => {
    return (
        <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        {['Référence', 'Titre', 'Priorité', 'Assigné', 'Échéance SLA', 'Statut', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {incidents.map(incident => {
                        const assignee = mockData.personnes.find(p => p.id === incident.assigneAId);
                        const isSlaBreached = new Date(incident.echeanceSLA) < new Date() && incident.statut !== 'Clôturé';
                        return (
                            <tr key={incident.id} onClick={() => onSelectIncident(incident)} className="hover:bg-gray-50 cursor-pointer">
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{incident.reference}</td>
                                <td className="px-4 py-2 text-sm text-gray-700 max-w-xs truncate">{incident.titre}</td>
                                <td className="px-4 py-2 text-sm">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${PRIORITY_COLORS[incident.priorite]}`}>{incident.priorite}</span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">{assignee ? `${assignee.prenom} ${assignee.nom}` : 'N/A'}</td>
                                <td className={`px-4 py-2 text-sm ${isSlaBreached ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                    {new Date(incident.echeanceSLA).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[incident.statut]}`}>{incident.statut}</span>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={(e) => { e.stopPropagation(); onEdit(incident); }} className="p-1 hover:bg-gray-200 rounded">
                                            <Edit className="h-4 w-4 text-blue-600"/>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); onDelete(incident.id); }} className="p-1 hover:bg-gray-200 rounded">
                                            <Trash2 className="h-4 w-4 text-red-600"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default IncidentList;