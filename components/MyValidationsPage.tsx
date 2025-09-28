

import React, { useState, useMemo } from 'react';
import { Check, X, Clock, CheckCircle } from 'lucide-react';
import { useDataContext, useAppContext } from '../context/AppContext';
import RejectionModal from './RejectionModal';
import type { ValidationInstance, FluxDefinition, Document, Procedure, Personne } from '../types';

const MyValidationsPage: React.FC = () => {
    const { user } = useAppContext();
    const { data, actions } = useDataContext();
    const { validationInstances, fluxDefinitions, documents, procedures, personnes } = data;
    const [rejectionTarget, setRejectionTarget] = useState<ValidationInstance | null>(null);

    const pendingValidations = useMemo(() => {
        return (validationInstances as ValidationInstance[]).filter(v => {
            if (v.statut !== 'En cours') return false;

            const flux = (fluxDefinitions as FluxDefinition[]).find(f => f.id === v.fluxDefinitionId);
            if (!flux) return false;

            const currentStep = flux.etapes.find(e => e.ordre === v.etapeActuelle);
            if (!currentStep) return false;
            
            // This is a simplified check. A real app would handle role groups etc.
            if (currentStep.modeAppro === 'Individu') {
                return currentStep.approbateursIds.includes(user.id);
            }

            // TODO: Handle 'Groupe de rôles' and 'File d’attente' modes
            return false;
        });
    }, [validationInstances, fluxDefinitions, user.id]);


    const getElementDetails = (elementId: string, elementModule: string): Document | Procedure | null => {
        switch (elementModule) {
            case 'Documents':
                return (documents as Document[]).find(d => d.id === elementId) || null;
            case 'Procédures':
                return (procedures as Procedure[]).find(p => p.id === elementId) || null;
            default:
                return null;
        }
    };
    
    const handleApprove = (validationId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir approuver cette demande ?")) {
            actions.approveValidation(validationId);
        }
    };

    const handleReject = (validationId: string, comment: string) => {
        actions.rejectValidation(validationId, comment);
        setRejectionTarget(null);
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-white rounded-lg border">
                <h1 className="text-2xl font-bold text-gray-900">Mes Validations en Attente</h1>
                <p className="text-sm text-gray-600 mt-1">Examinez et traitez les demandes qui requièrent votre approbation.</p>
            </div>
            
            <div className="space-y-4">
                {pendingValidations.map(validation => {
                    const element = getElementDetails(validation.elementId, validation.elementModule);
                    const demandeur = (personnes as Personne[]).find(p => p.id === validation.demandeurId);
                    if (!element) return null;

                    return (
                        <div key={validation.id} className="bg-white p-4 rounded-lg border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">{element.reference}</p>
                                <h2 className="font-semibold text-gray-800">{element.nom}</h2>
                                <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                                    <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /><span>Demandé le: {new Date(validation.dateDemande).toLocaleDateString('fr-FR')}</span></div>
                                    <div className="flex items-center gap-1.5"><span>par: {demandeur ? `${demandeur.prenom} ${demandeur.nom}` : 'Inconnu'}</span></div>
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2 w-full md:w-auto">
                                <button onClick={() => setRejectionTarget(validation)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    <X className="h-4 w-4 text-red-600" />
                                    Rejeter
                                </button>
                                <button onClick={() => handleApprove(validation.id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                                    <Check className="h-4 w-4" />
                                    Approuver
                                </button>
                            </div>
                        </div>
                    )
                })}

                {pendingValidations.length === 0 && (
                     <div className="text-center py-12 bg-white rounded-lg border">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Boîte de réception vide</h3>
                        <p className="mt-1 text-sm text-gray-500">Vous n'avez aucune demande de validation en attente.</p>
                    </div>
                )}
            </div>
            
            {rejectionTarget && (
                <RejectionModal 
                    isOpen={!!rejectionTarget}
                    onClose={() => setRejectionTarget(null)}
                    onConfirm={(comment) => handleReject(rejectionTarget.id, comment)}
                />
            )}
        </div>
    );
};

export default MyValidationsPage;