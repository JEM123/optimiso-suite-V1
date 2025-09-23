
import React, { useState, useMemo, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Processus } from '../types';
import { Target, Plus, Search, Filter } from 'lucide-react';
import ProcessusDetailPanel from './ProcessusDetailPanel';
import { ProcessusFormModal } from './ProcessusFormModal';
import { ReactFlowProvider } from 'reactflow';
import ProcessusMap from './ProcessusMap';
import PageHeader from './PageHeader';
import Button from './ui/Button';

interface ProcessusPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
}

const ProcessusPage: React.FC<ProcessusPageProps> = ({ onShowRelations }) => {
    const { data, actions } = useDataContext();
    const { processus } = data as { processus: Processus[] };

    const [selectedProcessus, setSelectedProcessus] = useState<Processus | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProcessus, setEditingProcessus] = useState<Partial<Processus> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelectedProcessus(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleOpenModal = (proc?: Partial<Processus>) => {
        setEditingProcessus(proc || { niveau: 'L0', type: 'Métier' });
        setIsModalOpen(true);
    };

    const handleAddSub = (parent: Processus) => {
        const nextLevel = `L${parseInt(parent.niveau.substring(1)) + 1}` as Processus['niveau'];
        setEditingProcessus({ 
            parentId: parent.id, 
            niveau: nextLevel, 
            type: parent.type,
            missionId: parent.missionId // Inherit mission from parent
        });
        setIsModalOpen(true);
    };

    const handleSave = (proc: Processus) => {
        actions.saveProcessus(proc).then(() => {
            const savedProc = (data.processus as Processus[]).find(p => p.id === proc.id) || proc;
            if (proc.id && selectedProcessus?.id === proc.id) {
                setSelectedProcessus(savedProc);
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
    
    useEffect(() => {
        if (!selectedProcessus && processus.length > 0) {
            const rootNode = processus.find(p => !p.parentId);
            setSelectedProcessus(rootNode || processus[0]);
        }
    }, [processus, selectedProcessus]);

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg border">
             <PageHeader
                title="Cartographie des Processus"
                icon={Target}
                description="Visualisez, modifiez et explorez la hiérarchie de vos processus."
                actions={[{
                    label: "Nouveau Processus Racine",
                    icon: Plus,
                    onClick: () => handleOpenModal(),
                    variant: 'primary'
                }]}
            />
            <div className="p-2 border-b bg-white flex items-center gap-4">
                 <div className="relative flex-grow max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un processus..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="pl-8 w-full border rounded-md py-1.5 text-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select 
                        value={filterType} 
                        onChange={e => setFilterType(e.target.value)} 
                        className="border rounded-md py-1.5 px-2 text-sm bg-white"
                    >
                        <option value="all">Tous les types</option>
                        <option value="Métier">Métier</option>
                        <option value="Support">Support</option>
                        <option value="Management">Management</option>
                    </select>
                </div>
            </div>
            <div className="flex-1 flex min-w-0 relative">
                 {selectedProcessus && <div className="absolute inset-0 bg-black/10 z-10" onClick={() => setSelectedProcessus(null)} />}
                <div className="flex-1 h-full">
                   <ReactFlowProvider>
                       <ProcessusMap
                           processus={processus}
                           onNodeClick={setSelectedProcessus}
                           onEditNode={handleOpenModal}
                           onAddSubNode={handleAddSub}
                           onDeleteNode={handleDelete}
                           onShowRelations={onShowRelations}
                           selectedNodeId={selectedProcessus?.id}
                           searchTerm={searchTerm}
                           filterType={filterType}
                       />
                   </ReactFlowProvider>
                </div>
                 <div className={`absolute top-0 right-0 h-full transition-transform duration-300 ease-in-out z-20 ${selectedProcessus ? 'translate-x-0' : 'translate-x-full'}`}>
                    {selectedProcessus && (
                        <ProcessusDetailPanel 
                            processus={selectedProcessus} 
                            onClose={() => setSelectedProcessus(null)} 
                            onEdit={handleOpenModal} 
                            onShowRelations={onShowRelations}
                            onNavigate={setSelectedProcessus}
                        />
                    )}
                </div>
            </div>
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
