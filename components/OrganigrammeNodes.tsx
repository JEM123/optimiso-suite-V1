import React, { useMemo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { Entite, Poste, Personne } from '../types';
import { Users, User, PlusCircle, MinusCircle } from 'lucide-react';

interface NodeData {
    item: Entite | Poste;
    peopleCount: number;
    occupants: Personne[];
    responsable?: Personne;
    isCollapsed: boolean;
    hasChildren: boolean;
    onToggleCollapse: (nodeId: string) => void;
}

const CollapseButton: React.FC<{ nodeId: string; isCollapsed: boolean; onToggle: (id: string) => void }> = ({ nodeId, isCollapsed, onToggle }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onToggle(nodeId); }}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 text-gray-500 bg-white rounded-full hover:text-blue-600"
        title={isCollapsed ? "Développer" : "Réduire"}
    >
        {isCollapsed ? <PlusCircle className="h-5 w-5" /> : <MinusCircle className="h-5 w-5" />}
    </button>
);

// EntiteNode: Blue-green background, white text
export const EntiteNode: React.FC<NodeProps<NodeData>> = ({ data }) => {
    const { item, peopleCount, responsable, isCollapsed, hasChildren, onToggleCollapse } = data;
    const entite = item as Entite;
    
    return (
        <div className="bg-teal-600 text-white rounded-lg shadow-md p-3 w-56 flex flex-col justify-between" style={{ minHeight: '120px' }}>
            <Handle type="target" position={Position.Top} className="!bg-gray-400 !opacity-50" />
            
            <div>
                <div className="font-bold">{entite.nom}</div>
                <div className="text-sm text-teal-100">{entite.type}</div>
                {responsable && (
                    <div className="text-xs text-teal-200 mt-2 flex items-center gap-1.5 opacity-80">
                        <User className="h-3 w-3" />
                        <span>Resp: {responsable.prenom} {responsable.nom}</span>
                    </div>
                )}
            </div>
            
            <div className="mt-2 pt-2 border-t border-teal-500 flex items-center justify-end text-sm">
                <Users className="h-4 w-4 mr-1.5" />
                <span>{peopleCount} {peopleCount !== 1 ? 'personnes' : 'personne'}</span>
            </div>

            {hasChildren && <CollapseButton nodeId={entite.id} isCollapsed={isCollapsed} onToggle={onToggleCollapse} />}
            <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !opacity-50" />
        </div>
    );
};

// PosteNode: White background, green border, with tooltip
export const PosteNode: React.FC<NodeProps<NodeData>> = ({ data }) => {
    const { item, peopleCount, occupants, isCollapsed, hasChildren, onToggleCollapse } = data;
    const poste = item as Poste;

    return (
        <div className="relative group">
            <div className="bg-white border-2 border-green-500 rounded-lg shadow-md p-3 w-56 flex flex-col justify-between" style={{ minHeight: '120px' }}>
                <Handle type="target" position={Position.Top} className="!bg-gray-400 !opacity-50" />
                
                <div>
                    <div className="font-bold text-gray-800">{poste.intitule}</div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-end text-sm text-gray-700">
                    <Users className="h-4 w-4 mr-1.5 text-green-600" />
                    <span>{peopleCount} / {poste.effectifCible}</span>
                </div>
                
                {hasChildren && <CollapseButton nodeId={poste.id} isCollapsed={isCollapsed} onToggle={onToggleCollapse} />}
                <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !opacity-50" />
            </div>
            
            {occupants.length > 0 && (
                 <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 left-1/2 -translate-x-1/2">
                    <h4 className="font-bold mb-1">Occupant(s)</h4>
                    <ul className="list-disc list-inside">
                        {occupants.map(p => <li key={p.id}>{p.prenom} {p.nom}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};