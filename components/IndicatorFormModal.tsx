import React, { useState, useEffect } from 'react';
import { mockData } from '../constants';
import type { Indicateur } from '../types';
import { X } from 'lucide-react';

interface IndicatorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (i: Indicateur) => void;
    indicator?: Partial<Indicateur> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const IndicatorFormModal: React.FC<IndicatorFormModalProps> = ({ isOpen, onClose, onSave, indicator }) => {
    const [formData, setFormData] = useState<Partial<Indicateur>>(indicator || {});
    
    useEffect(() => {
        if (isOpen) setFormData(indicator || { statut: 'brouillon', actif: false, categorieIds: [], processusIds: [], risqueIds: [], controleIds: [], mesures: [] });
    }, [indicator, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = ['objectif', 'seuilAlerte'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    };

    const handleMultiSelectChange = (name: 'categorieIds' | 'processusIds' | 'risqueIds' | 'controleIds', selectedIds: string[]) => {
        setFormData(prev => ({ ...prev, [name]: selectedIds }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Indicateur);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-3xl w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier l\'Indicateur' : 'Nouvel Indicateur'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <fieldset className="border p-4 rounded-lg">
                        <legend className="px-2 text-base font-semibold text-gray-800">Informations Générales</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Titre</label><input type="text" name="nom" value={formData.nom || ''} onChange={handleChange} className={formInputClasses} required /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Référence</label><input type="text" name="reference" value={formData.reference || ''} onChange={handleChange} className={formInputClasses} /></div>
                        </div>
                        <div className="mt-4"><label className="block text-sm font-semibold text-gray-700 mb-1">Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className={formInputClasses}></textarea></div>
                    </fieldset>
                    <fieldset className="border p-4 rounded-lg">
                        <legend className="px-2 text-base font-semibold text-gray-800">Paramètres & Seuils</legend>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             <div><label className="block text-sm font-semibold text-gray-700 mb-1">Unité</label><input type="text" name="unite" value={formData.unite || ''} onChange={handleChange} className={formInputClasses} placeholder="%, CHF, jours..." /></div>
                             <div><label className="block text-sm font-semibold text-gray-700 mb-1">Objectif</label><input type="number" name="objectif" value={formData.objectif || ''} onChange={handleChange} className={formInputClasses} /></div>
                             <div><label className="block text-sm font-semibold text-gray-700 mb-1">Seuil d'Alerte</label><input type="number" name="seuilAlerte" value={formData.seuilAlerte || ''} onChange={handleChange} className={formInputClasses} /></div>
                             <div><label className="block text-sm font-semibold text-gray-700 mb-1">Fréquence</label><select name="frequence" value={formData.frequence} onChange={handleChange} className={formInputClasses}>{['mensuel', 'trimestriel', 'annuel'].map(f=><option key={f} value={f}>{f}</option>)}</select></div>
                        </div>
                    </fieldset>
                    <fieldset className="border p-4 rounded-lg">
                        <legend className="px-2 text-base font-semibold text-gray-800">Organisation & Relations</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div><label className="block text-sm font-semibold text-gray-700 mb-1">Responsable</label><select name="responsableId" value={formData.responsableId} onChange={handleChange} className={formInputClasses}>{mockData.personnes.map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}</select></div>
                             <div><label className="block text-sm font-semibold text-gray-700 mb-1">Catégories</label><select name="categorieIds" value={formData.categorieIds} onChange={(e) => handleMultiSelectChange('categorieIds', [e.target.value])} className={formInputClasses}>{mockData.categoriesIndicateurs.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
                        </div>
                    </fieldset>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default IndicatorFormModal;