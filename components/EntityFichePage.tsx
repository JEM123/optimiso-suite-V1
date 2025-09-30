
import React from 'react';
import type { Entite } from '../types';
import { ChevronRight, Building, Link as LinkIcon, Edit, Trash2 } from 'lucide-react';
import EntityFicheContent from './EntityFicheContent';

interface EntityFichePageProps {
    entite: Entite;
    onClose: () => void;
    onShowRelations: (entity: any, entityType: string) => void;
    onEdit: (entite: Entite) => void;
    onDelete: (entite: Entite) => void;
}

const EntityFichePage: React.FC<EntityFichePageProps> = ({ entite, onClose, onShowRelations, onEdit, onDelete }) => {
    return (
        <div className="p-6 h-full flex flex-col bg-gray-50">
            <nav className="flex items-center text-sm text-gray-500 mb-4">
                <button onClick={onClose} className="flex items-center hover:underline">
                    <Building className="h-4 w-4 mr-2" /> Entités
                </button>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="font-medium text-gray-700">{entite.nom}</span>
            </nav>

            <div className="bg-white rounded-lg border flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{entite.nom}</h1>
                        <p className="text-sm text-gray-600">{entite.code} - {entite.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onShowRelations(entite, 'entites')} className="flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 text-sm">
                            <LinkIcon className="h-4 w-4" /> Vue 360°
                        </button>
                         <button onClick={() => onEdit(entite)} className="flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 text-sm">
                            <Edit className="h-4 w-4" /> Modifier
                        </button>
                         <button onClick={() => onDelete(entite)} className="flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-red-50 hover:bg-red-100 text-sm text-red-700">
                            <Trash2 className="h-4 w-4" /> Supprimer
                        </button>
                    </div>
                </div>
                
                <EntityFicheContent entite={entite} onShowRelations={onShowRelations} />
            </div>
        </div>
    );
};

export default EntityFichePage;
