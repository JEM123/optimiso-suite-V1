import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Actualite } from '../types';
import { X } from 'lucide-react';

interface NewsFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (a: Actualite) => void;
    actualite?: Partial<Actualite> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const NewsFormModal: React.FC<NewsFormModalProps> = ({ isOpen, onClose, onSave, actualite }) => {
    const { data } = useDataContext();
    const [formData, setFormData] = useState<Partial<Actualite>>(actualite || {});

    useEffect(() => {
        if (isOpen) {
            setFormData(actualite || {
                statut: 'brouillon',
                datePublication: new Date(),
                auteurId: 'pers-1' // Assuming current user is pers-1
            });
        }
    }, [actualite, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'datePublication' || name === 'dateExpiration') {
            setFormData(prev => ({ ...prev, [name]: value ? new Date(value) : undefined }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            auteurId: formData.auteurId || 'pers-1',
            dateCreation: formData.id ? formData.dateCreation : new Date(),
            dateModification: new Date(),
        } as Actualite);
    };
    
    const isFormValid = formData.nom && formData.categorieId && formData.resume;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-3xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier l\'Actualité' : 'Nouvelle Actualité'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Titre <span className="text-red-500">*</span></label>
                            <input type="text" name="nom" value={formData.nom || ''} onChange={handleChange} className={formInputClasses} required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Catégorie <span className="text-red-500">*</span></label>
                            <select name="categorieId" value={formData.categorieId || ''} onChange={handleChange} className={formInputClasses} required>
                                <option value="" disabled>Sélectionner...</option>
                                {(data.categoriesActualites as any[]).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Résumé (texte court) <span className="text-red-500">*</span></label>
                        <textarea name="resume" value={formData.resume || ''} onChange={handleChange} rows={3} className={formInputClasses} required></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Contenu riche (HTML)</label>
                        <textarea name="contenuRiche" value={formData.contenuRiche || ''} onChange={handleChange} rows={6} className={formInputClasses} placeholder="<p>Votre <b>contenu</b> ici...</p>"></textarea>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1">URL de l'image</label><input type="url" name="imageURL" value={formData.imageURL || ''} onChange={handleChange} className={formInputClasses} placeholder="https://..." /></div>
                        <div><label className="block text-sm font-medium mb-1">Lien "Lire la suite"</label><input type="url" name="lienCible" value={formData.lienCible || ''} onChange={handleChange} className={formInputClasses} placeholder="/module/id ou https://..." /></div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium mb-1">Date de publication</label><input type="date" name="datePublication" value={formData.datePublication ? new Date(formData.datePublication).toISOString().split('T')[0] : ''} onChange={handleChange} className={formInputClasses} required /></div>
                        <div><label className="block text-sm font-medium mb-1">Date d'expiration</label><input type="date" name="dateExpiration" value={formData.dateExpiration ? new Date(formData.dateExpiration).toISOString().split('T')[0] : ''} onChange={handleChange} className={formInputClasses} /></div>
                        <div><label className="block text-sm font-medium mb-1">Statut</label><select name="statut" value={formData.statut || 'brouillon'} onChange={handleChange} className={formInputClasses}><option value="brouillon">Brouillon</option><option value="publie">Publiée</option><option value="archive">Archivée</option></select></div>
                    </div>
                </div>
                <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                    <button type="submit" disabled={!isFormValid} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default NewsFormModal;
