import React from 'react';
import type { Role, Personne } from '../../../types';
import { useDataContext } from '../../../context/AppContext';

interface RoleAssignmentsSectionProps {
    role: Role;
}

const RoleAssignmentsSection: React.FC<RoleAssignmentsSectionProps> = ({ role }) => {
    const { data } = useDataContext();
    const assignedPeople = (data.personnes as Personne[]).filter(p => role.personneIds.includes(p.id));

    return (
        <div className="space-y-2">
             {assignedPeople.map(p => (
                 <div key={p.id} className="flex items-center space-x-3 p-2 bg-white border rounded-md">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                        {p.prenom[0]}{p.nom[0]}
                    </div>
                    <div>
                        <p className="font-medium text-sm text-gray-800">{p.prenom} {p.nom}</p>
                        <p className="text-xs text-gray-500">{p.email}</p>
                    </div>
                </div>
             ))}
             {assignedPeople.length === 0 && <p className="text-center text-sm text-gray-500 pt-4">Aucune personne assignée à ce rôle.</p>}
        </div>
    );
};

export default RoleAssignmentsSection;
