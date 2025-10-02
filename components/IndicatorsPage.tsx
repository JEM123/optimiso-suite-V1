import React, { useState, useMemo } from 'react';
import { mockData } from '../constants';
import type { Indicateur } from '../types';
import { Plus, Search, BarChart3, TrendingUp } from 'lucide-react';
import IndicatorDetailPanel from './IndicatorDetailPanel';
import IndicatorFormModal from './IndicatorFormModal';
import MeasureFormModal from './MeasureFormModal';

interface IndicatorsPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
}

const IndicatorsPage: React.FC<IndicatorsPageProps> = ({ onShowRelations }) => {
    const [indicators, setIndicators] = useState<Indicateur[]>(mockData.indicateurs);
    const [selectedIndicator, setSelectedIndicator] = useState<Indicateur | null>(indicators[0] || null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ categoryId: string, status: string }>({ categoryId: 'all', status: 'all' });
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingIndicator, setEditingIndicator] = useState<Partial<Indicateur> | null>(null);
    const [isMeasureModalOpen, setMeasureModalOpen] = useState(false);

    const filteredIndicators = useMemo(() => {
        return indicators.filter(i =>
            (i.nom.toLowerCase().includes(searchTerm.toLowerCase()) || i.reference.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.categoryId === 'all' || i.categorieIds.includes(filters.categoryId)) &&
            (filters.status === 'all' || i.statut === filters.status)
        );
    }, [indicators, searchTerm, filters]);
    
    const handleOpenFormModal = (indicator?: Indicateur) => {
        setEditingIndicator(indicator || {});
        setFormModalOpen(true);
    };

    const handleSaveIndicator = (indicatorToSave: Indicateur) => {
        // Mock save logic
        if (indicatorToSave.id) {
            const updated = { ...indicatorToSave, dateModification: new Date() } as Indicateur;
            setIndicators(indicators.map(i => i.id === updated.id ? updated : i));
            if (selectedIndicator?.id === updated.id) setSelectedIndicator(updated);
        } else {
            const newIndicator = { ...indicatorToSave, id: `IND-${Date.now()}` } as Indicateur;
            setIndicators([...indicators, newIndicator]);
        }
        setFormModalOpen(false);
    };
    
    return (
        <div className="flex h-[calc(100vh-150px)]">
            <div className="w-1/3 flex flex-col min-w-[350px] bg-white border-r">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Indicateurs</h2>
                    <button onClick={() => handleOpenFormModal()} className="p-1.5 hover:bg-gray-100 rounded-md"><Plus className="h-5 w-5 text-blue-600"/></button>
                </div>
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
            <div className="flex-1 bg-gray-50">
                {selectedIndicator ? (
                    <IndicatorDetailPanel
                        indicator={selectedIndicator}
                        onEdit={handleOpenFormModal}
                        onAddMeasure={() => setMeasureModalOpen(true)}
                        onShowRelations={onShowRelations}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun indicateur sélectionné</h3>
                            <p className="mt-1 text-sm text-gray-500">Sélectionnez un indicateur pour voir ses détails.</p>
                        </div>
                    </div>
                )}
            </div>
            <IndicatorFormModal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} onSave={handleSaveIndicator} indicator={editingIndicator} />
            {selectedIndicator && <MeasureFormModal isOpen={isMeasureModalOpen} onClose={() => setMeasureModalOpen(false)} onSave={() => {}} indicator={selectedIndicator} />}
        </div>
    );
};

export default IndicatorsPage;