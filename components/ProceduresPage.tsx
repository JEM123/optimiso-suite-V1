import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Procedure, EtapeProcedure, ProcedureLien } from '../types';
import { Plus, Search, Trash2, Edit, Workflow, ChevronLeft, Menu, CheckCircle, Link as LinkIcon, BarChart } from 'lucide-react';
import { ReactFlowProvider, useNodesState, useEdgesState, useReactFlow, applyNodeChanges, type OnNodesChange, type OnEdgesChange, type OnConnect, type Node, type Edge, type Connection, type NodePositionChange } from 'reactflow';
import ProcedureFormModal from './ProcedureFormModal';
import ProcedureFlow from './ProcedureFlow';
import PageHeader from './PageHeader';
import ProcedureStepDetailPanel from './ProcedureStepDetailPanel';

const PROC_STATUS_COLORS: Record<Procedure['statut'], string> = {
    'brouillon': 'bg-gray-200 text-gray-800', 'en_cours': 'bg-yellow-100 text-yellow-800',
    'valide': 'bg-green-100 text-green-800', 'archive': 'bg-red-100 text-red-800',
    'à_créer': 'bg-cyan-100 text-cyan-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800',
    'gelé': 'bg-purple-100 text-purple-800', 'figé': 'bg-indigo-100 text-indigo-800',
    'planifié': 'bg-blue-100 text-blue-800', 'terminé': 'bg-green-100 text-green-800',
    'non-conforme': 'bg-red-200 text-red-900', 'clôturé': 'bg-gray-300 text-gray-800',
    'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-200 text-red-900',
    'en_validation': 'bg-yellow-100 text-yellow-800',
    'publie': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800',
};

const newProcedureTemplate = (): Partial<Procedure> => ({
    nom: 'Nouvelle Procédure',
    reference: `PROC-${Date.now().toString().slice(-4)}`,
    statut: 'brouillon',
    version: '1.0',
    actif: true,
    etapes: [],
    liens: [],
    auteurId: 'pers-1',
    dateCreation: new Date(),
    dateModification: new Date(),
    acteursPosteIds: [],
    documentIds: [],
    risqueIds: [],
    controleIds: [],
});

interface ProceduresPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
    onShowValidation: (element: Procedure) => void;
    onShowImpactAnalysis: (element: any, type: string) => void;
}

