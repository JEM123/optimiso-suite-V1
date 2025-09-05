
import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { PlanFormation, Personne } from '../types';
import { X } from 'lucide-react';

interface PlanFormationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: PlanFormation) => void;
    plan?: Partial<PlanFormation> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";
const planTypes: PlanFormation['type'][] = ['Interne', 'Externe', 'E-learning'];
const planStatuts: PlanFormation['statut'][] = ['Planifié', 'En cours', 'Réalisé', 'Annulé'];

const PlanFormationFormModal: React.FC<PlanFormationFormModalProps> = ({ isOpen, onClose, onSave, plan }) => {
    const { data } = useDataContext();
    const { personnes } = data as { personnes: Personne[] };
    const [formData, setFormData] = useState<Partial<PlanFormation>>(plan || {});

    useEffect(() => {
        if (isOpen) {
            setFormData(plan || {});
        }
    }, [plan, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as PlanFormation);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier le Plan' : 'Nouveau Plan de Formation'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Personne</label>
                        <select name="personneId" value={formData.personneId || ''} onChange={handleChange} className={formInputClasses} required>
                            <option value="" disabled>Sélectionner une personne...</option>
                            {personnes.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Action de Formation</label>
                        <input type="text" name="action" value={formData.action || ''} onChange={handleChange} className={formInputClasses} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select name="type" value={formData.type || 'Interne'} onChange={handleChange} className={formInputClasses}>
                                {planTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Échéance</label>
                            <input type="date" name="echeance" value={formData.echeance ? new Date(formData.echeance).toISOString().split('T')[0] : ''} onChange={handleChange} className={formInputClasses} required />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <select name="statut" value={formData.statut || 'Planifié'} onChange={handleChange} className={formInputClasses}>
                            {planStatuts.map(s => <option key={s} value={s}>{s}</option>)}
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

export default PlanFormationFormModal;
