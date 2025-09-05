import React, { useState, useMemo } from 'react';
import type { Procedure, EtapeProcedure } from '../types';
import { mockData } from '../constants';
import { Plus, Edit, Trash2, ArrowDown, Briefcase, ArrowUp, ArrowDownCircle } from 'lucide-react';

interface ProcedureFlowProps {
    procedure: Procedure;
    onEditStep: (procId: string, step: EtapeProcedure) => void;
    onAddStep: (procId: string) => void;
    onDeleteStep: (procId: string, stepId: string) => void;
    onReorderStep: (procId: string, stepId: string, direction: 'up' | 'down') => void;
}

const ProcedureFlow: React.FC<ProcedureFlowProps> = ({ procedure, onEditStep, onAddStep, onDeleteStep, onReorderStep }) => {
    const [viewType, setViewType] = useState<'logigram' | 'swimlane'>('logigram');

    const swimlaneData = useMemo(() => {
        if (viewType !== 'swimlane') return null;
        const lanes: Record<string, EtapeProcedure[]> = {};
        procedure.etapes.forEach(etape => {
            if (!lanes[etape.responsablePosteId]) {
                lanes[etape.responsablePosteId] = [];
            }
            lanes[etape.responsablePosteId].push(etape);
        });
        // Ensure consistent order
        return Object.entries(lanes).sort(([idA], [idB]) => {
            const minOrderA = Math.min(...lanes[idA].map(e => e.ordre));
            const minOrderB = Math.min(...lanes[idB].map(e => e.ordre));
            return minOrderA - minOrderB;
        });
    }, [procedure.etapes, viewType]);

    const StepCard: React.FC<{ etape: EtapeProcedure, isFirst: boolean, isLast: boolean, showConnector: boolean }> = ({ etape, isFirst, isLast, showConnector }) => {
        const responsable = mockData.postes.find(p => p.id === etape.responsablePosteId);
        return (
            <div className="flex flex-col items-center group relative">
                <div className="w-64 bg-white border-2 border-blue-500 rounded-lg shadow-md p-3 relative">
                    <div className="flex">
                        <div className="bg-blue-500 text-white rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold text-sm">
                            {etape.ordre}
                        </div>
                        <div className="ml-3 min-w-0">
                            <h4 className="font-semibold text-gray-800 truncate">{etape.libelle}</h4>
                            {responsable && <p className="text-xs text-gray-600 flex items-center mt-1"><Briefcase className="h-3 w-3 mr-1"/>{responsable.intitule}</p>}
                        </div>
                    </div>
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex bg-white/50 backdrop-blur-sm rounded-md p-0.5 space-x-0.5">
                        <button onClick={() => onReorderStep(procedure.id, etape.id, 'up')} disabled={isFirst} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowUp className="h-3 w-3"/></button>
                        <button onClick={() => onReorderStep(procedure.id, etape.id, 'down')} disabled={isLast} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowDown className="h-3 w-3"/></button>
                        <button onClick={() => onEditStep(procedure.id, etape)} className="p-1 hover:bg-gray-100 rounded"><Edit className="h-3 w-3"/></button>
                        <button onClick={() => onDeleteStep(procedure.id, etape.id)} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="h-3 w-3 text-red-500"/></button>
                    </div>
                </div>
                {showConnector && !isLast && (
                    <div className="h-8 w-px bg-gray-400 my-1">
                        <ArrowDownCircle className="h-4 w-4 text-gray-400 -translate-x-1/2 left-1/2 relative top-1/2 -mt-2 bg-gray-50 rounded-full"/>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-start items-center mb-4">
                 <div className="flex bg-gray-200 rounded-lg p-1">
                    <button onClick={() => setViewType('logigram')} className={`px-3 py-1 text-sm rounded-md ${viewType === 'logigram' ? 'bg-white shadow' : ''}`}>Logigramme</button>
                    <button onClick={() => setViewType('swimlane')} className={`px-3 py-1 text-sm rounded-md ${viewType === 'swimlane' ? 'bg-white shadow' : ''}`}>Swim Lanes</button>
                </div>
            </div>

            {viewType === 'logigram' && (
                <div className="flex flex-col items-center space-y-0">
                    {procedure.etapes.sort((a,b) => a.ordre - b.ordre).map((etape, index) => (
                        <StepCard 
                            key={etape.id} 
                            etape={etape} 
                            isFirst={index === 0}
                            isLast={index === procedure.etapes.length - 1} 
                            showConnector={true}
                        />
                    ))}
                    <button onClick={() => onAddStep(procedure.id)} className="mt-3 flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 text-sm font-medium border border-dashed border-blue-300">
                        <Plus className="h-4 w-4" />
                        <span>Ajouter une étape</span>
                    </button>
                </div>
            )}
            
            {viewType === 'swimlane' && swimlaneData && (
                 <div className="flex space-x-4 overflow-x-auto pb-4">
                     {swimlaneData.map(([posteId, etapes]) => {
                         const poste = mockData.postes.find(p => p.id === posteId);
                         return (
                             <div key={posteId} className="w-72 bg-gray-100 rounded-lg p-2 flex-shrink-0">
                                 <h3 className="font-semibold p-2 text-center text-gray-700 border-b">{poste?.intitule || 'Non assigné'}</h3>
                                 <div className="space-y-4 pt-2">
                                     {etapes.sort((a,b) => a.ordre - b.ordre).map((etape, index) => (
                                         <StepCard 
                                            key={etape.id} 
                                            etape={etape} 
                                            isFirst={index === 0}
                                            isLast={index === etapes.length - 1}
                                            showConnector={false}
                                        />
                                     ))}
                                     <button onClick={() => onAddStep(procedure.id)} className="w-full mt-2 flex items-center justify-center space-x-2 bg-white/50 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-white text-sm font-medium border border-dashed border-gray-400">
                                        <Plus className="h-4 w-4" />
                                     </button>
                                 </div>
                             </div>
                         );
                     })}
                     <div className="w-72 bg-gray-100 rounded-lg p-2 flex-shrink-0 flex items-center justify-center">
                        {/* Maybe an "Add Lane" button in the future */}
                        <button onClick={() => onAddStep(procedure.id)} className="flex items-center space-x-2 bg-white/50 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-white text-sm font-medium border border-dashed border-gray-400">
                             <Plus className="h-4 w-4" /><span>Ajouter une étape</span>
                        </button>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default ProcedureFlow;