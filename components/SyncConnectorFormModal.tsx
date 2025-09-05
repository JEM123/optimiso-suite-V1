import React, { useState, useEffect } from 'react';
import { mockData } from '../constants';
import type { SyncConnector } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface SyncConnectorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (c: SyncConnector) => void;
    connector: Partial<SyncConnector> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const SyncConnectorFormModal: React.FC<SyncConnectorFormModalProps> = ({ isOpen, onClose, onSave, connector }) => {
    const [formData, setFormData] = useState<Partial<SyncConnector>>(connector || {});

    useEffect(() => { if (isOpen) setFormData(connector || {}); }, [connector, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleParamChange = (field: 'delimiter' | 'encoding', value: string) => {
        setFormData(prev => ({ ...prev, parametres: {...prev.parametres, [field]: value} }));
    };
    
    const handleMappingChange = (field: 'nom' | 'prenom' | 'email' | 'groupes', value: string) => {
         setFormData(prev => ({ ...prev, mappingAttributs: {...prev.mappingAttributs, [field]: value} }));
    };
    
    const handleGroupMappingChange = (index: number, field: 'csvGroup' | 'roleId', value: string) => {
        const newMappings = [...(formData.groupesMappingRoles || [])];
        newMappings[index] = {...newMappings[index], [field]: value};
        setFormData(prev => ({...prev, groupesMappingRoles: newMappings}));
    };
    
    const addGroupMapping = () => {
        const newMapping = { csvGroup: '', roleId: '' };
        setFormData(prev => ({...prev, groupesMappingRoles: [...(prev.groupesMappingRoles || []), newMapping]}));
    };

    const removeGroupMapping = (index: number) => {
        const newMappings = [...(formData.groupesMappingRoles || [])];
        newMappings.splice(index, 1);
        setFormData(prev => ({...prev, groupesMappingRoles: newMappings}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as SyncConnector);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-4xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                 <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-semibold">Configuration du Connecteur CSV</h2><button type="button" onClick={onClose}><X/></button></div>
                 <div className="flex-grow p-4 overflow-y-auto space-y-6">
                    <fieldset className="border p-4 rounded-lg"><legend className="px-2 text-base font-semibold text-gray-800">Paramètres CSV</legend>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Délimiteur</label><select value={formData.parametres?.delimiter} onChange={e=>handleParamChange('delimiter', e.target.value)} className={formInputClasses}><option value=";">Point-virgule (;)</option><option value=",">Virgule (,)</option></select></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Encodage</label><select value={formData.parametres?.encoding} onChange={e=>handleParamChange('encoding', e.target.value)} className={formInputClasses}><option value="UTF-8">UTF-8</option><option value="ISO-8859-1">ISO-8859-1</option></select></div>
                        </div>
                    </fieldset>
                    <fieldset className="border p-4 rounded-lg"><legend className="px-2 text-base font-semibold text-gray-800">Mapping des Attributs</legend>
                        <p className="text-xs text-gray-500 mb-2">Indiquez le nom exact des colonnes dans votre fichier CSV.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label><input placeholder="ex: NOM" value={formData.mappingAttributs?.nom} onChange={e=>handleMappingChange('nom', e.target.value)} className={formInputClasses}/></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Prénom</label><input placeholder="ex: PRENOM" value={formData.mappingAttributs?.prenom} onChange={e=>handleMappingChange('prenom', e.target.value)} className={formInputClasses}/></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input placeholder="ex: EMAIL" value={formData.mappingAttributs?.email} onChange={e=>handleMappingChange('email', e.target.value)} className={formInputClasses}/></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Groupes</label><input placeholder="ex: GROUPES" value={formData.mappingAttributs?.groupes} onChange={e=>handleMappingChange('groupes', e.target.value)} className={formInputClasses}/></div>
                        </div>
                    </fieldset>
                     <fieldset className="border p-4 rounded-lg"><legend className="px-2 text-base font-semibold text-gray-800">Mapping Groupes ↔ Rôles</legend>
                         {(formData.groupesMappingRoles || []).map((mapping, index) => (
                             <div key={index} className="flex items-center gap-2 mb-2">
                                <input placeholder="Nom du groupe CSV" value={mapping.csvGroup} onChange={e => handleGroupMappingChange(index, 'csvGroup', e.target.value)} className={formInputClasses}/>
                                <span>→</span>
                                <select value={mapping.roleId} onChange={e => handleGroupMappingChange(index, 'roleId', e.target.value)} className={formInputClasses}>{mockData.roles.map(r=><option key={r.id} value={r.id}>{r.nom}</option>)}</select>
                                <button type="button" onClick={()=>removeGroupMapping(index)}><Trash2 className="h-4 w-4 text-red-500"/></button>
                             </div>
                         ))}
                         <button type="button" onClick={addGroupMapping} className="text-sm text-blue-600 flex items-center gap-1"><Plus className="h-4 w-4"/>Ajouter un mapping</button>
                    </fieldset>
                    <div className="flex items-center gap-2"><input type="checkbox" name="modePilote" checked={formData.modePilote} onChange={handleChange} id="modePilote"/><label htmlFor="modePilote" className="text-sm font-medium">Mode Pilote (simuler sans modifier)</label></div>
                 </div>
                 <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default SyncConnectorFormModal;