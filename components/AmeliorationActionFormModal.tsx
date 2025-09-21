import React, { useState, useEffect } from 'react';
import { mockData } from '../constants';
import type { AmeliorationAction } from '../types';
import { X } from 'lucide-react';

interface AmeliorationActionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (a: AmeliorationAction) => void;
    action?: Partial<AmeliorationAction> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const AmeliorationActionFormModal: React.FC<AmeliorationActionFormModalProps> = ({ isOpen, onClose, onSave, action }) => {
    const [formData, setFormData] = useState<Partial<AmeliorationAction>>(action || {});

    useEffect(() => {
        if (isOpen) {
            setFormData(action || { statut: 'À faire', efficacite: 'Non évaluée' });
        }
    }, [action, isOpen]);
    
    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'dateEcheance') {
            setFormData(prev => ({ ...prev, [name]: new Date(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as AmeliorationAction);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier l\'Action' : 'Nouvelle Action'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                        <input type="text" name="titre" value={formData.titre || ''} onChange={handleChange} className={formInputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                        <select name="responsableId" value={formData.responsableId || ''} onChange={handleChange} className={formInputClasses} required>
                            <option value="" disabled>Sélectionner...</option>
                            {mockData.personnes.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                        </select>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                            <select name="statut" value={formData.statut || 'À faire'} onChange={handleChange} className={formInputClasses}>
                                {['À faire', 'En cours', 'En attente', 'Fait', 'Non conforme'].map(s=><option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                            <input 
                               type="date" 
                               name="dateEcheance" 
                               value={formData.dateEcheance ? new Date(formData.dateEcheance).toISOString().split('T')[0] : ''}
                               onChange={handleChange} 
                               className={formInputClasses}
                               required 
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Évaluation de l'efficacité</label>
                         <select name="efficacite" value={formData.efficacite || 'Non évaluée'} onChange={handleChange} className={formInputClasses}>
                            {['Non évaluée', 'Insuffisante', 'Acceptable', 'Excellente'].map(e=><option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                        <textarea name="commentaire" value={formData.commentaire || ''} onChange={handleChange} rows={3} className={formInputClasses}></textarea>
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

export default AmeliorationActionFormModal;