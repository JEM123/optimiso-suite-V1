import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactFlow, { Controls, Background, useNodesState, useEdgesState, addEdge } from 'reactflow';
import type { Connection, Edge, Node } from 'reactflow';
import type { Procedure, EtapeProcedure } from '../types';
import { mockData } from '../constants';
import { Briefcase } from 'lucide-react';
import ProcedureDetailPanel from './ProcedureDetailPanel';

// Custom Node Component
const StepNode = ({ data }: { data: EtapeProcedure }) => {
    const responsable = mockData.postes.find(p => p.id === data.responsablePosteId);
    return (
        <div className="w-64 bg-white border-2 border-blue-500 rounded-lg shadow-md p-3 hover:shadow-xl transition-shadow duration-300">
            <div className="flex">
                <div className="bg-blue-500 text-white rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold text-sm">
                    {data.ordre}
                </div>
                <div className="ml-3 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">{data.libelle}</h4>
                    {responsable && <p className="text-xs text-gray-600 flex items-center mt-1"><Briefcase className="h-3 w-3 mr-1"/>{responsable.intitule}</p>}
                </div>
            </div>
        </div>
    );
};

const nodeTypes = { step: StepNode };

interface ProcedureFlowProps {
    procedure: Procedure;
    onShowRelations: (entity: any, entityType: string) => void;
    onEditStep: (etape: EtapeProcedure) => void;
}

const ProcedureFlow: React.FC<ProcedureFlowProps> = ({ procedure, onShowRelations, onEditStep }) => {
    const initialNodes = useMemo(() => procedure.etapes.map(etape => ({
        id: etape.id,
        type: 'step',
        position: etape.position,
        data: etape,
    })), [procedure]);

    const initialEdges = useMemo(() => procedure.liens.map(lien => ({
        id: lien.id,
        source: lien.source,
        target: lien.target,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6b7280', strokeWidth: 2 },
    })), [procedure]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedStep, setSelectedStep] = useState<EtapeProcedure | null>(null);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        // Do not reset selected step on every re-render, only when procedure changes
        if (selectedStep && !procedure.etapes.some(e => e.id === selectedStep.id)) {
            setSelectedStep(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [procedure.id]); // Dependency on ID ensures this runs only on procedure switch

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);
    
    const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node<EtapeProcedure>) => {
        setSelectedStep(procedure.etapes.find(e => e.id === node.id) || null);
    }, [procedure.etapes]);

    const onPaneClick = useCallback(() => {
        setSelectedStep(null);
    }, []);

    const currentSelectedStep = selectedStep ? procedure.etapes.find(e => e.id === selectedStep.id) : null;

    return (
        <div className="w-full h-full flex">
            <div className="flex-grow h-full relative">
                 <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-gradient-to-br from-gray-50 to-gray-100"
                >
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>
            {currentSelectedStep && (
                <ProcedureDetailPanel 
                    etape={currentSelectedStep} 
                    procedure={procedure}
                    onClose={() => setSelectedStep(null)}
                    onShowRelations={onShowRelations}
                    onEdit={onEditStep}
                />
            )}
        </div>
    );
};

export default ProcedureFlow;