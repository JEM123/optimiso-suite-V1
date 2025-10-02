import React from 'react';
import { X } from 'lucide-react';
import EntityRelations from './EntityRelations';

interface ImpactAnalysisModalProps {
    target: any;
    onClose: () => void;
    onExplore: (entity: any, entityType: string) => void;
}

const ImpactAnalysisModal: React.FC<ImpactAnalysisModalProps> = ({ target, onClose, onExplore }) => {
    if (!target) return null;

    const entityName = target.nom || target.intitule || target.titre;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg max-w-2xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Analyse d'Impact</h2>
                        <p className="text-sm text-gray-500">Éléments affectés par une modification de : <span className="font-medium text-gray-700">{entityName} ({target.reference})</span></p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <X className="h-5 w-5"/>
                    </button>
                </div>
                
                <div className="flex-grow p-4 overflow-y-auto">
                   <EntityRelations target={target} onClose={onClose} onExplore={onExplore} />
                </div>

                <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Fermer</button>
                </div>
            </div>
        </div>
    );
};

export default ImpactAnalysisModal;
