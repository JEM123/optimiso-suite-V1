import React, { useState, useMemo } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Processus } from '../types';
import { Target, Plus, ChevronDown, Edit, Trash2, Workflow } from 'lucide-react';
import ProcessusDetailPanel from './ProcessusDetailPanel';
import ProcessusFormModal from './ProcessusFormModal';

const buildTree = (items: Processus[], parentId?: string): (Processus & { children: any[] })[] => {
  return items
    .filter(item => item.parentId === parentId)
    .map(item => ({ ...item, children: buildTree(items, item.id) }));
};

const ProcessusNode: React.FC<{ 
    node: Processus & { children: any[] }, 
    onSelect: (p: Processus) => void, 
    onEdit: (p: Processus) => void,
    onAddSub: (p: Processus) => void,
    selectedId?: string 
}> = ({ node, onSelect, onEdit, onAddSub, selectedId }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const { data } = useDataContext();
    const proprietaire = data.postes.find((p: any) => p.id === node.proprietaireProcessusId);

    const typeColors: Record<Processus['type'], string> = {
        'Management': 'border-purple-500',
        'Métier': 'border-blue-500',
        'Support': 'border-green-500',
    };

    return (
        <div className="pl-4">
            <div className="flex items-center my-1 group">
                <div 
                    onClick={() => onSelect(node)} 
                    className={`flex-grow p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 flex items-center ${typeColors[node.type]} ${selectedId === node.id ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-white'}`}
                >
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{node.nom}</p>
                        <p className="text-xs text-gray-500">{node.reference} | {proprietaire?.intitule || 'N/A'}</p>
                    </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white/50 backdrop-blur-sm rounded-md p-1 space-x-1">
                        {node.niveau !== 'L3' && <button onClick={(e) => { e.stopPropagation(); onAddSub(node); }} title="Ajouter sous-processus" className="p-1 hover:bg-gray-200 rounded"><Plus className="h-4 w-4 text-green-600"/></button>}
                        <button onClick={(e) => { e.stopPropagation(); onEdit(node); }} title="Modifier" className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                    </div>
                    {node.children.length > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="ml-2 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                        </button>
                    )}
                </div>
            </div>
            {isExpanded && node.children.length > 0 && (
                <div className="border-l-2 border-gray-200 ml-4">
                    {node.children.map(child => <ProcessusNode key={child.id} node={child} onSelect={onSelect} onEdit={onEdit} onAddSub={onAddSub} selectedId={selectedId} />)}
                </div>
            )}
        </div>
    );
};

const ProcessusPage: React.FC = () => {
    const { data, actions } = useDataContext();
    const { processus } = data as { processus: Processus[] };

    const [selectedProcessus, setSelectedProcessus] = useState<Processus | null>(processus.length > 0 ? processus[0] : null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProcessus, setEditingProcessus] = useState<Partial<Processus> | null>(null);
    
    const processusTree = useMemo(() => buildTree(processus), [processus]);

    const handleOpenModal = (proc?: Partial<Processus>) => {
        setEditingProcessus(proc || { niveau: 'L0' });
        setIsModalOpen(true);
    };

    const handleAddSub = (parent: Processus) => {
        const nextLevel = `L${parseInt(parent.niveau.substring(1)) + 1}` as Processus['niveau'];
        setEditingProcessus({ parentId: parent.id, niveau: nextLevel, type: parent.type });
        setIsModalOpen(true);
    };

    const handleSave = (proc: Processus) => {
        actions.saveProcessus(proc);
        setIsModalOpen(false);
    };

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
                            <Plus className="h-4 w-4" /><span>Nouveau Processus (L0)</span>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    {processusTree.map(rootNode => (
                        <ProcessusNode 
                            key={rootNode.id} 
                            node={rootNode} 
                            onSelect={setSelectedProcessus} 
                            onEdit={handleOpenModal}
                            onAddSub={handleAddSub}
                            selectedId={selectedProcessus?.id} 
                        />
                    ))}
                </div>
            </div>
            {selectedProcessus && (
                <ProcessusDetailPanel 
                    processus={selectedProcessus} 
                    onClose={() => setSelectedProcessus(null)} 
                    onEdit={handleOpenModal} 
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
