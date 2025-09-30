import React from 'react';
import type { Processus } from '../types';
import { X, Edit, Link as LinkIcon } from 'lucide-react';
import GenericFicheContent from './GenericFicheContent';

interface ProcessusDetailPanelProps {
    processus: Processus;
    onClose: () => void;
    onEdit: (p: Processus) => void;
    onShowRelations: (entity: any, entityType: string) => void;
    onNavigate: (proc: Processus) => void;
}

const ProcessusDetailPanel: React.FC<ProcessusDetailPanelProps> = (props) => {
    const { processus, onClose, onEdit, onShowRelations } = props;

    return (
        <div className="w-full max-w-lg bg-white border-l shadow-lg flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={processus.nom}>{processus.nom}</h2>
                    <p className="text-sm text-gray-500">{processus.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onShowRelations(processus, 'processus')} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md" title="Voir les relations"><LinkIcon className="h-4 w-4"/></button>
                    <button onClick={() => onEdit(processus)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md" title="Modifier"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <GenericFicheContent 
                moduleId="processus"
                item={processus}
                {...props}
            />
        </div>
    );
};

export default ProcessusDetailPanel;
