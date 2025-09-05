import React, { useState, useEffect } from 'react';
import type { AccueilComponent } from '../types';
import { mockData } from '../constants';
import { X } from 'lucide-react';

interface ComponentSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (componentId: string, newConfig: any) => void;
    component: AccueilComponent;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const ComponentSettingsModal: React.FC<ComponentSettingsModalProps> = ({ isOpen, onClose, onSave, component }) => {
    const [config, setConfig] = useState(component.config);

    useEffect(() => {
        setConfig(component.config);
    }, [component]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({...prev, [name]: value}));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(component.id, config);
    };

    const renderSettings = () => {
        switch (component.type) {
            case 'text':
            case 'news':
            case 'my-tasks':
            case 'risk-list':
            case 'useful-docs':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre du Widget</label>
                        <input type="text" name="title" value={config.title || ''} onChange={handleChange} className={formInputClasses} />
                    </div>
                );
            case 'indicator-chart':
                return (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Indicateur à afficher</label>
                        <select name="indicatorId" value={config.indicatorId || ''} onChange={handleChange} className={formInputClasses}>
                            <option value="" disabled>Sélectionner un indicateur</option>
                            {mockData.indicateurs.map(ind => (
                                <option key={ind.id} value={ind.id}>{ind.nom}</option>
                            ))}
                        </select>
                    </div>
                );
            default:
                return <p className="text-gray-600">Ce widget n'a pas d'options de configuration.</p>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-lg w-full m-4 shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Configurer le Widget</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    {renderSettings()}
                </div>
                 <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                        Annuler
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                        Sauvegarder
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ComponentSettingsModal;
