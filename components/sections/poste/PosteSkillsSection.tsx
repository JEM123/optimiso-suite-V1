import React from 'react';
import type { Poste, Competence } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { Star } from 'lucide-react';

interface PosteSkillsSectionProps {
    poste: Poste;
}

const PosteSkillsSection: React.FC<PosteSkillsSectionProps> = ({ poste }) => {
    const { data } = useDataContext();
    const requiredSkills = (data.competences as Competence[]).filter(c => poste.competencesRequisesIds?.includes(c.id));
    
    return (
        <div className="space-y-2">
            {requiredSkills.map(skill => {
                const requis = (competence: Competence) => competence.postesRequis.find(pr => pr.posteId === poste.id);
                const niveauAttendu = requis(skill)?.niveauAttendu || 0;

                return (
                    <div key={skill.id} className="p-3 bg-white border rounded-md">
                        <p className="font-medium text-sm">{skill.nom}</p>
                        <p className="text-xs text-gray-500">{skill.domaine}</p>
                        <div className="flex items-center gap-1 text-yellow-500 mt-2" title={`Niveau Attendu: ${niveauAttendu}`}>
                             {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < niveauAttendu ? 'fill-current' : ''}`}/>)}
                        </div>
                    </div>
                );
            })}
            {requiredSkills.length === 0 && <p className="text-sm text-gray-500">Aucune compétence requise définie.</p>}
        </div>
    );
};

export default PosteSkillsSection;
