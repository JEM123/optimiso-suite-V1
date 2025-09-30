import React from 'react';
import type { Poste, Personne } from '../../../types';
import { useDataContext } from '../../../context/AppContext';

interface PosteOccupantsSectionProps {
    poste: Poste;
}

const PosteOccupantsSection: React.FC<PosteOccupantsSectionProps> = ({ poste }) => {
    const { data } = useDataContext();
    const occupants = (data.personnes as Personne[]).filter(p => poste.occupantsIds.includes(p.id));

    return (
        <div className="space-y-2">
            <div className="p-3 bg-white border rounded-md text-center">
                <p className="text-3xl font-bold">{occupants.length} / {poste.effectifCible}</p>
                <p className="text-sm text-gray-600">Occupants vs Cible</p>
            </div>
            {occupants.map(person => (
                <div key={person.id} className="flex items-center space-x-3 p-2 bg-white border rounded-md">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                        {person.prenom[0]}{person.nom[0]}
                    </div>
                    <div>
                        <p className="font-medium text-sm text-gray-800">{person.prenom} {person.nom}</p>
                        <p className="text-xs text-gray-500">{person.email}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PosteOccupantsSection;
