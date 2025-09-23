
import React, { useState, useEffect } from 'react';
import type { Procedure, EtapeProcedure, Document, Risque, Controle } from '../types';
import { mockData } from '../constants';
import { X, Briefcase, Edit, AlertTriangle, CheckCircle, Save, Ban, FileText } from 'lucide-react';

interface ProcedureStepDetailPanelProps {
    etape: EtapeProcedure;
    procedure: Procedure;
    onClose: () => void;
    onShowRelations: (entity: any, entityType: string) => void;
    onSave: (etape: EtapeProcedure) => void;
}

const RelationItem: React.FC<{ item: any; icon: React.ElementType, onClick: () => void }> = ({ item, icon: Icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50 text-left">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </button>
);

const FormInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const MultiSelect: React.FC<{ items: any[], selectedIds: string[], onChange: (ids: string[]) => void, label: string }> = ({ items, selectedIds, onChange, label }) => {
    const handleSelect = (id: string) => {
        const newSelectedIds = selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id];
        onChange(newSelectedIds);
    }
    return (
        <div>
            <label className="font-semibold text-gray-700 mb-1 text-sm flex items-center gap-2">{label}</label>
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

const ProcedureStepDetailPanel: React.FC<ProcedureStepDetailPanelProps> = ({ etape, procedure, onClose, onShowRelations, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<EtapeProcedure>(etape);

    useEffect(() => {
        setFormData(etape);
        setIsEditing(false); // Reset editing state when step changes
    }, [etape]);
    
    const handleSave = () => {
        onSave(formData);
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setFormData(etape);
        setIsEditing(false);
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (field: keyof EtapeProcedure, ids: string[]) => {
        setFormData(prev => ({...prev, [field]: ids as any}));
    }

    const responsable = mockData.postes.find(p => p.id === formData.responsablePosteId);
    const documents = mockData.documents.filter(r => formData.documentIds?.includes(r.id));
    const risques = mockData.risques.filter(r => formData.risqueIds?.includes(r.id));
    const controles = mockData.controles.filter(c => formData.controleIds?.includes(c.id));

    return (
        <div className="w-full max-w-sm bg-white border-l shadow-lg flex flex-col h-full animate-slide-in-right z-10">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <p className="text-xs text-gray-500">Étape {etape.ordre}</p>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={etape.libelle}>{etape.libelle}</h2>
                </div>
                <div className="flex space-x-1">
                    {!isEditing && <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md" title="Modifier l'étape"><Edit className="h-4 w-4"/></button>}
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50 space-y-4">
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Titre de l'étape</label>
                    {isEditing ? (
                        <input type="text" name="libelle" value={formData.libelle} onChange={handleChange} className={FormInputClasses} />
                    ) : (
                        <p className="text-sm p-2 bg-white border rounded-md">{formData.libelle}</p>
                    )}
                </div>
                <div>
                    <label className="font-semibold text-gray-700 mb-1 text-sm flex items-center gap-2"><Briefcase className="h-4 w-4" />Responsable</label>
                     {isEditing ? (
                        <select name="responsablePosteId" value={formData.responsablePosteId || ''} onChange={handleChange} className={FormInputClasses}>
                            <option value="">Non défini</option>
                            {mockData.postes.map(p => <option key={p.id} value={p.id}>{p.intitule}</option>)}
                        </select>
                    ) : (
                        responsable ? <div className="p-2 bg-white border rounded-md text-sm">{responsable.intitule}</div> : <div className="p-2 bg-white border rounded-md text-sm text-gray-500">Non défini</div>
                    )}
                </div>
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
                    {isEditing ? (
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className={FormInputClasses} />
                    ) : (
                        <p className="text-sm text-gray-700 p-3 bg-white border rounded-md whitespace-pre-wrap">{formData.description || 'Aucune description.'}</p>
                    )}
                </div>
                
                {isEditing ? (
                    <>
                        <MultiSelect 
                            items={mockData.documents} 
                            selectedIds={formData.documentIds || []} 
                            onChange={(ids) => handleMultiSelectChange('documentIds', ids)}
                            label="Documents de référence"
                        />
                        <MultiSelect 
                            items={mockData.risques} 
                            selectedIds={formData.risqueIds || []} 
                            onChange={(ids) => handleMultiSelectChange('risqueIds', ids)}
                            label="Risques liés"
                        />
                        <MultiSelect 
                            items={mockData.controles} 
                            selectedIds={formData.controleIds || []} 
                            onChange={(ids) => handleMultiSelectChange('controleIds', ids)}
                            label="Contrôles de maîtrise"
                        />
                    </>
                ) : (
                    <>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><FileText className="h-4 w-4" />Documents de référence ({documents.length})</h4>
                            <div className="space-y-2">{documents.map(doc => <RelationItem key={doc.id} item={doc} icon={FileText} onClick={() => onShowRelations(doc, 'documents')} />)}</div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Risques liés ({risques.length})</h4>
                            <div className="space-y-2">{risques.map(risk => <RelationItem key={risk.id} item={risk} icon={AlertTriangle} onClick={() => onShowRelations(risk, 'risques')} />)}</div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><CheckCircle className="h-4 w-4" />Contrôles ({controles.length})</h4>
                            <div className="space-y-2">{controles.map(ctrl => <RelationItem key={ctrl.id} item={ctrl} icon={CheckCircle} onClick={() => onShowRelations(ctrl, 'controles')} />)}</div>
                        </div>
                    </>
                )}
            </div>
            {isEditing && (
                 <div className="p-2 border-t bg-gray-100 flex justify-end gap-2">
                     <button onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white border rounded-md hover:bg-gray-50"><Ban className="h-4 w-4"/>Annuler</button>
                     <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"><Save className="h-4 w-4"/>Enregistrer</button>
                 </div>
            )}
        </div>
    );
};

export default ProcedureStepDetailPanel;
