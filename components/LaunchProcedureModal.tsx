import React, { useState } from 'react';
import type { Procedure } from '../types';
import { X, Rocket } from 'lucide-react';

interface LaunchProcedureModalProps {
    procedure: Procedure;
    onClose: () => void;
    onLaunch: (procedure: Procedure, instanceName: string, targetDate: Date) => void;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const LaunchProcedureModal: React.FC<LaunchProcedureModalProps> = ({ procedure, onClose, onLaunch }) => {
    const [instanceName, setInstanceName] = useState(`${procedure.nom} - ${new Date().toLocaleDateString('fr-FR')}`);
    const [targetDate, setTargetDate] = useState(new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLaunch(procedure, instanceName, new Date(targetDate));
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Lancer la procédure</h2>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="space-y-4">
                     <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-sm text-gray-500">Procédure</p>
                        <p className="font-semibold">{procedure.nom}</p>
                    </div>
                    <div>
                        <label htmlFor="instanceName" className="block text-sm font-medium text-gray-700 mb-1">
                            Nom de l'instance
                        </label>
                        <input
                            type="text"
                            id="instanceName"
                            value={instanceName}
                            onChange={(e) => setInstanceName(e.target.value)}
                            className={formInputClasses}
                            required
                        />
                         <p className="text-xs text-gray-500 mt-1">Donnez un nom unique à cette exécution pour la retrouver facilement.</p>
                    </div>
                     <div>
                        <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Date d'échéance globale
                        </label>
                        <input
                            type="date"
                            id="targetDate"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className={formInputClasses}
                            required
                        />
                         <p className="text-xs text-gray-500 mt-1">Cette date sera utilisée comme échéance pour toutes les tâches générées.</p>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                        Annuler
                    </button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">
                        <Rocket className="h-4 w-4" />
                        Confirmer & Lancer
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LaunchProcedureModal;