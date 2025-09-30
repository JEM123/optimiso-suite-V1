import React from 'react';
import type { Amelioration, AmeliorationAction } from '../types';
import { X, Edit, Link as LinkIcon } from 'lucide-react';
import GenericFicheContent from './GenericFicheContent';
import AmeliorationActionFormModal from './AmeliorationActionFormModal';

interface AmeliorationDetailPanelProps {
    amelioration: Amelioration;
    onClose: () => void;
    onEdit: (a: Amelioration) => void;
    onShowRelations: (entity: any, entityType: string) => void;
    onSaveAction: (ameliorationId: string, action: AmeliorationAction) => void;
    onDeleteAction: (ameliorationId: string, actionId: string) => void;
}

const AmeliorationDetailPanel: React.FC<AmeliorationDetailPanelProps> = (props) => {
    const { amelioration, onClose, onEdit, onShowRelations } = props;
    const [isActionModalOpen, setActionModalOpen] = React.useState(false);
    const [editingAction, setEditingAction] = React.useState<Partial<AmeliorationAction> | null>(null);

    const handleOpenActionModal = (action?: AmeliorationAction) => {
        setEditingAction(action || {});
        setActionModalOpen(true);
    };

    const handleSaveAction = (actionToSave: AmeliorationAction) => {
        props.onSaveAction(amelioration.id, actionToSave);
        setActionModalOpen(false);
    };
    
    return (
        <>
            <div className="bg-white border-l shadow-lg flex flex-col h-full animate-slide-in-right">
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <div><h2 className="text-lg font-semibold text-gray-800">{amelioration.titre}</h2><p className="text-sm text-gray-500">{amelioration.reference}</p></div>
                    <div className="flex space-x-1">
                        <button onClick={() => onShowRelations(amelioration, 'ameliorations')} className="p-2"><LinkIcon className="h-4 w-4"/></button>
                        <button onClick={() => onEdit(amelioration)} className="p-2"><Edit className="h-4 w-4"/></button>
                        <button onClick={onClose} className="p-2"><X className="h-5 w-5"/></button>
                    </div>
                </div>
                
                 <GenericFicheContent 
                    moduleId="ameliorations"
                    item={amelioration}
                    onOpenActionModal={handleOpenActionModal}
                    {...props}
                />
            </div>
            <AmeliorationActionFormModal isOpen={isActionModalOpen} onClose={() => setActionModalOpen(false)} onSave={handleSaveAction} action={editingAction} />
        </>
    );
};

export default AmeliorationDetailPanel;
