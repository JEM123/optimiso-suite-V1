import React from 'react';
import type { Mission } from '../../../types';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface MissionDetailsSectionProps {
    mission: Mission;
}

const MissionDetailsSection: React.FC<MissionDetailsSectionProps> = ({ mission }) => {
    return (
        <div className="space-y-4">
            <DetailItem label="Description" value={<p className="whitespace-pre-wrap">{mission.description}</p>} />
            <DetailItem label="Objectifs" value={<p className="whitespace-pre-wrap">{mission.objectifs}</p>} />
            <DetailItem label="Portée (Clients)" value={mission.portee} />
            <DetailItem label="Statut" value={<span className="capitalize">{mission.statut.replace(/_/g, ' ')}</span>} />
        </div>
    );
};

export default MissionDetailsSection;
