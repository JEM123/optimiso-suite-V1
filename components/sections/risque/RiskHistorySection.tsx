import React from 'react';
import type { Risque } from '../../../types';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface RiskHistorySectionProps {
    risque: Risque;
}

const RiskHistorySection: React.FC<RiskHistorySectionProps> = ({ risque }) => {
    return (
        <div className="space-y-4">
            <DetailItem label="Créé le" value={new Date(risque.dateCreation).toLocaleDateString('fr-FR')} />
            <DetailItem label="Dernière modification" value={new Date(risque.dateModification).toLocaleDateString('fr-FR')} />
            {/* Could add author lookup here */}
        </div>
    );
};

export default RiskHistorySection;
