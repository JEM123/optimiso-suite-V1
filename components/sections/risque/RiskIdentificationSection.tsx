import React from 'react';
import type { Risque } from '../../../types';
import { useDataContext } from '../../../context/AppContext';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface RiskIdentificationSectionProps {
    risque: Risque;
}

const RiskIdentificationSection: React.FC<RiskIdentificationSectionProps> = ({ risque }) => {
    const { data } = useDataContext();
    const processus = (data.processus as any[]).find(p => p.id === risque.processusId);
    const categories = (data.categoriesRisques as any[]).filter(c => risque.categorieIds.includes(c.id));
    
    return (
        <div className="space-y-4">
            <DetailItem label="Processus lié" value={processus?.nom} />
            <DetailItem label="Catégories" value={<div className="flex flex-wrap gap-1">{categories.map(c => <span key={c.id} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">{c.nom}</span>)}</div>} />
            <DetailItem label="Causes potentielles" value={<p className="whitespace-pre-wrap">{risque.causes}</p>} />
            <DetailItem label="Conséquences potentielles" value={<p className="whitespace-pre-wrap">{risque.consequences}</p>} />
        </div>
    );
};

export default RiskIdentificationSection;
