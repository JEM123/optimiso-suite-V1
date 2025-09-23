
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
        // Delay fitView slightly to allow layout to settle
        const timer = setTimeout(() => {
            fitView({ padding: 0.1, duration: 300 });
        }, 50);
        return () => clearTimeout(timer);
    }, [propNodes, propEdges, setNodes, setEdges, fitView]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            className="bg-gray-100"
            proOptions={{ hideAttribution: true }}
            zoomOnDoubleClick={false}
            fitView
        >
            <Controls showInteractive={false} />
            <Background />
        </ReactFlow>
    );
};

export default OrganigrammeFlow;
