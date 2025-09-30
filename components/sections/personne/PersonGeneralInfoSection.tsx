import React from 'react';
import type { Personne } from '../../../types';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface PersonGeneralInfoSectionProps {
    person: Personne;
}

const PersonGeneralInfoSection: React.FC<PersonGeneralInfoSectionProps> = ({ person }) => {
    return (
        <div className="space-y-4">
            <DetailItem label="Prénom" value={person.prenom} />
            <DetailItem label="Nom" value={person.nom} />
            <DetailItem label="Email" value={person.email} />
            <DetailItem label="Profil d'accès" value={<span className="capitalize">{person.profil}</span>} />
            <DetailItem label="Synchronisé Azure AD" value={person.synchroniseAzureAD ? 'Oui' : 'Non'} />
        </div>
    );
};

export default PersonGeneralInfoSection;
