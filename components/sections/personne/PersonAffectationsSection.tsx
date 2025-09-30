import React from 'react';
import type { Personne, Poste, Entite } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { Briefcase, Building } from 'lucide-react';

const RelationItem: React.FC<{ item: any; icon: React.ElementType, onClick: () => void }> = ({ item, icon: Icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50 cursor-pointer text-left">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom || item.intitule}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </button>
);

interface PersonAffectationsSectionProps {
    person: Personne;
    onShowRelations: (entity: any, entityType: string) => void;
}

const PersonAffectationsSection: React.FC<PersonAffectationsSectionProps> = ({ person, onShowRelations }) => {
    const { data } = useDataContext();
    const postes = (data.postes as Poste[]).filter(p => person.posteIds.includes(p.id));
    const entites = (data.entites as Entite[]).filter(e => person.entiteIds.includes(e.id));
    
    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Poste(s) ({postes.length})</h4>
                <div className="space-y-2">{postes.map(p => <RelationItem key={p.id} item={p} icon={Briefcase} onClick={() => onShowRelations(p, 'postes')} />)}</div>
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Entité(s) ({entites.length})</h4>
                <div className="space-y-2">{entites.map(e => <RelationItem key={e.id} item={e} icon={Building} onClick={() => onShowRelations(e, 'entites')} />)}</div>
            </div>
        </div>
    );
};

export default PersonAffectationsSection;
