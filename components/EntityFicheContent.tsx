import React from 'react';
import type { Entite } from '../types';
import GenericFicheContent from './GenericFicheContent';

interface EntityFicheContentProps {
    entite: Entite;
    onShowRelations: (entity: any, entityType: string) => void;
}

const EntityFicheContent: React.FC<EntityFicheContentProps> = (props) => {
    return (
        <GenericFicheContent 
            moduleId="entites"
            item={props.entite}
            {...props}
        />
    );
};

export default EntityFicheContent;
