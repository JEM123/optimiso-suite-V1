import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { NormeLoiCadre, NormeLoiExigence } from '../types';
import { Plus, Search, Scale, Edit, Trash2, Eye } from 'lucide-react';
import NormesLoisDetailPanel from './NormesLoisDetailPanel';
import { useDataContext } from '../context/AppContext';
import NormeLoiCadreFormModal from './NormeLoiCadreFormModal';
import NormeLoiExigenceFormModal from './NormeLoiExigenceFormModal';
import PageHeader from './PageHeader';

const CADRE_TYPE_COLORS: Record<NormeLoiCadre['typeCadre'], string> = {
    'Norme': 'border-blue-500', 'Loi': 'border-red-500',
    'Règlement': 'border-purple-500', 'Politique interne': 'border-green-500',
};
const newCadreTemplate = (): Partial<NormeLoiCadre> => ({ nom: '', reference: '', statut: 'brouillon', typeCadre: 'Norme', responsableConformiteId: '', actif: true, dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1' });

const NormesLoisPage: React.FC = () => {
    const { data, actions } = useDataContext();
    const { normesLoisCadres, normesLoisExigences } = data;
    
    const [viewMode, setViewMode] = useState<'list-fiche' | 'list'>('list-fiche');
    const [selectedCadre, setSelectedCadre] = useState<NormeLoiCadre | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCadreModalOpen, setCadreModalOpen] = useState(false);
    const [editingCadre, setEditingCadre] = useState<Partial<NormeLoiCadre> | null>(null);
    const [isExigenceModalOpen, setExigenceModalOpen] = useState(false);
    const [editingExigence, setEditingExigence] = useState<Partial<NormeLoiExigence> | null>(null);

    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dividerPosition, setDividerPosition] = useState(35);

    const filteredCadres = useMemo(() => {
        return (normesLoisCadres as NormeLoiCadre[]).filter(c => c.nom.toLowerCase().includes(searchTerm.toLowerCase()) || c.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [normesLoisCadres, searchTerm]);

    const handleOpenCadreModal = (cadre?: NormeLoiCadre) => { setEditingCadre(cadre || newCadreTemplate()); setCadreModalOpen(true); };
    const handleSaveCadre = (cadre: NormeLoiCadre) => { actions.saveNormeLoiCadre(cadre); setCadreModalOpen(false); };
    const handleDeleteCadre = (id: string) => { if (window.confirm("Supprimer ce cadre et ses exigences ?")) { actions.deleteNormeLoiCadre(id); if (selectedCadre?.id === id) setSelectedCadre(null); }};
    const handleOpenExigenceModal = (exigence?: NormeLoiExigence) => { if (selectedCadre) { setEditingExigence(exigence || { cadreId: selectedCadre.id }); setExigenceModalOpen(true); }};
    const handleSaveExigence = (exigence: NormeLoiExigence) => { actions.saveNormeLoiExigence(exigence); setExigenceModalOpen(false); };
    const handleDeleteExigence = (id: string) => { if (window.confirm("Supprimer cette exigence ?")) actions.deleteNormeLoiExigence(id); };

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
            <div className="p-2 border-b"><div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 w-full border rounded-md py-1 text-sm"/></div></div>
            <div className="flex-1 overflow-y-auto">
                {filteredCadres.map(cadre => (
                    <div key={cadre.id} onClick={() => setSelectedCadre(cadre)} className={`p-3 border-l-4 cursor-pointer group relative ${selectedCadre?.id === cadre.id ? 'bg-blue-50' : 'hover:bg-gray-50'} ${CADRE_TYPE_COLORS[cadre.typeCadre]}`}>
                        <h3 className="font-semibold text-sm text-gray-800">{cadre.nom}</h3>
                        <p className="text-xs text-gray-500">{cadre.reference}</p>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                            <button onClick={(e) => { e.stopPropagation(); handleOpenCadreModal(cadre)}} className="p-1 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4 text-blue-600"/></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCadre(cadre.id)}} className="p-1 hover:bg-gray-200 rounded-md"><Trash2 className="h-4 w-4 text-red-600"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col">
             <PageHeader title="Normes & Lois" icon={Scale} actions={[
                { label: 'Nouveau Cadre', icon: Plus, onClick: () => handleOpenCadreModal(), variant: 'primary' },
                { label: viewMode === 'list' ? 'Liste + Fiche' : 'Liste', icon: Eye, onClick: () => setViewMode(v => v === 'list' ? 'list-fiche' : 'list'), variant: 'secondary' }
            ]} />
            <div ref={containerRef} className="flex-1 flex overflow-hidden">
                {viewMode === 'list' && <div className="w-full h-full">{listPanel}</div>}
                {viewMode === 'list-fiche' && (
                    <>
                        <div style={{ width: `${dividerPosition}%` }} className="h-full flex-shrink-0">{listPanel}</div>
                        <div onMouseDown={handleMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors flex-shrink-0" />
                        <div style={{ width: `${100 - dividerPosition}%` }} className="h-full flex-shrink-0 overflow-y-auto">
                            {selectedCadre ? (
                                <NormesLoisDetailPanel 
                                    cadre={selectedCadre} 
                                    exigences={ (normesLoisExigences as NormeLoiExigence[]).filter(e => e.cadreId === selectedCadre.id) }
                                    onEditCadre={handleOpenCadreModal} onDeleteCadre={handleDeleteCadre} onAddExigence={handleOpenExigenceModal}
                                    onEditExigence={handleOpenExigenceModal} onDeleteExigence={handleDeleteExigence}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-gray-500 bg-white"><p>Sélectionnez un cadre normatif pour voir ses détails.</p></div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <NormeLoiCadreFormModal isOpen={isCadreModalOpen} onClose={() => setCadreModalOpen(false)} onSave={handleSaveCadre} cadre={editingCadre} />
            <NormeLoiExigenceFormModal isOpen={isExigenceModalOpen} onClose={() => setExigenceModalOpen(false)} onSave={handleSaveExigence} exigence={editingExigence} />
        </div>
    );
};

export default NormesLoisPage;