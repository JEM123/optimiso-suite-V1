import React, { useState, useMemo } from 'react';
import type { Role } from '../types';
import { Plus, Search, Trash2, Edit, Users } from 'lucide-react';
import RoleDetailPanel from './RoleDetailPanel';
import RoleFormModal from './RoleFormModal';
import { useDataContext } from '../context/AppContext';
import { modules } from '../constants';

const ROLE_STATUS_COLORS: Record<Role['statut'], string> = {
    'brouillon': 'bg-gray-200 text-gray-800', 'en_cours': 'bg-yellow-100 text-yellow-800',
    'valide': 'bg-green-100 text-green-800', 'archive': 'bg-red-100 text-red-800',
    'à_créer': 'bg-cyan-100 text-cyan-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800',
    'gelé': 'bg-purple-100 text-purple-800', 'figé': 'bg-indigo-100 text-indigo-800',
    'planifié': 'bg-blue-100 text-blue-800', 'terminé': 'bg-green-100 text-green-800',
    'non-conforme': 'bg-red-200 text-red-900', 'clôturé': 'bg-gray-300 text-gray-800',
    'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-100 text-red-800',
    'en_validation': 'bg-yellow-100 text-yellow-800',
    'publie': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800',
};

const newRoleTemplate = (): Partial<Role> => ({
    nom: '',
    reference: '',
    statut: 'valide',
    personneIds: [],
    permissions: modules.reduce((acc, module) => {
        acc[module.id] = { C: false, R: false, U: false, D: false };
        return acc;
    }, {} as Role['permissions']),
    dateCreation: new Date(),
    dateModification: new Date(),
    auteurId: 'pers-1'
});

const RolesPage: React.FC = () => {
    const { data, actions } = useDataContext();
    const { roles } = data;

    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRoles = useMemo(() => {
        return roles.filter(r => r.nom.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [roles, searchTerm]);

    const handleOpenModal = (role?: Role) => { 
        setEditingRole(role || newRoleTemplate()); 
        setIsModalOpen(true); 
    };

    const handleSaveRole = async (roleToSave: Role) => {
        await actions.saveRole(roleToSave);
        setIsModalOpen(false);
    };

    const handleDeleteRole = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rôle ?")) {
            await actions.deleteRole(id);
            if (selectedRole?.id === id) setSelectedRole(null);
        }
    };

    return (
        <div className="flex h-[calc(100vh-150px)]">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b bg-white flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                        <Users className="h-8 w-8 text-gray-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Rôles</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium"><Plus className="h-4 w-4" /><span>Ajouter un rôle</span></button>
                    </div>
                </div>
                <div className="p-2 border-b bg-white">
                    <div className="relative flex-grow max-w-xs">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    <div className="bg-white border rounded-lg">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Nom', 'Description', 'Membres', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredRoles.map(role => (
                                    <tr key={role.id} onClick={() => setSelectedRole(role)} className={`hover:bg-gray-50 cursor-pointer ${selectedRole?.id === role.id ? 'bg-blue-50' : ''}`}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{role.nom}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500 max-w-sm truncate">{role.description}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{role.personneIds.length}</td>
                                        <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${ROLE_STATUS_COLORS[role.statut]}`}>{role.statut.replace(/_/g, ' ')}</span></td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center space-x-2">
                                                <button onClick={(e) => {e.stopPropagation(); handleOpenModal(role)}} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                                <button onClick={(e) => {e.stopPropagation(); handleDeleteRole(role.id)}} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {selectedRole && <RoleDetailPanel role={selectedRole} onClose={() => setSelectedRole(null)} onEdit={handleOpenModal} />}
            <RoleFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveRole} role={editingRole} />
        </div>
    );
};

export default RolesPage;