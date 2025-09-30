import React from 'react';
import type { Role } from '../../../types';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface RoleDetailsSectionProps {
    role: Role;
}

const RoleDetailsSection: React.FC<RoleDetailsSectionProps> = ({ role }) => {
    return (
        <div className="space-y-4">
            <DetailItem label="Description" value={role.description} />
            <DetailItem label="Statut" value={<span className="capitalize">{role.statut}</span>} />
            <DetailItem label="Créé le" value={new Date(role.dateCreation).toLocaleDateString('fr-FR')} />
            <DetailItem label="Modifié le" value={new Date(role.dateModification).toLocaleDateString('fr-FR')} />
        </div>
    );
};

export default RoleDetailsSection;
