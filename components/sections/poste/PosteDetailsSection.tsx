import React from 'react';
import type { Poste } from '../../../types';
import { useDataContext } from '../../../context/AppContext';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface PosteDetailsSectionProps {
    poste: Poste;
}

const PosteDetailsSection: React.FC<PosteDetailsSectionProps> = ({ poste }) => {
    const { data } = useDataContext();
    const entite = (data.entites as any[]).find(e => e.id === poste.entiteId);
    const parent = (data.postes as any[]).find(p => p.id === poste.posteParentId);

    return (
        <div className="space-y-4">
            <DetailItem label="Intitulé complet" value={poste.intitule} />
            <DetailItem label="Entité de rattachement" value={entite?.nom} />
            <DetailItem label="Poste parent" value={parent?.intitule} />
            <DetailItem label="Statut" value={<span className="capitalize">{poste.statut.replace(/_/g, ' ')}</span>} />
            <DetailItem label="Effectif Cible" value={`${poste.occupantsIds.length} / ${poste.effectifCible}`} />
            <DetailItem label="Niveau de confidentialité" value={<span className="capitalize">{poste.confidentialite}</span>} />
        </div>
    );
};

export default PosteDetailsSection;
