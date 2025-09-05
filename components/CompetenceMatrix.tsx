import React, { useState, useMemo } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Competence, Poste, Entite, EvaluationCompetence, Personne } from '../types';

interface CompetenceMatrixProps {
    onSelectCompetence: (competence: Competence) => void;
}

const CompetenceMatrix: React.FC<CompetenceMatrixProps> = ({ onSelectCompetence }) => {
    const { data } = useDataContext();
    const { competences, postes, entites, evaluationsCompetences, personnes } = data as { competences: Competence[], postes: Poste[], entites: Entite[], evaluationsCompetences: EvaluationCompetence[], personnes: Personne[] };
    const [selectedEntite, setSelectedEntite] = useState('all');

    const filteredPostes = useMemo(() => {
        return selectedEntite === 'all' ? postes : postes.filter(p => p.entiteId === selectedEntite);
    }, [postes, selectedEntite]);

    const getEvaluationForPoste = (competenceId: string, poste: Poste): { evaluation: EvaluationCompetence | undefined, occupant: Personne | undefined } => {
        if (poste.occupantsIds.length === 0) return { evaluation: undefined, occupant: undefined };
        // Simple case: take first occupant. A real app might need more complex logic.
        const occupantId = poste.occupantsIds[0];
        const occupant = personnes.find(p => p.id === occupantId);
        const evaluation = evaluationsCompetences.find(e => e.personneId === occupantId && e.competenceId === competenceId);
        return { evaluation, occupant };
    };

    const getGapColor = (attendu: number, evalué: number | null) => {
        if (evalué === null) return 'bg-gray-100';
        if (evalué >= attendu) return 'bg-green-100 border-green-300';
        if (evalué === attendu - 1) return 'bg-yellow-100 border-yellow-300';
        return 'bg-red-100 border-red-300';
    };

    return (
        <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center mb-4">
                <label className="mr-2 text-sm font-medium">Filtrer par entité:</label>
                <select value={selectedEntite} onChange={e => setSelectedEntite(e.target.value)} className="border rounded-lg py-1 px-2 text-sm">
                    <option value="all">Toutes les entités</option>
                    {entites.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200 text-xs">
                    <thead>
                        <tr>
                            <th className="sticky left-0 bg-gray-100 p-2 border border-gray-200 text-left font-semibold z-10">Compétence</th>
                            {filteredPostes.map(poste => (
                                <th key={poste.id} className="p-2 border border-gray-200 text-left font-semibold whitespace-nowrap">
                                    <div>{poste.intitule}</div>
                                    <div className="font-normal text-gray-500">{entites.find(e => e.id === poste.entiteId)?.nom}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {competences.map(comp => (
                            <tr key={comp.id}>
                                <td className="sticky left-0 bg-white p-2 border border-gray-200 font-medium whitespace-nowrap z-10">{comp.nom}</td>
                                {filteredPostes.map(poste => {
                                    const requis = comp.postesRequis.find(pr => pr.posteId === poste.id);
                                    const { evaluation, occupant } = getEvaluationForPoste(comp.id, poste);
                                    const attendu = requis?.niveauAttendu;
                                    const evalué = evaluation?.niveauEvalue;

                                    if (!attendu) {
                                        return <td key={poste.id} className="p-2 border border-gray-200 bg-gray-50"></td>;
                                    }
                                    
                                    const color = getGapColor(attendu, evalué ?? null);
                                    const tooltip = occupant ? `Occupant: ${occupant.prenom} ${occupant.nom}\nÉvalué le: ${evaluation?.dateEvaluation.toLocaleDateString('fr-FR')}` : 'Poste vacant';

                                    return (
                                        <td key={poste.id} className={`p-2 border ${color} text-center group relative`} title={tooltip}>
                                            <div className="flex flex-col items-center justify-center">
                                                <div>
                                                    <span className="font-bold">Att. {attendu}</span>
                                                </div>
                                                <div className="h-px w-8 bg-gray-300 my-1"></div>
                                                <div>
                                                    <span className={evalué === undefined ? 'text-gray-400' : ''}>Éval. {evalué ?? '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default CompetenceMatrix;
