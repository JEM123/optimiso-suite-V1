
import React from 'react';
import type { Entite } from '../types';
import { Edit, X } from 'lucide-react';
import EntityFicheContent from './EntityFicheContent';

interface EntityDetailPanelProps { 
    entity: Entite; 
    onClose: () => void; 
    onEdit: (e: Entite) => void; 
    onAddSub: (e: Entite) => void; 
    onReorder: (childId: string, direction: 'up' | 'down') => void; 
    allEntities: Entite[];
}

const EntityDetailPanel: React.FC<EntityDetailPanelProps> = ({ entity, onClose, onEdit }) => {
    
    return (
        <div className="w-full bg-white flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">{entity.nom}</h2>
                    <p className="text-sm text-gray-500">{entity.code}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEdit(entity)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
           
            <EntityFicheContent entite={entity} onShowRelations={() => {}} />
        </div>
    );
};

export default EntityDetailPanel;
