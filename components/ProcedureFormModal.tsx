import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Procedure, Poste } from '../types';
import { X } from 'lucide-react';

interface ProcedureFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (p: Procedure) => void;
    procedure?: Partial<Procedure> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const ProcedureFormModal: React.FC<ProcedureFormModalProps> = ({ isOpen, onClose, onSave, procedure }) => {
    const { data } = useDataContext();
    const [formData, setFormData] = useState<Partial<Procedure>>(procedure || {});

    useEffect(() => {
        if (isOpen) setFormData(procedure || {});
    }, [procedure, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (name: keyof Procedure, selectedIds: string[]) => {
        setFormData(prev => ({ ...prev, [name]: selectedIds }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Procedure);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier la Procédure' : 'Nouvelle Procédure'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Titre</label><input type="text" name="nom" value={formData.nom || ''} onChange={handleChange} className={formInputClasses} required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Référence</label><input type="text" name="reference" value={formData.reference || ''} onChange={handleChange} className={formInputClasses} /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className={formInputClasses}></textarea></div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Acteurs (Postes)</label>
                        {/* FIX: Explicitly type 'option' to resolve TS error */}
                        <select multiple value={formData.acteursPosteIds || []} onChange={(e) => handleMultiSelectChange('acteursPosteIds', Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className={`${formInputClasses} h-24`}>
                            {(data.postes as Poste[]).map(p => <option key={p.id} value={p.id}>{p.intitule}</option>)}
                        </select>
                    </div>
                    {/* Add more fields for other relations if needed */}
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default ProcedureFormModal;