import React from 'react';
import type { Actif } from '../types';
import { X, Edit } from 'lucide-react';
import GenericFicheContent from './GenericFicheContent';

interface ActifDetailPanelProps {
    actif: Actif;
    onClose: () => void;
    onEdit: (a: Actif) => void;
    onAddMaintenance: (actifId: string) => void;
}

const ActifDetailPanel: React.FC<ActifDetailPanelProps> = (props) => {
    const { actif, onClose, onEdit } = props;

    return (
        <div className="bg-white border-l shadow-lg flex flex-col h-full animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={actif.nom}>{actif.nom}</h2>
                    <p className="text-sm text-gray-500">{actif.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEdit(actif)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <GenericFicheContent
                moduleId="actifs"
                item={actif}
                {...props}
            />
        </div>
    );
};

export default ActifDetailPanel;
