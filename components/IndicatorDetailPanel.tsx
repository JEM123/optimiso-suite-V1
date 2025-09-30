import React from 'react';
import type { Indicateur } from '../types';
import { Edit, Link as LinkIcon, X, Plus } from 'lucide-react';
import GenericFicheContent from './GenericFicheContent';
import IndicatorChart from './IndicatorChart';

interface IndicatorDetailPanelProps {
    indicator: Indicateur;
    onClose: () => void;
    onEdit: (indicator: Indicateur) => void;
    onAddMeasure: () => void;
    onShowRelations: (entity: any, entityType: string) => void;
}

// FIX: Added component implementation and default export to resolve import error.
const IndicatorDetailPanel: React.FC<IndicatorDetailPanelProps> = (props) => {
    const { indicator, onClose, onEdit, onShowRelations, onAddMeasure } = props;

    return (
        <div className="bg-white border-l shadow-lg flex flex-col h-full animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={indicator.nom}>{indicator.nom}</h2>
                    <p className="text-sm text-gray-500">{indicator.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onAddMeasure()} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md" title="Ajouter une mesure"><Plus className="h-4 w-4"/></button>
                    <button onClick={() => onShowRelations(indicator, 'indicateurs')} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md" title="Voir les relations"><LinkIcon className="h-4 w-4"/></button>
                    <button onClick={() => onEdit(indicator)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md" title="Modifier"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>

            <div className="h-64 p-4 border-b">
                <IndicatorChart indicator={indicator} />
            </div>
            
            <GenericFicheContent 
                moduleId="indicateurs"
                item={indicator}
                {...props}
            />
        </div>
    );
};

export default IndicatorDetailPanel;
