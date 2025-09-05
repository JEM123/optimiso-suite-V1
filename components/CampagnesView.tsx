import React, { useState, useMemo } from 'react';
import { useDataContext } from '../context/AppContext';
import type { CampagneEvaluation, EvaluationCompetence } from '../types';
import { Plus, Calendar, Check, X } from 'lucide-react';
import CampagneDetailPanel from './CampagneDetailPanel';
import CampagneFormModal from './CampagneFormModal';

const STATUT_COLORS: Record<CampagneEvaluation['statut'], string> = {
    'brouillon': 'bg-gray-100 text-gray-800',
    'en_cours': 'bg-blue-100 text-blue-800',
    'clôturé': 'bg-green-100 text-green-800',
    'archive': 'bg-red-100 text-red-800',
    'planifié': 'bg-yellow-100 text-yellow-800',
    // a completer
    'valide': 'bg-green-100 text-green-800',
    'à_créer': 'bg-cyan-100 text-cyan-800',
    'en_recrutement': 'bg-yellow-100 text-yellow-800',
    'gelé': 'bg-purple-100 text-purple-800',
    'figé': 'bg-indigo-100 text-indigo-800',
    'terminé': 'bg-green-100 text-green-800',
    'non-conforme': 'bg-red-200 text-red-900',
    'a_faire': 'bg-yellow-100 text-yellow-800',
    'en_retard': 'bg-red-200 text-red-900',
    'en_validation': 'bg-yellow-100 text-yellow-800',
    'publie': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800',
};

const CampagnesView: React.FC = () => {
    const { data, actions } = useDataContext();
    const { campagnesEvaluation, evaluationsCompetences } = data as { campagnesEvaluation: CampagneEvaluation[], evaluationsCompetences: EvaluationCompetence[] };

    const [selectedCampagne, setSelectedCampagne] = useState<CampagneEvaluation | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampagne, setEditingCampagne] = useState<Partial<CampagneEvaluation> | null>(null);

    const campagnesWithProgress = useMemo(() => {
        return campagnesEvaluation.map(campagne => {
            const relevantEvals = evaluationsCompetences.filter(e => e.campagneId === campagne.id);
            const completedCount = relevantEvals.filter(e => e.statut === 'completee').length;
            const progress = relevantEvals.length > 0 ? (completedCount / relevantEvals.length) * 100 : 0;
            return { ...campagne, progress, totalEvals: relevantEvals.length, completedEvals: completedCount };
        });
    }, [campagnesEvaluation, evaluationsCompetences]);

    const handleOpenModal = (campagne?: CampagneEvaluation) => {
        setEditingCampagne(campagne || {});
        setIsModalOpen(true);
    };

    const handleSaveCampagne = (campagne: CampagneEvaluation) => {
        actions.saveCampagneEvaluation(campagne);
        setIsModalOpen(false);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b bg-white flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Gestion des Campagnes</h2>
                    <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium">
                        <Plus className="h-4 w-4" /><span>Nouvelle Campagne</span>
                    </button>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    <div className="space-y-3">
                        {campagnesWithProgress.map(campagne => (
                            <div key={campagne.id} onClick={() => setSelectedCampagne(campagne)} className={`bg-white p-4 rounded-lg border-l-4 ${selectedCampagne?.id === campagne.id ? 'border-blue-600' : 'border-gray-300'} hover:border-blue-500 cursor-pointer shadow-sm`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{campagne.nom}</h3>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <Calendar className="h-3 w-3 mr-1.5" />
                                            <span>{new Date(campagne.periodeDebut).toLocaleDateString('fr-FR')} - {new Date(campagne.periodeFin).toLocaleDateString('fr-FR')}</span>
                                            <span className={`ml-3 px-2 py-0.5 text-xs rounded-full capitalize ${STATUT_COLORS[campagne.statut]}`}>{campagne.statut.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-600">
                                        {campagne.completedEvals} / {campagne.totalEvals}
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${campagne.progress}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {selectedCampagne && (
                <CampagneDetailPanel 
                    campagne={selectedCampagne} 
                    onClose={() => setSelectedCampagne(null)}
                    onEdit={handleOpenModal}
                />
            )}
            <CampagneFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCampagne} campagne={editingCampagne} />
        </div>
    );
};

export default CampagnesView;
