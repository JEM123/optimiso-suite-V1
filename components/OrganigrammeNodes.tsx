import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Users } from 'lucide-react';
import type { Entite, Poste } from '../types';

type NodeData = {
    item: Entite | Poste;
    peopleCount: number;
};

export const EntiteNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
    return (
        <div className={`bg-teal-600 text-white rounded-lg shadow-md p-3 w-56 relative transition-all ${selected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}>
            <Handle type="target" position={Position.Top} className="!bg-gray-400" />
            <div className="font-bold truncate" title={(data.item as Entite).nom}>{(data.item as Entite).nom}</div>
            <div className="text-sm opacity-90">{(data.item as Entite).type}</div>
            <div 
                className="absolute -top-3 -right-3 bg-teal-800 text-white text-xs rounded-full h-7 w-7 flex items-center justify-center font-bold border-2 border-white" 
                title={`${data.peopleCount} personne(s) dans cette branche`}
            >
                <Users className="h-3 w-3 mr-0.5 flex-shrink-0" />
                <span className="flex-shrink-0">{data.peopleCount}</span>
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
        </div>
    );
};

export const PosteNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
     return (
        <div className={`bg-white border-2 border-green-700 rounded-lg shadow-md p-3 w-56 relative transition-all ${selected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}>
            <Handle type="target" position={Position.Top} className="!bg-gray-400" />
            <div className="font-bold text-gray-800 truncate" title={(data.item as Poste).intitule}>{(data.item as Poste).intitule}</div>
            <div 
                className="absolute -top-3 -right-3 bg-gray-100 text-gray-700 text-xs rounded-full h-7 w-7 flex items-center justify-center font-bold border-2 border-white" 
                title={`${data.peopleCount} personne(s) à ce poste`}
            >
                 <Users className="h-3 w-3 mr-0.5 flex-shrink-0" />
                 <span className="flex-shrink-0">{data.peopleCount}</span>
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
        </div>
    );
};