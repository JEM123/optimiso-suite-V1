import React from 'react';
import type { Processus } from '../../../types';
import { useDataContext } from '../../../context/AppContext';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface ProcessusDetailsSectionProps {
    processus: Processus;
    onNavigate: (proc: Processus) => void;
}

const ProcessusDetailsSection: React.FC<ProcessusDetailsSectionProps> = ({ processus, onNavigate }) => {
    const { data } = useDataContext();
    const parent = (data.processus as Processus[]).find(p => p.id === processus.parentId);
    const proprietaire = (data.postes as any[]).find(p => p.id === processus.proprietaireProcessusId);
    const mission = (data.missions as any[]).find(m => m.id === processus.missionId);

    return (
        <div className="space-y-4">
            <DetailItem label="Type" value={processus.type} />
            <DetailItem label="Niveau" value={processus.niveau} />
            <DetailItem label="Mission Mère" value={mission?.nom} />
            <DetailItem label="Propriétaire" value={proprietaire?.intitule} />
            <DetailItem label="Parent" value={parent ? <button onClick={() => onNavigate(parent)} className="text-blue-600 hover:underline">{parent.nom}</button> : 'Aucun'} />
        </div>
    );
};

export default ProcessusDetailsSection;
