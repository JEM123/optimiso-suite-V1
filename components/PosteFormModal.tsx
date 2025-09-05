

import React, { useState, useEffect } from 'react';
import { mockData } from '../constants';
import type { Poste } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

// FIX: Define POST_STATUS_COLORS constant
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


const PostFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (p: Poste) => void; poste?: Partial<Poste> | null; }> = ({ isOpen, onClose, onSave, poste }) => {
    const [formData, setFormData] = useState<Partial<Poste>>(poste || newPostTemplate());
    const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);

    useEffect(() => {
        if(isOpen) {
            const initialData = poste && Object.keys(poste).length > 0 ? poste : newPostTemplate();
            setFormData(initialData);
            const fieldsArray = initialData.champsLibres 
                ? Object.entries(initialData.champsLibres).map(([key, value]) => ({ key, value: String(value) }))
                : [];
            setCustomFields(fieldsArray);
        }
    }, [poste, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'effectifCible' ? parseInt(value) : value }));
    };

    const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
        const newFields = [...customFields];
        newFields[index][field] = value;
        setCustomFields(newFields);
    };

    const addCustomField = () => {
        setCustomFields([...customFields, { key: '', value: '' }]);
    };

    const removeCustomField = (index: number) => {
        const newFields = [...customFields];
        newFields.splice(index, 1);
        setCustomFields(newFields);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const champsLibresObject = customFields.reduce((acc, field) => {
            if (field.key) {
                acc[field.key] = field.value;
            }
            return acc;
        }, {} as Record<string, any>);
        onSave({ ...formData, champsLibres: champsLibresObject } as Poste);
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
                        
                        <fieldset className="border p-4 rounded-lg">
                            <legend className="px-2 text-base font-semibold text-gray-800">Champs Libres</legend>
                            <div className="space-y-2">
                                {customFields.map((field, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Nom du champ" 
                                            value={field.key}
                                            onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                                            className={formInputClasses + " flex-1"}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Valeur" 
                                            value={field.value}
                                            onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                                            className={formInputClasses + " flex-1"}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeCustomField(index)}
                                            className="p-2 text-red-500 hover:bg-red-100 rounded-md"
                                            aria-label="Supprimer le champ"
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </button>
                                    </div>
                                ))}
                                {customFields.length === 0 && <p className="text-xs text-gray-500 text-center py-2">Aucun champ personnalisé.</p>}
                            </div>
                            <button 
                                type="button" 
                                onClick={addCustomField}
                                className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <Plus className="h-4 w-4"/>
                                Ajouter un champ
                            </button>
                        </fieldset>

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

export default PostFormModal;