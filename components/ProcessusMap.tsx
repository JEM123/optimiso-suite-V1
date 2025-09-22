import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { Controls, Background, useNodesState, useEdgesState, useReactFlow, Node, Edge } from 'reactflow';
import type { Processus } from '../types';
import ProcessusNode from './ProcessusNode';

const nodeTypes = { processus: ProcessusNode };

const HORIZONTAL_SPACING = 300;
const VERTICAL_SPACING = 200;

interface ProcessusMapProps {
    processus: Processus[];
    onNodeClick: (proc: Processus) => void;
    onEditNode: (proc: Processus) => void;
    onAddSubNode: (proc: Processus) => void;
    onDeleteNode: (proc: Processus) => void;
    onShowRelations: (entity: any, entityType: string) => void;
    selectedNodeId?: string | null;
}

const getLayoutedElements = (processusList: Processus[]) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    if (processusList.length === 0) return { initialNodes: [], initialEdges: [] };

    const levels: Record<string, Processus[]> = {};

    processusList.forEach(p => {
        if(!levels[p.niveau]) levels[p.niveau] = [];
        levels[p.niveau].push(p);
        if(p.parentId) {
            edges.push({ id: `e-${p.parentId}-${p.id}`, source: p.parentId, target: p.id, type: 'smoothstep', animated: true });
        }
    });
    
    Object.keys(levels).sort().forEach((levelKey, levelIndex) => {
        const levelNodes = levels[levelKey];
        const y = levelIndex * VERTICAL_SPACING;
        const levelWidth = (levelNodes.length - 1) * HORIZONTAL_SPACING;
        const startX = -levelWidth / 2;

        levelNodes.forEach((nodeData, nodeIndex) => {
            nodes.push({
                id: nodeData.id,
                type: 'processus',
                position: { x: startX + nodeIndex * HORIZONTAL_SPACING, y },
                data: nodeData,
            });
        });
    });
    
    return { initialNodes: nodes, initialEdges: edges };
};


const ProcessusMap: React.FC<ProcessusMapProps> = (props) => {
    const { processus, onNodeClick, onEditNode, onAddSubNode, onDeleteNode, onShowRelations, selectedNodeId } = props;
    const { fitView } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

    const childrenMap = useMemo(() => processus.reduce((acc, p) => {
            if (p.parentId) {
            if (!acc[p.parentId]) acc[p.parentId] = [];
            acc[p.parentId].push(p.id);
        }
        return acc;
    }, {} as Record<string, string[]>), [processus]);

    useEffect(() => {
        const { initialNodes, initialEdges } = getLayoutedElements(processus);
        
        const allExpanded = Object.fromEntries(processus.map(p => [p.id, true]));
        setExpandedNodes(allExpanded);

        const nodesWithData = initialNodes.map(node => ({
            ...node,
            selected: node.id === selectedNodeId,
            data: {
                ...node.data,
                onEdit: onEditNode,
                onAddSub: onAddSubNode,
                onDelete: onDeleteNode,
                onShowRelations: onShowRelations,
                childrenCount: childrenMap[node.id]?.length || 0,
                isExpanded: true,
                onExpandCollapse: (id: string) => {
                     setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
                }
            }
        }));

        setNodes(nodesWithData as Node[]);
        setEdges(initialEdges);
        
        setTimeout(() => fitView({ padding: 0.2 }), 100);
    }, [processus, fitView, setNodes, setEdges, onEditNode, onAddSubNode, onDeleteNode, onShowRelations, childrenMap]);

    useEffect(() => {
        setNodes(nds => nds.map(node => ({...node, selected: node.id === selectedNodeId})));
    }, [selectedNodeId, setNodes]);


    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<Processus>) => {
        onNodeClick(node.data);
    }, [onNodeClick]);
    
    const getDescendants = useCallback((nodeId: string, procList: Processus[]): string[] => {
        const children = procList.filter(p => p.parentId === nodeId).map(p => p.id);
        if (children.length === 0) return [];
        return [...children, ...children.flatMap(cId => getDescendants(cId, procList))];
    }, []);

    const visibleNodesAndEdges = useMemo(() => {
        const hiddenNodeIds = new Set<string>();

        Object.keys(expandedNodes).forEach(nodeId => {
            if (!expandedNodes[nodeId]) {
                const descendants = getDescendants(nodeId, processus);
                descendants.forEach(id => hiddenNodeIds.add(id));
            }
        });
        
        const visibleNodes = nodes.map(n => ({
            ...n,
            hidden: hiddenNodeIds.has(n.id),
            data: {
                ...n.data,
                isExpanded: expandedNodes[n.id] ?? true
            }
        }));
        
        const visibleEdges = edges.filter(e => !hiddenNodeIds.has(e.source) && !hiddenNodeIds.has(e.target));
        
        return { nodes: visibleNodes, edges: visibleEdges };

    }, [nodes, edges, expandedNodes, processus, getDescendants]);


    return (
        <ReactFlow
            nodes={visibleNodesAndEdges.nodes}
            edges={visibleNodesAndEdges.edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-100"
        >
            <Controls />
            <Background />
        </ReactFlow>
    );
};

export default ProcessusMap;