const ProceduresPageContent: React.FC<ProceduresPageProps> = ({ onShowRelations, onShowValidation, onShowImpactAnalysis }) => {
    const { data, actions } = useDataContext();
    const { procedures } = data as { procedures: Procedure[] };

    const [selectedProcedureId, setSelectedProcedureId] = useState<string | null>(procedures[0]?.id || null);
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcModalOpen, setProcModalOpen] = useState(false);
    const [editingProcedure, setEditingProcedure] = useState<Partial<Procedure> | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    const prevProcIdRef = useRef<string | null>(null);
    const { screenToFlowPosition, fitView } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const selectedProcedure = useMemo(() => procedures.find(p => p.id === selectedProcedureId), [procedures, selectedProcedureId]);
    const selectedStep = useMemo(() => selectedProcedure?.etapes.find(e => e.id === selectedStepId), [selectedProcedure, selectedStepId]);

    const updateProcedureState = useCallback((procId: string, updater: (proc: Procedure) => Procedure) => {
        const currentProc = procedures.find(p => p.id === procId);
        if (currentProc) {
            const updatedProc = updater(currentProc);
            actions.saveProcedure(updatedProc);
        }
    }, [procedures, actions]);
    
    useEffect(() => {
        if (selectedProcedure) {
            setNodes(selectedProcedure.etapes.map(etape => ({ id: etape.id, type: etape.type, position: etape.position, data: { ...etape } })));
            setEdges(selectedProcedure.liens.map(lien => ({ id: lien.id, source: lien.source, target: lien.target, sourceHandle: lien.sourceHandle, targetHandle: lien.targetHandle, type: 'smoothstep', animated: true, label: lien.label })));
            
            if (prevProcIdRef.current !== selectedProcedure.id) {
                setSelectedStepId(null);
                setTimeout(() => fitView({ padding: 0.2 }), 100);
            }
        } else {
            setNodes([]);
            setEdges([]);
        }
        prevProcIdRef.current = selectedProcedure?.id || null;
    }, [selectedProcedure, setNodes, setEdges, fitView]);

    const handleNodesChange: OnNodesChange = useCallback((changes) => {
        onNodesChange(changes);

        if (!selectedProcedureId) return;

        const positionChanges = changes.filter(
            (change): change is NodePositionChange & { position: { x: number, y: number } } => 
                change.type === 'position' && !!change.position
        );

        if (positionChanges.length > 0) {
            updateProcedureState(selectedProcedureId, (proc) => {
                const updatedEtapes = proc.etapes.map(etape => {
                    const change = positionChanges.find(c => c.id === etape.id);
                    if (change) {
                        return { ...etape, position: change.position };
                    }
                    return etape;
                });
                return { ...proc, etapes: updatedEtapes };
            });
        }
    }, [onNodesChange, selectedProcedureId, updateProcedureState]);

    const onConnect = useCallback((params: Connection) => {
        if (!selectedProcedureId) return;
        const newLink: ProcedureLien = { id: `e${params.source}-${params.target}`, sourceHandle: params.sourceHandle, targetHandle: params.targetHandle, ...params };
        if (params.sourceHandle === 'yes') newLink.label = 'Oui';
        if (params.sourceHandle === 'no') newLink.label = 'Non';
        updateProcedureState(selectedProcedureId, p => ({...p, liens: [...p.liens, newLink]}));
    }, [selectedProcedureId, updateProcedureState]);
    
    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type || !selectedProcedureId || !selectedProcedure) return;

        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const newStep: EtapeProcedure = {
            id: `${type}-${Date.now()}`,
            ordre: (selectedProcedure.etapes.length || 0) + 1,
            libelle: `Nouvelle ${type}`,
            position,
            type: type as EtapeProcedure['type'],
        };
        updateProcedureState(selectedProcedureId, p => ({ ...p, etapes: [...p.etapes, newStep] }));
    }, [screenToFlowPosition, selectedProcedureId, selectedProcedure, updateProcedureState]);

    const handleSaveStep = useCallback((updatedStep: EtapeProcedure) => {
        if (!selectedProcedureId) return;
        updateProcedureState(selectedProcedureId, p => ({ ...p, etapes: p.etapes.map(e => e.id === updatedStep.id ? updatedStep : e) }));
        setSelectedStepId(updatedStep.id); // Keep panel open
    }, [selectedProcedureId, updateProcedureState]);

    const handleOpenProcModal = (proc?: Procedure) => { setEditingProcedure(proc || newProcedureTemplate()); setProcModalOpen(true); };
    
    const handleSaveProcedure = (procToSave: Procedure) => {
        actions.saveProcedure(procToSave).then(() => {
            if (!procToSave.id) {
                // This is a new procedure, we need to find its new ID to select it.
                // A better approach would be for the action to return the new item.
                // For now, we'll just not select it.
            } else {
                setSelectedProcedureId(procToSave.id);
            }
        });
        setProcModalOpen(false);
    };

    const handleDeleteProcedure = (procId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette procédure ?")) {
            actions.deleteProcedure(procId);
            if (selectedProcedureId === procId) setSelectedProcedureId(procedures.length > 1 ? procedures[0].id : null);
        }
    };

    const filteredProcedures = useMemo(() => procedures.filter(p => p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || p.reference.toLowerCase().includes(searchTerm.toLowerCase())), [procedures, searchTerm]);

    return (
        <div className="flex h-full">
            <div className={`bg-white border-r transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-16'} flex flex-col`}>
                <div className="p-2 border-b flex items-center justify-between">
                    {isSidebarOpen && <h2 className="text-lg font-semibold px-2">Procédures</h2>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-md">
                        {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
                {isSidebarOpen && <div className="p-2 border-b">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 w-full border rounded-md py-1 text-sm"/>
                    </div>
                </div>}
                 <div className="flex-1 overflow-y-auto">
                    {filteredProcedures.map(proc => (
                        <div key={proc.id} onClick={() => setSelectedProcedureId(proc.id)} className={`p-3 border-b cursor-pointer group relative ${selectedProcedureId === proc.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                            {isSidebarOpen ? (
                                <>
                                    <h3 className="font-semibold text-sm text-gray-800">{proc.nom}</h3>
                                    <p className="text-xs text-gray-500">{proc.reference}</p>
                                    <span className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${PROC_STATUS_COLORS[proc.statut]}`}>{proc.statut.replace(/_/g, ' ')}</span>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                                        {proc.validationInstanceId && (
                                            <button onClick={(e) => { e.stopPropagation(); onShowValidation(proc); }} className="p-1 hover:bg-gray-200 rounded-md" title="Voir flux de validation">
                                                <CheckCircle className="h-4 w-4 text-green-600"/>
                                            </button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenProcModal(proc)}} className="p-1 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4 text-blue-600"/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteProcedure(proc.id)}} className="p-1 hover:bg-gray-200 rounded-md"><Trash2 className="h-4 w-4 text-red-600"/></button>
                                    </div>
                                </>
                            ) : (
                                <div title={proc.nom}><Workflow className="h-5 w-5 mx-auto text-gray-600"/></div>
                            )}
                        </div>
                    ))}
                </div>
                {isSidebarOpen && <div className="p-2 border-t"><button onClick={() => handleOpenProcModal()} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium"><Plus className="h-4 w-4" /><span>Nouvelle</span></button></div>}
            </div>
            
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 flex min-w-0">
                    <div className="flex-1 flex flex-col relative">
                         {selectedProcedure && (
                            <div className="p-2 border-b bg-white flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">{selectedProcedure.nom} - v{selectedProcedure.version}</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onShowImpactAnalysis(selectedProcedure, 'procedures')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white border hover:bg-gray-50"><BarChart className="h-4 w-4"/>Analyser l'impact</button>
                                    <button onClick={() => onShowRelations(selectedProcedure, 'procedures')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white border hover:bg-gray-50"><LinkIcon className="h-4 w-4"/>Explorer les relations</button>
                                </div>
                            </div>
                        )}
                        <div className="flex-grow">
                            {selectedProcedure ? (
                                <ProcedureFlow nodes={nodes} edges={edges} onNodesChange={handleNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(evt, node) => setSelectedStepId(node.id)} onPaneClick={() => setSelectedStepId(null)} onDrop={onDrop} />
                            ) : (
                                <div className="flex h-full items-center justify-center text-center p-4 bg-gray-50">
                                    <div>
                                        <Workflow className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune procédure sélectionnée</h3>
                                        <p className="mt-1 text-sm text-gray-500">Sélectionnez ou créez une procédure pour commencer.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {selectedProcedure && selectedStep && (
                        <ProcedureStepDetailPanel key={selectedStep.id} etape={selectedStep} procedure={selectedProcedure} onClose={() => setSelectedStepId(null)} onShowRelations={onShowRelations} onSave={handleSaveStep} />
                    )}
                </div>
            </div>
            <ProcedureFormModal isOpen={isProcModalOpen} onClose={() => setProcModalOpen(false)} onSave={handleSaveProcedure} procedure={editingProcedure} />
        </div>
    );
}

const ProceduresPage: React.FC<ProceduresPageProps> = ({ onShowRelations, onShowValidation, onShowImpactAnalysis }) => {
    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg border">
            <PageHeader title="Procédures" icon={Workflow} description="Modélisez et visualisez les flux de travail de votre organisation."/>
            <div className="flex-grow h-[calc(100%-80px)]">
                 <ReactFlowProvider>
                    <ProceduresPageContent onShowRelations={onShowRelations} onShowValidation={onShowValidation} onShowImpactAnalysis={onShowImpactAnalysis} />
                 </ReactFlowProvider>
            </div>
        </div>
    );
};

export default ProceduresPage;
