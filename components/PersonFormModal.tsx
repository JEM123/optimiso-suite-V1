import React, { useState, useEffect } from 'react';
import { mockData } from '../constants';
import type { Personne, CustomFieldDef } from '../types';
import { X } from 'lucide-react';
import { useAppContext, useDataContext } from '../context/AppContext';

interface PersonFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (p: Personne) => void;
    person?: Partial<Personne> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const MultiSelect: React.FC<{ items: any[], selectedIds: string[], onChange: (ids: string[]) => void, label: string }> = ({ items, selectedIds, onChange, label }) => {
    const handleSelect = (id: string) => {
        const newSelectedIds = selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id];
        onChange(newSelectedIds);
    }
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <div className="max-h-24 overflow-y-auto border rounded-md p-2 space-y-1 bg-white">
                {items.map(item => (
                    <label key={item.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50">
                        <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelect(item.id)} className="rounded" />
                        <span className="text-sm">{item.nom || item.intitule}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

const PersonFormModal: React.FC<PersonFormModalProps> = ({ isOpen, onClose, onSave, person }) => {
    const { settings } = useAppContext();
    const { data } = useDataContext();
    const { personnes } = data;
    const [formData, setFormData] = useState<Partial<Personne>>(person || {});

    const customFieldDefs = settings.customFields.personnes || [];

    useEffect(() => {
        if (isOpen) {
            const initialData = person && Object.keys(person).length > 0 ? JSON.parse(JSON.stringify(person)) : {};
            if (!initialData.id) {
                // Generate reference for new person
                const refSettings = settings.references.personnes;
                const nextId = (personnes as Personne[]).length + 1;
                initialData.reference = `${refSettings.prefix}${String(nextId).padStart(refSettings.digits, '0')}`;
            }
            if (!initialData.champsLibres) {
                initialData.champsLibres = {};
            }
            setFormData(initialData);
        }
    }, [person, isOpen, settings, personnes]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            champsLibres: {
                ...prev.champsLibres,
                [name]: value
            }
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(p => ({ ...p, [name]: checked }));
    };

    const handleMultiSelectChange = (name: keyof Personne, selectedIds: string[]) => {
        setFormData(prev => ({ ...prev, [name]: selectedIds }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Personne);
    };

    const renderCustomField = (field: CustomFieldDef) => {
        const value = formData.champsLibres?.[field.name] || '';
        switch (field.type) {
            case 'number':
                return <input type="number" name={field.name} value={value} onChange={handleCustomFieldChange} className={formInputClasses} required={field.required} />;
            case 'date':
                return <input type="date" name={field.name} value={value} onChange={handleCustomFieldChange} className={formInputClasses} required={field.required} />;
            case 'text':
            default:
                return <input type="text" name={field.name} value={value} onChange={handleCustomFieldChange} className={formInputClasses} required={field.required} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier la Personne' : 'Nouvelle Personne'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Prénom</label><input type="text" name="prenom" value={formData.prenom || ''} onChange={handleChange} className={formInputClasses} required /></div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label><input type="text" name="nom" value={formData.nom || ''} onChange={handleChange} className={formInputClasses} required /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={formInputClasses} required /></div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Profil</label><select name="profil" value={formData.profil || ''} onChange={handleChange} className={formInputClasses}>{['administrateur', 'editeur', 'acteur', 'lecteur'].map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Référence</label><input type="text" name="reference" value={formData.reference || ''} onChange={handleChange} className={formInputClasses} disabled /></div>
                    </div>
                     <MultiSelect items={mockData.postes} selectedIds={formData.posteIds || []} onChange={(ids) => handleMultiSelectChange('posteIds', ids)} label="Postes" />
                     <MultiSelect items={mockData.entites} selectedIds={formData.entiteIds || []} onChange={(ids) => handleMultiSelectChange('entiteIds', ids)} label="Entités" />
                     <MultiSelect items={mockData.roles} selectedIds={formData.roleIds || []} onChange={(ids) => handleMultiSelectChange('roleIds', ids)} label="Rôles" />

                    {customFieldDefs.length > 0 && (
                        <fieldset className="border p-4 rounded-lg">
                            <legend className="px-2 text-base font-semibold">Champs Personnalisés</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {customFieldDefs.map(field => (
                                    <div key={field.id}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">{field.name} {field.required && <span className="text-red-500">*</span>}</label>
                                        {renderCustomField(field)}
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    )}

                    <div className="flex items-center space-x-2 pt-2">
                        <input type="checkbox" id="syncAD" name="synchroniseAzureAD" checked={!!formData.synchroniseAzureAD} onChange={handleCheckboxChange} className="rounded" />
                        <label htmlFor="syncAD" className="text-sm font-medium text-gray-700">Synchroniser avec Azure AD</label>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default PersonFormModal;