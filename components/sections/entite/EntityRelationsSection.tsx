import React, { useMemo } from 'react';
import type { Entite, Poste, Personne } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { Briefcase, Users } from 'lucide-react';

interface EntityRelationsSectionProps {
    entite: Entite;
}

const EntityRelationsSection: React.FC<EntityRelationsSectionProps> = ({ entite }) => {
    const { data } = useDataContext();
    const postes = (data.postes as Poste[]).filter(p => p.entiteId === entite.id);
    const personnes = (data.personnes as Personne[]).filter(p => p.entiteIds.includes(entite.id));
    
    return (
        <div className="p-4 bg-white border rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Éléments Liés</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-medium text-xs text-gray-500 uppercase mb-2 flex items-center gap-2"><Briefcase className="h-4 w-4"/>Postes ({postes.length})</h4>
                    <div className="space-y-2 text-sm">{postes.map(p => <div key={p.id} className="p-2 border rounded-md bg-gray-50">{p.intitule}</div>)}</div>
                </div>
                 <div>
                    <h4 className="font-medium text-xs text-gray-500 uppercase mb-2 flex items-center gap-2"><Users className="h-4 w-4"/>Personnes ({personnes.length})</h4>
                    <div className="space-y-2 text-sm">{personnes.map(p => <div key={p.id} className="p-2 border rounded-md bg-gray-50">{p.prenom} {p.nom}</div>)}</div>
                </div>
            </div>
        </div>
    );
};

export default EntityRelationsSection;
