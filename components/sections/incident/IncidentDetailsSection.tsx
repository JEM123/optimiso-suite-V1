import React, { useState, useEffect } from 'react';
import type { Incident, Personne } from '../../../types';
import { useDataContext } from '../../../context/AppContext';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div><p className="text-sm font-semibold text-gray-700">{label}</p><div className="text-sm text-gray-900 mt-1">{value || '-'}</div></div>
);

interface IncidentDetailsSectionProps {
    incident: Incident;
}

const IncidentDetailsSection: React.FC<IncidentDetailsSectionProps> = ({ incident }) => {
    const { data } = useDataContext();
    const [slaProgress, setSlaProgress] = useState(0);

    const declarant = (data.personnes as Personne[]).find(p => p.id === incident.declarantId);
    const assignee = (data.personnes as Personne[]).find(p => p.id === incident.assigneAId);

     useEffect(() => {
        const now = new Date().getTime();
        const start = new Date(incident.dateOuverture).getTime();
        const end = new Date(incident.echeanceSLA).getTime();
        if (incident.statut === 'Clôturé') { setSlaProgress(100); return; }
        const totalDuration = end - start;
        const elapsed = now - start;
        const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        setSlaProgress(progress);
    }, [incident]);

    const isSlaBreached = slaProgress >= 100 && incident.statut !== 'Clôturé';

    return (
        <div className="space-y-4">
            <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm font-semibold text-gray-700">SLA</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 my-2"><div className={`${isSlaBreached ? 'bg-red-500' : 'bg-green-500'} h-2.5 rounded-full`} style={{ width: `${slaProgress}%` }}></div></div>
                <p className={`text-xs ${isSlaBreached ? 'text-red-600 font-bold' : 'text-gray-600'}`}>Échéance: {new Date(incident.echeanceSLA).toLocaleString('fr-FR')} {isSlaBreached ? '(Dépassé)' : ''}</p>
            </div>
            <DetailItem label="Description" value={<p className="whitespace-pre-wrap">{incident.description}</p>} />
            <DetailItem label="Déclarant" value={declarant ? `${declarant.prenom} ${declarant.nom}` : '-'} />
            <DetailItem label="Assigné à" value={assignee ? `${assignee.prenom} ${assignee.nom}` : 'Non assigné'} />
            <DetailItem label="Catégorie" value={incident.categorie} />
            <DetailItem label="Priorité / Gravité" value={`${incident.priorite} / ${incident.gravite}`} />
        </div>
    );
};

export default IncidentDetailsSection;
