
import React, { useMemo, useCallback, useState } from 'react';
import { ReactFlowProvider, useReactFlow, Node } from 'reactflow';
import PageHeader from './PageHeader';
import { Network, ZoomIn, ZoomOut, Minimize2, Download, Image, FileText as FileTextIcon, User, Repeat } from 'lucide-react';
import { useDataContext, useAppContext } from '../context/AppContext';
import { buildOrganigrammeLayout } from '../utils/organigramme';
import OrganigrammeFlow from './OrganigrammeFlow';
import type { Entite, Poste, Personne } from '../types';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

interface OrganigrammePageProps {
    onShowRelations: (entity: any, entityType: string) => void;
}

const Toolbar: React.FC<{
    onExportPNG: () => void;
    onExportPDF: () => void;
    onFindMe: () => void;
    onToggleLayout: () => void;
}> = ({ onExportPNG, onExportPDF, onFindMe, onToggleLayout }) => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    return (
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border flex items-center gap-2">
            <button onClick={() => zoomIn()} title="Zoom avant" className="p-2 hover:bg-gray-100 rounded-md"><ZoomIn className="h-5 w-5"/></button>
            <button onClick={() => zoomOut()} title="Zoom arrière" className="p-2 hover:bg-gray-100 rounded-md"><ZoomOut className="h-5 w-5"/></button>
            <button onClick={() => fitView({ duration: 500 })} title="Ajuster à la vue" className="p-2 hover:bg-gray-100 rounded-md"><Minimize2 className="h-5 w-5"/></button>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <button onClick={onFindMe} title="Me retrouver" className="p-2 hover:bg-gray-100 rounded-md"><User className="h-5 w-5 text-indigo-600"/></button>
            <button onClick={onToggleLayout} title="Changer l'orientation" className="p-2 hover:bg-gray-100 rounded-md">
                <Repeat className="h-5 w-5 text-teal-600"/>
            </button>
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

const OrganigrammePageContent: React.FC<OrganigrammePageProps> = ({ onShowRelations }) => {
    const { data } = useDataContext();
    const { user } = useAppContext();
    const { entites, postes, personnes } = data as { entites: Entite[], postes: Poste[], personnes: Personne[] };
    
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
    const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');
    const { setCenter, zoomTo, getNodes, fitView } = useReactFlow();

    const toggleNode = useCallback((nodeId: string) => {
        setCollapsedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
        setTimeout(() => fitView({ duration: 500 }), 100);
    }, [fitView]);

    const { nodes, edges } = useMemo(
        () => buildOrganigrammeLayout(entites, postes, personnes, layoutDirection, collapsedNodes, toggleNode),
        [entites, postes, personnes, layoutDirection, collapsedNodes, toggleNode]
    );

    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        const item = node.data.item;
        // Check if item has 'type' property to distinguish Entite from Poste
        const entityType = 'type' in item ? 'entites' : 'postes';
        onShowRelations(item, entityType);
    }, [onShowRelations]);

    const handleExport = (format: 'png' | 'pdf') => {
        const flowElement = document.querySelector('.react-flow__viewport');
        if (!flowElement) {
            alert("Erreur: L'élément de l'organigramme n'a pas été trouvé.");
            return;
        }

        htmlToImage.toPng(flowElement as HTMLElement, { backgroundColor: '#f1f5f9' })
            .then((dataUrl) => {
                if (format === 'png') {
                    const link = document.createElement('a');
                    link.download = 'organigramme.png';
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
                    pdf.save('organigramme.pdf');
                }
            })
            .catch((err) => {
                console.error("Erreur lors de l'export de l'image:", err);
                alert("Une erreur est survenue lors de l'exportation.");
            });
    };
    
    const handleFindMe = useCallback(() => {
        const allNodes = getNodes();
        const userPosteNode = allNodes.find(node => {
            const item = node.data.item;
            return !('type' in item) && (item as Poste).occupantsIds.includes(user.id);
        });

        if (userPosteNode) {
            const x = userPosteNode.position.x + (userPosteNode.width || 0) / 2;
            const y = userPosteNode.position.y + (userPosteNode.height || 0) / 2;
            setCenter(x, y, { duration: 800, zoom: 1.2 });
        } else {
            alert("Votre poste n'a pas été trouvé dans l'organigramme.");
        }
    }, [user.id, getNodes, setCenter]);
    
    const handleToggleLayout = () => {
        setLayoutDirection(prev => (prev === 'TB' ? 'LR' : 'TB'));
    };

    return (
        <div className="flex-grow bg-gray-50 relative">
            {nodes.length > 0 ? (
                <>
                    <OrganigrammeFlow nodes={nodes} edges={edges} onNodeClick={handleNodeClick} />
                    <Toolbar 
                        onExportPNG={() => handleExport('png')} 
                        onExportPDF={() => handleExport('pdf')}
                        onFindMe={handleFindMe}
                        onToggleLayout={handleToggleLayout}
                    />
                </>
            ) : (
                <div className="flex h-full items-center justify-center text-center">
                    <div>
                        <Network className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700">Aucune donnée à afficher</h2>
                        <p className="text-gray-500 mt-2">Veuillez ajouter des entités et des postes pour construire l'organigramme.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const OrganigrammePage: React.FC<OrganigrammePageProps> = (props) => {
    return (
        <div className="flex flex-col h-full">
            <PageHeader
                title="Organigramme"
                icon={Network}
                description="Explorez la structure interactive de votre organisation."
            />
            <ReactFlowProvider>
                <OrganigrammePageContent {...props} />
            </ReactFlowProvider>
        </div>
    );
};

export default OrganigrammePage;
