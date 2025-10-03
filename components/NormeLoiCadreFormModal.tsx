import React, { useState, useEffect } from 'react';
import { mockData } from '../constants';
import type { NormeLoiCadre } from '../types';
import { X } from 'lucide-react';

interface NormeLoiCadreFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (c: NormeLoiCadre) => void;
    cadre?: Partial<NormeLoiCadre> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const NormeLoiCadreFormModal: React.FC<NormeLoiCadreFormModalProps> = ({ isOpen, onClose, onSave, cadre }) => {
    const [formData, setFormData] = useState<Partial<NormeLoiCadre>>(cadre || {});

    useEffect(() => {
        if (isOpen) {
            setFormData(cadre || {});
        }
    }, [cadre, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (name: keyof NormeLoiCadre, selectedIds: string[]) => {
        setFormData(prev => ({ ...prev, [name]: selectedIds }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as NormeLoiCadre);
    };

    const isFormValid = formData.nom && formData.responsableConformiteId;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-3xl w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier le Cadre' : 'Nouveau Cadre'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nom <span className="text-red-500">*</span></label>
                            <input type="text" name="nom" value={formData.nom || ''} onChange={handleChange} className={formInputClasses} required />
                        </div>
                        <div><label className="block text-sm font-medium mb-1">Référence</label><input type="text" name="reference" value={formData.reference || ''} onChange={handleChange} className={formInputClasses} /></div>
                        <div><label className="block text-sm font-medium mb-1">Type</label><select name="typeCadre" value={formData.typeCadre} onChange={handleChange} className={formInputClasses}>{['Norme', 'Loi', 'Règlement', 'Politique interne'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Responsable <span className="text-red-500">*</span></label>
                            <select name="responsableConformiteId" value={formData.responsableConformiteId || ''} onChange={handleChange} className={formInputClasses} required><option value="" disabled>Sélectionner...</option>{mockData.personnes.map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}</select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Périmètre</label>
                        <textarea name="perimetre" value={formData.perimetre || ''} onChange={handleChange} rows={3} className={formInputClasses}></textarea>
                        <p className="text-xs text-gray-500 mt-1">Définissez le champ d'application de ce cadre (ex: "Tous les services", "Département IT", etc.).</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Entités Concernées</label>
                        {/* FIX: Explicitly type 'option' to resolve TS error */}
                        <select multiple value={formData.entitesConcerneesIds || []} onChange={(e) => handleMultiSelectChange('entitesConcerneesIds', Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className={`${formInputClasses} h-24`}>
                            {mockData.entites.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                    <button type="submit" disabled={!isFormValid} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default NormeLoiCadreFormModal;
