import React from 'react';
import type { Controle, Risque, Document, Procedure } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { AlertTriangle, FileText, Settings } from 'lucide-react';

const RelationItem: React.FC<{ item: any; icon: React.ElementType, onClick: () => void }> = ({ item, icon: Icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50 cursor-pointer text-left">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </button>
);

interface ControlMasterySectionProps {
    control: Controle;
    onShowRelations: (entity: any, entityType: string) => void;
}

const ControlMasterySection: React.FC<ControlMasterySectionProps> = ({ control, onShowRelations }) => {
    const { data } = useDataContext();
    const risques = (data.risques as Risque[]).filter(r => control.risqueMaitriseIds?.includes(r.id));
    const documents = (data.documents as Document[]).filter(d => control.documentIds?.includes(d.id));
    const procedures = (data.procedures as Procedure[]).filter(p => control.procedureIds?.includes(p.id));

    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Risques Maîtrisés ({risques.length})</h4>
                <div className="space-y-2">{risques.map(r => <RelationItem key={r.id} item={r} icon={AlertTriangle} onClick={() => onShowRelations(r, 'risques')} />)}</div>
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Documents Liés ({documents.length})</h4>
                <div className="space-y-2">{documents.map(d => <RelationItem key={d.id} item={d} icon={FileText} onClick={() => onShowRelations(d, 'documents')} />)}</div>
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Procédures Liées ({procedures.length})</h4>
                <div className="space-y-2">{procedures.map(p => <RelationItem key={p.id} item={p} icon={Settings} onClick={() => onShowRelations(p, 'procedures')} />)}</div>
            </div>
        </div>
    );
};

export default ControlMasterySection;
