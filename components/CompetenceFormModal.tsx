import React, { useState, useEffect } from 'react';
import { useDataContext, useAppContext } from '../context/AppContext';
import type { Competence, EchelleNiveau, PosteRequis, CustomFieldDef } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface CompetenceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (c: Competence) => void;
    competence?: Partial<Competence> | null;
}

const newCompetenceTemplate = (): Partial<Competence> => ({
    nom: '', reference: '', statut: 'valide', domaine: 'Technique', actif: true,
    description: '', sousDomaine: '', echelleNiveaux: [
        { niveau: 1, libelle: 'Débutant', criteres: '' },
        { niveau: 2, libelle: 'Intermédiaire', criteres: '' },
        { niveau: 3, libelle: 'Avancé', criteres: '' },
    ], postesRequis: [],
    champsLibres: {},
    dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1'
});

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const CompetenceFormModal: React.FC<CompetenceFormModalProps> = ({ isOpen, onClose, onSave, competence }) => {
    const { data } = useDataContext();
    const { settings } = useAppContext();
    const [formData, setFormData] = useState<Partial<Competence>>(competence || newCompetenceTemplate());

    const customFieldDefs = settings.customFields.competences || [];

    useEffect(() => {
        if (isOpen) {
            const initialData = competence && Object.keys(competence).length > 0 ? JSON.parse(JSON.stringify(competence)) : newCompetenceTemplate();
             if (!initialData.champsLibres) {
                initialData.champsLibres = {};
            }
            setFormData(initialData);
        }
    }, [competence, isOpen]);
    
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

    const handleEchelleChange = (index: number, field: keyof EchelleNiveau, value: string | number) => {
        const newEchelle = [...(formData.echelleNiveaux || [])];
        newEchelle[index] = { ...newEchelle[index], [field]: value };
        setFormData(prev => ({ ...prev, echelleNiveaux: newEchelle }));
    };
    
    const handleAddNiveau = () => {
        const echelle = formData.echelleNiveaux || [];
        const newNiveau = { niveau: echelle.length + 1, libelle: '', criteres: '' };
        setFormData(prev => ({...prev, echelleNiveaux: [...echelle, newNiveau]}));
    };
    
    const handleRemoveNiveau = (index: number) => {
        const echelle = (formData.echelleNiveaux || []).filter((_, i) => i !== index);
        setFormData(prev => ({...prev, echelleNiveaux: echelle}));
    };

    const handlePosteRequisChange = (index: number, field: keyof PosteRequis, value: string | number) => {
        const newPostes = [...(formData.postesRequis || [])];
        newPostes[index] = { ...newPostes[index], [field]: value };
        setFormData(prev => ({...prev, postesRequis: newPostes}));
    }
    
    const handleAddPosteRequis = () => {
        const newPosteRequis = { posteId: '', niveauAttendu: 1 };
        setFormData(prev => ({ ...prev, postesRequis: [...(prev.postesRequis || []), newPosteRequis] }));
    };

    const handleRemovePosteRequis = (index: number) => {
        setFormData(prev => ({ ...prev, postesRequis: (prev.postesRequis || []).filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Competence);
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
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-4xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-semibold">{formData.id ? 'Modifier la Compétence' : 'Nouvelle Compétence'}</h2><button type="button" onClick={onClose}><X/></button></div>
                <div className="flex-grow p-4 overflow-y-auto space-y-6">
                    <fieldset className="border p-4 rounded-lg"><legend className="px-2 text-base font-semibold">Identification</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold mb-1">Nom</label><input type="text" name="nom" value={formData.nom || ''} onChange={handleChange} className={formInputClasses} required /></div>
                            <div><label className="block text-sm font-semibold mb-1">Référence</label><input type="text" name="reference" value={formData.reference || ''} onChange={handleChange} className={formInputClasses} /></div>
                            <div><label className="block text-sm font-semibold mb-1">Domaine</label><select name="domaine" value={formData.domaine} onChange={handleChange} className={formInputClasses}>{['Technique', 'Comportementale', 'Réglementaire', 'Métier'].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                            <div><label className="block text-sm font-semibold mb-1">Sous-domaine</label><input type="text" name="sousDomaine" value={formData.sousDomaine || ''} onChange={handleChange} className={formInputClasses} /></div>
                        </div>
                        <div className="mt-4"><label className="block text-sm font-semibold mb-1">Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className={formInputClasses}></textarea></div>
                    </fieldset>
                    
                    <fieldset className="border p-4 rounded-lg"><legend className="px-2 text-base font-semibold">Échelle de Niveaux</legend>
                        <div className="space-y-2">
                        {(formData.echelleNiveaux || []).map((e, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 p-2 border rounded-md items-center bg-gray-50">
                                <div className="col-span-1 font-bold text-center">N{e.niveau}</div>
                                <div className="col-span-3"><input type="text" placeholder="Libellé (ex: Avancé)" value={e.libelle} onChange={ev => handleEchelleChange(index, 'libelle', ev.target.value)} className={formInputClasses} /></div>
                                <div className="col-span-7"><input type="text" placeholder="Critères d'évaluation" value={e.criteres} onChange={ev => handleEchelleChange(index, 'criteres', ev.target.value)} className={formInputClasses} /></div>
                                <div className="col-span-1"><button type="button" onClick={() => handleRemoveNiveau(index)}><Trash2 className="h-4 w-4 text-red-500"/></button></div>
                            </div>
                        ))}
                        </div>
                        <button type="button" onClick={handleAddNiveau} className="mt-2 text-sm text-blue-600 flex items-center gap-1"><Plus className="h-4 w-4"/>Ajouter un niveau</button>
                    </fieldset>

                    <fieldset className="border p-4 rounded-lg"><legend className="px-2 text-base font-semibold">Postes Requis</legend>
                        <div className="space-y-2">
                            {(formData.postesRequis || []).map((pr, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                                    <select value={pr.posteId} onChange={e => handlePosteRequisChange(index, 'posteId', e.target.value)} className={formInputClasses + " flex-1"}>
                                        <option value="" disabled>Choisir un poste...</option>
                                        {(data.postes as any[]).map(p => <option key={p.id} value={p.id}>{p.intitule}</option>)}
                                    </select>
                                    <label className="text-sm">Niveau attendu:</label>
                                    <select value={pr.niveauAttendu} onChange={e => handlePosteRequisChange(index, 'niveauAttendu', Number(e.target.value))} className={formInputClasses}>
                                        {(formData.echelleNiveaux || []).map(e => <option key={e.niveau} value={e.niveau}>{e.niveau} - {e.libelle}</option>)}
                                    </select>
                                    <button type="button" onClick={() => handleRemovePosteRequis(index)}><Trash2 className="h-4 w-4 text-red-500"/></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddPosteRequis} className="mt-2 text-sm text-blue-600 flex items-center gap-1"><Plus className="h-4 w-4"/>Lier à un poste</button>
                    </fieldset>
                    
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
                <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default CompetenceFormModal;