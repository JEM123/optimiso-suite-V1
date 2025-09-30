import React from 'react';
import type { Document, Risque, Controle } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const RelationItem: React.FC<{ item: any; icon: React.ElementType, onClick: () => void }> = ({ item, icon: Icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50 cursor-pointer text-left">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </button>
);

interface DocumentRelationsSectionProps {
    document: Document;
    onShowRelations: (entity: any, entityType: string) => void;
}

const DocumentRelationsSection: React.FC<DocumentRelationsSectionProps> = ({ document, onShowRelations }) => {
    const { data } = useDataContext();
    const linkedRisks = (data.risques as Risque[]).filter(r => document.risqueIds?.includes(r.id));
    const linkedControls = (data.controles as Controle[]).filter(c => document.controleIds?.includes(c.id));
    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Risques Liés ({linkedRisks.length})</h4>
                <div className="space-y-2">{linkedRisks.map(r => <RelationItem key={r.id} item={r} icon={AlertTriangle} onClick={() => onShowRelations(r, 'risques')} />)}</div>
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Contrôles Liés ({linkedControls.length})</h4>
                <div className="space-y-2">{linkedControls.map(c => <RelationItem key={c.id} item={c} icon={CheckCircle} onClick={() => onShowRelations(c, 'controles')} />)}</div>
            </div>
        </div>
    );
};

export default DocumentRelationsSection;
