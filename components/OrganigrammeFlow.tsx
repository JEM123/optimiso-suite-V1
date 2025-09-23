import React, { useEffect } from 'react';
import ReactFlow, { Controls, Background, useNodesState, useEdgesState, useReactFlow, Node, Edge } from 'reactflow';
import { EntiteNode, PosteNode } from './OrganigrammeNodes';

const nodeTypes = {
    entite: EntiteNode,
    poste: PosteNode,
};

interface OrganigrammeFlowProps {
    nodes: Node[];
    edges: Edge[];
    onNodeClick?: (event: React.MouseEvent, node: Node) => void;
}

const OrganigrammeFlow: React.FC<OrganigrammeFlowProps> = ({ nodes: propNodes, edges: propEdges, onNodeClick }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { fitView } = useReactFlow();

    useEffect(() => {
        setNodes(propNodes);
        setEdges(propEdges);
    }, [propNodes, propEdges, setNodes, setEdges]);
    
    useEffect(() => {
        fitView({ padding: 0.1, duration: 300 });
    }, [propNodes, propEdges, fitView]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            className="bg-gray-100"
            proOptions={{ hideAttribution: true }}
            zoomOnDoubleClick={false}
        >
            <Controls showInteractive={false} />
            <Background />
        </ReactFlow>
    );
};

export default OrganigrammeFlow;