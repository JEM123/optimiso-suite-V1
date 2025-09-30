import React, { useMemo } from 'react';
import type { Entite } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { ChevronRight } from 'lucide-react';

interface EntityHierarchySectionProps {
    entite: Entite;
}

const EntityHierarchySection: React.FC<EntityHierarchySectionProps> = ({ entite }) => {
    const { data } = useDataContext();
    const allEntities = data.entites as Entite[];

    const { parent, children, breadcrumbs } = useMemo(() => {
        const parent = allEntities.find(e => e.id === entite.parentId);
        const children = allEntities.filter(e => e.parentId === entite.id);
        const crumbs: Entite[] = [];
        let current = parent;
        while(current) {
            crumbs.unshift(current);
            current = allEntities.find(e => e.id === current?.parentId);
        }
        return { parent, children, breadcrumbs: crumbs };
    }, [entite, allEntities]);

    return (
        <div className="p-4 bg-white border rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Position dans l'organisation</h3>
            <div className="text-sm text-gray-600 flex items-center flex-wrap">
                {breadcrumbs.map(b => (
                    <React.Fragment key={b.id}>
                        <span className="hover:underline cursor-pointer">{b.nom}</span>
                        <ChevronRight className="h-4 w-4 mx-1" />
                    </React.Fragment>
                ))}
                <span className="font-semibold text-gray-900">{entite.nom}</span>
            </div>

            <div className="mt-4">
                <h4 className="font-medium text-xs text-gray-500 uppercase mb-2">Sous-entités ({children.length})</h4>
                <div className="space-y-2">
                    {children.map(child => (
                        <div key={child.id} className="p-2 border rounded-md bg-gray-50 text-sm">{child.nom}</div>
                    ))}
                    {children.length === 0 && <p className="text-xs text-gray-500 italic">Aucune sous-entité.</p>}
                </div>
            </div>
        </div>
    );
};

export default EntityHierarchySection;
