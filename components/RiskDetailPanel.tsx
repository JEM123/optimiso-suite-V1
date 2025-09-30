import React from 'react';
import type { Risque } from '../types';
import { X, Edit, Link as LinkIcon } from 'lucide-react';
import GenericFicheContent from './GenericFicheContent';

interface RiskDetailPanelProps {
    risque: Risque;
    onClose: () => void;
    onEdit: (r: Risque) => void;
    onShowRelations: (entity: any, entityType: string) => void;
}

const RiskDetailPanel: React.FC<RiskDetailPanelProps> = (props) => {
    const { risque, onClose, onEdit, onShowRelations } = props;

    return (
        <div className="bg-white border-l shadow-lg flex flex-col h-full animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={risque.nom}>{risque.nom}</h2>
                    <p className="text-sm text-gray-500">{risque.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onShowRelations(risque, 'risques')} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md" title="Voir les relations"><LinkIcon className="h-4 w-4"/></button>
                    <button onClick={() => onEdit(risque)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md" title="Modifier"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <GenericFicheContent
                moduleId="risques"
                item={risque}
                {...props}
            />
        </div>
    );
};

export default RiskDetailPanel;
