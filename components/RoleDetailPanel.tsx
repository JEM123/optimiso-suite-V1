import React, { useState } from 'react';
import type { Role } from '../types';
import { mockData } from '../constants';
import { X, Edit, Info, Shield, Users, Calendar } from 'lucide-react';
import PermissionsMatrix from './PermissionsMatrix';

interface RoleDetailPanelProps {
    role: Role;
    onClose: () => void;
    onEdit: (r: Role) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <p className="text-sm text-gray-900 mt-1">{value || '-'}</p>
    </div>
);

const RoleDetailPanel: React.FC<RoleDetailPanelProps> = ({ role, onClose, onEdit }) => {
    const [activeTab, setActiveTab] = useState('permissions');
    
    const assignedPeople = mockData.personnes.filter(p => role.personneIds.includes(p.id));

    return (
        <div className="w-full max-w-lg bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
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
            
            <div className="border-b">
                <nav className="flex space-x-1 sm:space-x-2 px-2 sm:px-4">
                    {[
                        { id: 'details', label: 'Détails', icon: Info },
                        { id: 'permissions', label: 'Permissions', icon: Shield },
                        { id: 'assignations', label: `Assignations (${assignedPeople.length})`, icon: Users },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
                {activeTab === 'details' && (
                    <div className="space-y-4">
                        <DetailItem label="Description" value={role.description} />
                        <DetailItem label="Statut" value={<span className="capitalize">{role.statut}</span>} />
                        <DetailItem label="Créé le" value={role.dateCreation.toLocaleDateString('fr-FR')} />
                        <DetailItem label="Modifié le" value={role.dateModification.toLocaleDateString('fr-FR')} />
                    </div>
                )}
                {activeTab === 'permissions' && (
                    <PermissionsMatrix permissions={role.permissions} isEditing={false} />
                )}
                {activeTab === 'assignations' && (
                     <div className="space-y-2">
                         {assignedPeople.map(p => (
                             <div key={p.id} className="flex items-center space-x-3 p-2 bg-white border rounded-md">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                                    {p.prenom[0]}{p.nom[0]}
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-gray-800">{p.prenom} {p.nom}</p>
                                    <p className="text-xs text-gray-500">{p.email}</p>
                                </div>
                            </div>
                         ))}
                         {assignedPeople.length === 0 && <p className="text-center text-sm text-gray-500 pt-4">Aucune personne assignée à ce rôle.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleDetailPanel;