import React from 'react';
import type { Risque, Controle, Document, Procedure } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { CheckCircle, FileText, Settings } from 'lucide-react';

const RelationItem: React.FC<{ item: any; icon: React.ElementType, onClick: () => void }> = ({ item, icon: Icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50 cursor-pointer text-left">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </button>
);

interface RiskMasterySectionProps {
    risque: Risque;
    onShowRelations: (entity: any, entityType: string) => void;
}

const RiskMasterySection: React.FC<RiskMasterySectionProps> = ({ risque, onShowRelations }) => {
    const { data } = useDataContext();
    const controles = (data.controles as Controle[]).filter(c => risque.controleMaitriseIds?.includes(c.id));
    const documents = (data.documents as Document[]).filter(d => risque.documentMaitriseIds?.includes(d.id));
    const procedures = (data.procedures as Procedure[]).filter(p => risque.procedureMaitriseIds?.includes(p.id));

    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Contrôles ({controles.length})</h4>
                <div className="space-y-2">{controles.map(c => <RelationItem key={c.id} item={c} icon={CheckCircle} onClick={() => onShowRelations(c, 'controles')} />)}</div>
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Documents ({documents.length})</h4>
                <div className="space-y-2">{documents.map(d => <RelationItem key={d.id} item={d} icon={FileText} onClick={() => onShowRelations(d, 'documents')} />)}</div>
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Procédures ({procedures.length})</h4>
                <div className="space-y-2">{procedures.map(p => <RelationItem key={p.id} item={p} icon={Settings} onClick={() => onShowRelations(p, 'procedures')} />)}</div>
            </div>
        </div>
    );
};

export default RiskMasterySection;
