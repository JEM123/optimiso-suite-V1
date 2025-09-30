import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Mission } from '../types';
import { Plus, Search, Briefcase, Edit, Trash2, Eye, ChevronDown } from 'lucide-react';
import MissionDetailPanel from './MissionDetailPanel';
import { MissionFormModal } from './MissionFormModal';
import PageHeader from './PageHeader';

const STATUT_COLORS: Record<Mission['statut'], string> = {
    'brouillon': 'bg-gray-200 text-gray-800',
    'publie': 'bg-green-100 text-green-800',
    'archive': 'bg-red-100 text-red-800',
    'en_cours': 'bg-yellow-100 text-yellow-800', 'valide': 'bg-green-100 text-green-800', 'à_créer': 'bg-cyan-100 text-cyan-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800', 'gelé': 'bg-purple-100 text-purple-800', 'figé': 'bg-indigo-100 text-indigo-800', 'planifié': 'bg-blue-100 text-blue-800', 'terminé': 'bg-green-100 text-green-800', 'non-conforme': 'bg-red-200 text-red-900', 'clôturé': 'bg-gray-300 text-gray-800', 'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-200 text-red-900', 'en_validation': 'bg-yellow-100 text-yellow-800', 'rejete': 'bg-red-100 text-red-800',
};

interface MissionsPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
}

const MissionsPage: React.FC<MissionsPageProps> = ({ onShowRelations }) => {
    const { data, actions } = useDataContext();
    const { missions, entites, postes } = data as { missions: Mission[], entites: any[], postes: any[] };

    const [viewMode, setViewMode] = useState<'list-fiche' | 'list'>('list-fiche');
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMission, setEditingMission] = useState<Partial<Mission> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ statut: string }>({ statut: 'all' });
    
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dividerPosition, setDividerPosition] = useState(40);

    const filteredMissions = useMemo(() => {
        return missions.filter(m =>
            (m.nom.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.statut === 'all' || m.statut === filters.statut)
        );
    }, [missions, searchTerm, filters]);

    const handleOpenModal = (mission?: Mission) => {
        setEditingMission(mission || {});
        setIsModalOpen(true);
    };
    const handleSaveMission = (missionToSave: Mission) => {
        actions.saveMission(missionToSave);
        setIsModalOpen(false);
    };
    const handleDeleteMission = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette mission ?")) {
            actions.deleteMission(id);
            if (selectedMission?.id === id) setSelectedMission(null);
        }
    };
    const getRattachementName = (mission: Mission) => {
        if (mission.rattachementType === 'Entite') return entites.find(e => e.id === mission.rattachementId)?.nom || 'N/A';
        return postes.find(p => p.id === mission.rattachementId)?.intitule || 'N/A';
    };

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
                <select onChange={e => setFilters(f => ({...f, statut: e.target.value}))} className="border rounded-lg py-1.5 px-2 text-sm"><option value="all">Tous les statuts</option>{Object.keys(STATUT_COLORS).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0"><tr>{['Titre', 'Rattachement', 'Statut', 'Actions'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredMissions.map(mission => (
                        <tr key={mission.id} onClick={() => setSelectedMission(mission)} className={`hover:bg-gray-50 cursor-pointer ${selectedMission?.id === mission.id ? 'bg-blue-50' : ''}`}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{mission.nom}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{getRattachementName(mission)}</td>
                            <td className="px-4 py-2 text-sm"><span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${STATUT_COLORS[mission.statut]}`}>{mission.statut.replace(/_/g, ' ')}</span></td>
                            <td className="px-4 py-2"><div className="flex items-center space-x-2">
                                <button onClick={(e) => {e.stopPropagation(); handleOpenModal(mission)}} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                <button onClick={(e) => {e.stopPropagation(); handleDeleteMission(mission.id)}} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                            </div></td>
                        </tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="Missions" icon={Briefcase}
                actions={[
                    { label: 'Nouvelle Mission', icon: Plus, onClick: () => handleOpenModal(), variant: 'primary' },
                    { label: viewMode === 'list' ? 'Liste + Fiche' : 'Liste', icon: Eye, onClick: () => setViewMode(v => v === 'list' ? 'list-fiche' : 'list'), variant: 'secondary' }
                ]}
            />
             <div ref={containerRef} className="flex-1 flex overflow-hidden">
                {viewMode === 'list' && <div className="w-full h-full">{listPanel}</div>}
                {viewMode === 'list-fiche' && (
                    <>
                        <div style={{ width: `${dividerPosition}%` }} className="h-full flex-shrink-0">{listPanel}</div>
                        <div onMouseDown={handleMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors flex-shrink-0" />
                        <div style={{ width: `${100 - dividerPosition}%` }} className="h-full flex-shrink-0 overflow-y-auto">
                            {selectedMission ? (
                                <MissionDetailPanel mission={selectedMission} onClose={() => setSelectedMission(null)} onEdit={handleOpenModal} onShowRelations={onShowRelations} />
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-gray-500 bg-white"><p>Sélectionnez une mission pour voir ses détails.</p></div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <MissionFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveMission} mission={editingMission} />
        </div>
    );
};

export default MissionsPage;
