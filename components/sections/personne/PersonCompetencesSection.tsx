import React from 'react';
import type { Personne, Competence, EvaluationCompetence, Poste } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import CompetenceRadarChart from '../../CompetenceRadarChart';

interface PersonCompetencesSectionProps {
    person: Personne;
}

const PersonCompetencesSection: React.FC<PersonCompetencesSectionProps> = ({ person }) => {
    const { data } = useDataContext();
    const allCompetences = data.competences as Competence[];
    const allEvaluations = data.evaluationsCompetences as EvaluationCompetence[];
    const allPostes = data.postes as Poste[];

    const personPostes = allPostes.filter(p => p.occupantsIds.includes(person.id));
    const requiredCompetenceIds = new Set(personPostes.flatMap(p => p.competencesRequisesIds || []));
    
    const competenceData = Array.from(requiredCompetenceIds).map(compId => {
        const competence = allCompetences.find(c => c.id === compId);
        if (!competence) return null;

        const evaluation = allEvaluations.find(e => e.personneId === person.id && e.competenceId === compId);
        
        const niveauAttendu = Math.max(...competence.postesRequis
            .filter(pr => personPostes.some(p => p.id === pr.posteId))
            .map(pr => pr.niveauAttendu)
        );

        return {
            competence,
            niveauAttendu,
            niveauEvalue: evaluation?.niveauEvalue,
        };
    }).filter(item => item !== null) as { competence: Competence; niveauAttendu: number; niveauEvalue?: number; }[];

    return (
        <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-800 mb-4">Radar des Compétences Requises</h3>
            <div className="h-64">
                <CompetenceRadarChart competenceData={competenceData} />
            </div>
        </div>
    );
};

export default PersonCompetencesSection;
