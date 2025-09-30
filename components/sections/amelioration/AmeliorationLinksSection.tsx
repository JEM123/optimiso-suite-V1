import React from 'react';
import type { Amelioration, Incident, Risque, Controle } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const RelationItem: React.FC<{ item: any; icon: React.ElementType; onClick: () => void }> = ({ item, icon: Icon, onClick }) => (
    <button onClick={onClick} className="w-full p-2 bg-white border rounded-md text-left flex items-center gap-2 hover:bg-gray-50">
        <Icon className="h-4 w-4 text-gray-500"/>
        {item.nom || item.titre}
    </button>
);

interface AmeliorationLinksSectionProps {
    amelioration: Amelioration;
    onShowRelations: (entity: any, entityType: string) => void;
}

const AmeliorationLinksSection: React.FC<AmeliorationLinksSectionProps> = ({ amelioration, onShowRelations }) => {
    const { data } = useDataContext();
    const linkedIncident = (data.incidents as Incident[]).find(i => i.id === amelioration.lienIncidentId);
    const linkedRisk = (data.risques as Risque[]).find(r => r.id === amelioration.lienRisqueId);
    const linkedControl = (data.controles as Controle[]).find(c => c.id === amelioration.lienControleId);

    return (
        <div className="space-y-2">
            {linkedIncident && <RelationItem item={linkedIncident} icon={AlertTriangle} onClick={() => onShowRelations(linkedIncident, 'incidents')} />}
            {linkedRisk && <RelationItem item={linkedRisk} icon={AlertTriangle} onClick={() => onShowRelations(linkedRisk, 'risques')} />}
            {linkedControl && <RelationItem item={linkedControl} icon={CheckCircle} onClick={() => onShowRelations(linkedControl, 'controles')} />}
            {!linkedIncident && !linkedRisk && !linkedControl && <p className="text-sm text-gray-500 text-center pt-4">Aucun élément lié.</p>}
        </div>
    );
};

export default AmeliorationLinksSection;
