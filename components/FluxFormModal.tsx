import React, { useState, useEffect } from 'react';
import { mockData } from '../constants';
import type { FluxDefinition, FluxEtape, FluxModuleCible, FluxEvenementCible } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface FluxFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (f: FluxDefinition) => void;
    flux?: Partial<FluxDefinition> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";
const modulesCibles: FluxModuleCible[] = ['Documents', 'Procédures', 'Risques', 'Indicateurs', 'Contrôles'];
const evenementsCouverts: FluxEvenementCible[] = ['Création', 'Modification', 'Publication', 'Retrait'];

const FluxFormModal: React.FC<FluxFormModalProps> = ({ isOpen, onClose, onSave, flux }) => {
    const [formData, setFormData] = useState<Partial<FluxDefinition>>(flux || {});
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        if (isOpen) {
            setFormData(flux || { etapes: [] });
            setActiveTab('general');
        }
    }, [flux, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelect = (field: 'modulesCibles' | 'evenementsCouverts', value: string) => {
        const currentValues = formData[field] || [];
        const newValues = currentValues.includes(value as never)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        setFormData(prev => ({ ...prev, [field]: newValues }));
    };
    
    const handleAddStep = () => {
        const newStep: FluxEtape = { id: `new-${Date.now()}`, ordre: (formData.etapes?.length || 0) + 1, nom: '', type: 'Intermédiaire', modeAppro: 'Individu', approbateursIds: [], regleDecision: 'Tous', SLA_Heures: 24 };
        setFormData(prev => ({...prev, etapes: [...(prev.etapes || []), newStep]}));
    };
    
    const handleStepChange = (index: number, field: keyof FluxEtape, value: any) => {
        const newEtapes = [...(formData.etapes || [])];
        newEtapes[index] = { ...newEtapes[index], [field]: value };
        setFormData(prev => ({...prev, etapes: newEtapes}));
    };
    
    const handleRemoveStep = (index: number) => {
        const newEtapes = [...(formData.etapes || [])];
        newEtapes.splice(index, 1);
        setFormData(prev => ({...prev, etapes: newEtapes}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as FluxDefinition);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-4xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-semibold">{formData.id ? 'Modifier le Flux' : 'Nouveau Flux'}</h2><button type="button" onClick={onClose}><X/></button></div>
                <div className="flex-grow p-4 overflow-y-auto">
                     <nav className="flex space-x-4 border-b mb-4">
                        <button type="button" onClick={() => setActiveTab('general')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'general' ? 'border-b-2 border-blue-600' : ''}`}>Général</button>
                        <button type="button" onClick={() => setActiveTab('etapes')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'etapes' ? 'border-b-2 border-blue-600' : ''}`}>Étapes</button>
                    </nav>
                    {activeTab === 'general' && <div className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1">Nom du flux</label><input type="text" name="nom" value={formData.nom || ''} onChange={handleChange} className={formInputClasses} required /></div>
                        <div><label className="block text-sm font-medium mb-1">Modules Cibles</label><div className="flex flex-wrap gap-2 mt-1">{modulesCibles.map(m=><label key={m} className="flex items-center gap-2"><input type="checkbox" checked={formData.modulesCibles?.includes(m)} onChange={()=>handleMultiSelect('modulesCibles', m)}/>{m}</label>)}</div></div>
                        <div><label className="block text-sm font-medium mb-1">Évènements Couverts</label><div className="flex flex-wrap gap-2 mt-1">{evenementsCouverts.map(e=><label key={e} className="flex items-center gap-2"><input type="checkbox" checked={formData.evenementsCouverts?.includes(e)} onChange={()=>handleMultiSelect('evenementsCouverts', e)}/>{e}</label>)}</div></div>
                    </div>}
                    {activeTab === 'etapes' && <div className="space-y-4">
                        {(formData.etapes || []).map((etape, index) => (
                            <div key={etape.id} className="p-3 border rounded-lg bg-gray-50 space-y-2">
                                <div className="flex justify-between items-center"><h4 className="font-medium">Étape {index + 1}</h4><button type="button" onClick={()=>handleRemoveStep(index)}><Trash2 className="h-4 w-4 text-red-500"/></button></div>
                                <input type="text" placeholder="Nom de l'étape" value={etape.nom} onChange={e => handleStepChange(index, 'nom', e.target.value)} className={formInputClasses} />
                                <div className="grid grid-cols-2 gap-2">
                                    <select value={etape.type} onChange={e => handleStepChange(index, 'type', e.target.value)} className={formInputClasses}><option value="Intermédiaire">Intermédiaire</option><option value="Finale">Finale</option></select>
                                    <select value={etape.regleDecision} onChange={e => handleStepChange(index, 'regleDecision', e.target.value)} className={formInputClasses}><option value="Tous">Tous</option><option value="Premier répondant">Premier répondant</option></select>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddStep} className="flex items-center gap-2 text-sm text-blue-600"><Plus className="h-4 w-4"/>Ajouter une étape</button>
                    </div>}
                </div>
                <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default FluxFormModal;
