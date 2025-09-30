import React from 'react';
import type { Poste } from '../types';
import { Edit, Link as LinkIcon, X, BarChart } from 'lucide-react';
import GenericFicheContent from './GenericFicheContent';

interface PosteDetailPanelProps {
    poste: Poste;
    onClose: () => void;
    onEdit: (p: Poste) => void;
    onShowRelations: (entity: any, entityType: string) => void;
    onShowImpactAnalysis: (entity: any, entityType: string) => void;
}

const PosteDetailPanel: React.FC<PosteDetailPanelProps> = (props) => {
    const { poste, onClose, onEdit, onShowRelations, onShowImpactAnalysis } = props;

    return (
        <div className="bg-white border-l shadow-lg flex flex-col h-full animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">{poste.intitule}</h2>
                    <p className="text-sm text-gray-500">{poste.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onShowImpactAnalysis(poste, 'postes')} title="Analyser l'impact" className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><BarChart className="h-4 w-4"/></button>
                    <button onClick={() => onShowRelations(poste, 'postes')} title="Explorer les relations" className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><LinkIcon className="h-4 w-4"/></button>
                    <button onClick={() => onEdit(poste)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5" /></button>
                </div>
            </div>
            
            <GenericFicheContent
                moduleId="postes"
                item={poste}
                {...props}
            />
        </div>
    );
};

export default PosteDetailPanel;
