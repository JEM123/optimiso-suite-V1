import React from 'react';
import type { Processus } from '../../../types';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface ProcessusSipocSectionProps {
    processus: Processus;
}

const ProcessusSipocSection: React.FC<ProcessusSipocSectionProps> = ({ processus }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Fournisseurs" value={<p className="whitespace-pre-wrap">{processus.fournisseurs}</p>} />
            <DetailItem label="Clients" value={<p className="whitespace-pre-wrap">{processus.clients}</p>} />
            <DetailItem label="Entrées (Inputs)" value={<p className="whitespace-pre-wrap">{processus.entrees}</p>} />
            <DetailItem label="Sorties (Outputs)" value={<p className="whitespace-pre-wrap">{processus.sorties}</p>} />
        </div>
    );
};

export default ProcessusSipocSection;
