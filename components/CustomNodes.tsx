import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { EtapeProcedure } from '../types';
import { mockData } from '../constants';
import { Briefcase, AlertTriangle, CheckCircle, Play, StopCircle } from 'lucide-react';

const nodeStyles = {
    padding: '12px 16px',
    borderRadius: '8px',
    borderWidth: '1px',
    backgroundColor: 'white',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    minWidth: 200,
    fontFamily: 'sans-serif',
};

// Enhanced Step Node
export const StepNode = ({ data, selected }: NodeProps<EtapeProcedure>) => {
    const responsable = mockData.postes.find(p => p.id === data.responsablePosteId);
    const occupants = responsable ? mockData.personnes.filter(p => p.posteIds.includes(responsable.id)) : [];
    const firstOccupant = occupants[0];
    const initials = firstOccupant ? `${firstOccupant.prenom[0]}${firstOccupant.nom[0]}` : null;

    const hasRisks = data.risqueIds && data.risqueIds.length > 0;
    const hasControls = data.controleIds && data.controleIds.length > 0;

    return (
        <div style={nodeStyles} className={`border-slate-300 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
            <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />
            <div className="flex justify-between items-start">
                <div className="font-bold text-sm text-gray-800 pr-2">{data.libelle}</div>
                {initials && (
                    <div title={firstOccupant.prenom + ' ' + firstOccupant.nom} className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0 border-2 border-white ring-1 ring-blue-200">
                        {initials}
                    </div>
                )}
            </div>
            {responsable && <p className="text-xs text-gray-500 mt-1 flex items-center"><Briefcase className="h-3 w-3 mr-1.5"/>{responsable.intitule}</p>}
            {(hasRisks || hasControls) && (
                <div className="flex items-center space-x-3 mt-2 pt-2 border-t text-xs">
                    {hasRisks && <div className="flex items-center text-red-600" title={`${data.risqueIds?.length} risque(s)`}><AlertTriangle className="h-4 w-4 mr-1"/>{data.risqueIds?.length}</div>}
                    {hasControls && <div className="flex items-center text-green-600" title={`${data.controleIds?.length} contrôle(s)`}><CheckCircle className="h-4 w-4 mr-1"/>{data.controleIds?.length}</div>}
                </div>
            )}
            <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3" />
        </div>
    );
};

// Decision Node
export const DecisionNode = ({ data, selected }: NodeProps<EtapeProcedure>) => {
    return (
        <div className={`bg-amber-50 border border-amber-400 w-48 h-24 flex items-center justify-center text-center p-2 transform rotate-45 rounded-md shadow-sm ${selected ? 'ring-2 ring-amber-500' : ''}`}>
            <Handle type="target" position={Position.Top} id="top" className="!bg-gray-400 !w-3 !h-3" style={{ transform: 'translate(24px, -24px) rotate(-45deg)' }} />
            <div className="-rotate-45 font-semibold text-sm text-amber-800">{data.libelle}</div>
            <Handle type="source" position={Position.Right} id="yes" className="!bg-green-500 !w-3 !h-3" style={{ transform: 'translate(24px, 24px) rotate(-45deg)' }} />
            <Handle type="source" position={Position.Bottom} id="no" className="!bg-red-500 !w-3 !h-3" style={{ transform: 'translate(-24px, 24px) rotate(-45deg)' }} />
        </div>
    );
};

// Start/End Nodes (Capsule)
export const StartEndNode = ({ data, selected }: NodeProps<EtapeProcedure>) => {
    const isStart = data.type === 'start';
    const bgColor = isStart ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400';
    const textColor = isStart ? 'text-green-800' : 'text-red-800';
    const Icon = isStart ? Play : StopCircle;

    return (
        <div className={`w-40 h-12 rounded-full border ${bgColor} flex items-center justify-center px-4 shadow-sm ${selected ? 'ring-2 ring-blue-500' : ''}`}>
            <Icon className={`h-5 w-5 mr-2 ${textColor}`} />
            <span className={`font-semibold text-sm ${textColor}`}>{data.libelle}</span>
            {isStart ? (
                <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3" />
            ) : (
                <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />
            )}
        </div>
    );
};