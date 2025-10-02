
import React, { useState } from 'react';
import { useDataContext } from '../context/AppContext';
import type { MaintenanceLog, Actif, Personne } from '../types';
import { X } from 'lucide-react';

interface MaintenanceLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (log: MaintenanceLog) => void;
    actifId: string;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const MaintenanceLogModal: React.FC<MaintenanceLogModalProps> = ({ isOpen, onClose, onSave, actifId }) => {
    const { data } = useDataContext();
    const { actifs, personnes } = data as { actifs: Actif[], personnes: Personne[] };
    const [formData, setFormData] = useState<Partial<MaintenanceLog>>({ date: new Date() });
    
    if (!isOpen) return null;
    
    const actif = actifs.find(a => a.id === actifId);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as MaintenanceLog);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Nouvelle Intervention</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="text-sm bg-gray-50 p-2 rounded-md mb-4">
                    Pour: <span className="font-medium">{actif?.nom}</span>
                </div>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium mb-1">Date</label><input type="date" name="date" value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''} onChange={handleChange} className={formInputClasses} required /></div>
                    <div><label className="block text-sm font-medium mb-1">Technicien</label>
                        <select name="technicien" value={formData.technicien || ''} onChange={handleChange} className={formInputClasses} required>
                            <option value="" disabled>Sélectionner...</option>
                            {personnes.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                        </select>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className={formInputClasses} required></textarea></div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                </div>
            </form>
        </div>
    );
};

export default MaintenanceLogModal;
