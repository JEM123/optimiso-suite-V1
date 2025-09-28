import React from 'react';
import { X } from 'lucide-react';
import type { Document, Procedure, ValidationInstance, Personne, FluxDefinition } from '../types';
import { useDataContext } from '../context/AppContext';

interface ValidationModalProps {
    validationModal: { show: boolean; document?: Document; procedure?: Procedure };
    setValidationModal: (modalState: { show: boolean; document?: Document; procedure?: Procedure }) => void;
    onApprove: (element: Document | Procedure) => void;
    onReject: (element: Document | Procedure) => void;
}

const ValidationModal: React.FC<ValidationModalProps> = ({ validationModal, setValidationModal, onApprove, onReject }) => {
    const { data } = useDataContext();
    const { validationInstances, fluxDefinitions, personnes } = data;

    if (!validationModal.show) return null;

    const element = validationModal.document || validationModal.procedure;
    if (!element) return null;

    const validationInstance = (validationInstances as ValidationInstance[]).find(vi => vi.id === element.validationInstanceId);
    if (!validationInstance) return null;

    const fluxDef = (fluxDefinitions as FluxDefinition[]).find(f => f.id === validationInstance.fluxDefinitionId);
    const isEnCours = validationInstance.statut === 'En cours';

    const handleApprove = () => {
        onApprove(element);
    };

    const handleReject = () => {
        onReject(element);
    };

    const getStatusText = (status: Document['statut'] | Procedure['statut']) => {
        switch (status) {
            case 'publie':
            case 'valide':
                return 'Publié';
            case 'en_validation':
            case 'en_cours':
                return 'En cours de validation';
            default:
                return 'Version de travail';
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Flux de validation - {element.reference}</h2>
                    <button 
                        onClick={() => setValidationModal({ show: false })}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="font-medium mb-2 text-gray-900">{element.nom}</h3>
                        <div className="text-sm text-gray-600">
                            Version: {element.version} | 
                            Statut: {getStatusText(element.statut)} |
                            {isEnCours ? ' En cours de validation' : ` ${validationInstance.statut}`}
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-medium text-gray-800 mb-2">Historique des validations</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {validationInstance.historique.map((entry) => {
                                const approbateur = (personnes as Personne[]).find(p => p.id === entry.decideurId);
                                const etapeDef = fluxDef?.etapes.find(e => e.id === entry.etapeId);
                                const etapeType = etapeDef?.type === 'Finale' ? 'Approbation finale' : 'Approbation intermédiaire';
                                const decision = entry.decision;
                                const decisionColor = decision === 'Approuvé' ? 'text-green-600' : decision === 'Rejeté' ? 'text-red-600' : 'text-yellow-600';
                                
                                return (
                                    <div key={entry.id} className="flex items-start space-x-4 p-3 border rounded-lg bg-white">
                                        <div className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 ${
                                            decision === 'Approuvé' ? 'bg-green-500' : 
                                            decision === 'Rejeté' ? 'bg-red-500' : 'bg-yellow-500'
                                        }`}></div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800">
                                                {approbateur ? `${approbateur.prenom} ${approbateur.nom}` : 'Approbateur'} 
                                                <span className="text-gray-500 font-normal"> - {etapeType}</span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {entry.dateDecision ? new Date(entry.dateDecision).toLocaleDateString('fr-FR') : 'En attente'} - 
                                                <span className={`font-medium ${decisionColor}`}>
                                                    {decision}
                                                </span>
                                            </div>
                                            {entry.commentaire && (
                                                <div className="text-sm text-gray-500 italic mt-1 bg-gray-50 p-2 rounded">{entry.commentaire}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                        <button 
                            onClick={() => setValidationModal({ show: false })}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Fermer
                        </button>
                        {isEnCours && (
                            <>
                                <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                                    Rejeter
                                </button>
                                <button onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                                    Approuver
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ValidationModal;