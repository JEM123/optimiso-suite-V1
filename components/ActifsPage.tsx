import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Actif } from '../types';
import { Plus, Search, Shield, Eye } from 'lucide-react';
import ActifDetailPanel from './ActifDetailPanel';
import ActifFormModal from './ActifFormModal';
import MaintenanceLogModal from './MaintenanceLogModal';
import PageHeader from './PageHeader';

const ActifsPage: React.FC = () => {
    const { data, actions } = useDataContext();
    const [viewMode, setViewMode] = useState<'list-fiche' | 'list'>('list-fiche');
    const [selectedActif, setSelectedActif] = useState<Actif | null>(null);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingActif, setEditingActif] = useState<Partial<Actif> | null>(null);
    const [isMaintModalOpen, setMaintModalOpen] = useState(false);
    const [maintActifId, setMaintActifId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ type: string, status: string }>({ type: 'all', status: 'all' });
    
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dividerPosition, setDividerPosition] = useState(40);

    const filteredActifs = useMemo(() => {
        return (data.actifs as Actif[]).filter(a =>
            (a.nom.toLowerCase().includes(searchTerm.toLowerCase()) || a.reference.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.type === 'all' || a.type === filters.type) &&
            (filters.status === 'all' || a.statutCycleVie === filters.status)
        );
    }, [data.actifs, searchTerm, filters]);

    const handleOpenFormModal = (actif?: Actif) => { setEditingActif(actif || {}); setFormModalOpen(true); };
    const handleSaveActif = (actifToSave: Actif) => {
        actions.saveActif(actifToSave).then(() => {
            if(selectedActif?.id === actifToSave.id) setSelectedActif(actifToSave);
        });
        setFormModalOpen(false);
    };
    const handleOpenMaintModal = (actifId: string) => { setMaintActifId(actifId); setMaintModalOpen(true); };

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
            <div className="p-2 border-b flex flex-wrap items-center gap-2">
                <div className="relative flex-grow max-w-xs"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border rounded-lg w-full text-sm"/></div>
                <select onChange={e => setFilters(f => ({...f, type: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous Types</option>{['Matériel', 'Logiciel', 'Service', 'Donnée', 'Autre'].map(t=><option key={t}>{t}</option>)}</select>
                <select onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous Statuts</option>{['En service', 'En stock', 'En maintenance', 'Obsolète', 'Retiré'].map(s=><option key={s}>{s}</option>)}</select>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0"><tr>{['Nom', 'Type', 'Statut'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredActifs.map(actif => (
                        <tr key={actif.id} onClick={() => setSelectedActif(actif)} className={`hover:bg-gray-50 cursor-pointer ${selectedActif?.id === actif.id ? 'bg-blue-50' : ''}`}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{actif.nom}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{actif.type}</td>
                            <td className="px-4 py-2 text-sm">{actif.statutCycleVie}</td>
                        </tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Gestion des Actifs" icon={Shield} actions={[
                { label: 'Nouvel Actif', icon: Plus, onClick: () => handleOpenFormModal(), variant: 'primary' },
                { label: viewMode === 'list' ? 'Liste + Fiche' : 'Liste', icon: Eye, onClick: () => setViewMode(v => v === 'list' ? 'list-fiche' : 'list'), variant: 'secondary' }
            ]} />
             <div ref={containerRef} className="flex-1 flex overflow-hidden">
                {viewMode === 'list' && <div className="w-full h-full">{listPanel}</div>}
                {viewMode === 'list-fiche' && (
                    <>
                        <div style={{ width: `${dividerPosition}%` }} className="h-full flex-shrink-0">{listPanel}</div>
                        <div onMouseDown={handleMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors flex-shrink-0" />
                        <div style={{ width: `${100 - dividerPosition}%` }} className="h-full flex-shrink-0 overflow-y-auto">
                            {selectedActif ? (
                                <ActifDetailPanel actif={selectedActif} onClose={() => setSelectedActif(null)} onEdit={handleOpenFormModal} onAddMaintenance={handleOpenMaintModal}/>
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-gray-500 bg-white"><p>Sélectionnez un actif pour voir ses détails.</p></div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <ActifFormModal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} onSave={handleSaveActif} actif={editingActif} />
            {maintActifId && <MaintenanceLogModal isOpen={isMaintModalOpen} onClose={() => setMaintModalOpen(false)} onSave={()=>{}} actifId={maintActifId} />}
        </div>
    );
};

export default ActifsPage;
