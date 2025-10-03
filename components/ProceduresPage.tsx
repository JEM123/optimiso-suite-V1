




import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useDataContext, useAppContext } from '../context/AppContext';
import type { Procedure, EtapeProcedure, ProcedureLien, Personne, Poste, Tache } from '../types';
import { Plus, Search, Trash2, Edit, Workflow, ChevronLeft, Menu, CheckCircle, Link as LinkIcon, BarChart, AlertTriangle, X, Rocket } from 'lucide-react';
import { ReactFlowProvider, useNodesState, useEdgesState, useReactFlow, applyNodeChanges, type OnNodesChange, type OnEdgesChange, type OnConnect, type Node, type Edge, type Connection, type NodePositionChange } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import ProcedureFormModal from './ProcedureFormModal';
import ProcedureFlow from './ProcedureFlow';
import PageHeader from './PageHeader';
import ProcedureStepDetailPanel from './ProcedureStepDetailPanel';
import ObjectPalette from './ObjectPalette';
import LaunchProcedureModal from './LaunchProcedureModal';

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

const validateProcedure = (procedure: Procedure): string[] => {
    const issues: string[] = [];
    const { etapes, liens } = procedure;

    if (etapes.length === 0) {
        issues.push("Alerte : Le diagramme est vide.");
        return issues;
    }

    const startNodes = etapes.filter(e => e.type === 'start');
    if (startNodes.length === 0) {
        issues.push("Erreur : Aucun point de départ ('start') n'a été trouvé.");
    }
    if (startNodes.length > 1) {
        issues.push("Alerte : Plusieurs points de départ ('start') ont été trouvés.");
    }

    const endNodes = etapes.filter(e => e.type === 'end');
    if (endNodes.length === 0) {
        issues.push("Alerte : Aucun point de fin ('end') n'a été trouvé.");
    }
    
    etapes.forEach(etape => {
        const hasIncoming = liens.some(l => l.target === etape.id);
        const hasOutgoing = liens.some(l => l.source === etape.id);

        if (etape.type === 'start' && hasIncoming) {
             issues.push(`Alerte : Le point de départ '${etape.libelle}' ne devrait pas avoir de connexion entrante.`);
        }
        if (etape.type === 'start' && !hasOutgoing) {
            issues.push(`Alerte : Le point de départ '${etape.libelle}' n'a pas de sortie.`);
        }

        if (etape.type === 'end' && hasOutgoing) {
             issues.push(`Alerte : Le point de fin '${etape.libelle}' ne devrait pas avoir de connexion sortante.`);
        }
        if (etape.type === 'end' && !hasIncoming) {
            issues.push(`Alerte : Le point de fin '${etape.libelle}' n'est jamais atteint.`);
        }
        
        if (etape.type === 'step' || etape.type === 'decision') {
            if (!hasIncoming && !startNodes.some(start => liens.some(l => l.source === start.id && l.target === etape.id))) {
                 if (!liens.some(l => l.target === etape.id)) {
                    issues.push(`Alerte : L'étape '${etape.libelle}' n'a pas d'entrée.`);
                 }
            }
        }
        
        if (etape.type === 'step') {
            if (!hasOutgoing) {
                issues.push(`Alerte : L'étape '${etape.libelle}' n'a pas de sortie.`);
            }
        }
        
        if (etape.type === 'decision') {
            const outgoing = liens.filter(l => l.source === etape.id);
            if (outgoing.length === 0) {
                 issues.push(`Alerte : La décision '${etape.libelle}' n'a pas de sortie.`);
            }
            if (!outgoing.some(l => l.sourceHandle === 'yes')) {
                issues.push(`Alerte : La décision '${etape.libelle}' n'a pas de branche 'Oui'.`);
            }
            if (!outgoing.some(l => l.sourceHandle === 'no')) {
                issues.push(`Alerte : La décision '${etape.libelle}' n'a pas de branche 'Non'.`);
            }
        }
    });

    return issues;
};

