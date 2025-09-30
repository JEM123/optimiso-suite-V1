import React from 'react';
import type { Personne, Role } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { KeyRound } from 'lucide-react';

const RelationItem: React.FC<{ item: any; icon: React.ElementType, onClick: () => void }> = ({ item, icon: Icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50 cursor-pointer text-left">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </button>
);

interface PersonAccessSectionProps {
    person: Personne;
    onShowRelations: (entity: any, entityType: string) => void;
}

const PersonAccessSection: React.FC<PersonAccessSectionProps> = ({ person, onShowRelations }) => {
    const { data } = useDataContext();
    const roles = (data.roles as Role[]).filter(r => person.roleIds.includes(r.id));
    
    return (
        <div>
            <h4 className="font-semibold text-gray-800 mb-2">Rôles ({roles.length})</h4>
            <div className="space-y-2">
                {roles.map(r => <RelationItem key={r.id} item={r} icon={KeyRound} onClick={() => onShowRelations(r, 'roles')} />)}
            </div>
        </div>
    );
};

export default PersonAccessSection;
