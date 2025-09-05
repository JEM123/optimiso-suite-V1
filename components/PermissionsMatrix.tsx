import React from 'react';
import { modules } from '../constants';
import type { Role } from '../types';
import { Check, X } from 'lucide-react';

interface PermissionsMatrixProps {
    permissions: Role['permissions'];
    isEditing: boolean;
    onChange?: (permissions: Role['permissions']) => void;
}

const PermissionsMatrix: React.FC<PermissionsMatrixProps> = ({ permissions, isEditing, onChange }) => {

    const handleSingleChange = (moduleId: string, perm: 'C' | 'R' | 'U' | 'D') => {
        if (!onChange) return;
        const newPermissions = JSON.parse(JSON.stringify(permissions));
        if (!newPermissions[moduleId]) {
            newPermissions[moduleId] = { C: false, R: false, U: false, D: false };
        }
        newPermissions[moduleId][perm] = !newPermissions[moduleId][perm];
        onChange(newPermissions);
    };
    
    const handleSelectAll = (perm: 'C' | 'R' | 'U' | 'D') => {
        if (!onChange) return;
        const allChecked = modules.every(m => permissions[m.id]?.[perm]);
        const newPermissions = JSON.parse(JSON.stringify(permissions));
        modules.forEach(m => {
             if(!newPermissions[m.id]) newPermissions[m.id] = { C: false, R: false, U: false, D: false };
             newPermissions[m.id][perm] = !allChecked;
        });
        onChange(newPermissions);
    };

    const handleRowSelectAll = (moduleId: string, checked: boolean) => {
        if (!onChange) return;
        const newPermissions = JSON.parse(JSON.stringify(permissions));
        newPermissions[moduleId] = { C: checked, R: checked, U: checked, D: checked };
        onChange(newPermissions);
    };

    const handleFullAccess = () => {
        if (!onChange) return;
        const newPermissions = JSON.parse(JSON.stringify(permissions));
        modules.forEach(m => {
            newPermissions[m.id] = { C: true, R: true, U: true, D: true };
        });
        onChange(newPermissions);
    };

    const handleReadOnly = () => {
        if (!onChange) return;
        const newPermissions = JSON.parse(JSON.stringify(permissions));
        modules.forEach(m => {
            newPermissions[m.id] = { C: false, R: true, U: false, D: false };
        });
        onChange(newPermissions);
    };

    const handleClearAll = () => {
        if (!onChange) return;
        const newPermissions = JSON.parse(JSON.stringify(permissions));
        modules.forEach(m => {
            newPermissions[m.id] = { C: false, R: false, U: false, D: false };
        });
        onChange(newPermissions);
    };

    const perms: Array<'C' | 'R' | 'U' | 'D'> = ['C', 'R', 'U', 'D'];
    const permLabels: Record<'C' | 'R' | 'U' | 'D', string> = { C: 'Créer', R: 'Lire', U: 'Modifier', D: 'Supprimer' };

    return (
        <div className="border rounded-lg bg-white">
            {isEditing && (
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border-b">
                    <button type="button" onClick={handleFullAccess} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Accès total</button>
                    <button type="button" onClick={handleReadOnly} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Lecture seule</button>
                    <button type="button" onClick={handleClearAll} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Tout effacer</button>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-600">Module</th>
                            {perms.map(p => (
                                <th key={p} className="px-4 py-2 text-center font-medium text-gray-600">
                                    {isEditing ? (
                                        <label className="flex flex-col items-center gap-1 cursor-pointer">
                                            <span>{permLabels[p]}</span>
                                            <input 
                                                type="checkbox" 
                                                className="rounded"
                                                checked={modules.every(m => permissions[m.id]?.[p])}
                                                onChange={() => handleSelectAll(p)}
                                            />
                                        </label>
                                    ) : (
                                        permLabels[p]
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {modules.map(module => {
                            const currentPerms = permissions[module.id] || { C: false, R: false, U: false, D: false };
                            const isAllChecked = Object.values(currentPerms).every(v => v);
                            return (
                                <tr key={module.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                         <div className="flex items-center gap-2">
                                            {isEditing && (
                                                <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={isAllChecked}
                                                    onChange={(e) => handleRowSelectAll(module.id, e.target.checked)}
                                                    title={`Tout sélectionner pour ${module.nom}`}
                                                />
                                            )}
                                            <span>{module.nom}</span>
                                        </div>
                                    </td>
                                    {perms.map(p => (
                                        <td key={p} className="px-4 py-2 text-center">
                                            {isEditing ? (
                                                <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={!!currentPerms[p]}
                                                    onChange={() => handleSingleChange(module.id, p)}
                                                />
                                            ) : (
                                                currentPerms[p]
                                                    ? <Check className="h-5 w-5 text-green-500 mx-auto" />
                                                    : <X className="h-5 w-5 text-red-500 mx-auto" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PermissionsMatrix;