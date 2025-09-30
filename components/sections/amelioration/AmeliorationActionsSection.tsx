import React from 'react';
import type { Amelioration, AmeliorationAction } from '../../../types';
import { Plus, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';

const ActionItem: React.FC<{ action: AmeliorationAction; onEdit: () => void; onDelete: () => void; }> = ({ action, onEdit, onDelete }) => (
    <div className="p-2 bg-white border-b flex items-center gap-3 group">
        {action.statut === 'Fait' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-500" />}
        <div className="flex-1">
            <p className="text-sm">{action.titre}</p>
            <p className="text-xs text-gray-500">Échéance: {new Date(action.dateEcheance).toLocaleDateString('fr-FR')}</p>
        </div>
        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1 hover:bg-gray-100 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
            <button onClick={onDelete} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
        </div>
    </div>
);

interface AmeliorationActionsSectionProps {
    amelioration: Amelioration;
    onOpenActionModal: (action?: AmeliorationAction) => void;
    onDeleteAction: (ameliorationId: string, actionId: string) => void;
}

const AmeliorationActionsSection: React.FC<AmeliorationActionsSectionProps> = ({ amelioration, onOpenActionModal, onDeleteAction }) => {
    const totalActions = amelioration.actions.length;
    const doneActions = amelioration.actions.filter(a => a.statut === 'Fait').length;
    const progress = totalActions > 0 ? (doneActions / totalActions) * 100 : 0;

    return (
        <div>
             <div className="mb-4">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-1"><span>Progression</span><span>{doneActions}/{totalActions}</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
            </div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-800">Actions ({amelioration.actions.length})</h4>
                <button onClick={() => onOpenActionModal()} className="flex items-center gap-1 text-sm bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"><Plus className="h-4 w-4"/>Ajouter</button>
            </div>
            <div className="space-y-1 bg-white rounded-md border">
                {amelioration.actions.map(a => <ActionItem key={a.id} action={a} onEdit={() => onOpenActionModal(a)} onDelete={() => onDeleteAction(amelioration.id, a.id)} />)}
                 {amelioration.actions.length === 0 && <p className="text-sm text-center text-gray-500 p-4">Aucune action définie.</p>}
            </div>
        </div>
    );
};

export default AmeliorationActionsSection;
