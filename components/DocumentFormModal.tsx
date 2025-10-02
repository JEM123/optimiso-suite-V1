

import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Document, Risque, Controle } from '../types';
import { X } from 'lucide-react';

interface DocumentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (c: Document) => void;
    document?: Partial<Document> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const MultiSelect: React.FC<{ items: any[], selectedIds: string[], onChange: (ids: string[]) => void, label: string }> = ({ items, selectedIds, onChange, label }) => {
    const handleSelect = (id: string) => {
        const newSelectedIds = selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id];
        onChange(newSelectedIds);
    }
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="max-h-24 overflow-y-auto border rounded-md p-2 space-y-1 bg-white">
                {items.map(item => (
                    <label key={item.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50">
                        <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelect(item.id)} className="rounded" />
                        <span className="text-sm">{item.nom} ({item.reference})</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

const DocumentFormModal: React.FC<DocumentFormModalProps> = ({ isOpen, onClose, onSave, document }) => {
    const { data } = useDataContext();
    const { categoriesDocuments, risques, controles } = data;
    const [formData, setFormData] = useState<Partial<Document>>(document || {});
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        if (isOpen) {
            setFormData(document || {});
            setActiveTab('info');
        }
    }, [document, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, champsLibres: { ...prev.champsLibres, [name]: value } }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(p => ({ ...p, [name]: checked }));
    };

    const handleGedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData(p => ({
            ...p,
            autoValidationGED: isChecked,
        }));
    };

    const handleMultiSelectChange = (name: keyof Document, selectedIds: string[]) => {
        setFormData(prev => ({ ...prev, [name]: selectedIds }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Document);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-4xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier le Document' : 'Nouveau Document'}</h2>
                    <button type="button" onClick={onClose}><X className="h-5 w-5"/></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    <nav className="flex space-x-4 border-b mb-4">
                        <button type="button" onClick={() => setActiveTab('info')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'info' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Informations</button>
                        <button type="button" onClick={() => setActiveTab('source')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'source' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Source & Contenu</button>
                        <button type="button" onClick={() => setActiveTab('relations')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'relations' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Relations</button>
                    </nav>

                    {activeTab === 'info' && <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div><label className="block text-sm font-medium text-gray-700 mb-1">Titre</label><input type="text" name="nom" value={formData.nom} onChange={handleChange} className={formInputClasses} required /></div>
                           <div><label className="block text-sm font-medium text-gray-700 mb-1">Référence</label><input type="text" name="reference" value={formData.reference} onChange={handleChange} className={formInputClasses} /></div>
                           <div><label className="block text-sm font-medium text-gray-700 mb-1">Version</label><input type="text" name="version" value={formData.version} onChange={handleChange} className={formInputClasses} /></div>
                           <div><label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label><input type="date" name="dateEcheance" value={formData.champsLibres?.dateEcheance || ''} onChange={handleDateChange} className={formInputClasses} /></div>
                        </div>
                         <div><label className="block text-sm font-medium text-gray-700 mb-1">Catégories</label>
                            {/* FIX: Explicitly type 'option' to HTMLOptionElement to resolve TS error */}
                            <select multiple value={formData.categorieIds} onChange={(e) => handleMultiSelectChange('categorieIds', Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className={`${formInputClasses} h-24`}>
                                {(categoriesDocuments as any[]).map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <input type="checkbox" id="miseEnAvant" name="miseEnAvant" checked={!!formData.miseEnAvant} onChange={handleCheckboxChange} className="rounded" />
                            <label htmlFor="miseEnAvant" className="text-sm font-medium text-gray-700">Mettre en avant ce document</label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="autoValidationGED" name="autoValidationGED" checked={!!formData.autoValidationGED} onChange={handleGedChange} className="rounded" />
                            <label htmlFor="autoValidationGED" className="text-sm font-medium text-gray-700">Publication automatique (sans flux de validation)</label>
                        </div>
                    </div>}

                    {activeTab === 'source' && <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                            <select name="source" value={formData.source} onChange={handleChange} className={formInputClasses}>
                                <option value="Fichier">Fichier (ex: PDF, Word)</option>
                                <option value="Lien">Lien externe (URL)</option>
                                <option value="Description">Description riche (éditeur)</option>
                            </select>
                        </div>
                        {formData.source === 'Fichier' && <div><label className="block text-sm font-medium text-gray-700 mb-1">Téléverser le fichier</label><input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/></div>}
                        {formData.source === 'Lien' && <div><label className="block text-sm font-medium text-gray-700 mb-1">URL du lien</label><input type="url" name="lien" value={formData.lien || ''} onChange={handleChange} className={formInputClasses} placeholder="https://..." /></div>}
                        {formData.source === 'Description' && <div><label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={8} className={formInputClasses}></textarea></div>}
                    </div>}

                    {activeTab === 'relations' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MultiSelect items={risques as Risque[]} selectedIds={formData.risqueIds || []} onChange={(ids) => handleMultiSelectChange('risqueIds', ids)} label="Risques liés" />
                        <MultiSelect items={controles as Controle[]} selectedIds={formData.controleIds || []} onChange={(ids) => handleMultiSelectChange('controleIds', ids)} label="Contrôles liés" />
                    </div>}

                </div>
                <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default DocumentFormModal;