import React, { useState } from 'react';
import { useDataContext, useAppContext } from '../context/AppContext';
import type { Competence, EvaluationCompetence, PlanFormation, Personne } from '../types';
import { X, Edit, Trash2, Info, Briefcase, UserCheck, BookOpen, Star, BarChart2, Plus } from 'lucide-react';
import PlanFormationFormModal from './PlanFormationFormModal';

interface CompetenceDetailPanelProps {
    competence: Competence;
    onClose: () => void;
    onEdit: (c: Competence) => void;
    onDelete: (id: string) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div><p className="text-sm font-semibold text-gray-700">{label}</p><div className="text-sm text-gray-900 mt-1">{value || '-'}</div></div>
);

const PLAN_STATUT_COLORS: Record<PlanFormation['statut'], string> = {
    'Planifié': 'bg-blue-100 text-blue-800',
    'En cours': 'bg-yellow-100 text-yellow-800',
    'Réalisé': 'bg-green-100 text-green-800',
    'Annulé': 'bg-gray-100 text-gray-800',
};


const CompetenceDetailPanel: React.FC<CompetenceDetailPanelProps> = ({ competence, onClose, onEdit, onDelete }) => {
    const [activeTab, setActiveTab] = useState('details');
    const { data, actions } = useDataContext();
    const { settings } = useAppContext();
    const { postes, evaluationsCompetences, personnes, plansFormation } = data as { postes: any[], evaluationsCompetences: EvaluationCompetence[], personnes: Personne[], plansFormation: PlanFormation[] };

    const [isPlanModalOpen, setPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Partial<PlanFormation> | null>(null);

    const customFieldDefs = settings.customFields.competences || [];
    const hasCustomFields = customFieldDefs.length > 0 && competence.champsLibres && Object.keys(competence.champsLibres).some(key => competence.champsLibres[key]);

    // Logic for Évaluations tab
    const evaluations = evaluationsCompetences
        .filter(e => e.competenceId === competence.id && e.statut === 'completee')
        .map(e => ({...e, personne: personnes.find(p => p.id === e.personneId)}))
        .filter(e => e.personne);
    const avgLevel = evaluations.length > 0 ? (evaluations.reduce((sum, e) => sum + (e.niveauEvalue || 0), 0) / evaluations.length).toFixed(1) : 'N/A';
    const levelCounts = competence.echelleNiveaux.map(level => ({
        ...level,
        count: evaluations.filter(e => e.niveauEvalue === level.niveau).length
    }));
    const maxCount = Math.max(...levelCounts.map(l => l.count), 1);

    // Logic for Plans de formation tab
    const plans = plansFormation.filter(p => p.competenceId === competence.id)
      .map(p => ({...p, personne: personnes.find(pe => pe.id === p.personneId)}))
      .filter(p => p.personne);

    const handleOpenPlanModal = (plan?: PlanFormation) => {
        setEditingPlan(plan ? plan : { competenceId: competence.id });
        setPlanModalOpen(true);
    };

    const handleSavePlan = (plan: PlanFormation) => {
        actions.savePlanFormation(plan);
        setPlanModalOpen(false);
    };

    const handleDeletePlan = (id: string) => {
        if(window.confirm("Êtes-vous sûr de vouloir supprimer ce plan de formation ?")) {
            actions.deletePlanFormation(id);
        }
    };

    return (
        <>
        <div className="w-full max-w-lg bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={competence.nom}>{competence.nom}</h2>
                    <p className="text-sm text-gray-500">{competence.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEdit(competence)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={() => onDelete(competence.id)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Trash2 className="h-4 w-4 text-red-500"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="border-b">
                <nav className="flex space-x-1 sm:space-x-2 px-2 sm:px-4">
                    {[
                        { id: 'details', label: 'Détails', icon: Info },
                        { id: 'postes', label: `Postes (${competence.postesRequis.length})`, icon: Briefcase },
                        { id: 'evaluations', label: 'Évaluations', icon: UserCheck },
                        { id: 'formations', label: 'Plans Formation', icon: BookOpen }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
                {activeTab === 'details' && (
                    <div className="space-y-4">
                        <DetailItem label="Description" value={<p className="whitespace-pre-wrap">{competence.description}</p>} />
                        <DetailItem label="Domaine / Sous-domaine" value={`${competence.domaine}${competence.sousDomaine ? ` / ${competence.sousDomaine}`: ''}`} />
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Échelle des niveaux</p>
                            <div className="space-y-2">
                                {competence.echelleNiveaux.map(e => (
                                    <div key={e.niveau} className="p-3 bg-white border rounded-md">
                                        <p className="font-semibold text-sm">Niveau {e.niveau}: {e.libelle}</p>
                                        <p className="text-xs text-gray-600 mt-1 italic">"{e.criteres}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {hasCustomFields && (
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Champs Personnalisés</p>
                                <div className="space-y-3 mt-2 bg-white p-3 border rounded-md">
                                    {customFieldDefs.map(field => {
                                        const value = competence.champsLibres?.[field.name];
                                        if (!value) return null;
                                        return <DetailItem key={field.id} label={field.name} value={String(value)} />;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'postes' && (
                    <div className="space-y-2">
                        {competence.postesRequis.map(pr => {
                            const poste = (postes as any[]).find(p => p.id === pr.posteId);
                            if (!poste) return null;
                            return (
                                <div key={pr.posteId} className="p-3 bg-white border rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-sm">{poste.intitule}</p>
                                        <p className="text-xs text-gray-500">{poste.reference}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-500" title={`Niveau Attendu: ${pr.niveauAttendu}`}>
                                        {[...Array(pr.niveauAttendu)].map((_,i) => <Star key={i} className="h-4 w-4 fill-current"/>)}
                                        {[...Array(5-pr.niveauAttendu)].map((_,i) => <Star key={i} className="h-4 w-4"/>)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {activeTab === 'evaluations' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white p-3 rounded-lg border text-center"><p className="text-xs text-gray-500">Niveau Moyen</p><p className="text-2xl font-bold text-blue-600">{avgLevel}</p></div>
                           <div className="bg-white p-3 rounded-lg border text-center"><p className="text-xs text-gray-500">Évaluations</p><p className="text-2xl font-bold text-blue-600">{evaluations.length}</p></div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                             <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><BarChart2 className="h-4 w-4"/>Répartition des Niveaux</h4>
                             <div className="space-y-2">
                                {levelCounts.map(level => (
                                    <div key={level.niveau} className="flex items-center gap-2">
                                        <div className="w-16 text-xs text-right shrink-0">{level.libelle}</div>
                                        <div className="w-full bg-gray-200 rounded-full h-4">
                                            <div className="bg-blue-500 h-4 rounded-full text-white text-xs flex items-center justify-end pr-2" style={{width: `${(level.count / maxCount) * 100}%`}}>
                                                {level.count > 0 ? level.count : ''}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                         <div className="bg-white rounded-lg border">
                            <h4 className="font-semibold text-gray-800 p-3 border-b">Détail des Évaluations</h4>
                            <div className="max-h-60 overflow-y-auto">
                               {evaluations.map(ev => (
                                   <div key={ev.id} className="p-3 border-b">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-medium">{ev.personne?.prenom} {ev.personne?.nom}</p>
                                            <p className="text-sm font-bold">Niveau: {ev.niveauEvalue}</p>
                                        </div>
                                        <p className="text-xs text-gray-500">Évalué le {ev.dateEvaluation?.toLocaleDateString('fr-FR')}</p>
                                        {ev.commentaire && <p className="text-xs italic text-gray-600 mt-1 p-2 bg-gray-50 rounded">"{ev.commentaire}"</p>}
                                   </div>
                               ))}
                            </div>
                         </div>
                    </div>
                )}
                 {activeTab === 'formations' && (
                     <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">Plans de formation ({plans.length})</h3>
                            <button onClick={() => handleOpenPlanModal()} className="flex items-center gap-1 text-sm bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"><Plus className="h-4 w-4"/>Ajouter un plan</button>
                         </div>
                         {plans.map(plan => (
                             <div key={plan.id} className="bg-white p-3 rounded-lg border group">
                                 <div className="flex justify-between items-start">
                                     <div>
                                        <p className="text-sm font-medium">{plan.action}</p>
                                        <p className="text-xs text-gray-600 mt-1">{plan.personne?.prenom} {plan.personne?.nom}</p>
                                     </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenPlanModal(plan as PlanFormation)} className="p-1 hover:bg-gray-100 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                        <button onClick={() => handleDeletePlan(plan.id)} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                                    </div>
                                 </div>
                                 <div className="flex justify-between items-center mt-2">
                                     <span className={`px-2 py-0.5 text-xs rounded-full ${PLAN_STATUT_COLORS[plan.statut]}`}>{plan.statut}</span>
                                     <span className="text-xs text-gray-500">Échéance: {new Date(plan.echeance).toLocaleDateString('fr-FR')}</span>
                                 </div>
                             </div>
                         ))}
                         {plans.length === 0 && <p className="text-center text-sm text-gray-500 pt-4">Aucun plan de formation pour cette compétence.</p>}
                     </div>
                )}
            </div>
        </div>
        <PlanFormationFormModal isOpen={isPlanModalOpen} onClose={() => setPlanModalOpen(false)} onSave={handleSavePlan} plan={editingPlan} />
        </>
    );
};

export default CompetenceDetailPanel;