import React, { useState, useMemo, useEffect } from 'react';
import type { Risque } from '../types';
import { Plus, Search, Link as LinkIcon, List, LayoutGrid, Map as MapIcon, Lock, Unlock, Edit, Trash2, FileSpreadsheet, LayoutDashboard, AlertTriangle } from 'lucide-react';
import RiskDetailPanel from './RiskDetailPanel';
import RiskMatrix from './RiskMap';
import PageHeader from './PageHeader';
import { useDataContext, useAppContext } from '../context/AppContext';
import RisksDashboard from './new_RisksDashboard';
import { RiskFormModal } from './RiskFormModal';

// --- UTILITY FUNCTIONS & CONSTANTS ---
const RISK_STATUS_COLORS: Record<Risque['statut'], string> = {
    'brouillon': 'bg-gray-200 text-gray-800', 'valide': 'bg-blue-100 text-blue-800', 'figé': 'bg-indigo-100 text-indigo-800', 'archive': 'bg-red-100 text-red-800', 'en_cours': 'bg-yellow-100 text-yellow-800', 'à_créer': 'bg-cyan-100 text-cyan-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800', 'gelé': 'bg-purple-100 text-purple-800', 'planifié': 'bg-blue-100 text-blue-800', 'terminé': 'bg-green-100 text-green-800', 'non-conforme': 'bg-red-200 text-red-900', 'clôturé': 'bg-gray-300 text-gray-800', 'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-200 text-red-900', 'en_validation': 'bg-yellow-100 text-yellow-800', 'publie': 'bg-green-100 text-green-800', 'rejete': 'bg-red-100 text-red-800',
};
const getRiskLevelColor = (level: number) => {
    if (level >= 16) return 'bg-red-500'; if (level >= 10) return 'bg-orange-500'; if (level >= 5) return 'bg-yellow-400'; return 'bg-green-500';
};
const newRiskTemplate = (processus: any[], auteurId: string): Partial<Risque> => ({
    nom: '', reference: '', statut: 'brouillon', processusId: processus[0]?.id || '', categorieIds: [], entiteIds: [],
    analyseInherente: { probabilite: 1, impact: 1 }, analyseResiduelle: { probabilite: 1, impact: 1 },
    controleMaitriseIds: [], documentMaitriseIds: [], procedureMaitriseIds: [], indicateurIds: [],
    dateCreation: new Date(), dateModification: new Date(), auteurId: auteurId
});

interface RisksPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
    notifiedItemId: string | null;
}

const RiskCartography: React.FC<{ risks: Risque[] }> = ({ risks }) => (
    <div className="text-center p-8 text-gray-500">Cartographie des risques en construction.</div>
);

