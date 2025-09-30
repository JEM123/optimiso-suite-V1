import React from 'react';
import type { Document } from '../types';
import { X, Edit, Link as LinkIcon, Send, GitBranch } from 'lucide-react';
import GenericFicheContent from './GenericFicheContent';

interface DocumentDetailPanelProps {
    document: Document;
    onClose: () => void;
    onEdit: (d: Partial<Document>) => void;
    onShowValidation: (d: Document) => void;
    onShowRelations: (entity: any, entityType: string) => void;
    onSubmitForValidation: (d: Document) => void;
    onCreateNewVersion: (d: Document) => void;
}

const DocumentActions: React.FC<{ document: Document, onEdit: Function, onSubmit: Function, onNewVersion: Function }> = ({ document, onEdit, onSubmit, onNewVersion }) => {
    const isPublished = document.statut === 'publie' || document.statut === 'valide';
    const isDraft = document.statut === 'brouillon';
    const isPending = document.statut === 'en_validation';
    const isRejectedOrArchived = document.statut === 'rejete' || document.statut === 'archive';

    return (
        <div className="flex-shrink-0 flex items-center gap-2">
            {(isPublished || isRejectedOrArchived) && <button onClick={() => onNewVersion(document)} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"><GitBranch className="h-4 w-4"/>Créer une nouvelle version</button>}
            {isDraft && <button onClick={() => onSubmit(document)} className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"><Send className="h-4 w-4"/>Soumettre pour validation</button>}
            {isDraft && <button onClick={() => onEdit(document)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Modifier"><Edit className="h-4 w-4"/></button>}
            {isPending && <span className="text-sm text-yellow-700 font-medium bg-yellow-100 p-2 rounded-md">En cours de validation...</span>}
        </div>
    )
}

const DocumentDetailPanel: React.FC<DocumentDetailPanelProps> = (props) => {
    const { document, onClose, onEdit, onShowRelations, onSubmitForValidation, onCreateNewVersion } = props;
    
    return (
        <div className="bg-white border-l shadow-lg flex flex-col h-full animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={document.nom}>{document.nom}</h2>
                    <p className="text-sm text-gray-500">{document.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onShowRelations(document, 'documents')} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><LinkIcon className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="p-4 border-b">
                 <DocumentActions document={document} onEdit={onEdit} onSubmit={onSubmitForValidation} onNewVersion={onCreateNewVersion} />
            </div>

            <GenericFicheContent 
                moduleId="documents"
                item={document}
                {...props}
            />
        </div>
    );
};

export default DocumentDetailPanel;
