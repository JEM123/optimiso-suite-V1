import React from 'react';
import type { Controle } from '../../../types';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface ControlDetailsSectionProps {
    control: Controle;
}

const ControlDetailsSection: React.FC<ControlDetailsSectionProps> = ({ control }) => {
    return (
        <div className="space-y-4">
            <DetailItem label="Description" value={<p className="whitespace-pre-wrap">{control.description}</p>} />
            <DetailItem label="Méthode d'exécution" value={<p className="whitespace-pre-wrap">{control.methodeExecution}</p>} />
        </div>
    );
};

export default ControlDetailsSection;