// --- MAIN PAGE COMPONENT ---
const RisksPage: React.FC<RisksPageProps> = ({ onShowRelations, notifiedItemId }) => {
    const { data, actions } = useDataContext();
    const { user, clearNotifiedTarget } = useAppContext();
    const { risques, processus, categoriesRisques } = data as { risques: Risque[], processus: any[], categoriesRisques: any[] };

    const [view, setView] = useState<'dashboard' | 'list' | 'matrix' | 'map'>('dashboard');
    const [selectedRisk, setSelectedRisk] = useState<Risque | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRisk, setEditingRisk] = useState<Partial<Risque> | null>(null);
    const [analysisType, setAnalysisType] = useState<keyof Pick<Risque, 'analyseInherente' | 'analyseResiduelle' | 'analyseFuture'>>('analyseResiduelle');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ categorieId: string, processusId: string }>({ categorieId: 'all', processusId: 'all' });

    useEffect(() => {
        if (notifiedItemId) {
            const riskToSelect = risques.find(r => r.id === notifiedItemId);
            if(riskToSelect) setSelectedRisk(riskToSelect);
            setView('list');
            clearNotifiedTarget();
        }
    }, [notifiedItemId, risques, clearNotifiedTarget]);

    const filteredRisks = useMemo(() => {
        return risques.filter(r => 
            (r.nom.toLowerCase().includes(searchTerm.toLowerCase()) || r.reference.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.categorieId === 'all' || r.categorieIds.includes(filters.categorieId)) &&
            (filters.processusId === 'all' || r.processusId === filters.processusId)
        );
    }, [risques, searchTerm, filters]);

    const handleOpenModal = (risk?: Risque) => { 
        setEditingRisk(risk || newRiskTemplate(processus, user.id)); 
        setIsModalOpen(true); 
    };
    
    const handleSaveRisk = async (riskToSave: Risque) => {
        await actions.saveRisque(riskToSave);
        if (selectedRisk && selectedRisk.id === riskToSave.id) {
            const updatedRisk = (actions.data.risques as Risque[]).find(r => r.id === riskToSave.id);
            setSelectedRisk(updatedRisk || null);
        }
        setIsModalOpen(false); 
        setEditingRisk(null);
    };

    const handleDeleteRisk = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce risque ?")) {
            await actions.deleteRisque(id);
            if (selectedRisk?.id === id) setSelectedRisk(null);
        }
    };
    
    const handleToggleFreeze = async (risk: Risque) => {
        const newStatus: Risque['statut'] = risk.statut === 'figé' ? 'valide' : 'figé';
        const updatedRisk = { ...risk, statut: newStatus };
        await actions.saveRisque(updatedRisk);
        if (selectedRisk?.id === risk.id) setSelectedRisk(updatedRisk);
    }

    const handleSelectRisk = (risk: Risque) => {
        setSelectedRisk(risk);
        if(view !== 'list') setView('list');
    }

    const pageActions = [
        { label: "Exporter CSV", icon: FileSpreadsheet, onClick: () => {}, variant: 'secondary' as const },
        { label: "Nouveau Risque", icon: Plus, onClick: () => handleOpenModal(), variant: 'primary' as const }
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <PageHeader 
                title="Risques" 
                icon={AlertTriangle} 
                description="Pilotez et évaluez les risques de votre organisation." 
                actions={pageActions} 
            />
            <div className="flex h-[calc(100%-80px)]">
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-2 border-b bg-white flex flex-wrap items-center justify-between gap-2">
                         <div className="flex items-center gap-2">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button onClick={() => setView('dashboard')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><LayoutDashboard className="h-4 w-4"/>Tableau de bord</button>
                                <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><List className="h-4 w-4"/>Liste</button>
                                <button onClick={() => setView('matrix')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'matrix' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><LayoutGrid className="h-4 w-4"/>Matrice</button>
                                <button onClick={() => setView('map')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><MapIcon className="h-4 w-4"/>Cartographie</button>
                            </div>
                            {(view === 'matrix' || view === 'map') && (
                                <select value={analysisType} onChange={e => setAnalysisType(e.target.value as any)} className="border rounded-lg py-1.5 px-2 text-sm bg-white">
                                    <option value="analyseInherente">Analyse Inhérente</option><option value="analyseResiduelle">Analyse Résiduelle</option>
                                </select>
                            )}
                        </div>
                        {view !== 'dashboard' && <div className="flex items-center gap-2">
                             <div className="relative flex-grow max-w-xs"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                             <select onChange={e => setFilters(f => ({...f, categorieId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Toutes les catégories</option>{categoriesRisques.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select>
                             <select onChange={e => setFilters(f => ({...f, processusId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les processus</option>{processus.map(p=><option key={p.id} value={p.id}>{p.nom}</option>)}</select>
                        </div>}
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        {view === 'dashboard' && <RisksDashboard />}
                        {view === 'list' && (
                            <div className="bg-white border rounded-lg">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50"><tr>{['Titre', 'Processus', 'Niveau Résiduel', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredRisks.map(risk => {
                                            const residuelLevel = risk.analyseResiduelle.probabilite * risk.analyseResiduelle.impact;
                                            return (
                                            <tr key={risk.id} onClick={() => setSelectedRisk(risk)} className={`hover:bg-gray-50 cursor-pointer ${selectedRisk?.id === risk.id ? 'bg-blue-50' : ''}`}>
                                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{risk.nom}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{processus.find(p=>p.id === risk.processusId)?.nom}</td>
                                                <td className="px-4 py-2 text-sm"><span className={`px-2 py-1 text-white text-xs rounded-full ${getRiskLevelColor(residuelLevel)}`}>{residuelLevel}</span></td>
                                                <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${RISK_STATUS_COLORS[risk.statut]}`}>{risk.statut}</span></td>
                                                <td className="px-4 py-2"><div className="flex items-center space-x-2">
                                                    <button onClick={(e) => {e.stopPropagation(); onShowRelations(risk, 'risques')}} title="Voir les relations" className="p-1 hover:bg-gray-200 rounded"><LinkIcon className="h-4 w-4 text-gray-500"/></button>
                                                    <button onClick={(e) => {e.stopPropagation(); handleToggleFreeze(risk)}} title={risk.statut === 'figé' ? 'Défiger' : 'Figer'} className="p-1 hover:bg-gray-200 rounded">{risk.statut === 'figé' ? <Unlock className="h-4 w-4 text-indigo-600"/> : <Lock className="h-4 w-4 text-indigo-600"/>}</button>
                                                    <button onClick={(e) => {e.stopPropagation(); handleOpenModal(risk)}} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                                    <button onClick={(e) => {e.stopPropagation(); handleDeleteRisk(risk.id)}} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                                                </div></td>
                                            </tr>);
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {view === 'matrix' && <RiskMatrix risks={filteredRisks} analysisType={analysisType} onSelectRisk={handleSelectRisk} />}
                        {view === 'map' && <RiskCartography risks={filteredRisks} />}
                    </div>
                </div>
                {selectedRisk && <RiskDetailPanel risque={selectedRisk} onClose={() => setSelectedRisk(null)} onEdit={handleOpenModal} onShowRelations={onShowRelations} />}
                <RiskFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveRisk} risque={editingRisk}/>
            </div>
        </div>
    );
};
export default RisksPage;