import React from 'react';
import type { Actif } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const RelationItem: React.FC<{ item: any; icon: React.ElementType }> = ({ item, icon: Icon }) => (
    <div className="flex items-center space-x-3 p-2 bg-white border rounded-md">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </div>
);

interface ActifLinksSectionProps {
    actif: Actif;
}

const ActifLinksSection: React.FC<ActifLinksSectionProps> = ({ actif }) => {
    const { data } = useDataContext();
    const linkedRisks = (data.risques as any[]).filter(r => actif.lienRisqueIds?.includes(r.id));
    const linkedControls = (data.controles as any[]).filter(c => actif.lienControleIds?.includes(c.id));

    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-medium text-gray-700 mb-2">Risques Liés ({linkedRisks.length})</h4>
                <div className="space-y-2">
                    {linkedRisks.map(risk => <RelationItem key={risk.id} item={risk} icon={AlertTriangle} />)}
                </div>
            </div>
            <div>
                <h4 className="font-medium text-gray-700 mb-2">Contrôles Liés ({linkedControls.length})</h4>
                <div className="space-y-2">
                    {linkedControls.map(control => <RelationItem key={control.id} item={control} icon={CheckCircle} />)}
                </div>
            </div>
        </div>
    );
};

export default ActifLinksSection;
