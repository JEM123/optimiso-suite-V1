import React from 'react';
import type { Role } from '../types';
import { X, Edit } from 'lucide-react';
import GenericFicheContent from './GenericFicheContent';

interface RoleDetailPanelProps {
    role: Role;
    onClose: () => void;
    onEdit: (r: Role) => void;
}

const RoleDetailPanel: React.FC<RoleDetailPanelProps> = (props) => {
    const { role, onClose, onEdit } = props;

    return (
        <div className="w-full bg-white border-l shadow-lg flex flex-col h-full animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">{role.nom}</h2>
                    <p className="text-sm text-gray-500">{role.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEdit(role)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <GenericFicheContent
                moduleId="roles"
                item={role}
                {...props}
            />
        </div>
    );
};

export default RoleDetailPanel;
