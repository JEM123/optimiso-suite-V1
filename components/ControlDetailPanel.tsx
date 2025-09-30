import React from 'react';
import type { Controle } from '../types';
import { X, Edit, Link as LinkIcon } from 'lucide-react';
import GenericFicheContent from './GenericFicheContent';

interface ControlDetailPanelProps {
    control: Controle;
    onClose: () => void;
    onEdit: (c: Controle) => void;
    onShowRelations: (entity: any, entityType: string) => void;
}

const ControlDetailPanel: React.FC<ControlDetailPanelProps> = (props) => {
    const { control, onClose, onEdit, onShowRelations } = props;

    return (
        <div className="bg-white border-l shadow-lg flex flex-col h-full animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={control.nom}>{control.nom}</h2>
                    <p className="text-sm text-gray-500">{control.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onShowRelations(control, 'controles')} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><LinkIcon className="h-4 w-4"/></button>
                    <button onClick={() => onEdit(control)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <GenericFicheContent 
                moduleId="controles"
                item={control}
                {...props}
            />
        </div>
    );
};

export default ControlDetailPanel;
