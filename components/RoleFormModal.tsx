import React, { useState, useEffect, useMemo } from 'react';
import { mockData } from '../constants';
import type { Role } from '../types';
import { X } from 'lucide-react';
import PermissionsMatrix from './PermissionsMatrix';

interface RoleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (r: Role) => void;
    role?: Partial<Role> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const MultiSelectPeople: React.FC<{ selectedIds: string[], onChange: (ids: string[]) => void }> = ({ selectedIds, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredPeople = useMemo(() => {
        return mockData.personnes.filter(p => 
            `${p.prenom} ${p.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const handleSelect = (id: string) => {
        const newSelectedIds = selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id];
        onChange(newSelectedIds);
    };
    
    return (
        <div className="space-y-2">
            <input 
                type="search"
                placeholder="Rechercher une personne..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={formInputClasses}
            />
            <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1 bg-white">
                {filteredPeople.map(item => (
                    <label key={item.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelect(item.id)} className="rounded" />
                        <span className="text-sm">{item.prenom} {item.nom}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({ isOpen, onClose, onSave, role }) => {
    const [formData, setFormData] = useState<Partial<Role>>(role || {});
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        if (isOpen) {
            setFormData(role || {});
            setActiveTab('general');
        }
    }, [role, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionsChange = (newPermissions: Role['permissions']) => {
        setFormData(prev => ({ ...prev, permissions: newPermissions }));
    };

    const handlePeopleChange = (personneIds: string[]) => {
        setFormData(prev => ({...prev, personneIds}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Role);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-4xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier le Rôle' : 'Nouveau Rôle'}</h2>
                    <button type="button" onClick={onClose}><X className="h-5 w-5"/></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    <nav className="flex space-x-4 border-b mb-4">
                        <button type="button" onClick={() => setActiveTab('general')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Général</button>
                        <button type="button" onClick={() => setActiveTab('permissions')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'permissions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Permissions</button>
                        <button type="button" onClick={() => setActiveTab('assignations')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'assignations' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Assignations</button>
                    </nav>

                    {activeTab === 'general' && (
                        <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nom du rôle</label><input type="text" name="nom" value={formData.nom || ''} onChange={handleChange} className={formInputClasses} required /></div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Référence</label><input type="text" name="reference" value={formData.reference || ''} onChange={handleChange} className={formInputClasses} /></div>
                            </div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className={formInputClasses}></textarea></div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
                                <select name="statut" value={formData.statut || 'valide'} onChange={handleChange} className={formInputClasses}>
                                    <option value="valide">Valide</option>
                                    <option value="archive">Archivé</option>
                                </select>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'permissions' && (
                        <PermissionsMatrix permissions={formData.permissions!} isEditing={true} onChange={handlePermissionsChange} />
                    )}

                    {activeTab === 'assignations' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Personnes assignées</label>
                            <MultiSelectPeople selectedIds={formData.personneIds || []} onChange={handlePeopleChange} />
                        </div>
                    )}

                </div>
                <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default RoleFormModal;