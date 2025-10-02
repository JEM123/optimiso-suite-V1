
import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { CampagneEvaluation } from '../types';
import { X } from 'lucide-react';

interface CampagneFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (c: CampagneEvaluation) => void;
    campagne?: Partial<CampagneEvaluation> | null;
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


const CampagneFormModal: React.FC<CampagneFormModalProps> = ({ isOpen, onClose, onSave, campagne }) => {
    const { data } = useDataContext();
    const { entites, postes, personnes, competences } = data;
    const [formData, setFormData] = useState<Partial<CampagneEvaluation>>(campagne || {});

    useEffect(() => {
        if (isOpen) {
            setFormData(campagne || { statut: 'planifié', entitesCiblesIds: [], postesCiblesIds: [], personnesCiblesIds: [], competencesCiblesIds: [], methodes: ['Manager'] });
        }
    }, [campagne, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'periodeDebut' || name === 'periodeFin') {
            setFormData(prev => ({ ...prev, [name]: new Date(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleMultiSelectChange = (name: keyof CampagneEvaluation, selectedIds: string[]) => {
        setFormData(prev => ({ ...prev, [name]: selectedIds }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            auteurId: 'pers-1',
            dateCreation: formData.id ? formData.dateCreation : new Date(),
            dateModification: new Date(),
        } as CampagneEvaluation);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-4xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{formData.id ? 'Modifier la Campagne' : 'Nouvelle Campagne'}</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1">Nom</label><input type="text" name="nom" value={formData.nom || ''} onChange={handleChange} className={formInputClasses} required /></div>
                        <div><label className="block text-sm font-medium mb-1">Référence</label><input type="text" name="reference" value={formData.reference || ''} onChange={handleChange} className={formInputClasses} /></div>
                        <div><label className="block text-sm font-medium mb-1">Début</label><input type="date" name="periodeDebut" value={formData.periodeDebut ? new Date(formData.periodeDebut).toISOString().split('T')[0] : ''} onChange={handleChange} className={formInputClasses} required/></div>
                        <div><label className="block text-sm font-medium mb-1">Fin</label><input type="date" name="periodeFin" value={formData.periodeFin ? new Date(formData.periodeFin).toISOString().split('T')[0] : ''} onChange={handleChange} className={formInputClasses} required/></div>
                    </div>
                     <div><label className="block text-sm font-medium mb-1">Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className={formInputClasses}></textarea></div>
                    
                    <fieldset className="border p-4 rounded-lg"><legend className="px-2 text-base font-semibold">Population Cible</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <MultiSelect items={entites as any[]} selectedIds={formData.entitesCiblesIds || []} onChange={(ids) => handleMultiSelectChange('entitesCiblesIds', ids)} label="Entités" />
                            <MultiSelect items={postes as any[]} selectedIds={formData.postesCiblesIds || []} onChange={(ids) => handleMultiSelectChange('postesCiblesIds', ids)} label="Postes" />
                            <MultiSelect items={personnes as any[]} selectedIds={formData.personnesCiblesIds || []} onChange={(ids) => handleMultiSelectChange('personnesCiblesIds', ids)} label="Personnes" />
                        </div>
                    </fieldset>

                     <fieldset className="border p-4 rounded-lg"><legend className="px-2 text-base font-semibold">Périmètre</legend>
                        <MultiSelect items={competences as any[]} selectedIds={formData.competencesCiblesIds || []} onChange={(ids) => handleMultiSelectChange('competencesCiblesIds', ids)} label="Compétences à évaluer" />
                    </fieldset>
                </div>
                <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Sauvegarder</button>
                </div>
            </form>
        </div>
    );
};

export default CampagneFormModal;
