
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { Controls, Background, useNodesState, useEdgesState, useReactFlow, Node, Edge } from 'reactflow';
import type { Processus } from '../types';
import ProcessusNode from './ProcessusNode';
import { Target } from 'lucide-react';

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
    searchTerm: string;
    filterType: string;
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
    const { processus, onNodeClick, onEditNode, onAddSubNode, onDeleteNode, onShowRelations, selectedNodeId, searchTerm, filterType } = props;
    const { fitView } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    
    const processusMap = useMemo(() => new Map(processus.map(p => [p.id, p])), [processus]);

    useEffect(() => {
        const { initialNodes, initialEdges } = getLayoutedElements(processus);
        
        const nodesWithData = initialNodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                onEdit: onEditNode,
                onAddSub: onAddSubNode,
                onDelete: onDeleteNode,
                onShowRelations: onShowRelations,
            }
        }));

        setNodes(nodesWithData as Node[]);
        setEdges(initialEdges);
        
        setTimeout(() => fitView({ padding: 0.2 }), 100);
    }, [processus, fitView, setNodes, setEdges, onEditNode, onAddSubNode, onDeleteNode, onShowRelations]);
    
    const getAncestors = useCallback((nodeId: string): Set<string> => {
        const ancestors = new Set<string>();
        let current = processusMap.get(nodeId);
        while (current?.parentId) {
            ancestors.add(current.parentId);
            current = processusMap.get(current.parentId);
        }
        return ancestors;
    }, [processusMap]);

    const filteredNodes = useMemo(() => {
        if (!searchTerm && filterType === 'all') {
            return nodes.map(n => ({...n, data: { ...n.data, isDimmed: false }}));
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        
        const matchingNodes = new Set<string>();
        processus.forEach(p => {
            const matchesSearch = !searchTerm || p.nom.toLowerCase().includes(lowerSearchTerm) || p.reference.toLowerCase().includes(lowerSearchTerm);
            const matchesFilter = filterType === 'all' || p.type === filterType;
            if (matchesSearch && matchesFilter) {
                matchingNodes.add(p.id);
            }
        });
        
        const visibleAncestors = new Set<string>();
        matchingNodes.forEach(nodeId => {
            getAncestors(nodeId).forEach(ancestorId => visibleAncestors.add(ancestorId));
        });

        return nodes.map(n => {
            const isMatch = matchingNodes.has(n.id);
            const isAncestor = visibleAncestors.has(n.id);
            const isDimmed = !(isMatch || isAncestor);
            return {...n, data: {...n.data, isDimmed}};
        });
    }, [nodes, searchTerm, filterType, processus, getAncestors]);


    useEffect(() => {
        setNodes(nds => nds.map(node => ({...node, selected: node.id === selectedNodeId})));
    }, [selectedNodeId, setNodes]);


    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<Processus>) => {
        onNodeClick(node.data);
    }, [onNodeClick]);
    
    if (processus.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-center p-4">
                <div>
                    <Target className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun processus défini</h3>
                    <p className="mt-1 text-sm text-gray-500">Commencez par créer un processus racine.</p>
                </div>
            </div>
        );
    }

    return (
        <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-100"
            nodesDraggable={false}
        >
            <Controls />
            <Background />
        </ReactFlow>
    );
};

export default ProcessusMap;
