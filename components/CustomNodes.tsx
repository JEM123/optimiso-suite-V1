import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { EtapeProcedure } from '../types';
import { mockData } from '../constants';
import { Briefcase, AlertTriangle, CheckCircle, Play, StopCircle } from 'lucide-react';

const nodeBaseStyle = {
    fontFamily: 'sans-serif',
};

const StepNode: React.FC<NodeProps<EtapeProcedure>> = ({ data, selected }) => {
    const responsable = mockData.postes.find(p => p.id === data.responsablePosteId);
    const occupants = responsable ? mockData.personnes.filter(p => p.posteIds.includes(responsable.id)) : [];
    const firstOccupant = occupants[0];
    const initials = firstOccupant ? `${firstOccupant.prenom[0]}${firstOccupant.nom[0]}` : null;
    const hasRisks = data.risqueIds && data.risqueIds.length > 0;
    const hasControls = data.controleIds && data.controleIds.length > 0;

    return (
        <div style={nodeBaseStyle} className={`bg-white rounded-lg shadow-md border min-w-[220px] ${selected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-300'}`}>
            <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />
            <div className="p-3">
                <div className="flex justify-between items-start gap-2">
                    <div className="font-bold text-sm text-gray-800 pr-2">{data.libelle}</div>
                    {initials && (
                        <div title={firstOccupant.prenom + ' ' + firstOccupant.nom} className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0 border-2 border-white ring-1 ring-blue-200">
                            {initials}
                        </div>
                    )}
                </div>
                {responsable && <p className="text-xs text-gray-500 mt-1 flex items-center"><Briefcase className="h-3 w-3 mr-1.5"/>{responsable.intitule}</p>}
            </div>
            {(hasRisks || hasControls) && (
                <div className="flex items-center space-x-3 mt-1 p-2 border-t bg-gray-50/50 text-xs rounded-b-lg">
                    {hasRisks && <div className="flex items-center text-red-600" title={`${data.risqueIds?.length} risque(s)`}><AlertTriangle className="h-4 w-4 mr-1"/>{data.risqueIds?.length}</div>}
                    {hasControls && <div className="flex items-center text-green-600" title={`${data.controleIds?.length} contrôle(s)`}><CheckCircle className="h-4 w-4 mr-1"/>{data.controleIds?.length}</div>}
                </div>
            )}
            <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3" />
        </div>
    );
};

const DecisionNode: React.FC<NodeProps<EtapeProcedure>> = ({ data, selected }) => {
    return (
        <div 
            style={{ ...nodeBaseStyle, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
            className={`
                w-48 h-32 flex items-center justify-center text-center p-4
                bg-amber-100 border-2 ${selected ? 'border-amber-600 ring-2 ring-amber-400' : 'border-amber-400'}
            `}
        >
            <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" style={{ top: -6 }}/>
            <div className="font-semibold text-sm text-amber-800 break-words">{data.libelle}</div>
            <Handle type="source" position={Position.Right} id="yes" className="!bg-green-500 !w-3 !h-3" style={{ right: -6 }}/>
            <Handle type="source" position={Position.Bottom} id="no" className="!bg-red-500 !w-3 !h-3" style={{ bottom: -6 }}/>
        </div>
    );
};

const StartEndNode: React.FC<NodeProps<EtapeProcedure>> = ({ data, selected }) => {
    const isStart = data.type === 'start';
    const bgColor = isStart ? 'bg-green-100 border-green-500' : 'bg-gray-200 border-gray-500';
    const textColor = isStart ? 'text-green-800' : 'text-gray-800';
    const Icon = isStart ? Play : StopCircle;

    return (
        <div style={nodeBaseStyle} className={`w-48 h-12 rounded-full border-2 ${bgColor} flex items-center justify-center px-4 shadow-sm ${selected ? 'ring-2 ring-blue-500' : ''}`}>
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

export { StepNode, DecisionNode, StartEndNode };
