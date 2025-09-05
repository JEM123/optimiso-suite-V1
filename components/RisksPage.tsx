
import React, { useState, useMemo } from 'react';
import type { Risque } from '../types';
import { Plus, Search, Trash2, Edit, X, Info, ShieldCheck, TrendingUp, Link as LinkIcon, List, LayoutGrid, Map, Lock, Unlock, Filter, Download } from 'lucide-react';
import RiskDetailPanel from './RiskDetailPanel';
import RiskMap from './RiskMap';
import { useDataContext } from '../context/AppContext';

// --- UTILITY FUNCTIONS & CONSTANTS ---
const RISK_STATUS_COLORS: Record<Risque['statut'], string> = {
    'brouillon': 'bg-gray-200 text-gray-800',
    'valide': 'bg-blue-100 text-blue-800',
    'figé': 'bg-indigo-100 text-indigo-800',
    'archive': 'bg-red-100 text-red-800',
    'en_cours': 'bg-yellow-100 text-yellow-800',
    'à_créer': 'bg-cyan-100 text-cyan-800',
    'en_recrutement': 'bg-yellow-100 text-yellow-800',
    'gelé': 'bg-purple-100 text-purple-800',
    'planifié': 'bg-blue-100 text-blue-800',
    'terminé': 'bg-green-100 text-green-800',
    'non-conforme': 'bg-red-200 text-red-900',
    'clôturé': 'bg-gray-300 text-gray-800',
    'a_faire': 'bg-yellow-100 text-yellow-800',
    'en_retard': 'bg-red-200 text-red-900',
    'en_validation': 'bg-yellow-100 text-yellow-800',
    'publie': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800',
};
const PROBABILITY_SCALE = ['Très faible', 'Faible', 'Moyenne', 'Élevée', 'Très élevée'];
const IMPACT_SCALE = ['Négligeable', 'Mineur', 'Modéré', 'Majeur', 'Critique'];
const getRiskLevelColor = (level: number) => {
    if (level >= 16) return 'bg-red-500';
    if (level >= 10) return 'bg-orange-500';
    if (level >= 5) return 'bg-yellow-400';
    return 'bg-green-500';
};
const newRiskTemplate = (processus: any[], auteurId: string): Partial<Risque> => ({
    nom: '', reference: '', statut: 'brouillon', processusId: processus[0]?.id || '', categorieIds: [], entiteIds: [],
    analyseInherente: { probabilite: 1, impact: 1 }, analyseResiduelle: { probabilite: 1, impact: 1 },
    controleMaitriseIds: [], documentMaitriseIds: [], procedureMaitriseIds: [], indicateurIds: [],
    dateCreation: new Date(), dateModification: new Date(), auteurId: auteurId
});
const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";


// --- SUB-COMPONENTS ---

const RiskFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (r: Risque) => void; risque?: Partial<Risque> | null; }> = ({ isOpen, onClose, onSave, risque }) => {
    const { data, loading } = useDataContext();
    // FIX: Cast data.processus to any[] to satisfy newRiskTemplate parameter type
    const [formData, setFormData] = useState<Partial<Risque>>(risque || newRiskTemplate(data.processus as any[], 'pers-1'));
    const [activeTab, setActiveTab] = useState('identification');
    
    // FIX: Cast data.processus to any[] to satisfy newRiskTemplate parameter type
    React.useEffect(() => { setFormData(risque || newRiskTemplate(data.processus as any[], 'pers-1')); }, [risque, data.processus]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleMultiSelectChange = (name: 'controleMaitriseIds' | 'documentMaitriseIds' | 'procedureMaitriseIds' | 'indicateurIds', selectedIds: string[]) => {
        setFormData(prev => ({ ...prev, [name]: selectedIds }));
    };

    const handleEvalChange = (analyse: 'analyseInherente' | 'analyseResiduelle' | 'analyseFuture', field: 'probabilite' | 'impact', value: number) => {
        setFormData(prev => ({ ...prev, [analyse]: { ...prev[analyse], [field]: value } }));
    };

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData as Risque); };

    const renderEvaluation = (analyse: 'analyseInherente' | 'analyseResiduelle' | 'analyseFuture', title: string) => {
        const evalData = formData[analyse] || { probabilite: 1, impact: 1 };
        const level = evalData.probabilite * evalData.impact;
        return (
            <div className="p-3 border rounded-lg bg-white">
                <h4 className="font-medium text-gray-800">{title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div>
                        <label className="text-sm">Probabilité: <strong>{evalData.probabilite}</strong> ({PROBABILITY_SCALE[evalData.probabilite - 1]})</label>
                        <input type="range" min="1" max="5" value={evalData.probabilite} onChange={(e) => handleEvalChange(analyse, 'probabilite', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                    </div>
                    <div>
                        <label className="text-sm">Impact: <strong>{evalData.impact}</strong> ({IMPACT_SCALE[evalData.impact - 1]})</label>
                        <input type="range" min="1" max="5" value={evalData.impact} onChange={(e) => handleEvalChange(analyse, 'impact', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                    </div>
                </div>
                <div className="mt-2 text-sm">Niveau de risque: <span className={`px-2 py-1 text-white text-xs rounded-full ${getRiskLevelColor(level)}`}>{level}</span></div>
            </div>
        );
    }
    
    const MultiSelect: React.FC<{ items: any[], selectedIds: string[], onChange: (ids: string[]) => void, label: string }> = ({ items, selectedIds, onChange, label }) => {
        const handleSelect = (id: string) => {
            const newSelectedIds = selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id];
            onChange(newSelectedIds);
        }
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1 bg-white">
                    {items.map(item => (
                        <label key={item.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50">
                            <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelect(item.id)} className="rounded" />
                            <span className="text-sm">{item.nom} ({item.reference})</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-4xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-semibold">{formData.id ? 'Modifier le Risque' : 'Nouveau Risque'}</h2><button type="button" onClick={onClose}><X className="h-5 w-5"/></button></div>
                <div className="flex-grow p-4 overflow-y-auto">
                    <nav className="flex space-x-4 border-b mb-4">
                        <button type="button" onClick={() => setActiveTab('identification')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'identification' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Identification</button>
                        <button type="button" onClick={() => setActiveTab('evaluation')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'evaluation' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Évaluations</button>
                        <button type="button" onClick={() => setActiveTab('maitrise')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'maitrise' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Maîtrise</button>
                    </nav>
                    {activeTab === 'identification' && <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div><label className="block text-sm font-medium text-gray-700 mb-1">Titre</label><input type="text" name="nom" value={formData.nom} onChange={handleChange} className={formInputClasses} required /></div>
                           <div><label className="block text-sm font-medium text-gray-700 mb-1">Référence</label><input type="text" name="reference" value={formData.reference} onChange={handleChange} className={formInputClasses} /></div>
                           {/* FIX: Cast data.processus to any[] to use .map() */}
                           <div><label className="block text-sm font-medium text-gray-700 mb-1">Processus</label><select name="processusId" value={formData.processusId} onChange={handleChange} className={formInputClasses}>{(data.processus as any[]).map(p=><option key={p.id} value={p.id}>{p.nom}</option>)}</select></div>
                           {/* FIX: Cast data.postes to any[] to use .map() */}
                           <div><label className="block text-sm font-medium text-gray-700 mb-1">Propriétaire (Poste)</label><select name="proprietairePosteId" value={formData.proprietairePosteId || ''} onChange={handleChange} className={formInputClasses}><option value="">Non défini</option>{(data.postes as any[]).map(p=><option key={p.id} value={p.id}>{p.intitule}</option>)}</select></div>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Causes</label><textarea name="causes" value={formData.causes} onChange={handleChange} rows={2} className={formInputClasses}></textarea></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Conséquences</label><textarea name="consequences" value={formData.consequences} onChange={handleChange} rows={2} className={formInputClasses}></textarea></div>
                    </div>}
                    {activeTab === 'evaluation' && <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                        {renderEvaluation('analyseInherente', 'Analyse Inhérente (brute)')}
                        {renderEvaluation('analyseResiduelle', 'Analyse Résiduelle (nette)')}
                        {renderEvaluation('analyseFuture', 'Analyse Future (cible)')}
                    </div>}
                    {activeTab === 'maitrise' && <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                        {/* FIX: Cast data properties to any[] to pass to MultiSelect */}
                        <MultiSelect items={data.controles as any[]} selectedIds={formData.controleMaitriseIds || []} onChange={(ids) => handleMultiSelectChange('controleMaitriseIds', ids)} label="Contrôles de maîtrise" />
                        <MultiSelect items={data.documents as any[]} selectedIds={formData.documentMaitriseIds || []} onChange={(ids) => handleMultiSelectChange('documentMaitriseIds', ids)} label="Documents de maîtrise" />
                        <MultiSelect items={data.procedures as any[]} selectedIds={formData.procedureMaitriseIds || []} onChange={(ids) => handleMultiSelectChange('procedureMaitriseIds', ids)} label="Procédures de maîtrise" />
                        <MultiSelect items={data.indicateurs as any[]} selectedIds={formData.indicateurIds || []} onChange={(ids) => handleMultiSelectChange('indicateurIds', ids)} label="Indicateurs liés" />
                    </div>}
                </div>
                <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium" disabled={loading}>Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-300" disabled={loading}>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                </div>
            </form>
        </div>
    );
};

const RisksMatrix: React.FC<{risks: Risque[], analysisType: keyof Pick<Risque, 'analyseInherente' | 'analyseResiduelle' | 'analyseFuture'>, onSelect: (r: Risque) => void}> = ({risks, analysisType, onSelect}) => {
    const matrix: (Risque[])[][] = Array(5).fill(0).map(() => Array(5).fill(0).map(() => []));
    risks.forEach(risk => {
        const evalData = risk[analysisType];
        if(evalData) {
            const p = evalData.probabilite - 1;
            const i = evalData.impact - 1;
            if (p >= 0 && p < 5 && i >= 0 && i < 5) {
                matrix[4-p][i].push(risk);
            }
        }
    });

    return (
        <div className="grid grid-cols-6 gap-1 p-4 bg-white border rounded-lg overflow-x-auto">
            <div className="sticky left-0 bg-white"></div>
            {IMPACT_SCALE.map((label, i) => <div key={i} className="text-center font-semibold text-xs py-2">{label}</div>)}
            {matrix.map((row, p) => (
                <React.Fragment key={p}>
                    <div className="sticky left-0 bg-white flex items-center justify-center font-semibold text-xs text-center -rotate-90 ">{PROBABILITY_SCALE[4-p]}</div>
                    {row.map((cellRisks, i) => {
                        const level = (5-p) * (i+1);
                        return <div key={i} className={`h-24 flex items-center justify-center rounded border ${getRiskLevelColor(level)} text-white font-bold text-lg relative group`}>
                            {cellRisks.length > 0 && <button className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">{cellRisks.length}</button>}
                            {cellRisks.length > 0 && <div className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                {cellRisks.map(r => <p key={r.id} className="truncate cursor-pointer" onClick={() => onSelect(r)}>{r.nom}</p>)}
                            </div>}
                        </div>
                    })}
                </React.Fragment>
            ))}
        </div>
    );
}

// --- MAIN PAGE COMPONENT ---
const RisksPage: React.FC<{ onShowRelations: (entity: any, entityType: string) => void; }> = ({ onShowRelations }) => {
    const { data, actions } = useDataContext();
    // FIX: Cast data properties to their expected array types
    const risques = data.risques as Risque[];
    const processus = data.processus as any[];
    const categoriesRisques = data.categoriesRisques as any[];

    const [view, setView] = useState<'list' | 'matrix' | 'map'>('list');
    const [selectedRisk, setSelectedRisk] = useState<Risque | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRisk, setEditingRisk] = useState<Partial<Risque> | null>(null);
    const [analysisType, setAnalysisType] = useState<keyof Pick<Risque, 'analyseInherente' | 'analyseResiduelle' | 'analyseFuture'>>('analyseResiduelle');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ categorieId: string, processusId: string }>({ categorieId: 'all', processusId: 'all' });

    const filteredRisks = useMemo(() => {
        return risques.filter(r => 
            (r.nom.toLowerCase().includes(searchTerm.toLowerCase()) || r.reference.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.categorieId === 'all' || r.categorieIds.includes(filters.categorieId)) &&
            (filters.processusId === 'all' || r.processusId === filters.processusId)
        );
    }, [risques, searchTerm, filters]);

    const handleOpenModal = (risk?: Risque) => { 
        setEditingRisk(risk || newRiskTemplate(processus, 'pers-1')); 
        setIsModalOpen(true); 
    };
    
    const handleSaveRisk = async (riskToSave: Risque) => {
        await actions.saveRisk(riskToSave);
        setIsModalOpen(false); 
        setEditingRisk(null);
    };

    const handleDeleteRisk = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce risque ?")) {
            await actions.deleteRisk(id);
            if (selectedRisk?.id === id) setSelectedRisk(null);
        }
    };
    
    const handleToggleFreeze = (risk: Risque) => {
        const newStatus: Risque['statut'] = risk.statut === 'figé' ? 'valide' : 'figé';
        actions.saveRisk({ ...risk, statut: newStatus });
    }

    const handleSelectRisk = (risk: Risque) => {
        setSelectedRisk(risk);
        if(view !== 'list') setView('list');
    }

    return (
        <div className="flex h-[calc(100vh-150px)]">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b bg-white flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><List className="h-4 w-4"/>Liste</button>
                            <button onClick={() => setView('matrix')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'matrix' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><LayoutGrid className="h-4 w-4"/>Matrice</button>
                            <button onClick={() => setView('map')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><Map className="h-4 w-4"/>Cartographie</button>
                        </div>
                        {(view === 'matrix' || view === 'map') && (
                             <select value={analysisType} onChange={e => setAnalysisType(e.target.value as any)} className="border rounded-lg py-1.5 px-2 text-sm bg-white">
                                <option value="analyseInherente">Analyse Inhérente</option><option value="analyseResiduelle">Analyse Résiduelle</option><option value="analyseFuture">Analyse Future</option>
                             </select>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium"><Plus className="h-4 w-4" /><span>Nouveau Risque</span></button>
                        <div className="relative group">
                            <button className="flex items-center space-x-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm font-medium"><Download className="h-4 w-4" /><span>Exporter</span></button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity z-10">
                                <a href="#" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm">Exporter la Matrice</a>
                                <a href="#" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm">Exporter la Fiche</a>
                            </div>
                        </div>
                    </div>
                </div>
                {view === 'list' && (<div className="p-2 border-b bg-white flex flex-wrap items-center gap-2">
                    <div className="relative flex-grow max-w-xs"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                    <select onChange={e => setFilters(f => ({...f, categorieId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Toutes les catégories</option>{categoriesRisques.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select>
                    <select onChange={e => setFilters(f => ({...f, processusId: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les processus</option>{processus.map(p=><option key={p.id} value={p.id}>{p.nom}</option>)}</select>
                </div>)}
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
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
                    {view === 'matrix' && <RisksMatrix risks={filteredRisks} analysisType={analysisType} onSelect={handleSelectRisk} />}
                    {view === 'map' && <RiskMap risks={filteredRisks} analysisType={analysisType} onSelectRisk={handleSelectRisk} />}
                </div>
            </div>
            {selectedRisk && <RiskDetailPanel risque={selectedRisk} onClose={() => setSelectedRisk(null)} onEdit={handleOpenModal} onShowRelations={onShowRelations}/>}
            <RiskFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveRisk} risque={editingRisk} />
        </div>
    );
};

export default RisksPage;