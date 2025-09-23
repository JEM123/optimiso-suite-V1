import React, { useEffect } from 'react';
import ReactFlow, { Controls, Background, useNodesState, useEdgesState, useReactFlow, Node, Edge } from 'reactflow';

interface OrganigrammeFlowProps {
    initialNodes: Node[];
    initialEdges: Edge[];
}

const OrganigrammeFlow: React.FC<OrganigrammeFlowProps> = ({ initialNodes, initialEdges }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { fitView } = useReactFlow();

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        setTimeout(() => fitView({ padding: 0.1, duration: 300 }), 50);
    }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            className="bg-gray-100"
            proOptions={{ hideAttribution: true }}
        >
            <Controls />
            <Background />
        </ReactFlow>
    );
};

export default OrganigrammeFlow;
