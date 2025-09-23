

import React, { useState, useMemo, useEffect } from 'react';
import type { Risque, Processus, CategorieRisque, Entite } from '../types';
import { Plus, Search, Trash2, Edit, X, Info, ShieldCheck, TrendingUp, Link as LinkIcon, List, LayoutGrid, Map as MapIcon, Lock, Unlock, Filter, Download, AlertTriangle, Building2, FileSpreadsheet } from 'lucide-react';
import RiskDetailPanel from './RiskDetailPanel';
import RiskMatrix from './RiskMap';
import PageHeader from './PageHeader';
import { useDataContext, useAppContext } from '../context/AppContext';

const exportToCsv = (filename: string, rows: object[]) => {
    if (!rows || rows.length === 0) {
        alert("Aucune donnée à exporter.");
        return;
    }
    const separator = ';';
    const keys = Object.keys(rows[0]);
    const csvContent =
        keys.join(separator) +
        '\n' +
        rows.map(row => {
            return keys.map(k => {
                let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
                cell = String(cell).replace(/"/g, '""');
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`;
                }
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

const RiskCartography: React.FC<{ 
    risks: Risque[], 
    analysisType: keyof Pick<Risque, 'analyseInherente' | 'analyseResiduelle' | 'analyseFuture'> 
}> = ({ risks, analysisType }) => {
    const { data } = useDataContext();
    const allEntities = data.entites as Entite[];

    const risksByEntity = useMemo(() => {
        const byEntity = new Map<string, { critical: number, high: number, medium: number, low: number, risks: Risque[] }>();
        
        allEntities.forEach(entity => {
            byEntity.set(entity.id, { critical: 0, high: 0, medium: 0, low: 0, risks: [] });
        });

        risks.forEach(risk => {
            const evalData = risk[analysisType];
            if (!evalData) return;
            const level = evalData.probabilite * evalData.impact;
            const uniqueEntityIds = new Set(risk.entiteIds);
            uniqueEntityIds.forEach(entiteId => {
                if (byEntity.has(entiteId)) {
                    const current = byEntity.get(entiteId)!;
                    current.risks.push(risk);
                    if (level >= 16) current.critical++;
                    else if (level >= 10) current.high++;
                    else if (level >= 5) current.medium++;
                    else current.low++;
                }
            });
        });
        return byEntity;
    }, [risks, analysisType, allEntities]);
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allEntities.map(entity => {
                const entityRisks = risksByEntity.get(entity.id);
                if (!entityRisks || entityRisks.risks.length === 0) return null;

                return (
                    <div key={entity.id} className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            {entity.nom}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">Total des risques : {entityRisks.risks.length}</p>
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-2 rounded bg-red-100 text-red-800">
                                <div className="text-2xl font-bold">{entityRisks.critical}</div>
                                <div className="text-xs font-medium">Critiques</div>
                            </div>
                            <div className="p-2 rounded bg-orange-100 text-orange-800">
                                <div className="text-2xl font-bold">{entityRisks.high}</div>
                                <div className="text-xs font-medium">Élevés</div>
                            </div>
                            <div className="p-2 rounded bg-yellow-100 text-yellow-800">
                                <div className="text-2xl font-bold">{entityRisks.medium}</div>
                                <div className="text-xs font-medium">Moyens</div>
                            </div>
                             <div className="p-2 rounded bg-green-100 text-green-800">
                                <div className="text-2xl font-bold">{entityRisks.low}</div>
                                <div className="text-xs font-medium">Faibles</div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

const RisksPage: React.FC<RisksPageProps> = ({ onShowRelations, notifiedItemId }) => {
    const { data, actions } = useDataContext();
    const { user, clearNotifiedTarget } = useAppContext();
    const risques = data.risques as Risque[];
    const processus = data.processus as Processus[];
    const categoriesRisques = data.categoriesRisques as CategorieRisque[];

    const [view, setView] = useState<'list' | 'matrix' | 'map'>('list');
    const [selectedRisk, setSelectedRisk] = useState<Risque | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRisk, setEditingRisk] = useState<Partial<Risque> | null>(null);
    const [analysisType, setAnalysisType] = useState<keyof Pick<Risque, 'analyseInherente' | 'analyseResiduelle' | 'analyseFuture'>>('analyseResiduelle');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ categorieId: string, processusId: string }>({ categorieId: 'all', processusId: 'all' });

    useEffect(() => {
        if (notifiedItemId) {
            const riskToSelect = risques.find(r => r.id === notifiedItemId);
            if (riskToSelect) {
                setSelectedRisk(riskToSelect);
            }
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
        if (selectedRisk?.id === riskToSave.id) {
            setSelectedRisk(riskToSave);
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
    
    const handleToggleFreeze = (risk: Risque) => {
        const newStatus: Risque['statut'] = risk.statut === 'figé' ? 'valide' : 'figé';
        actions.saveRisque({ ...risk, statut: newStatus });
    }

    const handleSelectRisk = (risk: Risque) => {
        setSelectedRisk(risk);
        if(view !== 'list') setView('list');
    }
    
    const handleExportCsv = () => {
        const dataToExport = filteredRisks.map(risk => {
            const proc = processus.find(p => p.id === risk.processusId);
            return {
                Reference: risk.reference,
                Nom: risk.nom,
                Processus: proc?.nom || '',
                'Probabilite Inhérente': risk.analyseInherente.probabilite,
                'Impact Inhérent': risk.analyseInherente.impact,
                'Niveau Inhérent': risk.analyseInherente.probabilite * risk.analyseInherente.impact,
                'Probabilite Résiduelle': risk.analyseResiduelle.probabilite,
                'Impact Résiduel': risk.analyseResiduelle.impact,
                'Niveau Résiduel': risk.analyseResiduelle.probabilite * risk.analyseResiduelle.impact,
                Statut: risk.statut,
            };
        });
        exportToCsv('export_risques.csv', dataToExport);
    };

    const pageActions = [
        { label: "Exporter CSV", icon: FileSpreadsheet, onClick: handleExportCsv, variant: 'secondary' as const },
        { label: "Nouveau Risque", icon: Plus, onClick: () => handleOpenModal(), variant: 'primary' as const }
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg border">
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
                                <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><List className="h-4 w-4"/>Liste</button>
                                <button onClick={() => setView('matrix')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'matrix' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><LayoutGrid className="h-4 w-4"/>Matrice</button>
                                <button onClick={() => setView('map')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><MapIcon className="h-4 w-4"/>Cartographie</button>
                            </div>
                            {(view === 'matrix' || view === 'map') && (
                                <select value={analysisType} onChange={e => setAnalysisType(e.target.value as typeof analysisType)} className="border rounded-lg py-1.5 px-2 text-sm bg-white">
                                    <option value="analyseInherente">Analyse Inhérente</option><option value="analyseResiduelle">Analyse Résiduelle</option><option value="analyseFuture">Analyse Future</option>
                                </select>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow max-w-xs"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                             {/* FIX: Explicitly type event object in onChange handler */}
                             <select onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters(f => ({...f, categorieId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Toutes les catégories</option>{categoriesRisques.map((c: CategorieRisque)=><option key={c.id} value={c.id}>{c.nom}</option>)}</select>
                             {/* FIX: Explicitly type event object in onChange handler */}
                             <select onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters(f => ({...f, processusId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les processus</option>{processus.map((p: Processus)=><option key={p.id} value={p.id}>{p.nom}</option>)}</select>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
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
                        {view === 'matrix' && (
                             <RiskMatrix risks={filteredRisks} analysisType={analysisType} onSelectRisk={handleSelectRisk} />
                        )}
                        {view === 'map' && (
                           <RiskCartography risks={filteredRisks} analysisType={analysisType} />
                        )}
                    </div>
                </div>
                {selectedRisk && <RiskDetailPanel risque={selectedRisk} onClose={() => setSelectedRisk(null)} onEdit={handleOpenModal} onShowRelations={onShowRelations} />}
            </div>
        </div>
    );
};

export default RisksPage;