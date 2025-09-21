import React, { useState, useEffect } from 'react';
import { mockData } from '../constants';
import type { EtapeProcedure } from '../types';
import { X } from 'lucide-react';

interface StepFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (procId: string, step: EtapeProcedure) => void;
    context: { procId: string, step?: Partial<EtapeProcedure> | null };
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const StepFormModal: React.FC<StepFormModalProps> = ({ isOpen, onClose, onSave, context }) => {
    const [formData, setFormData] = useState<Partial<EtapeProcedure>>(context.step || {});

    useEffect(() => {
        if (isOpen) setFormData(context.step || {});
    }, [context, isOpen]);
    
    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (name: keyof EtapeProcedure, selectedIds: string[]) => {
        setFormData(prev => ({ ...prev, [name]: selectedIds }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(context.procId, formData as EtapeProcedure);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier l\'Étape' : 'Nouvelle Étape'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Libellé</label><input type="text" name="libelle" value={formData.libelle || ''} onChange={handleChange} className={formInputClasses} required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Responsable (Poste)</label>
                        <select name="responsablePosteId" value={formData.responsablePosteId || ''} onChange={handleChange} className={formInputClasses} required>
                            <option value="" disabled>Sélectionner un poste</option>
                            {mockData.postes.map(p => <option key={p.id} value={p.id}>{p.intitule}</option>)}
                        </select>
                    </div>
                     <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className={formInputClasses}></textarea></div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Documents en entrée</label>
                        <select multiple value={formData.entreesIds || []} onChange={(e) => handleMultiSelectChange('entreesIds', Array.from(e.target.selectedOptions, option => option.value))} className={`${formInputClasses} h-24`}>
                            {mockData.documents.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Documents en sortie</label>
                        <select multiple value={formData.sortiesIds || []} onChange={(e) => handleMultiSelectChange('sortiesIds', Array.from(e.target.selectedOptions, option => option.value))} className={`${formInputClasses} h-24`}>
                            {mockData.documents.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Risques liés</label>
                        <select multiple value={formData.risqueIds || []} onChange={(e) => handleMultiSelectChange('risqueIds', Array.from(e.target.selectedOptions, option => option.value))} className={`${formInputClasses} h-24`}>
                            {mockData.risques.map(r => <option key={r.id} value={r.id}>{r.reference} - {r.nom}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contrôles de maîtrise</label>
                        <select multiple value={formData.controleIds || []} onChange={(e) => handleMultiSelectChange('controleIds', Array.from(e.target.selectedOptions, option => option.value))} className={`${formInputClasses} h-24`}>
                            {mockData.controles.map(c => <option key={c.id} value={c.id}>{c.reference} - {c.nom}</option>)}
                        </select>
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

export default StepFormModal;