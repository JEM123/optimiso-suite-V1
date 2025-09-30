
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { Entite } from '../types';
import { Users, Briefcase, Link as LinkIcon, Edit, Plus, Building, Search, Filter, Trash2, ChevronDown, List, Eye, ArrowUpDown, Network, ChevronRight } from 'lucide-react';
import { useDataContext } from '../context/AppContext';
import { EntiteFormModal } from './EntiteFormModal';
import EntityDetailPanel from './EntityDetailPanel';
import EntityFichePage from './EntityFichePage';

const ENTITY_STATUS_COLORS: Record<Entite['statut'], string> = { 'brouillon': 'bg-gray-100 text-gray-800', 'en_cours': 'bg-yellow-100 text-yellow-800', 'valide': 'bg-green-100 text-green-800', 'archive': 'bg-red-100 text-red-800', 'à_créer': 'bg-blue-100 text-blue-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800', 'gelé': 'bg-purple-100 text-purple-800', 'figé': 'bg-indigo-100 text-indigo-800', 'planifié': 'bg-cyan-100 text-cyan-800', 'terminé': 'bg-green-100 text-green-800', 'non-conforme': 'bg-red-200 text-red-900', 'clôturé': 'bg-gray-300 text-gray-800', 'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-200 text-red-900', 'en_validation': 'bg-yellow-100 text-yellow-800', 'publie': 'bg-green-100 text-green-800', 'rejete': 'bg-red-100 text-red-800', };

const ENTITY_TYPE_ICONS: Record<Entite['type'], React.ElementType> = { 'Direction': Building, 'Division': Building, 'Service': Building, 'Équipe': Users, 'Autre': Building };

interface EntitiesPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
}

