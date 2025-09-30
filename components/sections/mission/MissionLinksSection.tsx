import React from 'react';
import type { Mission } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { Target, Settings, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

const RelationItem: React.FC<{ item: any; icon: React.ElementType }> = ({ item, icon: Icon }) => (
    <div className="flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </div>
);

interface MissionLinksSectionProps {
    mission: Mission;
}

const MissionLinksSection: React.FC<MissionLinksSectionProps> = ({ mission }) => {
    const { data } = useDataContext();

    const linkedProcessus = (data.processus as any[]).filter(p => mission.processusIds?.includes(p.id));
    const linkedProcedures = (data.procedures as any[]).filter(p => mission.procedureIds?.includes(p.id));
    const linkedDocuments = (data.documents as any[]).filter(d => mission.documentIds?.includes(d.id));
    const linkedRisques = (data.risques as any[]).filter(r => mission.risqueIds?.includes(r.id));
    const linkedControles = (data.controles as any[]).filter(c => mission.controleIds?.includes(c.id));

    return (
        <div className="space-y-4">
            <div><h4 className="font-semibold text-gray-800 mb-2">Processus ({linkedProcessus.length})</h4><div className="space-y-2">{linkedProcessus.map((item: any) => <RelationItem key={item.id} item={item} icon={Target} />)}</div></div>
            <div><h4 className="font-semibold text-gray-800 mb-2">Procédures ({linkedProcedures.length})</h4><div className="space-y-2">{linkedProcedures.map((item: any) => <RelationItem key={item.id} item={item} icon={Settings} />)}</div></div>
            <div><h4 className="font-semibold text-gray-800 mb-2">Documents ({linkedDocuments.length})</h4><div className="space-y-2">{linkedDocuments.map((item: any) => <RelationItem key={item.id} item={item} icon={FileText} />)}</div></div>
            <div><h4 className="font-semibold text-gray-800 mb-2">Risques ({linkedRisques.length})</h4><div className="space-y-2">{linkedRisques.map((item: any) => <RelationItem key={item.id} item={item} icon={AlertTriangle} />)}</div></div>
            <div><h4 className="font-semibold text-gray-800 mb-2">Contrôles ({linkedControles.length})</h4><div className="space-y-2">{linkedControles.map((item: any) => <RelationItem key={item.id} item={item} icon={CheckCircle} />)}</div></div>
        </div>
    );
};

export default MissionLinksSection;
