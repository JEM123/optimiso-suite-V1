import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Indicateur } from '../types';
import { Plus, Search, BarChart3, TrendingUp, Eye } from 'lucide-react';
import IndicatorDetailPanel from './IndicatorDetailPanel';
import IndicatorFormModal from './IndicatorFormModal';
import MeasureFormModal from './MeasureFormModal';
import PageHeader from './PageHeader';

interface IndicatorsPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
}

const IndicatorsPage: React.FC<IndicatorsPageProps> = ({ onShowRelations }) => {
    const { data, actions } = useDataContext();
    const [viewMode, setViewMode] = useState<'list-fiche' | 'list'>('list-fiche');
    const [selectedIndicator, setSelectedIndicator] = useState<Indicateur | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingIndicator, setEditingIndicator] = useState<Partial<Indicateur> | null>(null);
    const [isMeasureModalOpen, setMeasureModalOpen] = useState(false);

    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dividerPosition, setDividerPosition] = useState(35);
    
    const filteredIndicators = useMemo(() => {
        return (data.indicateurs as Indicateur[]).filter(i =>
            (i.nom.toLowerCase().includes(searchTerm.toLowerCase()) || i.reference.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [data.indicateurs, searchTerm]);
    
    const handleOpenFormModal = (indicator?: Indicateur) => { setEditingIndicator(indicator || {}); setFormModalOpen(true); };
    const handleSaveIndicator = (indicatorToSave: Indicateur) => {
        actions.saveIndicateur(indicatorToSave).then(() => {
             if (selectedIndicator?.id === indicatorToSave.id) setSelectedIndicator(indicatorToSave);
        });
        setFormModalOpen(false);
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
            <div className="p-2 border-b">
                <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 w-full border rounded-md py-1 text-sm"/></div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredIndicators.map(ind => {
                    const lastMeasure = ind.mesures.length > 0 ? ind.mesures[ind.mesures.length - 1] : null;
                    const isUnderAlert = lastMeasure && lastMeasure.valeur < ind.seuilAlerte;
                    return (
                    <div key={ind.id} onClick={() => setSelectedIndicator(ind)} className={`p-3 border-b cursor-pointer ${selectedIndicator?.id === ind.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-sm text-gray-800">{ind.nom}</h3>
                            {isUnderAlert && <span title="Sous le seuil d'alerte"><TrendingUp className="h-4 w-4 text-red-500"/></span>}
                        </div>
                        <p className="text-xs text-gray-500">{ind.reference}</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-xl font-bold text-blue-600">{lastMeasure?.valeur ?? '-'} <span className="text-sm font-normal text-gray-500">{ind.unite}</span></span>
                            <span className="text-xs text-gray-500">Objectif: {ind.objectif} {ind.unite}</span>
                        </div>
                    </div>
                )})}
            </div>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Indicateurs" icon={BarChart3} actions={[
                { label: 'Nouvel Indicateur', icon: Plus, onClick: () => handleOpenFormModal(), variant: 'primary' },
                { label: viewMode === 'list' ? 'Liste + Fiche' : 'Liste', icon: Eye, onClick: () => setViewMode(v => v === 'list' ? 'list-fiche' : 'list'), variant: 'secondary' }
            ]} />
            <div ref={containerRef} className="flex-1 flex overflow-hidden">
                {viewMode === 'list' && <div className="w-full h-full">{listPanel}</div>}
                {viewMode === 'list-fiche' && (
                    <>
                        <div style={{ width: `${dividerPosition}%` }} className="h-full flex-shrink-0">{listPanel}</div>
                        <div onMouseDown={handleMouseDown} className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors flex-shrink-0" />
                        <div style={{ width: `${100 - dividerPosition}%` }} className="h-full flex-shrink-0 overflow-y-auto">
                            {selectedIndicator ? (
                                <IndicatorDetailPanel indicator={selectedIndicator} onClose={() => setSelectedIndicator(null)} onEdit={handleOpenFormModal} onAddMeasure={() => setMeasureModalOpen(true)} onShowRelations={onShowRelations} />
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-gray-500 bg-white"><p>Sélectionnez un indicateur pour voir ses détails.</p></div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <IndicatorFormModal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} onSave={handleSaveIndicator} indicator={editingIndicator} />
            {selectedIndicator && <MeasureFormModal isOpen={isMeasureModalOpen} onClose={() => setMeasureModalOpen(false)} onSave={() => {}} indicator={selectedIndicator} />}
        </div>
    );
};

export default IndicatorsPage;
