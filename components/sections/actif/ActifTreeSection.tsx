import React from 'react';
import type { Actif } from '../../../types';
import ActifTree from '../../ActifTree';
import { useDataContext } from '../../../context/AppContext';

interface ActifTreeSectionProps {
    actif: Actif;
}

const ActifTreeSection: React.FC<ActifTreeSectionProps> = ({ actif }) => {
    const { data } = useDataContext();
    return <ActifTree rootActifId={actif.id} allActifs={data.actifs as any[]} />;
};

export default ActifTreeSection;