const EntityRow: React.FC<{
    entity: Entite;
    level: number;
    onRowClick: (e: Entite) => void;
    selectedEntityId: string | null;
    hasChildren: boolean;
    isExpanded: boolean;
    onToggleExpand: (id: string) => void;
    displayMode: 'flat' | 'tree';
}> = ({ entity, level, onRowClick, selectedEntityId, hasChildren, isExpanded, onToggleExpand, displayMode }) => {
    
    const Icon = ENTITY_TYPE_ICONS[entity.type] || Building;

    return (
        <tr onClick={() => onRowClick(entity)} className={`cursor-pointer ${selectedEntityId === entity.id ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}>
            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                <div className="flex items-center" style={{ paddingLeft: `${displayMode === 'tree' ? level * 24 : 0}px` }}>
                    {displayMode === 'tree' && hasChildren && (
                        <button onClick={(e) => { e.stopPropagation(); onToggleExpand(entity.id); }} className="mr-2 p-0.5 rounded hover:bg-gray-200">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                    )}
                    {displayMode === 'tree' && !hasChildren && <div className="w-5 mr-2" />}
                    <Icon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                    <span>{entity.nom}</span>
                </div>
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{entity.reference}</td>
        </tr>
    );
};


export const EntitiesPage: React.FC<EntitiesPageProps> = ({ onShowRelations }) => {
    const { data, actions } = useDataContext();
    const { entites } = data as { entites: Entite[] };

    const [viewMode, setViewMode] = useState<'list' | 'list-fiche'>('list-fiche');
    const [displayMode, setDisplayMode] = useState<'flat' | 'tree'>('tree');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(entites.filter(e => !e.parentId).map(e => e.id)));
    
    const [selectedEntity, setSelectedEntity] = useState<Entite | null>(null);
    const [activeFiche, setActiveFiche] = useState<Entite | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState<{ type: string, statut: string }>({ type: 'all', statut: 'all' });
    const [isViewModeDropdownOpen, setIsViewModeDropdownOpen] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntity, setEditingEntity] = useState<Partial<Entite> | null>(null);

    const [dividerPosition, setDividerPosition] = useState(40);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const viewModeRef = useRef<HTMLDivElement>(null);
    
    const entityChildrenMap = useMemo(() => {
        const map = new Map<string, string[]>();
        entites.forEach(e => {
            if (e.parentId) {
                if (!map.has(e.parentId)) map.set(e.parentId, []);
                map.get(e.parentId)!.push(e.id);
            }
        });
        return map;
    }, [entites]);

    const handleToggleExpand = (nodeId: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) newSet.delete(nodeId);
            else newSet.add(nodeId);
            return newSet;
        });
    };

    const renderableEntities = useMemo(() => {
        const filtered = entites.filter(e =>
            (e.nom.toLowerCase().includes(searchTerm.toLowerCase()) || e.reference.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.type === 'all' || e.type === filters.type) &&
            (filters.statut === 'all' || e.statut === filters.statut)
        );

        const sorted = [...filtered].sort((a, b) => {
            if (sortDirection === 'asc') return a.nom.localeCompare(b.nom);
            return b.nom.localeCompare(a.nom);
        });

        if (displayMode === 'flat') {
            return sorted.map(e => ({...e, level: 0}));
        }

        const result: (Entite & { level: number })[] = [];
        const renderNode = (id: string, level: number) => {
            const entity = entites.find(e => e.id === id);
            if (entity && filtered.some(f => f.id === id)) {
                result.push({ ...entity, level });
                if (expandedNodes.has(id)) {
                    const children = entityChildrenMap.get(id) || [];
                     const sortedChildren = [...children]
                        .map(childId => entites.find(e => e.id === childId))
                        .filter((e): e is Entite => !!e)
                        .sort((a,b) => sortDirection === 'asc' ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom));
                    
                    sortedChildren.forEach(child => renderNode(child.id, level + 1));
                }
            }
        };
        
        const rootNodes = sorted.filter(e => !e.parentId || !filtered.some(f => f.id === e.parentId));
        rootNodes.forEach(node => renderNode(node.id, 0));
        
        return result;

    }, [entites, searchTerm, filters, sortDirection, displayMode, expandedNodes, entityChildrenMap]);

    
    const handleRowClick = (entity: Entite) => {
        if (viewMode === 'list') { setActiveFiche(entity); } 
        else { setSelectedEntity(entity); }
    };
    const handleOpenModal = (entity?: Entite) => { setEditingEntity(entity || {}); setIsModalOpen(true); };
    const handleSaveEntity = (entityToSave: Entite) => {
        actions.saveEntite(entityToSave).then(() => {
            if (activeFiche && activeFiche.id === entityToSave.id) setActiveFiche(entityToSave);
            if (selectedEntity && selectedEntity.id === entityToSave.id) setSelectedEntity(entityToSave);
        });
        setIsModalOpen(false);
    };
    const handleDeleteEntity = (entityToDelete: Entite) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'entité "${entityToDelete.nom}" ?`)) {
            actions.deleteEntite(entityToDelete.id);
            setActiveFiche(null);
            setSelectedEntity(null);
        }
    };
    const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); setIsResizing(true); };
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDividerPosition(((e.clientX - rect.left) / rect.width) * 100);
        }
    }, [isResizing]);
    const handleMouseUp = useCallback(() => setIsResizing(false), []);
    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (viewModeRef.current && !viewModeRef.current.contains(event.target as Node)) setIsViewModeDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const listPanel = (
        <div className="bg-white flex flex-col h-full">
            <div className="p-2 border-b space-y-2">
                <div className="flex items-center gap-2">
                     <div className="flex bg-gray-100 rounded-lg p-0.5">
                        <button onClick={() => setDisplayMode('flat')} className={`p-1 rounded-md ${displayMode === 'flat' ? 'bg-white shadow-sm' : ''}`}><List className="h-4 w-4"/></button>
                        <button onClick={() => setDisplayMode('tree')} className={`p-1 rounded-md ${displayMode === 'tree' ? 'bg-white shadow-sm' : ''}`}><Network className="h-4 w-4"/></button>
                    </div>
                    <button onClick={() => setSortDirection(s => s === 'asc' ? 'desc' : 'asc')} className="p-1.5 border rounded-lg hover:bg-gray-50"><ArrowUpDown className="h-4 w-4"/></button>
                    <div className="flex-grow" />
                    <button onClick={() => handleOpenModal()} className="px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-gray-50">Nouveau</button>
                    <button onClick={() => setIsFilterVisible(!isFilterVisible)} className={`p-2 border rounded-lg ${isFilterVisible ? 'bg-blue-50 text-blue-600' : 'bg-white hover:bg-gray-50'}`} aria-label="Filtrer"><Filter className="h-4 w-4" /></button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-1.5 border rounded-lg text-sm" />
                </div>
            </div>
            {isFilterVisible && (
                    <div className="p-2 border-b flex gap-4 bg-gray-50 animate-fade-in-down">
                        <div className="flex-1"><label className="block text-xs font-medium mb-1">Type</label><select onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} className="w-full border rounded-lg py-1 px-2 text-sm"><option value="all">Tous</option>{Object.keys(ENTITY_TYPE_ICONS).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        <div className="flex-1"><label className="block text-xs font-medium mb-1">Statut</label><select onChange={e => setFilters(f => ({ ...f, statut: e.target.value }))} className="w-full border rounded-lg py-1 px-2 text-sm"><option value="all">Tous</option>{Object.keys(ENTITY_STATUS_COLORS).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
                    </div>
            )}
            <div className="flex-1 overflow-y-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100 sticky top-0 z-10"><tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {renderableEntities.map(entity => (
                             <EntityRow 
                                key={entity.id}
                                entity={entity}
                                level={entity.level}
                                onRowClick={handleRowClick}
                                selectedEntityId={selectedEntity?.id || null}
                                hasChildren={(entityChildrenMap.get(entity.id) || []).length > 0}
                                isExpanded={expandedNodes.has(entity.id)}
                                onToggleExpand={handleToggleExpand}
                                displayMode={displayMode}
                             />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (activeFiche) return <EntityFichePage entite={activeFiche} onClose={() => setActiveFiche(null)} onShowRelations={onShowRelations} onEdit={handleOpenModal} onDelete={handleDeleteEntity} />;

    return (
        <div className="h-full flex flex-col bg-gray-50">
            <div className="p-4 border-b bg-white">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">Entités <span className="ml-3 px-2.5 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">{renderableEntities.length}</span></h1>
                     <div className="flex items-center gap-4">
                        <button className="p-2 border rounded-lg hover:bg-gray-50" aria-label="Filtrer"><Filter className="h-4 w-4" /></button>
                        <div className="relative" ref={viewModeRef}>
                            <button onClick={() => setIsViewModeDropdownOpen(prev => !prev)} className="flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 text-sm">
                                <Eye className="h-4 w-4" />
                                <span>{viewMode === 'list' ? 'Liste' : 'Liste + Fiche'}</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            {isViewModeDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white border rounded-lg shadow-lg z-10 animate-fade-in-down">
                                    <button onClick={() => { setViewMode('list'); setSelectedEntity(null); setIsViewModeDropdownOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm">Liste</button>
                                    <button onClick={() => { setViewMode('list-fiche'); setIsViewModeDropdownOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm">Liste + Fiche</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div ref={containerRef} className="flex-1 flex overflow-hidden">
                {viewMode === 'list' && <div className="w-full overflow-y-auto">{listPanel}</div>}
                {viewMode === 'list-fiche' && (
                    <>
                        <div style={{ width: `${dividerPosition}%` }} className="overflow-y-auto flex-shrink-0">{listPanel}</div>
                        <div onMouseDown={handleMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors flex-shrink-0" />
                        <div style={{ width: `${100 - dividerPosition}%` }} className="overflow-y-auto flex-shrink-0">
                            {selectedEntity ? (
                                <EntityDetailPanel entity={selectedEntity} allEntities={entites} onClose={() => setSelectedEntity(null)} onEdit={handleOpenModal} onAddSub={() => {}} onReorder={() => {}}/>
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-gray-500 bg-white"><p>Sélectionnez une entité pour voir ses détails.</p></div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <EntiteFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEntity} entite={editingEntity} />
        </div>
    );
};

export default EntitiesPage;
