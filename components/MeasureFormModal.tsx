import React, { useState, useEffect } from 'react';
import type { Indicateur, MesureIndicateur } from '../types';
import { X } from 'lucide-react';

interface MeasureFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mesure: MesureIndicateur) => void;
    indicator: Indicateur;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const MeasureFormModal: React.FC<MeasureFormModalProps> = ({ isOpen, onClose, onSave, indicator }) => {
    const [formData, setFormData] = useState<Partial<MesureIndicateur>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData({
                dateMesure: new Date(),
                modeSaisie: 'Manuel',
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = ['valeur'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as MesureIndicateur);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Nouvelle Mesure</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                 <div className="text-sm bg-gray-50 p-2 rounded-md mb-4">
                    Pour: <span className="font-medium">{indicator.nom}</span>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Date de la mesure</label>
                            <input type="date" name="dateMesure" value={formData.dateMesure ? new Date(formData.dateMesure).toISOString().split('T')[0] : ''} onChange={handleChange} className={formInputClasses} required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Valeur ({indicator.unite})</label>
                            <input type="number" name="valeur" value={formData.valeur || ''} onChange={handleChange} className={formInputClasses} required step="any" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Commentaire</label>
                        <textarea name="commentaire" value={formData.commentaire || ''} onChange={handleChange} rows={3} className={formInputClasses}></textarea>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                </div>
            </form>
        </div>
    );
};

export default MeasureFormModal;