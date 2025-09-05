import React from 'react';
import type { Amelioration } from '../types';
import { mockData } from '../constants';
import { Edit, Trash2 } from 'lucide-react';

interface AmeliorationListProps {
    ameliorations: Amelioration[];
    onSelectAmelioration: (amelioration: Amelioration) => void;
    onEdit: (amelioration: Amelioration) => void;
    onDelete: (id: string) => void;
}

const PRIORITY_COLORS: Record<Amelioration['priorite'], string> = {
    'basse': 'bg-gray-100 text-gray-800', 'moyenne': 'bg-blue-100 text-blue-800',
    'haute': 'bg-yellow-100 text-yellow-800', 'critique': 'bg-red-100 text-red-800'
};

const STATUS_COLORS: Record<Amelioration['statut'], string> = {
    'Nouveau': 'bg-blue-100 text-blue-800', 'En cours': 'bg-yellow-100 text-yellow-800',
    'Suspendu': 'bg-purple-100 text-purple-800', 'Clôturé': 'bg-green-100 text-green-800'
};

const AmeliorationList: React.FC<AmeliorationListProps> = ({ ameliorations, onSelectAmelioration, onEdit, onDelete }) => {
    return (
        <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        {['Titre', 'Type', 'Priorité', 'Pilote', 'Avancement', 'Statut', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {ameliorations.map(amelioration => {
                        const pilote = mockData.personnes.find(p => p.id === amelioration.piloteId);
                        const totalActions = amelioration.actions.length;
                        const doneActions = amelioration.actions.filter(a => a.statut === 'Fait').length;
                        const progress = totalActions > 0 ? (doneActions / totalActions) * 100 : 0;

                        return (
                            <tr key={amelioration.id} onClick={() => onSelectAmelioration(amelioration)} className="hover:bg-gray-50 cursor-pointer">
                                <td className="px-4 py-2 text-sm font-medium text-gray-900 max-w-xs truncate">{amelioration.titre}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{amelioration.type}</td>
                                <td className="px-4 py-2 text-sm">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${PRIORITY_COLORS[amelioration.priorite]}`}>{amelioration.priorite}</span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">{pilote ? `${pilote.prenom} ${pilote.nom}` : 'N/A'}</td>
                                <td className="px-4 py-2 text-sm">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-sm">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[amelioration.statut]}`}>{amelioration.statut}</span>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={(e) => { e.stopPropagation(); onEdit(amelioration); }} className="p-1 hover:bg-gray-200 rounded">
                                            <Edit className="h-4 w-4 text-blue-600"/>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); onDelete(amelioration.id); }} className="p-1 hover:bg-gray-200 rounded">
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

export default AmeliorationList;
