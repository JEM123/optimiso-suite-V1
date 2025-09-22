import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Amelioration, AmeliorationType, AmeliorationPriorite, AmeliorationOrigine, Personne, Entite, Incident, Risque } from '../types';
import { X } from 'lucide-react';

interface AmeliorationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (a: Amelioration) => void;
    amelioration?: Partial<Amelioration> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const AmeliorationFormModal: React.FC<AmeliorationFormModalProps> = ({ isOpen, onClose, onSave, amelioration }) => {
    const { data } = useDataContext();
    const { personnes, entites, incidents, risques } = data;
    const [formData, setFormData] = useState<Partial<Amelioration>>(amelioration || {});
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        if (isOpen) {
            setFormData(amelioration || {});
            setActiveTab('general');
        }
    }, [amelioration, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = ['budget'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    };
    
    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value as AmeliorationOrigine);
        setFormData(prev => ({...prev, origine: selectedOptions}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Amelioration);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-3xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier l\'Amélioration' : 'Annoncer une Amélioration'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    <nav className="flex space-x-4 border-b mb-4">
                        <button type="button" onClick={() => setActiveTab('general')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'general' ? 'border-b-2 border-blue-600' : ''}`}>Général</button>
                        <button type="button" onClick={() => setActiveTab('links')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'links' ? 'border-b-2 border-blue-600' : ''}`}>Origine & Liens</button>
                    </nav>
                    
                    {activeTab === 'general' && <div className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1">Titre</label><input type="text" name="titre" value={formData.titre || ''} onChange={handleChange} className={formInputClasses} required /></div>
                        <div><label className="block text-sm font-medium mb-1">Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} className={formInputClasses} required></textarea></div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-1">Pilote</label><select name="piloteId" value={formData.piloteId || ''} onChange={handleChange} className={formInputClasses} required><option value="" disabled>Sélectionner</option>{(personnes as Personne[]).map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}</select></div>
                            <div><label className="block text-sm font-medium mb-1">Commanditaire</label><select name="commanditaireId" value={formData.commanditaireId || ''} onChange={handleChange} className={formInputClasses}><option value="">Aucun</option>{(personnes as Personne[]).map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}</select></div>
                            <div><label className="block text-sm font-medium mb-1">Entité</label><select name="entiteId" value={formData.entiteId || ''} onChange={handleChange} className={formInputClasses}><option value="">Aucune</option>{(entites as Entite[]).map(e=><option key={e.id} value={e.id}>{e.nom}</option>)}</select></div>
                             <div><label className="block text-sm font-medium mb-1">Échéance Cible</label><input type="date" name="echeanceCible" value={formData.echeanceCible ? new Date(formData.echeanceCible).toISOString().split('T')[0] : ''} onChange={handleChange} className={formInputClasses} /></div>
                        </div>
                        <div><label className="block text-sm font-medium mb-1">Objectif Mesurable</label><textarea name="objectifMesurable" value={formData.objectifMesurable || ''} onChange={handleChange} rows={2} className={formInputClasses}></textarea></div>
                    </div>}
                    
                    {activeTab === 'links' && <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div><label className="block text-sm font-medium mb-1">Type</label><select name="type" value={formData.type} onChange={handleChange} className={formInputClasses}>{['Corrective', 'Préventive', 'Opportunité'].map(c=><option key={c} value={c as AmeliorationType}>{c}</option>)}</select></div>
                             <div><label className="block text-sm font-medium mb-1">Priorité</label><select name="priorite" value={formData.priorite} onChange={handleChange} className={formInputClasses}>{['basse', 'moyenne', 'haute', 'critique'].map(p=><option key={p} value={p as AmeliorationPriorite} className="capitalize">{p}</option>)}</select></div>
                             <div><label className="block text-sm font-medium mb-1">Budget (CHF)</label><input type="number" name="budget" value={formData.budget || ''} onChange={handleChange} className={formInputClasses} /></div>
                             <div><label className="block text-sm font-medium mb-1">Confidentialité</label><select name="confidentialite" value={formData.confidentialite} onChange={handleChange} className={formInputClasses}>{['publique', 'restreinte'].map(p=><option key={p} value={p} className="capitalize">{p}</option>)}</select></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Origine(s)</label>
                            <select multiple name="origine" value={formData.origine} onChange={handleMultiSelectChange} className={`${formInputClasses} h-24`}>
                                {['Incident', 'Audit', 'Risque', 'Contrôle', 'Indicateur', 'Suggestion'].map(o=><option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-1">Incident Lié</label><select name="lienIncidentId" value={formData.lienIncidentId || ''} onChange={handleChange} className={formInputClasses}><option value="">Aucun</option>{(incidents as Incident[]).map(i=><option key={i.id} value={i.id}>{i.reference} - {i.titre}</option>)}</select></div>
                            <div><label className="block text-sm font-medium mb-1">Risque Lié</label><select name="lienRisqueId" value={formData.lienRisqueId || ''} onChange={handleChange} className={formInputClasses}><option value="">Aucun</option>{(risques as Risque[]).map(r=><option key={r.id} value={r.id}>{r.reference} - {r.nom}</option>)}</select></div>
                         </div>
                    </div>}

                </div>
                <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default AmeliorationFormModal;
