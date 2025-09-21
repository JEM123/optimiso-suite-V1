import React, { useState, useEffect } from 'react';
import { mockData } from '../constants';
import type { ExecutionControle, Controle } from '../types';
import { X } from 'lucide-react';

interface ExecutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: ExecutionControle) => void;
    execution: ExecutionControle;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const ExecutionModal: React.FC<ExecutionModalProps> = ({ isOpen, onClose, onSave, execution }) => {
    const [results, setResults] = useState<Record<string, any>>(execution.resultatsSaisis || {});
    const [status, setStatus] = useState<'terminé' | 'non-conforme'>('terminé');

    useEffect(() => {
        setResults(execution.resultatsSaisis || {});
    }, [execution]);

    const control = mockData.controles.find(c => c.id === execution.controleId);
    
    if (!isOpen || !control) return null;

    const handleResultChange = (fieldId: string, value: any, type: string) => {
        if (type === 'booléen') {
             setResults(prev => ({ ...prev, [fieldId]: !prev[fieldId] }));
        } else {
             setResults(prev => ({ ...prev, [fieldId]: value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedExecution: ExecutionControle = {
            ...execution,
            resultatsSaisis: results,
            statut: status,
            dateExecution: new Date(),
        };
        onSave(updatedExecution);
    };

    const renderField = (field: any) => {
        const value = results[field.id] || '';
        switch (field.type_reponse) {
            case 'texte':
                return <textarea value={value} onChange={(e) => handleResultChange(field.id, e.target.value, field.type_reponse)} rows={2} className={formInputClasses} />;
            case 'nombre':
                return <input type="number" value={value} onChange={(e) => handleResultChange(field.id, e.target.value, field.type_reponse)} className={formInputClasses} />;
            case 'date':
                return <input type="date" value={value} onChange={(e) => handleResultChange(field.id, e.target.value, field.type_reponse)} className={formInputClasses} />;
            case 'booléen':
                return <input type="checkbox" checked={!!value} onChange={(e) => handleResultChange(field.id, e.target.checked, field.type_reponse)} className="mt-1 h-5 w-5 rounded" />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-2xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Exécuter le Contrôle</h2>
                    <button type="button" onClick={onClose}><X className="h-5 w-5"/></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <h3 className="font-bold text-gray-800">{control.nom}</h3>
                        <p className="text-sm text-gray-600 mt-1">{control.methodeExecution}</p>
                    </div>
                    <div className="space-y-4">
                        {control.champsResultatsDef.map(field => (
                            <div key={field.id}>
                                <label className="block text-sm font-medium mb-1">{field.libelle} {field.obligatoire && <span className="text-red-500">*</span>}</label>
                                {renderField(field)}
                            </div>
                        ))}
                         <div>
                            <label className="block text-sm font-medium mb-1">Conclusion</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={formInputClasses}>
                                <option value="terminé">Terminé (Conforme)</option>
                                <option value="non-conforme">Terminé (Non Conforme)</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Valider l'exécution</button>
                </div>
            </form>
        </div>
    );
};

export default ExecutionModal;