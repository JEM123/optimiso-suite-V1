import React from 'react';
import type { Competence } from '../types';
import { X, Edit, Trash2 } from 'lucide-react';
import CompetenceRadarChart from './CompetenceRadarChart'; // Example of a custom section content

interface CompetenceDetailPanelProps {
    competence: Competence;
    onClose: () => void;
    onEdit: (c: Competence) => void;
    onDelete: (id: string) => void;
}

const CompetenceDetailPanel: React.FC<CompetenceDetailPanelProps> = ({ competence, onClose, onEdit, onDelete }) => {
    // Note: This component could be refactored to use GenericFicheContent
    // once sections for Competences are created and registered.
    return (
        <div className="w-full bg-white border-l shadow-lg flex flex-col h-full animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={competence.nom}>{competence.nom}</h2>
                    <p className="text-sm text-gray-500">{competence.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEdit(competence)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={() => onDelete(competence.id)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Trash2 className="h-4 w-4 text-red-500"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
                <p>{competence.description}</p>
            </div>
        </div>
    );
};

export default CompetenceDetailPanel;