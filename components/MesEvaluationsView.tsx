import React, { useState, useMemo } from 'react';
import { useAppContext, useDataContext } from '../context/AppContext';
import type { EvaluationCompetence, Personne, Competence } from '../types';
import { Target, User, TrendingUp, Calendar } from 'lucide-react';
import EvaluationFormModal from './EvaluationFormModal';

const MesEvaluationsView: React.FC = () => {
    const { user } = useAppContext();
    const { data, actions } = useDataContext();
    const { evaluationsCompetences, personnes, competences } = data as {
        evaluationsCompetences: EvaluationCompetence[],
        personnes: Personne[],
        competences: Competence[]
    };

    const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationCompetence | null>(null);

    const myEvaluations = useMemo(() => {
        return evaluationsCompetences
            .filter(e => e.evaluateurId === user.id && e.statut === 'a_faire')
            .map(e => {
                const personne = personnes.find(p => p.id === e.personneId);
                const competence = competences.find(c => c.id === e.competenceId);
                return { ...e, personne, competence };
            })
            .filter(e => e.personne && e.competence);
    }, [evaluationsCompetences, user.id, personnes, competences]);

    const handleSaveEvaluation = (evaluation: EvaluationCompetence) => {
        actions.saveEvaluationCompetence({
            ...evaluation,
            statut: 'completee',
            dateEvaluation: new Date(),
        });
        setSelectedEvaluation(null);
    };

    return (
        <div className="bg-white p-4 rounded-lg border">
            <div className="mb-4">
                <h2 className="text-xl font-semibold">Mes Évaluations à Réaliser</h2>
                <p className="text-sm text-gray-500">Liste des évaluations qui vous sont assignées et en attente d'action.</p>
            </div>
            <div className="space-y-3">
                {myEvaluations.map(evaluation => (
                    <div key={evaluation.id} className="p-4 border rounded-lg bg-gray-50/50">
                        <div className="flex justify-between items-start">
                           <div>
                             <h3 className="font-semibold text-blue-700">{evaluation.competence?.nom}</h3>
                             <div className="flex items-center text-sm text-gray-600 mt-1">
                                 <User className="h-4 w-4 mr-2" />
                                 <span>À évaluer : <strong>{evaluation.personne?.prenom} {evaluation.personne?.nom}</strong></span>
                             </div>
                             <div className="flex items-center text-xs text-gray-500 mt-1">
                                 <TrendingUp className="h-3 w-3 mr-1.5" />
                                 <span>Type : {evaluation.methode.replace('_', '-')}</span>
                             </div>
                           </div>
                           <button 
                             onClick={() => setSelectedEvaluation(evaluation)}
                             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                           >
                                Évaluer
                           </button>
                        </div>
                    </div>
                ))}
                {myEvaluations.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Vous n'avez aucune évaluation en attente.</p>
                    </div>
                )}
            </div>

            {selectedEvaluation && (
                <EvaluationFormModal
                    isOpen={!!selectedEvaluation}
                    onClose={() => setSelectedEvaluation(null)}
                    onSave={handleSaveEvaluation}
                    evaluation={selectedEvaluation}
                />
            )}
        </div>
    );
};

export default MesEvaluationsView;
