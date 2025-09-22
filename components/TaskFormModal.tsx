import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Tache, Personne } from '../types';
import { X } from 'lucide-react';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (t: Tache) => void;
    task?: Partial<Tache> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, task }) => {
    const { data } = useDataContext();
    const [formData, setFormData] = useState<Partial<Tache>>(task || {});

    useEffect(() => {
        if (isOpen) setFormData(task || {});
    }, [task, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Tache);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier la Tâche' : 'Nouvelle Tâche'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                        <input type="text" name="titre" value={formData.titre || ''} onChange={handleChange} className={formInputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} className={formInputClasses}></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assigner à</label>
                            <select name="assigneA" value={formData.assigneA || ''} onChange={handleChange} className={formInputClasses} required>
                                <option value="" disabled>Sélectionner une personne</option>
                                {(data.personnes as Personne[]).map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                            <select name="priorite" value={formData.priorite || 'Normale'} onChange={handleChange} className={formInputClasses}>
                                {['Basse', 'Normale', 'Haute', 'Critique'].map(p=><option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
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
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default TaskFormModal;
