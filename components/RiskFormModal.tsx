import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Risque, Processus, CategorieRisque, Poste, Entite, Controle, Document, Procedure } from '../types';
import { X } from 'lucide-react';

interface RiskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (r: Risque) => void;
    risque?: Partial<Risque> | null;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const MultiSelect: React.FC<{ items: any[], selectedIds: string[], onChange: (ids: string[]) => void, label: string }> = ({ items, selectedIds, onChange, label }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
        <select multiple value={selectedIds} onChange={(e) => onChange(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className={`${formInputClasses} h-24`}>
            {items.map(item => <option key={item.id} value={item.id}>{item.nom || item.intitule}</option>)}
        </select>
    </div>
);

const RiskEvalInput: React.FC<{ label: string, value: { probabilite: number, impact: number }, onChange: (newValue: { probabilite: number, impact: number }) => void }> = ({ label, value, onChange }) => (
    <div className="p-3 rounded-lg border bg-gray-50">
        <h4 className="font-semibold text-gray-800">{label}</h4>
        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
            <div>
                <label>Probabilité</label>
                <select value={value.probabilite} onChange={e => onChange({ ...value, probabilite: parseInt(e.target.value) })} className={formInputClasses}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>
            <div>
                <label>Impact</label>
                 <select value={value.impact} onChange={e => onChange({ ...value, impact: parseInt(e.target.value) })} className={formInputClasses}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>
            <div className="text-center">
                <label>Niveau</label>
                <p className="font-bold text-lg mt-2">{value.probabilite * value.impact}</p>
            </div>
        </div>
    </div>
);


export const RiskFormModal: React.FC<RiskFormModalProps> = ({ isOpen, onClose, onSave, risque }) => {
    const { data } = useDataContext();
    const { processus, categoriesRisques, postes, entites, controles, documents, procedures } = data as {
        processus: Processus[], categoriesRisques: CategorieRisque[], postes: Poste[], entites: Entite[],
        controles: Controle[], documents: Document[], procedures: Procedure[]
    };

    const [formData, setFormData] = useState<Partial<Risque>>(risque || {});
    const [activeTab, setActiveTab] = useState('identification');

    useEffect(() => {
        if (isOpen) {
            setFormData(risque || {});
            setActiveTab('identification');
        }
    }, [risque, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleEvalChange = (field: 'analyseInherente' | 'analyseResiduelle', value: { probabilite: number, impact: number }) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelectChange = (name: keyof Risque, selectedIds: string[]) => {
        setFormData(prev => ({ ...prev, [name]: selectedIds as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Risque);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-4xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier le Risque' : 'Nouveau Risque'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                     <nav className="flex space-x-4 border-b mb-4">
                        <button type="button" onClick={() => setActiveTab('identification')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'identification' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Identification</button>
                        <button type="button" onClick={() => setActiveTab('evaluation')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'evaluation' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Évaluation</button>
                        <button type="button" onClick={() => setActiveTab('maitrise')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'maitrise' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Maîtrise</button>
                    </nav>

                    {activeTab === 'identification' && <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold mb-1">Titre</label><input type="text" name="nom" value={formData.nom || ''} onChange={handleChange} className={formInputClasses} required /></div>
                            <div><label className="block text-sm font-semibold mb-1">Référence</label><input type="text" name="reference" value={formData.reference || ''} onChange={handleChange} className={formInputClasses} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold mb-1">Processus</label><select name="processusId" value={formData.processusId || ''} onChange={handleChange} className={formInputClasses} required>{processus.map(p=><option key={p.id} value={p.id}>{p.nom}</option>)}</select></div>
                            <div><label className="block text-sm font-semibold mb-1">Catégorie</label><select name="categorieIds" value={(formData.categorieIds || [])[0] || ''} onChange={e => handleMultiSelectChange('categorieIds', [e.target.value])} className={formInputClasses}>{categoriesRisques.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
                        </div>
                        <div><label className="block text-sm font-semibold mb-1">Causes</label><textarea name="causes" value={formData.causes || ''} onChange={handleChange} rows={3} className={formInputClasses}></textarea></div>
                        <div><label className="block text-sm font-semibold mb-1">Conséquences</label><textarea name="consequences" value={formData.consequences || ''} onChange={handleChange} rows={3} className={formInputClasses}></textarea></div>
                    </div>}

                    {activeTab === 'evaluation' && <div className="space-y-4">
                        <RiskEvalInput label="Analyse Inhérente" value={formData.analyseInherente || {probabilite: 1, impact: 1}} onChange={v => handleEvalChange('analyseInherente', v)} />
                        <RiskEvalInput label="Analyse Résiduelle" value={formData.analyseResiduelle || {probabilite: 1, impact: 1}} onChange={v => handleEvalChange('analyseResiduelle', v)} />
                    </div>}
                    
                    {activeTab === 'maitrise' && <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <MultiSelect items={controles} selectedIds={formData.controleMaitriseIds || []} onChange={ids => handleMultiSelectChange('controleMaitriseIds', ids)} label="Contrôles de maîtrise" />
                           <MultiSelect items={documents} selectedIds={formData.documentMaitriseIds || []} onChange={ids => handleMultiSelectChange('documentMaitriseIds', ids)} label="Documents de maîtrise" />
                           <MultiSelect items={procedures} selectedIds={formData.procedureMaitriseIds || []} onChange={ids => handleMultiSelectChange('procedureMaitriseIds', ids)} label="Procédures de maîtrise" />
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
