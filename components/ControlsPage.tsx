import React, { useState, useMemo } from 'react';
import { mockData } from '../constants';
import type { Controle, ExecutionControle } from '../types';
import { Plus, Search, List, LayoutDashboard, Edit, Trash2, PlayCircle } from 'lucide-react';
import ControlFormModal from './ControlFormModal';
import ExecutionModal from './ExecutionModal';
import ControlsDashboard from './ControlsDashboard';
import ControlDetailPanel from './ControlDetailPanel'; // Import the new detail panel

// --- UTILITY FUNCTIONS & CONSTANTS ---
const CONTROL_STATUS_COLORS: Record<Controle['statut'], string> = {
    'brouillon': 'bg-gray-200 text-gray-800',
    'planifié': 'bg-blue-100 text-blue-800',
    'terminé': 'bg-green-100 text-green-800',
    'non-conforme': 'bg-red-100 text-red-800',
    'clôturé': 'bg-gray-500 text-white',
    'archive': 'bg-red-200 text-red-900',
    // other statuses from BaseEntity for completeness
    'en_cours': 'bg-yellow-100 text-yellow-800',
    'valide': 'bg-green-100 text-green-800',
    'à_créer': 'bg-cyan-100 text-cyan-800',
    'en_recrutement': 'bg-yellow-100 text-yellow-800',
    'gelé': 'bg-purple-100 text-purple-800',
    'figé': 'bg-indigo-100 text-indigo-800',
    'a_faire': 'bg-yellow-100 text-yellow-800',
    'en_retard': 'bg-red-100 text-red-800',
    'en_validation': 'bg-yellow-100 text-yellow-800',
    'publie': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800',
};

const getAutomationStatus = (control: Controle): {text: string, color: string} => {
    if (control.typePlanification === 'non_automatisé') {
        return { text: 'N/A', color: 'bg-gray-400' };
    }
    if (!control.executantsIds || control.executantsIds.length === 0) {
        return { text: 'Incomplet', color: 'bg-red-500' };
    }
    if (control.dateFin && new Date(control.dateFin) < new Date()) {
        return { text: 'Arrêté', color: 'bg-gray-600' };
    }
    return { text: 'Prêt', color: 'bg-green-500' };
};

// --- MAIN PAGE COMPONENT ---
const ControlsPage: React.FC = () => {
    const [view, setView] = useState<'list' | 'dashboard'>('dashboard');
    const [controls, setControls] = useState<Controle[]>(mockData.controles);
    const [executions, setExecutions] = useState<ExecutionControle[]>(mockData.executionsControles);
    const [selectedControl, setSelectedControl] = useState<Controle | null>(null);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingControl, setEditingControl] = useState<Partial<Controle> | null>(null);
    const [isExecModalOpen, setExecModalOpen] = useState(false);
    const [executingExecution, setExecutingExecution] = useState<ExecutionControle | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ categorieId: string, statut: string }>({ categorieId: 'all', statut: 'all' });

    const filteredControls = useMemo(() => {
        return controls.filter(c => 
            (c.nom.toLowerCase().includes(searchTerm.toLowerCase()) || c.reference.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.categorieId === 'all' || c.categorieIds.includes(filters.categorieId)) &&
            (filters.statut === 'all' || c.statut === filters.statut)
        );
    }, [controls, searchTerm, filters]);

    const handleOpenFormModal = (control?: Controle) => {
        setEditingControl(control || {});
        setFormModalOpen(true);
    };

    const handleSaveControl = (controlToSave: Controle) => {
        if (controlToSave.id) { 
            const updatedControl = { ...controls.find(c => c.id === controlToSave.id), ...controlToSave } as Controle;
            setControls(controls.map(c => c.id === controlToSave.id ? updatedControl : c));
            if(selectedControl?.id === updatedControl.id) setSelectedControl(updatedControl);
        } else { 
            const newControl = { ...controlToSave, id: `ctrl-${Date.now()}`, reference: controlToSave.reference || `C${Date.now()}` } as Controle;
            setControls([...controls, newControl]); 
        }
        setFormModalOpen(false);
    };

    const handleDeleteControl = (id: string) => {
        setControls(controls.filter(c => c.id !== id));
        if(selectedControl?.id === id) setSelectedControl(null);
    };

    const handleOpenExecModal = (control: Controle) => {
        let execution = executions.find(e => e.controleId === control.id && e.statut === 'a_faire');
        if (!execution) {
            execution = {
                id: `exec-${Date.now()}`, controleId: control.id, nom: `Exécution: ${control.nom}`, reference: "EXEC-DEM",
                statut: 'a_faire', dateEcheance: new Date(), executantId: 'pers-1', resultatsSaisis: {},
                dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'
            }
        }
        setExecutingExecution(execution);
        setExecModalOpen(true);
    };
    
    const handleSaveExecution = (executionToSave: ExecutionControle) => {
        setExecutions(executions.map(e => e.id === executionToSave.id ? executionToSave : e));
        setExecModalOpen(false);
    };

    return (
        <div className="flex h-[calc(100vh-150px)]">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b bg-white flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={() => setView('dashboard')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><LayoutDashboard className="h-4 w-4"/>Tableau de bord</button>
                            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><List className="h-4 w-4"/>Liste</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenFormModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm"><Plus className="h-4 w-4" /><span>Nouveau Contrôle</span></button>
                    </div>
                </div>

                {view === 'list' && (
                    <div className="p-2 border-b bg-white flex flex-wrap items-center gap-2">
                        <div className="relative flex-grow max-w-xs"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                        <select onChange={e => setFilters(f => ({...f, categorieId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Toutes les catégories</option>{mockData.categoriesControles.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select>
                        <select onChange={e => setFilters(f => ({...f, statut: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les statuts</option>{Object.keys(CONTROL_STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                )}

                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    {view === 'dashboard' && <ControlsDashboard controls={controls} executions={executions} />}
                    {view === 'list' && (
                        <div className="bg-white border rounded-lg">
                            <table className="min-w-full">
                                <thead className="bg-gray-50"><tr>{['Titre', 'Type', 'Statut Automatisation', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
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
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenExecModal(control)}} title="Exécuter" className="p-1 hover:bg-gray-200 rounded"><PlayCircle className="h-4 w-4 text-green-600"/></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenFormModal(control)}} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteControl(control.id)}} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                                            </div></td>
                                        </tr>);
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            
            {selectedControl && <ControlDetailPanel control={selectedControl} onClose={() => setSelectedControl(null)} onEdit={handleOpenFormModal} />}
            <ControlFormModal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} onSave={handleSaveControl} control={editingControl} />
            {executingExecution && <ExecutionModal isOpen={isExecModalOpen} onClose={() => setExecModalOpen(false)} onSave={handleSaveExecution} execution={executingExecution} />}
        </div>
    );
};

export default ControlsPage;
