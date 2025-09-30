import React from 'react';
import type { Personne } from '../../../types';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface PersonHistorySectionProps {
    person: Personne;
}

const PersonHistorySection: React.FC<PersonHistorySectionProps> = ({ person }) => {
    return (
        <div className="space-y-4">
            <DetailItem label="Créé le" value={new Date(person.dateCreation).toLocaleDateString('fr-FR')} />
            <DetailItem label="Dernière modification" value={new Date(person.dateModification).toLocaleDateString('fr-FR')} />
        </div>
    );
};

export default PersonHistorySection;
