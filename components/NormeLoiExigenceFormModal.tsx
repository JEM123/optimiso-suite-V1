import React, { useState, useEffect } from 'react';
import { mockData } from '../constants';
import type { NormeLoiExigence } from '../types';
import { X, AlertTriangle } from 'lucide-react';

interface NormeLoiExigenceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: NormeLoiExigence) => void;
    exigence?: Partial<NormeLoiExigence> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const MultiSelect: React.FC<{ items: any[], selectedIds: string[], onChange: (ids: string[]) => void, label: string }> = ({ items, selectedIds, onChange, label }) => {
    const handleSelect = (id: string) => {
        const newSelectedIds = selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id];
        onChange(newSelectedIds);
    }
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
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

const NormeLoiExigenceFormModal: React.FC<NormeLoiExigenceFormModalProps> = ({ isOpen, onClose, onSave, exigence }) => {
    const [formData, setFormData] = useState<Partial<NormeLoiExigence>>(exigence || {});
    const [activeTab, setActiveTab] = useState('details');
    const [showProofWarning, setShowProofWarning] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const initialData = exigence || { statutConformite: 'À évaluer', processusLiesIds: [], controlesLiesIds: [], documentsPreuvesIds: [] };
            setFormData(initialData);
            setActiveTab('details');
        }
    }, [exigence, isOpen]);

    useEffect(() => {
        const needsProof = formData.statutConformite === 'Conforme' || formData.statutConformite === 'Partiellement conforme';
        const hasProof = (formData.processusLiesIds?.length || 0) > 0 ||
                         (formData.controlesLiesIds?.length || 0) > 0 ||
                         (formData.documentsPreuvesIds?.length || 0) > 0;
        setShowProofWarning(needsProof && !hasProof);
    }, [formData.statutConformite, formData.processusLiesIds, formData.controlesLiesIds, formData.documentsPreuvesIds]);


    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (name: 'processusLiesIds' | 'controlesLiesIds' | 'documentsPreuvesIds', selectedIds: string[]) => {
        setFormData(prev => ({ ...prev, [name]: selectedIds }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (showProofWarning) {
            if (!window.confirm("Avertissement : Vous marquez cette exigence comme conforme sans fournir de preuve. Voulez-vous vraiment continuer ?")) {
                return;
            }
        }
        onSave({
            ...formData,
            auteurId: formData.auteurId || 'pers-1',
            dateCreation: formData.dateCreation || new Date(),
            dateModification: new Date()
        } as NormeLoiExigence);
    };

    const isFormValid = formData.reference && formData.intitule && formData.description && formData.responsableId;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-3xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier l\'Exigence' : 'Nouvelle Exigence'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    <nav className="flex space-x-4 border-b mb-4">
                        <button type="button" onClick={() => setActiveTab('details')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Détails</button>
                        <button type="button" onClick={() => setActiveTab('preuves')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'preuves' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Preuves & Liens</button>
                    </nav>

                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            {showProofWarning && (
                                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg text-yellow-800 text-sm flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Preuves manquantes</h4>
                                        <p>Veuillez lier au moins un processus, contrôle ou document dans l'onglet "Preuves & Liens" pour justifier le statut de conformité.</p>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium mb-1">Référence <span className="text-red-500">*</span></label><input type="text" name="reference" value={formData.reference || ''} onChange={handleChange} className={formInputClasses} placeholder="Ex: 8.5.1" required /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Intitulé <span className="text-red-500">*</span></label><input type="text" name="intitule" value={formData.intitule || ''} onChange={handleChange} className={formInputClasses} required /></div>
                            </div>
                            <div><label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className={formInputClasses} required></textarea></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div><label className="block text-sm font-medium mb-1">Obligation</label><select name="obligation" value={formData.obligation} onChange={handleChange} className={formInputClasses}>{['Obligatoire', 'Recommandée'].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                                <div><label className="block text-sm font-medium mb-1">Criticité</label><select name="criticite" value={formData.criticite} onChange={handleChange} className={formInputClasses}>{['Faible', 'Moyenne', 'Élevée'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                <div><label className="block text-sm font-medium mb-1">Statut Conformité</label><select name="statutConformite" value={formData.statutConformite} onChange={handleChange} className={formInputClasses}>{['Non applicable', 'Conforme', 'Partiellement conforme', 'Non conforme', 'À évaluer'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                <div><label className="block text-sm font-medium mb-1">Périodicité</label><select name="periodiciteEval" value={formData.periodiciteEval} onChange={handleChange} className={formInputClasses}>{['À la demande', 'Trimestrielle', 'Semestrielle', 'Annuelle'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                                <div className="lg:col-span-2"><label className="block text-sm font-medium mb-1">Responsable <span className="text-red-500">*</span></label><select name="responsableId" value={formData.responsableId || ''} onChange={handleChange} className={formInputClasses} required><option value="" disabled>Sélectionner...</option>{mockData.postes.map(p=><option key={p.id} value={p.id}>{p.intitule}</option>)}</select></div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'preuves' && (
                        <div className="space-y-4">
                             <MultiSelect items={mockData.processus} selectedIds={formData.processusLiesIds || []} onChange={(ids) => handleMultiSelectChange('processusLiesIds', ids)} label="Processus Liés" />
                             <MultiSelect items={mockData.controles} selectedIds={formData.controlesLiesIds || []} onChange={(ids) => handleMultiSelectChange('controlesLiesIds', ids)} label="Contrôles Liés" />
                             <MultiSelect items={mockData.documents} selectedIds={formData.documentsPreuvesIds || []} onChange={(ids) => handleMultiSelectChange('documentsPreuvesIds', ids)} label="Documents de Preuve" />
                        </div>
                    )}
                </div>
                <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                    <button type="submit" disabled={!isFormValid} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default NormeLoiExigenceFormModal;