const ValidationResultsPanel: React.FC<{ issues: string[]; onClose: () => void }> = ({ issues, onClose }) => {
    const hasIssues = issues.length > 0;
    
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-lg shadow-lg border z-20 animate-fade-in-up">
            <div className={`p-3 flex justify-between items-center border-b ${hasIssues ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                <div className={`flex items-center gap-2 font-semibold ${hasIssues ? 'text-yellow-800' : 'text-green-800'}`}>
                    {hasIssues ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                    <span>{hasIssues ? `Validation terminée avec ${issues.length} alerte(s)` : 'Validation réussie'}</span>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X className="h-5 w-5 text-gray-600" /></button>
            </div>
            <div className="p-4 max-h-40 overflow-y-auto">
                {hasIssues ? (
                    <ul className="space-y-2 text-sm text-gray-700">
                        {issues.map((issue, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-yellow-600 font-bold">&bull;</span>
                                <span>{issue}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-green-700">Aucun problème de logique détecté dans le diagramme.</p>
                )}
            </div>
        </div>
    );
};


const ProceduresPageContent: React.FC<ProceduresPageProps & { setActiveModule: (id: string) => void }> = ({ onShowRelations, onShowValidation, onShowImpactAnalysis, setActiveModule }) => {
    const { data, actions } = useDataContext();
    const { user } = useAppContext();
    const { procedures, postes } = data as { procedures: Procedure[], postes: Poste[] };

    const [selectedProcedureId, setSelectedProcedureId] = useState<string | null>(procedures[0]?.id || null);
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcModalOpen, setProcModalOpen] = useState(false);
    const [editingProcedure, setEditingProcedure] = useState<Partial<Procedure> | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [validationIssues, setValidationIssues] = useState<string[] | null>(null);
    const [launchingProc, setLaunchingProc] = useState<Procedure | null>(null);
    
    const prevProcIdRef = useRef<string | null>(null);
    const { project, fitView, getNodes } = useReactFlow();

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
                setValidationIssues(null); // Clear validation on procedure change
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
    
    const handleNodeDragStop = useCallback((event: React.MouseEvent, draggedNode: Node<EtapeProcedure>) => {
        if (!selectedProcedureId || !selectedProcedure) return;

        const currentNodes = getNodes();
        const sortedNodes = [...currentNodes].sort((a, b) => a.position.y - b.position.y);
        const etapesMap = new Map(selectedProcedure.etapes.map(e => [e.id, e]));

        const updatedEtapes = sortedNodes.map((node, index) => {
            const originalEtape = etapesMap.get(node.id);
            if (originalEtape) {
                return { ...originalEtape, ordre: index + 1, position: node.position };
            }
            return null;
        }).filter((e): e is EtapeProcedure => e !== null);

        updateProcedureState(selectedProcedureId, proc => ({ ...proc, etapes: updatedEtapes }));
    }, [selectedProcedureId, selectedProcedure, getNodes, updateProcedureState]);

    const onConnect = useCallback((params: Connection) => {
        if (!selectedProcedureId || !params.source || !params.target) return;
        const newLink: ProcedureLien = {
            id: `e${params.source}-${params.target}`,
            source: params.source,
            target: params.target,
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle,
        };
        if (params.sourceHandle === 'yes') newLink.label = 'Oui';
        if (params.sourceHandle === 'no') newLink.label = 'Non';
        updateProcedureState(selectedProcedureId, p => ({...p, liens: [...p.liens, newLink]}));
    }, [selectedProcedureId, updateProcedureState]);
    
    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        if (!selectedProcedureId || !selectedProcedure) return;
        const position = project({ x: event.clientX, y: event.clientY });
    
        const toolboxType = event.dataTransfer.getData('application/reactflow');
        if (toolboxType) {
            const newStep: EtapeProcedure = {
                id: `${toolboxType}-${Date.now()}`,
                ordre: (selectedProcedure.etapes.length || 0) + 1,
                libelle: `Nouvelle ${toolboxType}`,
                position,
                type: toolboxType as EtapeProcedure['type'],
            };
            updateProcedureState(selectedProcedureId, p => ({ ...p, etapes: [...p.etapes, newStep] }));
            return;
        }
    
        const objectPayload = event.dataTransfer.getData('application/optimiso-object');
        if (objectPayload) {
            try {
                const { type: objectType, id: objectId } = JSON.parse(objectPayload);
                const reactFlowNodes = getNodes();
                const targetNode = reactFlowNodes.find(node =>
                    node.positionAbsolute && node.width && node.height &&
                    position.x >= node.positionAbsolute.x &&
                    position.x <= node.positionAbsolute.x + node.width &&
                    position.y >= node.positionAbsolute.y &&
                    position.y <= node.positionAbsolute.y + node.height
                );
    
                if (targetNode) {
                    updateProcedureState(selectedProcedureId, proc => {
                        const updatedEtapes = proc.etapes.map(etape => {
                            if (etape.id === targetNode.id) {
                                const newEtape = { ...etape };
                                if (objectType === 'document') {
                                    const docIds = new Set(newEtape.documentIds || []);
                                    docIds.add(objectId);
                                    newEtape.documentIds = Array.from(docIds);
                                } else if (objectType === 'risk') {
                                    const riskIds = new Set(newEtape.risqueIds || []);
                                    riskIds.add(objectId);
                                    newEtape.risqueIds = Array.from(riskIds);
                                }
                                return newEtape;
                            }
                            return etape;
                        });
                        return { ...proc, etapes: updatedEtapes };
                    });
                }
            } catch (e) { console.error("Failed to parse dropped object payload", e); }
        }
    }, [project, getNodes, selectedProcedureId, selectedProcedure, updateProcedureState]);

    const handleSaveStep = useCallback((updatedStep: EtapeProcedure) => {
        if (!selectedProcedureId) return;
        updateProcedureState(selectedProcedureId, p => ({ ...p, etapes: p.etapes.map(e => e.id === updatedStep.id ? updatedStep : e) }));
        setSelectedStepId(updatedStep.id);
    }, [selectedProcedureId, updateProcedureState]);

    const handleOpenProcModal = (proc?: Procedure) => { setEditingProcedure(proc || newProcedureTemplate()); setProcModalOpen(true); };
    
    const handleSaveProcedure = (procToSave: Procedure) => {
        actions.saveProcedure(procToSave).then(() => {
            if (!procToSave.id) { } 
            else { setSelectedProcedureId(procToSave.id); }
        });
        setProcModalOpen(false);
    };

    const handleDeleteProcedure = (procId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette procédure ?")) {
            actions.deleteProcedure(procId);
            if (selectedProcedureId === procId) setSelectedProcedureId(procedures.length > 1 ? procedures[0].id : null);
        }
    };

    const handleValidateDiagram = () => {
        if (selectedProcedure) {
            const issues = validateProcedure(selectedProcedure);
            setValidationIssues(issues);
        }
    };

    const handleLaunch = async (proc: Procedure, instanceName: string, targetDate: Date) => {
        const instanceId = uuidv4();
        const mainResponsablePoste = proc.acteursPosteIds.length > 0 ? postes.find(p => p.id === proc.acteursPosteIds[0]) : null;
        const defaultAssignee = mainResponsablePoste?.occupantsIds[0] || user.id;

        const etapesToCreateTasksFor = proc.etapes.filter(etape => etape.type !== 'start' && etape.type !== 'end');
        
        // 1. Create a task for each step and map etape.id to task.id
        const etapeIdToTaskIdMap = new Map<string, string>();
        const tasksToCreate: Tache[] = etapesToCreateTasksFor.map(etape => {
            const taskId = uuidv4();
            etapeIdToTaskIdMap.set(etape.id, taskId);
            return {
                id: taskId,
                titre: etape.libelle,
                description: `Étape de la procédure "${proc.nom}". Instance: ${instanceName}.`,
                sourceModule: 'Processus',
                sourceId: proc.id,
                assigneA: defaultAssignee,
                createur: user.id,
                priorite: 'Normale',
                statut: 'A faire', // Default, will be updated
                dateCreation: new Date(),
                dateEcheance: targetDate,
                procedureInstanceId: instanceId,
                procedureInstanceName: instanceName,
                predecessorIds: [],
            };
        });
    
        const taskIdToTaskMap = new Map(tasksToCreate.map(t => [t.id, t]));
    
        // 2. Build dependency graph from procedure links
        proc.liens.forEach(lien => {
            const sourceEtapeId = lien.source;
            const targetEtapeId = lien.target;
    
            const targetTaskId = etapeIdToTaskIdMap.get(targetEtapeId);
            if (targetTaskId) {
                const targetTask = taskIdToTaskMap.get(targetTaskId);
                if (targetTask) {
                    const sourceTaskId = etapeIdToTaskIdMap.get(sourceEtapeId);
                    if (sourceTaskId) {
                        targetTask.predecessorIds?.push(sourceTaskId);
                    }
                }
            }
        });
    
        // 3. Set initial status based on dependencies
        tasksToCreate.forEach(task => {
            if (task.predecessorIds && task.predecessorIds.length > 0) {
                task.statut = 'En attente';
            } else {
                task.statut = 'A faire';
            }
        });
        
        // 4. Save all created tasks
        for (const task of tasksToCreate) {
            await actions.saveTache(task);
        }
        
        setLaunchingProc(null);
        alert(`${tasksToCreate.length} tâches ont été créées avec leurs dépendances. Vous allez être redirigé vers le ToDo Manager.`);
        setActiveModule('todo');
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
                                        <button onClick={(e) => { e.stopPropagation(); setLaunchingProc(proc); }} className="p-1 hover:bg-gray-200 rounded-md" title="Lancer la procédure"><Rocket className="h-4 w-4 text-green-600"/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenProcModal(proc)}} className="p-1 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4 text-blue-600"/></button>
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
                <div className="flex-1 flex min-w-0 relative">
                    <div className="flex-1 flex flex-col relative">
                         {selectedProcedure && (
                            <div className="p-2 border-b bg-white flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">{selectedProcedure.nom} - v{selectedProcedure.version}</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleValidateDiagram} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white border hover:bg-gray-50"><CheckCircle className="h-4 w-4 text-green-600"/>Valider le diagramme</button>
                                    <button onClick={() => onShowImpactAnalysis(selectedProcedure, 'procedures')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white border hover:bg-gray-50"><BarChart className="h-4 w-4"/>Analyser l'impact</button>
                                </div>
                            </div>
                        )}
                        <div className="flex-grow">
                            {selectedProcedure ? (
                                <ProcedureFlow nodes={nodes} edges={edges} onNodesChange={handleNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(evt, node) => setSelectedStepId(node.id)} onPaneClick={() => setSelectedStepId(null)} onDrop={onDrop} onNodeDragStop={handleNodeDragStop} />
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
                        {validationIssues !== null && (
                            <ValidationResultsPanel issues={validationIssues} onClose={() => setValidationIssues(null)} />
                        )}
                    </div>
                    {selectedProcedure && <ObjectPalette />}
                    {selectedProcedure && selectedStep && (
                        <ProcedureStepDetailPanel 
                          key={selectedStep.id} 
                          etape={selectedStep} 
                          procedure={selectedProcedure} 
                          onClose={() => setSelectedStepId(null)}
                          onShowRelations={onShowRelations}
                          onSave={handleSaveStep}
                        />
                    )}
                </div>
            </div>
            
            <ProcedureFormModal isOpen={isProcModalOpen} onClose={() => setProcModalOpen(false)} onSave={handleSaveProcedure} procedure={editingProcedure} />
            {launchingProc && <LaunchProcedureModal procedure={launchingProc} onClose={() => setLaunchingProc(null)} onLaunch={handleLaunch} />}
        </div>
    );
};


const ProceduresPage: React.FC<ProceduresPageProps & { setActiveModule: (id: string) => void }> = (props) => (
    <ReactFlowProvider>
        {/* FIX: Replaced prop spreading with explicit prop passing to avoid TypeScript error. */}
        <ProceduresPageContent
            onShowRelations={props.onShowRelations}
            onShowValidation={props.onShowValidation}
            onShowImpactAnalysis={props.onShowImpactAnalysis}
            setActiveModule={props.setActiveModule}
        />
    </ReactFlowProvider>
);

export default ProceduresPage;
