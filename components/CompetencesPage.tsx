import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useDataContext, useAppContext } from '../context/AppContext';
import type { Competence } from '../types';
import { Plus, Search, TrendingUp, Edit, Trash2, List, LayoutGrid, Calendar, Target, Download, FileSpreadsheet, Eye } from 'lucide-react';
import CompetenceDetailPanel from './CompetenceDetailPanel';
import CompetenceFormModal from './CompetenceFormModal';
import CompetenceMatrix from './CompetenceMatrix';
import CampagnesView from './CampagnesView';
import MesEvaluationsView from './MesEvaluationsView';
import PageHeader from './PageHeader';

const exportToCsv = (filename: string, rows: object[]) => {
    if (!rows || rows.length === 0) { alert("Aucune donnée à exporter."); return; }
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

const STATUT_COLORS: Record<Competence['statut'], string> = { 'brouillon': 'bg-gray-200 text-gray-800', 'valide': 'bg-green-100 text-green-800', 'archive': 'bg-red-100 text-red-800', 'en_cours': 'bg-yellow-100 text-yellow-800', 'à_créer': 'bg-cyan-100 text-cyan-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800', 'gelé': 'bg-purple-100 text-purple-800', 'figé': 'bg-indigo-100 text-indigo-800', 'planifié': 'bg-blue-100 text-blue-800', 'terminé': 'bg-green-100 text-green-800', 'non-conforme': 'bg-red-200 text-red-900', 'clôturé': 'bg-gray-300 text-gray-800', 'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-200 text-red-900', 'en_validation': 'bg-yellow-100 text-yellow-800', 'publie': 'bg-green-100 text-green-800', 'rejete': 'bg-red-100 text-red-800', };
type CompetenceView = 'catalogue' | 'matrix' | 'campagnes' | 'mes-evaluations';
interface CompetencesPageProps { notifiedItemId: string | null; }

const CompetencesPage: React.FC<CompetencesPageProps> = ({ notifiedItemId }) => {
    const { data, actions } = useDataContext();
    const { clearNotifiedTarget } = useAppContext();
    const { competences } = data as { competences: Competence[] };
    
    const [selectedCompetence, setSelectedCompetence] = useState<Competence | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompetence, setEditingCompetence] = useState<Partial<Competence> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ domaine: string }>({ domaine: 'all' });
    const [view, setView] = useState<CompetenceView>('catalogue');

    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dividerPosition, setDividerPosition] = useState(50);
    
    useEffect(() => {
        if (notifiedItemId) { setView('mes-evaluations'); clearNotifiedTarget(); }
    }, [notifiedItemId, clearNotifiedTarget]);

    const domaines = useMemo(() => [...new Set(competences.map(c => c.domaine))], [competences]);
    const filteredCompetences = useMemo(() => {
        return competences.filter(c => 
            (c.nom.toLowerCase().includes(searchTerm.toLowerCase())) && (filters.domaine === 'all' || c.domaine === filters.domaine)
        );
    }, [competences, searchTerm, filters]);

    const handleOpenModal = (competence?: Competence) => { setEditingCompetence(competence || {}); setIsModalOpen(true); };
    const handleSaveCompetence = (competence: Competence) => { actions.saveCompetence(competence); setIsModalOpen(false); };
    const handleDeleteCompetence = (id: string) => { if (window.confirm("Supprimer cette compétence ?")) { actions.deleteCompetence(id); if (selectedCompetence?.id === id) setSelectedCompetence(null); }};
    const handleExportCsv = () => { exportToCsv('export_competences.csv', filteredCompetences.map(c => ({ Reference: c.reference, Nom: c.nom, Domaine: c.domaine, SousDomaine: c.sousDomaine, Statut: c.statut }))); };
    
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

    const listPanel = (
        <div className="bg-white flex flex-col h-full border-r">
             <div className="p-2 border-b flex items-center gap-2">
                <div className="relative flex-grow"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                <select onChange={e => setFilters(f => ({...f, domaine: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous domaines</option>{domaines.map(d=><option key={d} value={d}>{d}</option>)}</select>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0"><tr>{['Nom', 'Domaine', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredCompetences.map(c => (
                        <tr key={c.id} onClick={() => setSelectedCompetence(c)} className={`hover:bg-gray-50 cursor-pointer ${selectedCompetence?.id === c.id ? 'bg-blue-50' : ''}`}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{c.nom}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{c.domaine}</td>
                            <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${STATUT_COLORS[c.statut]}`}>{c.statut.replace(/_/g, ' ')}</span></td>
                            <td className="px-4 py-2"><div className="flex items-center space-x-2">
                                <button onClick={(e) => {e.stopPropagation(); handleOpenModal(c)}} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                <button onClick={(e) => {e.stopPropagation(); handleDeleteCompetence(c.id)}} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                            </div></td>
                        </tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderContent = () => {
        switch(view) {
            case 'catalogue': return (
                <div ref={containerRef} className="flex-1 flex overflow-hidden">
                    <div style={{ width: `${dividerPosition}%` }} className="h-full flex-shrink-0">{listPanel}</div>
                    <div onMouseDown={handleMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors flex-shrink-0" />
                    <div style={{ width: `${100 - dividerPosition}%` }} className="h-full flex-shrink-0 overflow-y-auto">
                        {selectedCompetence ? (
                           <CompetenceDetailPanel competence={selectedCompetence} onClose={() => setSelectedCompetence(null)} onEdit={handleOpenModal} onDelete={handleDeleteCompetence}/>
                        ) : (
                            <div className="flex h-full items-center justify-center text-center text-gray-500 bg-white"><p>Sélectionnez une compétence pour voir ses détails.</p></div>
                        )}
                    </div>
                </div>
            );
            case 'matrix': return <div className="p-4 bg-gray-50 flex-1 overflow-auto"><CompetenceMatrix onSelectCompetence={setSelectedCompetence} /></div>;
            case 'campagnes': return <div className="p-4 bg-gray-50 flex-1 overflow-auto"><CampagnesView /></div>;
            case 'mes-evaluations': return <div className="p-4 bg-gray-50 flex-1 overflow-auto"><MesEvaluationsView /></div>;
            default: return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Compétences" icon={TrendingUp}>
                 <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button onClick={() => setView('catalogue')} className={`px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 ${view === 'catalogue' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><List className="h-4 w-4"/>Catalogue</button>
                        <button onClick={() => setView('matrix')} className={`px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 ${view === 'matrix' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><LayoutGrid className="h-4 w-4"/>Matrice</button>
                        <button onClick={() => setView('campagnes')} className={`px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 ${view === 'campagnes' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><Calendar className="h-4 w-4"/>Campagnes</button>
                        <button onClick={() => setView('mes-evaluations')} className={`px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 ${view === 'mes-evaluations' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><Target className="h-4 w-4"/>Mes Évaluations</button>
                    </div>
                     <div className="flex items-center gap-2">
                        {view === 'catalogue' && <>
                            <button onClick={handleExportCsv} className="flex items-center space-x-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm"><FileSpreadsheet className="h-4 w-4 text-green-600"/>Exporter</button>
                            <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium"><Plus className="h-4 w-4" />Nouveau</button>
                        </>}
                    </div>
                </div>
            </PageHeader>
            {renderContent()}
            <CompetenceFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCompetence} competence={editingCompetence} />
        </div>
    );
};

export default CompetencesPage;