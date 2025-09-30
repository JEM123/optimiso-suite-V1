import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useDataContext, usePermissions } from '../context/AppContext';
import type { Controle, ExecutionControle } from '../types';
import { Plus, Search, List, LayoutDashboard, Edit, Trash2, PlayCircle, Link as LinkIcon, FileSpreadsheet, CheckCircle, ChevronDown } from 'lucide-react';
import ControlFormModal from './ControlFormModal';
import ExecutionModal from './ExecutionModal';
import ControlsDashboard from './ControlsDashboard';
import ControlDetailPanel from './ControlDetailPanel';
import PageHeader from './PageHeader';

// --- UTILITY FUNCTIONS & CONSTANTS ---
const exportToCsv = (filename: string, rows: object[]) => {
    if (!rows || rows.length === 0) { return; }
    const separator = ';';
    const keys = Object.keys(rows[0]);
    const csvContent = keys.join(separator) + '\n' + rows.map(row => {
        return keys.map(k => {
            let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
            cell = String(cell).replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
        }).join(separator);
    }).join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const CONTROL_STATUS_COLORS: Record<Controle['statut'], string> = { 'brouillon': 'bg-gray-200 text-gray-800', 'planifié': 'bg-blue-100 text-blue-800', 'terminé': 'bg-green-100 text-green-800', 'non-conforme': 'bg-red-100 text-red-800', 'clôturé': 'bg-gray-500 text-white', 'archive': 'bg-red-200 text-red-900', 'en_cours': 'bg-yellow-100 text-yellow-800', 'valide': 'bg-green-100 text-green-800', 'à_créer': 'bg-cyan-100 text-cyan-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800', 'gelé': 'bg-purple-100 text-purple-800', 'figé': 'bg-indigo-100 text-indigo-800', 'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-100 text-red-800', 'en_validation': 'bg-yellow-100 text-yellow-800', 'publie': 'bg-green-100 text-green-800', 'rejete': 'bg-red-100 text-red-800', };
const getAutomationStatus = (control: Controle): {text: string, color: string} => {
    if (control.typePlanification === 'non_automatisé') return { text: 'N/A', color: 'bg-gray-400' };
    if (!control.executantsIds || control.executantsIds.length === 0) return { text: 'Incomplet', color: 'bg-red-500' };
    if (control.dateFin && new Date(control.dateFin) < new Date()) return { text: 'Arrêté', color: 'bg-gray-600' };
    return { text: 'Prêt', color: 'bg-green-500' };
};

interface ControlsPageProps { onShowRelations: (entity: any, entityType: string) => void; }

const ControlsPage: React.FC<ControlsPageProps> = ({ onShowRelations }) => {
    const { data, actions } = useDataContext();
    const { can } = usePermissions();
    const { controles, executionsControles, categoriesControles } = data;

    const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
    const [selectedControl, setSelectedControl] = useState<Controle | null>(null);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingControl, setEditingControl] = useState<Partial<Controle> | null>(null);
    const [isExecModalOpen, setExecModalOpen] = useState(false);
    const [executingExecution, setExecutingExecution] = useState<ExecutionControle | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ categorieId: string, statut: string }>({ categorieId: 'all', statut: 'all' });
    const [isViewDropdownOpen, setViewDropdownOpen] = useState(false);
    const viewDropdownRef = useRef<HTMLDivElement>(null);
    
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dividerPosition, setDividerPosition] = useState(50);

    const filteredControls = useMemo(() => {
        return (controles as Controle[]).filter(c => 
            (c.nom.toLowerCase().includes(searchTerm.toLowerCase()) || c.reference.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.categorieId === 'all' || c.categorieIds.includes(filters.categorieId)) &&
            (filters.statut === 'all' || c.statut === filters.statut)
        );
    }, [controles, searchTerm, filters]);

    const handleOpenFormModal = (control?: Controle) => { setEditingControl(control || {}); setFormModalOpen(true); };
    const handleSaveControl = (controlToSave: Controle) => {
        actions.saveControle(controlToSave).then(() => {
            if(selectedControl?.id === controlToSave.id) setSelectedControl(controlToSave);
        });
        setFormModalOpen(false);
    };
    const handleDeleteControl = (id: string) => { actions.deleteControle(id); if(selectedControl?.id === id) setSelectedControl(null); };
    const handleOpenExecModal = (control: Controle) => {
        let execution = (executionsControles as ExecutionControle[]).find(e => e.controleId === control.id && e.statut === 'a_faire');
        if (!execution) {
            execution = { id: `exec-${Date.now()}`, controleId: control.id, nom: `Exécution: ${control.nom}`, reference: "EXEC-DEM", statut: 'a_faire', dateEcheance: new Date(), executantId: 'pers-1', resultatsSaisis: {}, dateCreation: new Date(), dateModification: new Date(), auteurId: 'system' }
        }
        setExecutingExecution(execution);
        setExecModalOpen(true);
    };
    const handleSaveExecution = (executionToSave: ExecutionControle) => {
        // Mock save
        setExecModalOpen(false);
    };
    const handleExportCsv = () => {
        const dataToExport = filteredControls.map(c => ({ Reference: c.reference, Nom: c.nom, TypePlanification: c.typePlanification.replace(/_/g, ' '), Frequence: c.frequence || 'N/A', Statut: c.statut, }));
        exportToCsv('export_controles.csv', dataToExport);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target as Node)) {
                setViewDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); setIsResizing(true); };
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const newPos = ((e.clientX - rect.left) / rect.width) * 100;
            if (newPos > 20 && newPos < 80) { setDividerPosition(newPos); }
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

    const pageActions = [
        { label: "Nouveau Contrôle", icon: Plus, onClick: () => handleOpenFormModal(), variant: 'primary' as const, disabled: !can('C', 'controles') },
        { label: "Exporter CSV", icon: FileSpreadsheet, onClick: handleExportCsv, variant: 'secondary' as const },
    ];
    
    const listPanel = (
         <div className="bg-white flex flex-col h-full border-r">
             <div className="p-2 border-b flex flex-wrap items-center gap-2">
                <div className="relative flex-grow max-w-xs"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                <select onChange={e => setFilters(f => ({...f, categorieId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Toutes les catégories</option>{(categoriesControles as any[]).map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select>
                <select onChange={e => setFilters(f => ({...f, statut: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les statuts</option>{Object.keys(CONTROL_STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}</select>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0"><tr>{['Titre', 'Type', 'Statut Automatisation', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredControls.map(control => {
                            const autoStatus = getAutomationStatus(control);
                            return (
                            <tr key={control.id} onClick={() => setSelectedControl(control)} className={`hover:bg-gray-50 cursor-pointer ${selectedControl?.id === control.id ? 'bg-blue-50' : ''}`}>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{control.nom}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{control.typePlanification.replace(/_/g, ' ')}</td>
                                <td className="px-4 py-2 text-sm"><span className={`px-2 py-1 text-white text-xs rounded-full ${autoStatus.color}`}>{autoStatus.text}</span></td>
                                <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${CONTROL_STATUS_COLORS[control.statut]}`}>{control.statut}</span></td>
                                <td className="px-4 py-2"><div className="flex items-center space-x-2">
                                    <button onClick={(e) => { e.stopPropagation(); onShowRelations(control, 'controles'); }} title="Voir les relations" className="p-1 hover:bg-gray-200 rounded"><LinkIcon className="h-4 w-4 text-gray-500"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenExecModal(control)}} title="Exécuter" className="p-1 hover:bg-gray-200 rounded"><PlayCircle className="h-4 w-4 text-green-600"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenFormModal(control)}} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteControl(control.id)}} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                                </div></td>
                            </tr>);
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Contrôles" icon={CheckCircle} actions={pageActions}>
                 <div className="relative" ref={viewDropdownRef}>
                    <button onClick={() => setViewDropdownOpen(p => !p)} className="flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 text-sm">
                        <span>{view === 'dashboard' ? 'Tableau de bord' : 'Liste'}</span><ChevronDown className="h-4 w-4" />
                    </button>
                    {isViewDropdownOpen && <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-10 animate-fade-in-down">
                        <button onClick={() => { setView('dashboard'); setViewDropdownOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm"><LayoutDashboard className="h-4 w-4"/>Tableau de bord</button>
                        <button onClick={() => { setView('list'); setViewDropdownOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm"><List className="h-4 w-4"/>Liste</button>
                    </div>}
                </div>
            </PageHeader>
            <div ref={containerRef} className="flex-1 flex overflow-hidden">
                {view === 'dashboard' && <div className="flex-1 overflow-auto p-4 bg-gray-50"><ControlsDashboard controls={controles as Controle[]} executions={executionsControles as ExecutionControle[]} /></div>}
                {view === 'list' && (
                     <>
                        <div style={{ width: `${dividerPosition}%` }} className="h-full flex-shrink-0">{listPanel}</div>
                        <div onMouseDown={handleMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors flex-shrink-0" />
                        <div style={{ width: `${100 - dividerPosition}%` }} className="h-full flex-shrink-0 overflow-y-auto">
                            {selectedControl ? (
                                <ControlDetailPanel control={selectedControl} onClose={() => setSelectedControl(null)} onEdit={handleOpenFormModal} onShowRelations={onShowRelations} />
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-gray-500 bg-white"><p>Sélectionnez un contrôle pour voir ses détails.</p></div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <ControlFormModal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} onSave={handleSaveControl} control={editingControl} />
            {executingExecution && <ExecutionModal isOpen={isExecModalOpen} onClose={() => setExecModalOpen(false)} onSave={handleSaveExecution} execution={executingExecution} />}
        </div>
    );
};

export default ControlsPage;
