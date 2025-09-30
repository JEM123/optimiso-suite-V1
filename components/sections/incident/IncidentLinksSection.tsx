import React from 'react';
import type { Incident, Risque, Controle } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const RelationItem: React.FC<{ item: any; icon: React.ElementType; onClick: () => void }> = ({ item, icon: Icon, onClick }) => (
    <button onClick={onClick} className="w-full p-2 bg-white border rounded-md text-left flex items-center gap-2 hover:bg-gray-50">
        <Icon className="h-4 w-4 text-gray-500"/>
        {item.nom || item.titre}
    </button>
);

interface IncidentLinksSectionProps {
    incident: Incident;
    onShowRelations: (entity: any, entityType: string) => void;
}

const IncidentLinksSection: React.FC<IncidentLinksSectionProps> = ({ incident, onShowRelations }) => {
    const { data } = useDataContext();
    const linkedRisk = (data.risques as Risque[]).find(r => r.id === incident.lienRisqueId);
    const linkedControl = (data.controles as Controle[]).find(c => c.id === incident.lienControleId);

    return (
        <div className="space-y-2">
            {linkedRisk && <RelationItem item={linkedRisk} icon={AlertTriangle} onClick={() => onShowRelations(linkedRisk, 'risques')} />}
            {linkedControl && <RelationItem item={linkedControl} icon={CheckCircle} onClick={() => onShowRelations(linkedControl, 'controles')} />}
            {!linkedRisk && !linkedControl && <p className="text-sm text-gray-500 text-center pt-4">Aucun élément lié.</p>}
        </div>
    );
};

export default IncidentLinksSection;
