
import React, { DragEvent, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap, type OnNodesChange, type OnEdgesChange, type OnConnect, type Node, type Edge } from 'reactflow';
import type { EtapeProcedure } from '../types';
import { StepNode, DecisionNode, StartEndNode } from './CustomNodes';
import { Play, StopCircle, Diamond, Square } from 'lucide-react';

const nodeTypes = { 
    step: StepNode,
    decision: DecisionNode,
    start: StartEndNode,
    end: StartEndNode
};

const ToolboxItem: React.FC<{ label: string; type: EtapeProcedure['type']; icon: React.ElementType }> = ({ label, type, icon: Icon }) => {
    const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };
    return (
        <div 
            className="flex items-center gap-2 p-2 border bg-white rounded-md cursor-grab hover:bg-blue-50"
            onDragStart={(event) => onDragStart(event, type)}
            draggable
        >
            <Icon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
};

const Toolbox = () => (
    <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border space-y-2">
        <ToolboxItem label="Début" type="start" icon={Play} />
        <ToolboxItem label="Étape" type="step" icon={Square} />
        <ToolboxItem label="Décision" type="decision" icon={Diamond} />
        <ToolboxItem label="Fin" type="end" icon={StopCircle} />
    </div>
);

interface ProcedureFlowProps {
    nodes: Node<EtapeProcedure>[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    onNodeClick: (event: React.MouseEvent, node: Node<EtapeProcedure>) => void;
    onPaneClick: () => void;
    onDrop: (event: DragEvent) => void;
    onNodeDragStop?: (event: React.MouseEvent, node: Node<EtapeProcedure>) => void;
}

const ProcedureFlow: React.FC<ProcedureFlowProps> = (props) => {
     const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    return (
        <div className="w-full h-full" onDrop={props.onDrop} onDragOver={onDragOver}>
            <ReactFlow
                nodes={props.nodes}
                edges={props.edges}
                onNodesChange={props.onNodesChange}
                onEdgesChange={props.onEdgesChange}
                onConnect={props.onConnect}
                onNodeClick={props.onNodeClick}
                onPaneClick={props.onPaneClick}
                onNodeDragStop={props.onNodeDragStop}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gray-50"
            >
                <Controls />
                <MiniMap />
                <Background gap={12} size={1} />
                <Toolbox />
            </ReactFlow>
        </div>
    );
};

export default ProcedureFlow;
