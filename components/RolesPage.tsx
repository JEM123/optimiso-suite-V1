import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { Role } from '../types';
import { Plus, Search, Trash2, Edit, Users, Eye } from 'lucide-react';
import RoleDetailPanel from './RoleDetailPanel';
import RoleFormModal from './RoleFormModal';
import { useDataContext, usePermissions } from '../context/AppContext';
import { modules } from '../constants';
import PageHeader from './PageHeader';

const ROLE_STATUS_COLORS: Record<Role['statut'], string> = { 'brouillon': 'bg-gray-200 text-gray-800', 'en_cours': 'bg-yellow-100 text-yellow-800', 'valide': 'bg-green-100 text-green-800', 'archive': 'bg-red-100 text-red-800', 'à_créer': 'bg-cyan-100 text-cyan-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800', 'gelé': 'bg-purple-100 text-purple-800', 'figé': 'bg-indigo-100 text-indigo-800', 'planifié': 'bg-blue-100 text-blue-800', 'terminé': 'bg-green-100 text-green-800', 'non-conforme': 'bg-red-200 text-red-900', 'clôturé': 'bg-gray-300 text-gray-800', 'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-200 text-red-900', 'en_validation': 'bg-yellow-100 text-yellow-800', 'publie': 'bg-green-100 text-green-800', 'rejete': 'bg-red-100 text-red-800', };
const newRoleTemplate = (): Partial<Role> => ({ nom: '', reference: '', statut: 'valide', personneIds: [], permissions: modules.reduce((acc, module) => { acc[module.id] = { C: false, R: false, U: false, D: false }; return acc; }, {} as Role['permissions']), dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1' });

const RolesPage: React.FC = () => {
    const { data, actions } = useDataContext();
    const { can } = usePermissions();
    const { roles } = data;

    const [viewMode, setViewMode] = useState<'list-fiche' | 'list'>('list-fiche');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dividerPosition, setDividerPosition] = useState(50);

    const filteredRoles = useMemo(() => {
        return (roles as Role[]).filter(r => r.nom.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [roles, searchTerm]);

    const handleOpenModal = (role?: Role) => { setEditingRole(role || newRoleTemplate()); setIsModalOpen(true); };
    const handleSaveRole = async (roleToSave: Role) => {
        await actions.saveRole(roleToSave);
        if (selectedRole?.id === roleToSave.id) setSelectedRole(roleToSave);
        setIsModalOpen(false);
    };
    const handleDeleteRole = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rôle ?")) {
            await actions.deleteRole(id);
            if (selectedRole?.id === id) setSelectedRole(null);
        }
    };
    
    const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); setIsResizing(true); };
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const newPos = ((e.clientX - rect.left) / rect.width) * 100;
            if (newPos > 20 && newPos < 80) { setDividerPosition(newPos); }
        }
    }, [isResizing]);
    const handleMouseUp = useCallback(() => setIsResizing(false), []);
    
    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    const listPanel = (
        <div className="bg-white flex flex-col h-full border-r">
            <div className="p-2 border-b">
                <div className="relative flex-grow max-w-xs">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/>
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0"><tr>{['Nom', 'Membres', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredRoles.map(role => (
                            <tr key={role.id} onClick={() => setSelectedRole(role)} className={`hover:bg-gray-50 cursor-pointer ${selectedRole?.id === role.id ? 'bg-blue-50' : ''}`}>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{role.nom}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{role.personneIds.length}</td>
                                <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${ROLE_STATUS_COLORS[role.statut]}`}>{role.statut.replace(/_/g, ' ')}</span></td>
                                <td className="px-4 py-2"><div className="flex items-center space-x-2">
                                    <button onClick={(e) => {e.stopPropagation(); handleOpenModal(role)}} disabled={!can('U', 'roles')} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                    <button onClick={(e) => {e.stopPropagation(); handleDeleteRole(role.id)}} disabled={!can('D', 'roles')} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                                </div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="Rôles & Permissions"
                icon={Users}
                actions={[
                    { label: "Nouveau Rôle", icon: Plus, onClick: () => handleOpenModal(), variant: 'primary', disabled: !can('C', 'roles') },
                    { label: viewMode === 'list' ? 'Liste + Fiche' : 'Liste', icon: Eye, onClick: () => setViewMode(v => v === 'list' ? 'list-fiche' : 'list'), variant: 'secondary' }
                ]}
            />
            <div ref={containerRef} className="flex-1 flex overflow-hidden">
                {viewMode === 'list' && <div className="w-full h-full">{listPanel}</div>}
                {viewMode === 'list-fiche' && (
                    <>
                        <div style={{ width: `${dividerPosition}%` }} className="h-full flex-shrink-0">{listPanel}</div>
                        <div onMouseDown={handleMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors flex-shrink-0" />
                        <div style={{ width: `${100 - dividerPosition}%` }} className="h-full flex-shrink-0 overflow-y-auto">
                            {selectedRole ? (
                                <RoleDetailPanel role={selectedRole} onClose={() => setSelectedRole(null)} onEdit={handleOpenModal} />
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-gray-500 bg-white"><p>Sélectionnez un rôle pour voir ses détails et permissions.</p></div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <RoleFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveRole} role={editingRole} />
        </div>
    );
};

export default RolesPage;
