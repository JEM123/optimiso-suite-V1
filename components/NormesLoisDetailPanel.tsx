import React from 'react';
import type { NormeLoiCadre, NormeLoiExigence } from '../types';
import { Edit, Plus, Trash2 } from 'lucide-react';

interface NormesLoisDetailPanelProps {
    cadre: NormeLoiCadre;
    exigences: NormeLoiExigence[];
    onEditCadre: (cadre: NormeLoiCadre) => void;
    onDeleteCadre: (id: string) => void;
    onAddExigence: () => void;
    onEditExigence: (exigence: NormeLoiExigence) => void;
    onDeleteExigence: (id: string) => void;
}

const STATUT_CONFORMITE_COLORS: Record<NormeLoiExigence['statutConformite'], string> = {
    'Non applicable': 'bg-gray-100 text-gray-800', 'Conforme': 'bg-green-100 text-green-800',
    'Partiellement conforme': 'bg-yellow-100 text-yellow-800', 'Non conforme': 'bg-red-100 text-red-800',
    'À évaluer': 'bg-blue-100 text-blue-800',
};

const ExigenceItem: React.FC<{ exigence: NormeLoiExigence; onEdit: () => void; onDelete: () => void; }> = ({ exigence, onEdit, onDelete }) => (
    <div className="p-3 border-b bg-white last:border-b-0 group">
        <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
                <p className="font-semibold text-sm text-gray-900">{exigence.reference} - {exigence.intitule}</p>
                <p className="text-xs text-gray-500 mt-1">{exigence.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${STATUT_CONFORMITE_COLORS[exigence.statutConformite]}`}>
                    {exigence.statutConformite}
                </span>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-1 hover:bg-gray-100 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                    <button onClick={onDelete} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                </div>
            </div>
        </div>
    </div>
);

const NormesLoisDetailPanel: React.FC<NormesLoisDetailPanelProps> = ({ cadre, exigences, onEditCadre, onAddExigence, onEditExigence, onDeleteExigence }) => {
    // Note: This component could be refactored to use GenericFicheContent
    // once sections for Normes & Lois are created and registered.
    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="p-4 border-b bg-white flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">{cadre.nom}</h2>
                    <p className="text-sm text-gray-500">{cadre.reference}</p>
                </div>
                <button onClick={() => onEditCadre(cadre)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Modifier"><Edit className="h-4 w-4"/></button>
            </div>
             <div className="flex-1 overflow-y-auto">
                 <div className="p-3 border-b flex justify-between items-center bg-white sticky top-0">
                    <h3 className="font-semibold text-gray-800">Exigences ({exigences.length})</h3>
                    <button onClick={onAddExigence} className="flex items-center gap-1 text-sm bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600">
                        <Plus className="h-4 w-4"/>Ajouter
                    </button>
                </div>
                <div className="divide-y">
                    {exigences.map(ex => <ExigenceItem key={ex.id} exigence={ex} onEdit={() => onEditExigence(ex)} onDelete={() => onDeleteExigence(ex.id)} />)}
                    {exigences.length === 0 && <p className="p-4 text-center text-sm text-gray-500">Aucune exigence définie.</p>}
                </div>
            </div>
        </div>
    );
};

export default NormesLoisDetailPanel;