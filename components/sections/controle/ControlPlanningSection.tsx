import React from 'react';
import type { Controle, Personne } from '../../../types';
import { useDataContext } from '../../../context/AppContext';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface ControlPlanningSectionProps {
    control: Controle;
}

const ControlPlanningSection: React.FC<ControlPlanningSectionProps> = ({ control }) => {
    const { data } = useDataContext();
    const executants = (data.personnes as Personne[]).filter(p => control.executantsIds?.includes(p.id));
    const superviseur = (data.personnes as Personne[]).find(p => p.id === control.superviseurId);

    return (
        <div className="space-y-4">
            <DetailItem label="Type de Planification" value={<span className="capitalize">{control.typePlanification.replace(/_/g, ' ')}</span>} />
            {control.typePlanification === 'periodique' && (
                <DetailItem label="Fréquence" value={<span className="capitalize">{control.frequence}</span>} />
            )}
            <DetailItem label="Date de début" value={new Date(control.dateDebut).toLocaleDateString('fr-FR')} />
            <DetailItem label="Exécutant(s)" value={executants.map(p => `${p.prenom} ${p.nom}`).join(', ')} />
            <DetailItem label="Superviseur" value={superviseur ? `${superviseur.prenom} ${superviseur.nom}` : 'N/A'} />
        </div>
    );
};

export default ControlPlanningSection;
