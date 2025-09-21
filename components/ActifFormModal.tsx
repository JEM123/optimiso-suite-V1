import React, { useState, useEffect } from 'react';
import { mockData } from '../constants';
import type { Actif } from '../types';
import { X } from 'lucide-react';

interface ActifFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (a: Actif) => void;
    actif?: Partial<Actif> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const ActifFormModal: React.FC<ActifFormModalProps> = ({ isOpen, onClose, onSave, actif }) => {
    const [formData, setFormData] = useState<Partial<Actif>>(actif || {});

    useEffect(() => {
        if (isOpen) setFormData(actif || {});
    }, [actif, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Actif);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-3xl w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold">{formData.id ? 'Modifier l\'Actif' : 'Nouvel Actif'}</h2><button type="button" onClick={onClose}><X/></button></div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1">Nom</label><input type="text" name="nom" value={formData.nom || ''} onChange={handleChange} className={formInputClasses} required /></div>
                        <div><label className="block text-sm font-medium mb-1">Référence</label><input type="text" name="reference" value={formData.reference || ''} onChange={handleChange} className={formInputClasses} /></div>
                        <div><label className="block text-sm font-medium mb-1">Type</label><select name="type" value={formData.type} onChange={handleChange} className={formInputClasses}>{['Matériel', 'Logiciel', 'Service', 'Donnée', 'Autre'].map(t=><option key={t}>{t}</option>)}</select></div>
                        <div><label className="block text-sm font-medium mb-1">Catégorie</label><select name="categorieId" value={formData.categorieId} onChange={handleChange} className={formInputClasses}>{mockData.actifCategories.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
                        <div><label className="block text-sm font-medium mb-1">Actif Parent</label>
                            <select name="parentId" value={formData.parentId || ''} onChange={handleChange} className={formInputClasses}>
                                <option value="">Aucun (racine)</option>
                                {mockData.actifs.filter(a => a.id !== formData.id).map(a=><option key={a.id} value={a.id}>{a.nom}</option>)}
                            </select>
                        </div>
                        <div><label className="block text-sm font-medium mb-1">Statut Cycle de Vie</label><select name="statutCycleVie" value={formData.statutCycleVie} onChange={handleChange} className={formInputClasses}>{['En service', 'En stock', 'En maintenance', 'Obsolète', 'Retiré'].map(s=><option key={s}>{s}</option>)}</select></div>
                         <div><label className="block text-sm font-medium mb-1">Propriétaire</label><select name="proprietaireId" value={formData.proprietaireId} onChange={handleChange} className={formInputClasses}>{mockData.personnes.map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}</select></div>
                        <div><label className="block text-sm font-medium mb-1">Gestionnaire</label><select name="gestionnaireId" value={formData.gestionnaireId} onChange={handleChange} className={formInputClasses}>{mockData.personnes.map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}</select></div>
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

export default ActifFormModal;