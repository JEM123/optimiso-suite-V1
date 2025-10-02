import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Controle, ChampResultat, Personne, Risque, Document, Procedure } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface ControlFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (c: Controle) => void;
    control?: Partial<Controle> | null;
}

const newControlTemplate = (): Partial<Controle> => ({
    nom: '', reference: '', statut: 'brouillon', typePlanification: 'non_automatisé',
    methodeExecution: '', categorieIds: [], executantsIds: [],
    champsResultatsDef: [], risqueMaitriseIds: [], procedureIds: [], documentIds: [],
    dateDebut: new Date(),
    dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1'
});

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const MultiSelect: React.FC<{ items: any[], selectedIds: string[], onChange: (ids: string[]) => void, label: string }> = ({ items, selectedIds, onChange, label }) => {
    const handleSelect = (id: string) => {
        const newSelectedIds = selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id];
        onChange(newSelectedIds);
    }
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1 bg-white">
                {items.map(item => (
                    <label key={item.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50">
                        <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelect(item.id)} className="rounded" />
                        <span className="text-sm">{item.nom} ({item.reference})</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

const ControlFormModal: React.FC<ControlFormModalProps> = ({ isOpen, onClose, onSave, control }) => {
    const { data } = useDataContext();
    const { personnes, risques, documents, procedures } = data;

    const [formData, setFormData] = useState<Partial<Controle>>(control || newControlTemplate());
    const [activeTab, setActiveTab] = useState('identification');

    useEffect(() => {
        if (isOpen) {
            setFormData(control && Object.keys(control).length > 0 ? control : newControlTemplate());
            setActiveTab('identification');
        }
    }, [control, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (name: keyof Controle, selectedIds: string[]) => {
        setFormData(prev => ({ ...prev, [name]: selectedIds }));
    };

    const handleResultFieldChange = (index: number, field: keyof ChampResultat, value: any) => {
        const newFields = [...(formData.champsResultatsDef || [])];
        newFields[index] = { ...newFields[index], [field]: value };
        setFormData(prev => ({ ...prev, champsResultatsDef: newFields }));
    };

    const addResultField = () => {
        const newField: ChampResultat = { id: `res-${Date.now()}`, libelle: '', type_reponse: 'texte', obligatoire: false };
        setFormData(prev => ({ ...prev, champsResultatsDef: [...(prev.champsResultatsDef || []), newField] }));
    };

    const removeResultField = (index: number) => {
        const newFields = [...(formData.champsResultatsDef || [])];
        newFields.splice(index, 1);
        setFormData(prev => ({ ...prev, champsResultatsDef: newFields }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Controle);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-4xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier le Contrôle' : 'Nouveau Contrôle'}</h2>
                    <button type="button" onClick={onClose}><X className="h-5 w-5"/></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    <nav className="flex space-x-4 border-b mb-4">
                        <button type="button" onClick={() => setActiveTab('identification')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'identification' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Identification</button>
                        <button type="button" onClick={() => setActiveTab('planification')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'planification' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Planification</button>
                        <button type="button" onClick={() => setActiveTab('maitrise')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'maitrise' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Maîtrise</button>
                        <button type="button" onClick={() => setActiveTab('resultats')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'resultats' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Définition des Résultats</button>
                    </nav>

                    {activeTab === 'identification' && <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div><label className="block text-sm font-semibold text-gray-700 mb-1">Titre</label><input type="text" name="nom" value={formData.nom} onChange={handleChange} className={formInputClasses} required /></div>
                           <div><label className="block text-sm font-semibold text-gray-700 mb-1">Référence</label><input type="text" name="reference" value={formData.reference} onChange={handleChange} className={formInputClasses} /></div>
                        </div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Méthode d'exécution</label><textarea name="methodeExecution" value={formData.methodeExecution} onChange={handleChange} rows={3} className={formInputClasses}></textarea></div>
                    </div>}
                    
                    {activeTab === 'planification' && <div className="space-y-4">
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Type de planification</label><select name="typePlanification" value={formData.typePlanification} onChange={handleChange} className={formInputClasses}>{['non_automatisé', 'a_la_demande', 'periodique'].map(t=><option key={t} value={t}>{t.replace('_', ' ')}</option>)}</select></div>
                        {formData.typePlanification === 'periodique' && <div><label className="block text-sm font-semibold text-gray-700 mb-1">Fréquence</label><select name="frequence" value={formData.frequence} onChange={handleChange} className={formInputClasses}>{['quotidienne', 'hebdomadaire', 'mensuelle', 'trimestrielle', 'annuelle'].map(f=><option key={f} value={f}>{f}</option>)}</select></div>}
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Exécutants</label>
                            {/* FIX: Explicitly type 'option' to HTMLOptionElement to resolve TS error */}
                            <select multiple value={formData.executantsIds} onChange={(e) => handleMultiSelectChange('executantsIds', Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className={`${formInputClasses} h-24`}>
                                {(personnes as Personne[]).map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                            </select>
                        </div>
                    </div>}

                    {activeTab === 'maitrise' && <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                        <MultiSelect items={risques as Risque[]} selectedIds={formData.risqueMaitriseIds || []} onChange={(ids) => handleMultiSelectChange('risqueMaitriseIds', ids)} label="Risques maîtrisés" />
                        <MultiSelect items={documents as Document[]} selectedIds={formData.documentIds || []} onChange={(ids) => handleMultiSelectChange('documentIds', ids)} label="Documents liés" />
                        <MultiSelect items={procedures as Procedure[]} selectedIds={formData.procedureIds || []} onChange={(ids) => handleMultiSelectChange('procedureIds', ids)} label="Procédures liées" />
                    </div>}

                    {activeTab === 'resultats' && <div className="space-y-4">
                        <p className="text-sm text-gray-600">Définissez les champs que l'exécutant devra saisir.</p>
                        {(formData.champsResultatsDef || []).map((field, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 p-2 border rounded-md items-center bg-white">
                                <div className="col-span-5"><input type="text" placeholder="Libellé du champ" value={field.libelle} onChange={(e) => handleResultFieldChange(index, 'libelle', e.target.value)} className={formInputClasses} /></div>
                                <div className="col-span-3"><select value={field.type_reponse} onChange={(e) => handleResultFieldChange(index, 'type_reponse', e.target.value)} className={formInputClasses}>{['texte', 'nombre', 'date', 'booléen'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                <div className="col-span-3 flex items-center"><input type="checkbox" checked={field.obligatoire} onChange={(e) => handleResultFieldChange(index, 'obligatoire', e.target.checked)} className="mr-2 rounded" /><label className="text-sm">Obligatoire</label></div>
                                <div className="col-span-1"><button type="button" onClick={() => removeResultField(index)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4"/></button></div>
                            </div>
                        ))}
                        <button type="button" onClick={addResultField} className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"><Plus className="h-4 w-4"/><span>Ajouter un champ de résultat</span></button>
                    </div>}
                </div>
                <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default ControlFormModal;