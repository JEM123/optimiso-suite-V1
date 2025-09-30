import React from 'react';
import type { Actif } from '../../../types';
import { useDataContext } from '../../../context/AppContext';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface ActifDetailsSectionProps {
    actif: Actif;
}

const ActifDetailsSection: React.FC<ActifDetailsSectionProps> = ({ actif }) => {
    const { data } = useDataContext();
    const owner = (data.personnes as any[]).find(p => p.id === actif.proprietaireId);
    const manager = (data.personnes as any[]).find(p => p.id === actif.gestionnaireId);

    return (
        <div className="space-y-4">
            <DetailItem label="Description" value={actif.description} />
            <DetailItem label="Propriétaire" value={owner ? `${owner.prenom} ${owner.nom}` : 'N/A'} />
            <DetailItem label="Gestionnaire" value={manager ? `${manager.prenom} ${manager.nom}` : 'N/A'} />
            <DetailItem label="Statut du Cycle de Vie" value={actif.statutCycleVie} />
            <DetailItem label="Date d'achat" value={actif.dateAchat ? new Date(actif.dateAchat).toLocaleDateString('fr-FR') : 'N/A'} />
            <DetailItem label="Valeur" value={actif.valeur ? `${actif.valeur.toLocaleString('fr-FR')} CHF` : 'N/A'} />
        </div>
    );
};

export default ActifDetailsSection;
