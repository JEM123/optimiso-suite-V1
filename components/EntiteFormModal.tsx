
import React, { useState, useEffect } from 'react';
import type { Entite, CustomFieldDef, Personne } from '../types';
import { X } from 'lucide-react';
import { useAppContext, useDataContext } from '../context/AppContext';

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

interface EntiteFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: Entite) => void;
    entite?: Partial<Entite> | null;
}

const newEntiteTemplate = (parentId?: string): Partial<Entite> => ({
    nom: '',
    reference: '',
    code: '',
    type: 'Service',
    statut: 'brouillon',
    actif: true,
    parentId: parentId,
    ordre: 1,
    confidentialite: 'publique',
    champsLibres: {},
    dateCreation: new Date(),
    dateModification: new Date(),
    auteurId: 'pers-1'
});

export const EntiteFormModal: React.FC<EntiteFormModalProps> = ({ isOpen, onClose, onSave, entite }) => {
    const { settings } = useAppContext();
    const { data } = useDataContext();
    const [formData, setFormData] = useState<Partial<Entite>>(entite || newEntiteTemplate());

    const customFieldDefs = settings.customFields.entites || [];

    useEffect(() => {
        if (isOpen) {
            const initialData = entite && Object.keys(entite).length > 0 ? JSON.parse(JSON.stringify(entite)) : newEntiteTemplate(entite?.parentId);
            if (!initialData.champsLibres) {
                initialData.champsLibres = {};
            }
            setFormData(initialData);
        }
    }, [entite, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        onSave(formData as Entite);
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
                    <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">{formData.id ? 'Modifier l\'Entité' : 'Nouvelle Entité'}</h2><button type="button" onClick={onClose}><X/></button></div>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label><input type="text" name="nom" value={formData.nom} onChange={handleChange} className={formInputClasses} required /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Code</label><input type="text" name="code" value={formData.code} onChange={handleChange} className={formInputClasses} /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Type</label><select name="type" value={formData.type} onChange={handleChange} className={formInputClasses}>{['Direction', 'Division', 'Service', 'Équipe', 'Autre'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Entité Parente</label><select name="parentId" value={formData.parentId || ''} onChange={handleChange} className={formInputClasses}><option value="">Aucune (racine)</option>{(data.entites as Entite[]).filter(e => e.id !== formData.id).map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}</select></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Responsable</label><select name="responsableId" value={formData.responsableId || ''} onChange={handleChange} className={formInputClasses}><option value="">Non assigné</option>{(data.personnes as Personne[]).map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}</select></div>
                        </div>
                        
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
