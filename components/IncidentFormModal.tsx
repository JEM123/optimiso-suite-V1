import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Incident, Personne, Risque } from '../types';
import { X } from 'lucide-react';

interface IncidentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (i: Incident) => void;
    incident?: Partial<Incident> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const IncidentFormModal: React.FC<IncidentFormModalProps> = ({ isOpen, onClose, onSave, incident }) => {
    const { data } = useDataContext();
    const { personnes, risques } = data;
    const [formData, setFormData] = useState<Partial<Incident>>(incident || {});

    useEffect(() => {
        if (isOpen) setFormData(incident || {});
    }, [incident, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Incident);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-3xl w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">{formData.id ? 'Modifier l\'Incident' : 'Déclarer un Incident'}</h2><button type="button" onClick={onClose}><X/></button></div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div><label className="block text-sm font-medium mb-1">Titre</label><input type="text" name="titre" value={formData.titre || ''} onChange={handleChange} className={formInputClasses} required /></div>
                    <div><label className="block text-sm font-medium mb-1">Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} className={formInputClasses} required></textarea></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium mb-1">Catégorie</label><select name="categorie" value={formData.categorie} onChange={handleChange} className={formInputClasses}>{['Sécurité', 'Qualité', 'SI', 'RH', 'Environnement'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                        <div><label className="block text-sm font-medium mb-1">Assigné à</label><select name="assigneAId" value={formData.assigneAId || ''} onChange={handleChange} className={formInputClasses} required><option value="" disabled>Sélectionner</option>{(personnes as Personne[]).map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}</select></div>
                        <div><label className="block text-sm font-medium mb-1">Priorité</label><select name="priorite" value={formData.priorite} onChange={handleChange} className={formInputClasses}>{['Faible', 'Moyenne', 'Élevée', 'Critique'].map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                        <div><label className="block text-sm font-medium mb-1">Gravité</label><select name="gravite" value={formData.gravite} onChange={handleChange} className={formInputClasses}>{['Mineure', 'Majeure', 'Critique'].map(g=><option key={g} value={g}>{g}</option>)}</select></div>
                         <div><label className="block text-sm font-medium mb-1">Risque lié</label><select name="lienRisqueId" value={formData.lienRisqueId || ''} onChange={handleChange} className={formInputClasses}><option value="">Aucun</option>{(risques as Risque[]).map(r=><option key={r.id} value={r.id}>{r.reference} - {r.nom}</option>)}</select></div>
                        <div><label className="block text-sm font-medium mb-1">SLA (heures)</label><input type="number" name="SLA_Cible" value={formData.SLA_Cible || 24} onChange={handleChange} className={formInputClasses} min="1" /></div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Cause Racine (si connue)</label>
                        <textarea name="causeRacine" value={formData.causeRacine || ''} onChange={handleChange} rows={3} className={formInputClasses} placeholder="Décrire la cause fondamentale de l'incident..."></textarea>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default IncidentFormModal;
