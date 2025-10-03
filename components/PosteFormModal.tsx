

import React, { useState, useEffect } from 'react';
import { mockData } from '../constants';
import type { Poste, CustomFieldDef } from '../types';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const POST_STATUS_COLORS: Record<Poste['statut'], string> = {
    'brouillon': 'bg-gray-100 text-gray-800',
    'valide': 'bg-green-100 text-green-800',
    'archive': 'bg-red-100 text-red-800',
    'à_créer': 'bg-blue-100 text-blue-800',
    'en_recrutement': 'bg-yellow-100 text-yellow-800',
    'gelé': 'bg-purple-100 text-purple-800',
    'en_cours': 'bg-yellow-100 text-yellow-800',
    'figé': 'bg-indigo-100 text-indigo-800',
    'planifié': 'bg-cyan-100 text-cyan-800',
    'terminé': 'bg-green-100 text-green-800',
    'non-conforme': 'bg-red-200 text-red-900',
    'clôturé': 'bg-gray-300 text-gray-800',
    'a_faire': 'bg-yellow-100 text-yellow-800',
    'en_retard': 'bg-red-200 text-red-900',
    'en_validation': 'bg-yellow-100 text-yellow-800',
    'publie': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800',
};

const newPostTemplate = (parentId?: string, entiteId?: string): Partial<Poste> => ({
    intitule: '',
    reference: '',
    mission: '',
    entiteId: entiteId || '',
    posteParentId: parentId,
    occupantsIds: [],
    effectifCible: 1,
    statut: 'brouillon',
    confidentialite: 'publique',
    champsLibres: {},
    dateCreation: new Date(),
    dateModification: new Date(),
    auteurId: 'pers-1'
});

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

interface PostFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (p: Poste) => void;
    poste?: Partial<Poste> | null;
}

export const PosteFormModal: React.FC<PostFormModalProps> = ({ isOpen, onClose, onSave, poste }) => {
    const { settings } = useAppContext();
    const [formData, setFormData] = useState<Partial<Poste>>(poste || newPostTemplate());
    
    const customFieldDefs = settings.customFields.postes || [];

    useEffect(() => {
        if(isOpen) {
            const initialData = poste && Object.keys(poste).length > 0 ? JSON.parse(JSON.stringify(poste)) : newPostTemplate();
            if (!initialData.champsLibres) {
                initialData.champsLibres = {};
            }
            setFormData(initialData);
        }
    }, [poste, isOpen]);

    if (!isOpen) return null;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'effectifCible' ? parseInt(value) : value }));
    };

    const handleCustomFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            champsLibres: {
                ...prev.champsLibres,
                [name]: value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Poste);
    };
    
    const renderCustomField = (field: CustomFieldDef) => {
        const value = formData.champsLibres?.[field.name] || '';
        switch (field.type) {
            case 'number':
                return <input type="number" name={field.name} value={value} onChange={handleCustomFieldChange} className={formInputClasses} required={field.required} />;
            case 'date':
                return <input type="date" name={field.name} value={value} onChange={handleCustomFieldChange} className={formInputClasses} required={field.required} />;
            case 'textarea':
                 return <textarea name={field.name} value={value} onChange={handleCustomFieldChange} className={formInputClasses} required={field.required} rows={3}></textarea>;
            case 'select':
                return (
                    <select name={field.name} value={value} onChange={handleCustomFieldChange} className={formInputClasses} required={field.required}>
                        <option value="">Sélectionner...</option>
                        {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            case 'text':
            default:
                return <input type="text" name={field.name} value={value} onChange={handleCustomFieldChange} className={formInputClasses} required={field.required} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl animate-fade-in-up">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">{formData.id ? 'Modifier le Poste' : 'Nouveau Poste'}</h2><button type="button" onClick={onClose}><X/></button></div>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Intitulé</label><input type="text" name="intitule" value={formData.intitule} onChange={handleChange} className={formInputClasses} required /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Référence</label><input type="text" name="reference" value={formData.reference} onChange={handleChange} className={formInputClasses} /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Entité</label><select name="entiteId" value={formData.entiteId} onChange={handleChange} className={formInputClasses} required>{mockData.entites.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}</select></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Poste Parent</label><select name="posteParentId" value={formData.posteParentId || ''} onChange={handleChange} className={formInputClasses}><option value="">Aucun</option>{mockData.postes.filter(p => p.id !== formData.id).map(p => <option key={p.id} value={p.id}>{p.intitule}</option>)}</select></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Effectif Cible</label><input type="number" name="effectifCible" value={formData.effectifCible} onChange={handleChange} className={formInputClasses} min="0" /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label><select name="statut" value={formData.statut} onChange={handleChange} className={formInputClasses}>{Object.keys(POST_STATUS_COLORS).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
                        </div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Mission</label><textarea name="mission" value={formData.mission} onChange={handleChange} rows={3} className={formInputClasses}></textarea></div>
                        
                        {customFieldDefs.length > 0 && (
                            <fieldset className="border p-4 rounded-lg">
                                <legend className="px-2 text-base font-semibold text-gray-800">Champs Personnalisés</legend>
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

                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};