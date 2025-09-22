import React from 'react';
import type { Amelioration, Personne } from '../types';
import { useDataContext } from '../context/AppContext';

interface AmeliorationCardProps {
    amelioration: Amelioration;
    onSelectAmelioration: (amelioration: Amelioration) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

const PRIORITY_COLORS: Record<Amelioration['priorite'], string> = {
    'basse': 'border-l-gray-400',
    'moyenne': 'border-l-blue-500',
    'haute': 'border-l-yellow-500',
    'critique': 'border-l-red-500'
};

const AmeliorationCard: React.FC<AmeliorationCardProps> = ({ amelioration, onSelectAmelioration, onDragStart }) => {
    const { data } = useDataContext();
    const pilote = (data.personnes as Personne[]).find(p => p.id === amelioration.piloteId);
    const piloteInitials = pilote ? `${pilote.prenom[0]}${pilote.nom[0]}` : '?';

    const totalActions = amelioration.actions.length;
    const doneActions = amelioration.actions.filter(a => a.statut === 'Fait').length;
    const progress = totalActions > 0 ? (doneActions / totalActions) * 100 : 0;
    
    return (
        <div
            className={`p-3 bg-white rounded-md shadow-sm border-l-4 hover:shadow-md cursor-pointer ${PRIORITY_COLORS[amelioration.priorite]}`}
            onClick={() => onSelectAmelioration(amelioration)}
            draggable
            onDragStart={onDragStart}
        >
            <p className="text-sm font-medium text-gray-800 pr-2">{amelioration.titre}</p>
            <p className="text-xs text-gray-500 mt-1">{amelioration.reference}</p>
            
            <div className="mt-3">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span>{doneActions}/{totalActions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-3">
                <div className="text-xs text-gray-500">
                    Pilote:
                </div>
                <div 
                    className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600"
                    title={pilote ? `${pilote.prenom} ${pilote.nom}` : 'Non assigné'}
                >
                    {piloteInitials}
                </div>
            </div>
        </div>
    );
};

export default AmeliorationCard;
