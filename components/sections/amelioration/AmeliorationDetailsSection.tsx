import React from 'react';
import type { Amelioration, Personne } from '../../../types';
import { useDataContext } from '../../../context/AppContext';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div><p className="text-sm font-semibold text-gray-700">{label}</p><div className="text-sm text-gray-900 mt-1">{value || '-'}</div></div>
);

interface AmeliorationDetailsSectionProps {
    amelioration: Amelioration;
}

const AmeliorationDetailsSection: React.FC<AmeliorationDetailsSectionProps> = ({ amelioration }) => {
    const { data } = useDataContext();
    const pilote = (data.personnes as Personne[]).find(p => p.id === amelioration.piloteId);

    return (
        <div className="space-y-4">
            <DetailItem label="Description" value={<p className="whitespace-pre-wrap">{amelioration.description}</p>} />
            <DetailItem label="Pilote" value={pilote ? `${pilote.prenom} ${pilote.nom}` : '-'} />
            <DetailItem label="Type" value={amelioration.type} />
            <DetailItem label="Priorité" value={<span className="capitalize">{amelioration.priorite}</span>} />
            <DetailItem label="Origine" value={amelioration.origine.join(', ')} />
            <DetailItem label="Objectif Mesurable" value={<p className="whitespace-pre-wrap">{amelioration.objectifMesurable}</p>} />
            <DetailItem label="Échéance Cible" value={new Date(amelioration.echeanceCible).toLocaleDateString('fr-FR')} />
        </div>
    );
};

export default AmeliorationDetailsSection;
