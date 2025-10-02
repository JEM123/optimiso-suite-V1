import React, { useState, useMemo } from 'react';
import type { Controle, ExecutionControle } from '../types';
import { Plus, Search, List, LayoutDashboard, Edit, Trash2, PlayCircle, Link as LinkIcon, CheckCircle } from 'lucide-react';
import ControlFormModal from './ControlFormModal';
import ExecutionModal from './ExecutionModal';
import ControlsDashboard from './ControlsDashboard';
import ControlDetailPanel from './ControlDetailPanel';
import PageHeader from './PageHeader';
import { useDataContext } from '../context/AppContext';

const CONTROL_STATUS_COLORS: Record<Controle['statut'], string> = {
    'brouillon': 'bg-gray-200 text-gray-800', 'planifié': 'bg-blue-100 text-blue-800',
    'terminé': 'bg-green-100 text-green-800', 'non-conforme': 'bg-red-100 text-red-800',
    'clôturé': 'bg-gray-500 text-white', 'archive': 'bg-red-200 text-red-900',
    'en_cours': 'bg-yellow-100 text-yellow-800', 'valide': 'bg-green-100 text-green-800',
    'à_créer': 'bg-cyan-100 text-cyan-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800',
    'gelé': 'bg-purple-100 text-purple-800', 'figé': 'bg-indigo-100 text-indigo-800',
    'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-100 text-red-800',
    'en_validation': 'bg-yellow-100 text-yellow-800', 'publie': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800',
};

const getAutomationStatus = (control: Controle): {text: string, color: string} => {
    if (control.typePlanification === 'non_automatisé') return { text: 'N/A', color: 'bg-gray-400' };
    if (!control.executantsIds || control.executantsIds.length === 0) return { text: 'Incomplet', color: 'bg-red-500' };
    if (control.dateFin && new Date(control.dateFin) < new Date()) return { text: 'Arrêté', color: 'bg-gray-600' };
    return { text: 'Prêt', color: 'bg-green-500' };
};

interface ControlsPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
}

const ControlsPage: React.FC<ControlsPageProps> = ({ onShowRelations }) => {
    const { data, actions } = useDataContext();
    const { controles, executionsControles, categoriesControles } = data;
    
    const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
    const [selectedControl, setSelectedControl] = useState<Controle | null>(null);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingControl, setEditingControl] = useState<Partial<Controle> | null>(null);
    const [isExecModalOpen, setExecModalOpen] = useState(false);
    const [executingExecution, setExecutingExecution] = useState<ExecutionControle | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ categorieId: string, statut: string }>({ categorieId: 'all', statut: 'all' });

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
            if (selectedControl && selectedControl.id === controlToSave.id) {
                const updatedControl = (data.controles as Controle[]).find(c => c.id === controlToSave.id);
                setSelectedControl(updatedControl || null);
            }
        });
        setFormModalOpen(false);
    };
    const handleDeleteControl = (id: string) => { 
        actions.deleteControle(id); 
        if(selectedControl?.id === id) setSelectedControl(null); 
    };
    const handleOpenExecModal = (control: Controle) => {
        let execution = (executionsControles as ExecutionControle[]).find(e => e.controleId === control.id && e.statut === 'a_faire');
        if (!execution) {
            execution = {
                id: '', controleId: control.id, nom: `Exécution: ${control.nom}`, reference: "EXEC-DEM",
                statut: 'a_faire', dateEcheance: new Date(), executantId: 'pers-1', resultatsSaisis: {},
                dateCreation: new Date(), dateModification: new Date(), auteurId: 'system'
            }
        }
        setExecutingExecution(execution);
        setExecModalOpen(true);
    };
    const handleSaveExecution = (executionToSave: ExecutionControle) => { 
        // This should be a dedicated action in a real app
        console.log("Saving execution", executionToSave);
        setExecModalOpen(false); 
    };

    return (
        <div className="flex flex-col h-full">
            <PageHeader 
                title="Contrôles" 
                icon={CheckCircle} 
                description="Suivez et exécutez les contrôles internes pour maîtriser vos risques."
                actions={[{ label: "Nouveau Contrôle", icon: Plus, onClick: () => handleOpenFormModal(), variant: 'primary' }]}
            />
            <div className="flex h-[calc(100%-80px)]">
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-2 border-b bg-white flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button onClick={() => setView('dashboard')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><LayoutDashboard className="h-4 w-4"/>Tableau de bord</button>
                                <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><List className="h-4 w-4"/>Liste</button>
                            </div>
                        </div>
                        {view === 'list' && (
                            <div className="flex items-center gap-2">
                                <div className="relative flex-grow max-w-xs"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                                <select onChange={e => setFilters(f => ({...f, categorieId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Toutes les catégories</option>{(categoriesControles as any[]).map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-auto p-4 bg-gray-50">
                        {view === 'dashboard' && <ControlsDashboard controls={controles as Controle[]} executions={executionsControles as ExecutionControle[]} />}
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
                        )}
                    </div>
                </div>
                {selectedControl && <ControlDetailPanel control={selectedControl} onClose={() => setSelectedControl(null)} onEdit={handleOpenFormModal} onShowRelations={onShowRelations} />}
                <ControlFormModal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} onSave={handleSaveControl} control={editingControl} />
                {executingExecution && <ExecutionModal isOpen={isExecModalOpen} onClose={() => setExecModalOpen(false)} onSave={handleSaveExecution} execution={executingExecution} />}
            </div>
        </div>
    );
};

export default ControlsPage;