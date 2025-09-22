import React, { useState, useEffect } from 'react';
import { useDataContext, useAppContext } from '../context/AppContext';
import type { Processus, CustomFieldDef } from '../types';
import { X } from 'lucide-react';

interface ProcessusFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (p: Processus) => void;
    processus?: Partial<Processus> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const MultiSelect: React.FC<{ items: any[], selectedIds: string[], onChange: (ids: string[]) => void, label: string }> = ({ items, selectedIds, onChange, label }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
        <select multiple value={selectedIds} onChange={(e) => onChange(Array.from(e.target.selectedOptions, option => option.value))} className={`${formInputClasses} h-24`}>
            {items.map(item => <option key={item.id} value={item.id}>{item.nom || item.intitule}</option>)}
        </select>
    </div>
);

const newProcessusTemplate = (): Partial<Processus> => ({
    nom: '', reference: '', type: 'Métier', niveau: 'L2', actif: true, statut: 'brouillon',
    proprietaireProcessusId: '', entitesConcerneesIds: [], procedureIds: [], indicateurIds: [],
    risqueIds: [], controleIds: [], documentIds: [], missionId: '', exigenceIds: [],
    champsLibres: {},
    dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1'
});

export const ProcessusFormModal: React.FC<ProcessusFormModalProps> = ({ isOpen, onClose, onSave, processus }) => {
    const { data } = useDataContext();
    const { settings } = useAppContext();
    const [formData, setFormData] = useState<Partial<Processus>>(processus || newProcessusTemplate());
    const [activeTab, setActiveTab] = useState('identification');

    const customFieldDefs = settings.customFields.processus || [];

    useEffect(() => {
        if (isOpen) {
            const initialData = processus && Object.keys(processus).length > 1 ? JSON.parse(JSON.stringify(processus)) : newProcessusTemplate();
             if (!initialData.champsLibres) {
                initialData.champsLibres = {};
            }
            setFormData(initialData);
            setActiveTab('identification');
        }
    }, [processus, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (name: keyof Processus, selectedIds: string[]) => {
        setFormData(prev => ({ ...prev, [name]: selectedIds as any }));
    };

    const handleCustomFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            champsLibres: {
                ...prev.champsLibres,
                [name]: value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Processus);
    };

    const renderCustomField = (field: CustomFieldDef) => {
        const value = formData.champsLibres?.[field.name] || '';
        switch (field.type) {
            case 'number':
                return <input type="number" name={field.name} value={value} onChange={handleCustomFieldChange} className={formInputClasses} required={field.required} />;
            case 'date':
                return <input type="date" name={field.name} value={value} onChange={handleCustomFieldChange} className={formInputClasses} required={field.required} />;
            case 'textarea':
                 return <textarea name={field.name} value={value} onChange={handleCustomFieldChange} className={formInputClasses} required={field.required} rows={3}></textarea>;
            case 'select':
                return (
                    <select name={field.name} value={value} onChange={handleCustomFieldChange} className={formInputClasses} required={field.required}>
                        <option value="">Sélectionner...</option>
                        {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            case 'text':
            default:
                return <input type="text" name={field.name} value={value} onChange={handleCustomFieldChange} className={formInputClasses} required={field.required} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-4xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier le Processus' : 'Nouveau Processus'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    <nav className="flex space-x-4 border-b mb-4">
                        <button type="button" onClick={() => setActiveTab('identification')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'identification' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Identification</button>
                        <button type="button" onClick={() => setActiveTab('sipoc')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'sipoc' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>SIPOC & Liens</button>
                    </nav>

                    {activeTab === 'identification' && <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold mb-1">Nom</label><input type="text" name="nom" value={formData.nom || ''} onChange={handleChange} className={formInputClasses} required /></div>
                            <div><label className="block text-sm font-semibold mb-1">Référence</label><input type="text" name="reference" value={formData.reference || ''} onChange={handleChange} className={formInputClasses} /></div>
                            <div><label className="block text-sm font-semibold mb-1">Type</label><select name="type" value={formData.type} onChange={handleChange} className={formInputClasses}>{['Management', 'Métier', 'Support'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                            <div><label className="block text-sm font-semibold mb-1">Niveau</label><select name="niveau" value={formData.niveau} onChange={handleChange} className={formInputClasses}>{['L0', 'L1', 'L2', 'L3'].map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                             <div><label className="block text-sm font-semibold mb-1">Parent</label><select name="parentId" value={formData.parentId || ''} onChange={handleChange} className={formInputClasses}><option value="">Aucun</option>{(data.processus as any[]).filter(p => p.id !== formData.id).map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}</select></div>
                             <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Mission Mère <span className="text-red-500">*</span></label>
                                <select name="missionId" value={formData.missionId || ''} onChange={handleChange} className={formInputClasses} required>
                                    <option value="" disabled>Sélectionner une mission...</option>
                                    {(data.missions as any[]).map((m: any) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                                </select>
                            </div>
                             <div><label className="block text-sm font-semibold mb-1">Propriétaire (Poste)</label><select name="proprietaireProcessusId" value={formData.proprietaireProcessusId || ''} onChange={handleChange} className={formInputClasses} required><option value="" disabled>Sélectionner...</option>{(data.postes as any[]).map(p => <option key={p.id} value={p.id}>{p.intitule}</option>)}</select></div>
                        </div>
                        <div><label className="block text-sm font-semibold mb-1">Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className={formInputClasses}></textarea></div>
                        
                        {customFieldDefs.length > 0 && (
                            <fieldset className="border p-4 rounded-lg">
                                <legend className="px-2 text-base font-semibold text-gray-800">Champs Personnalisés</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {customFieldDefs.map(field => (
                                        <div key={field.id}>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">{field.name} {field.required && <span className="text-red-500">*</span>}</label>
                                            {renderCustomField(field)}
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                        )}
                    </div>}
                    
                    {activeTab === 'sipoc' && <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Fournisseurs</label><textarea name="fournisseurs" value={formData.fournisseurs || ''} onChange={handleChange} rows={2} className={formInputClasses}></textarea></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Clients</label><textarea name="clients" value={formData.clients || ''} onChange={handleChange} rows={2} className={formInputClasses}></textarea></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Entrées (Inputs)</label><textarea name="entrees" value={formData.entrees || ''} onChange={handleChange} rows={2} className={formInputClasses}></textarea></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Sorties (Outputs)</label><textarea name="sorties" value={formData.sorties || ''} onChange={handleChange} rows={2} className={formInputClasses}></textarea></div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <MultiSelect items={data.procedures as any[]} selectedIds={formData.procedureIds || []} onChange={(ids) => handleMultiSelectChange('procedureIds', ids)} label="Procédures"/>
                            <MultiSelect items={data.documents as any[]} selectedIds={formData.documentIds || []} onChange={(ids) => handleMultiSelectChange('documentIds', ids)} label="Documents"/>
                            <MultiSelect items={data.risques as any[]} selectedIds={formData.risqueIds || []} onChange={(ids) => handleMultiSelectChange('risqueIds', ids)} label="Risques"/>
                            <MultiSelect items={data.controles as any[]} selectedIds={formData.controleIds || []} onChange={(ids) => handleMultiSelectChange('controleIds', ids)} label="Contrôles"/>
                            <MultiSelect items={data.indicateurs as any[]} selectedIds={formData.indicateurIds || []} onChange={(ids) => handleMultiSelectChange('indicateurIds', ids)} label="Indicateurs"/>
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