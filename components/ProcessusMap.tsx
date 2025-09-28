

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { Controls, Background, useNodesState, useEdgesState, useReactFlow, Node, Edge } from 'reactflow';
import type { Processus } from '../types';
import ProcessusNode from './ProcessusNode';
import { Target, Download, Image, FileText as FileTextIcon, ZoomIn, ZoomOut, Minimize2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

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

const Toolbar: React.FC<{
    onExportPNG: () => void;
    onExportPDF: () => void;
}> = ({ onExportPNG, onExportPDF }) => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    return (
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border flex items-center gap-2">
            <button onClick={() => zoomIn()} title="Zoom avant" className="p-2 hover:bg-gray-100 rounded-md"><ZoomIn className="h-5 w-5"/></button>
            <button onClick={() => zoomOut()} title="Zoom arrière" className="p-2 hover:bg-gray-100 rounded-md"><ZoomOut className="h-5 w-5"/></button>
            <button onClick={() => fitView({ duration: 500 })} title="Ajuster à la vue" className="p-2 hover:bg-gray-100 rounded-md"><Minimize2 className="h-5 w-5"/></button>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <div className="relative group">
                <button className="p-2 hover:bg-gray-100 rounded-md flex items-center gap-2"><Download className="h-5 w-5"/> <span className="text-sm font-medium">Exporter</span></button>
                <div className="absolute left-0 top-full mt-1 w-40 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity z-10">
                    <button onClick={onExportPNG} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm"><Image className="h-4 w-4 text-blue-600"/>Exporter PNG</button>
                    <button onClick={onExportPDF} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm"><FileTextIcon className="h-4 w-4 text-red-600"/>Exporter PDF</button>
                </div>
            </div>
        </div>
    );
};

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
    
    const handleExport = (format: 'png' | 'pdf') => {
        const flowElement = document.querySelector('.react-flow__viewport');
        if (!flowElement) {
            alert("Erreur: L'élément de la cartographie n'a pas été trouvé.");
            return;
        }

        htmlToImage.toPng(flowElement as HTMLElement, { backgroundColor: '#f9fafb' })
            .then((dataUrl) => {
                if (format === 'png') {
                    const link = document.createElement('a');
                    link.download = 'cartographie_processus.png';
                    link.href = dataUrl;
                    link.click();
                } else {
                    const { width, height } = flowElement.getBoundingClientRect();
                    const pdf = new jsPDF({
                        orientation: width > height ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [width, height]
                    });
                    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
                    pdf.save('cartographie_processus.pdf');
                }
            })
            .catch((err) => {
                console.error("Erreur lors de l'export de l'image:", err);
                alert("Une erreur est survenue lors de l'exportation.");
            });
    };

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
            <Controls showInteractive={false} />
            <Background />
            <Toolbar 
                onExportPNG={() => handleExport('png')}
                onExportPDF={() => handleExport('pdf')}
            />
        </ReactFlow>
    );
};

export default ProcessusMap;
