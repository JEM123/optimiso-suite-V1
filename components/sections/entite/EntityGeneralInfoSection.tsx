import React from 'react';
import type { Entite, Personne } from '../../../types';
import { useDataContext } from '../../../context/AppContext';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface EntityGeneralInfoSectionProps {
    entite: Entite;
}

const EntityGeneralInfoSection: React.FC<EntityGeneralInfoSectionProps> = ({ entite }) => {
    const { data } = useDataContext();
    const responsable = (data.personnes as Personne[]).find(p => p.id === entite.responsableId);
    
    return (
        <div className="p-4 bg-white border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem label="Nom Complet" value={entite.nom} />
            <DetailItem label="Code" value={entite.code} />
            <DetailItem label="Type" value={entite.type} />
            <DetailItem label="Statut" value={<span className="capitalize">{entite.statut.replace(/_/g, ' ')}</span>} />
            <DetailItem label="Responsable" value={responsable ? `${responsable.prenom} ${responsable.nom}` : 'Non défini'} />
            <DetailItem label="Confidentialité" value={<span className="capitalize">{entite.confidentialite}</span>} />
            <DetailItem label="Email de contact" value={entite.emailContact} />
            <DetailItem label="Téléphone" value={entite.telephoneContact} />
            <div className="md:col-span-2">
                 <DetailItem label="Adresse" value={entite.siteAdresse} />
            </div>
        </div>
    );
};

export default EntityGeneralInfoSection;
