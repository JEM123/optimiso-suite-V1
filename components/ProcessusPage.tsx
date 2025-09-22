import React, { useState, useMemo, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Processus } from '../types';
import { Target, Plus } from 'lucide-react';
import ProcessusDetailPanel from './ProcessusDetailPanel';
import { ProcessusFormModal } from './ProcessusFormModal';
import { ReactFlowProvider } from 'reactflow';
import ProcessusMap from './ProcessusMap';

interface ProcessusPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
}

const ProcessusPage: React.FC<ProcessusPageProps> = ({ onShowRelations }) => {
    const { data, actions } = useDataContext();
    const { processus } = data as { processus: Processus[] };

    const [selectedProcessus, setSelectedProcessus] = useState<Processus | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProcessus, setEditingProcessus] = useState<Partial<Processus> | null>(null);
    
    const handleOpenModal = (proc?: Partial<Processus>) => {
        setEditingProcessus(proc || { niveau: 'L0', type: 'Métier' });
        setIsModalOpen(true);
    };

    const handleAddSub = (parent: Processus) => {
        const nextLevel = `L${parseInt(parent.niveau.substring(1)) + 1}` as Processus['niveau'];
        setEditingProcessus({ parentId: parent.id, niveau: nextLevel, type: parent.type });
        setIsModalOpen(true);
    };

    const handleSave = (proc: Processus) => {
        actions.saveProcessus(proc).then(() => {
            if (proc.id && selectedProcessus?.id === proc.id) {
                 // FIX: Corrected logic to update the selected process. The object from the form (`proc`) is the most up-to-date version.
                 setSelectedProcessus(proc);
            }
        });
        setIsModalOpen(false);
    };

    const handleDelete = (proc: Processus) => {
        const children = (data.processus as Processus[]).filter(p => p.parentId === proc.id);
        if (children.length > 0) {
            alert("Veuillez d'abord supprimer ou réaffecter les sous-processus.");
            return;
        }
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le processus "${proc.nom}" ?`)) {
            actions.deleteProcessus(proc.id);
            if(selectedProcessus?.id === proc.id) setSelectedProcessus(null);
        }
    };
    
    // Select the first root node on initial load if none is selected
    useEffect(() => {
        if (!selectedProcessus && processus.length > 0) {
            const rootNode = processus.find(p => !p.parentId);
            setSelectedProcessus(rootNode || processus[0]);
        }
    }, [processus, selectedProcessus]);

    return (
        <div className="flex h-[calc(100vh-150px)]">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b bg-white flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                        <Target className="h-8 w-8 text-gray-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Cartographie des Processus</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium">
                            <Plus className="h-4 w-4" /><span>Nouveau Processus (Racine)</span>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto bg-gray-50 relative">
                   <ReactFlowProvider>
                       <ProcessusMap
                           processus={processus}
                           onNodeClick={setSelectedProcessus}
                           onEditNode={handleOpenModal}
                           onAddSubNode={handleAddSub}
                           onDeleteNode={handleDelete}
                           onShowRelations={onShowRelations}
                           selectedNodeId={selectedProcessus?.id}
                       />
                   </ReactFlowProvider>
                </div>
            </div>
            {selectedProcessus && (
                <ProcessusDetailPanel 
                    processus={selectedProcessus} 
                    onClose={() => setSelectedProcessus(null)} 
                    onEdit={handleOpenModal} 
                    onShowRelations={onShowRelations}
                />
            )}
            <ProcessusFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                processus={editingProcessus} 
            />
        </div>
    );
};

export default ProcessusPage;