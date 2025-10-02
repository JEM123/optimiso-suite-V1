import React, { useState } from 'react';
import type { Risque } from '../types';
import { useDataContext, useAppContext } from '../context/AppContext';
import { X, Edit, Info, ShieldCheck, TrendingUp, BookOpen, History, FileText, Settings, CheckCircle, BarChart3, Link as LinkIcon } from 'lucide-react';

interface RiskDetailPanelProps {
    risque: Risque;
    onClose: () => void;
    onEdit: (r: Risque) => void;
    onShowRelations: (entity: any, entityType: string) => void;
}

const getRiskLevelColor = (level: number) => {
    if (level >= 16) return { text: 'text-red-800', bg: 'bg-red-100', border: 'border-red-500', bar: 'bg-red-500' };
    if (level >= 10) return { text: 'text-orange-800', bg: 'bg-orange-100', border: 'border-orange-500', bar: 'bg-orange-500' };
    if (level >= 5) return { text: 'text-yellow-800', bg: 'bg-yellow-100', border: 'border-yellow-500', bar: 'bg-yellow-400' };
    return { text: 'text-green-800', bg: 'bg-green-100', border: 'border-green-500', bar: 'bg-green-500' };
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

const EvaluationView: React.FC<{ title: string; evaluation: Risque['analyseInherente'] }> = ({ title, evaluation }) => {
    const level = evaluation.probabilite * evaluation.impact;
    const colors = getRiskLevelColor(level);
    return (
        <div className={`p-3 rounded-lg border-l-4 ${colors.border} ${colors.bg}`}>
            <h4 className={`font-semibold ${colors.text}`}>{title}</h4>
            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                <div className="text-center"><p>Probabilité</p><p className="font-bold">{evaluation.probabilite}</p></div>
                <div className="text-center"><p>Impact</p><p className="font-bold">{evaluation.impact}</p></div>
                <div className="text-center"><p>Niveau</p><p className="font-bold">{level}</p></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className={`${colors.bar} h-2.5 rounded-full`} style={{ width: `${(level / 25) * 100}%` }}></div>
            </div>
        </div>
    );
};

const MasteryItem: React.FC<{ item: any, icon: React.ElementType, onNavigate: () => void, onShowRelations: () => void }> = ({ item, icon: Icon, onNavigate, onShowRelations }) => (
    <div className="w-full flex items-center space-x-1 p-2 bg-white border rounded-md group">
        <button onClick={onNavigate} className="flex-1 flex items-center space-x-3 text-left">
            <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">{item.nom}</p>
                <p className="text-xs text-gray-500">{item.reference}</p>
            </div>
        </button>
        <button onClick={onShowRelations} title="Vue 360°" className="p-1.5 hover:bg-gray-100 rounded-full">
            <LinkIcon className="h-4 w-4 text-gray-500"/>
        </button>
    </div>
);

const RiskDetailPanel: React.FC<RiskDetailPanelProps> = ({ risque, onClose, onEdit, onShowRelations }) => {
    const { data } = useDataContext();
    const { handleNotificationClick } = useAppContext();
    const [activeTab, setActiveTab] = useState('identification');
    
    const processus = (data.processus as any[]).find(p => p.id === risque.processusId);
    const proprietaire = (data.postes as any[]).find(p => p.id === risque.proprietairePosteId);
    const controles = (data.controles as any[]).filter(c => risque.controleMaitriseIds.includes(c.id));
    const documents = (data.documents as any[]).filter(d => risque.documentMaitriseIds.includes(d.id));
    const procedures = (data.procedures as any[]).filter(p => risque.procedureMaitriseIds.includes(p.id));
    const indicateurs = (data.indicateurs as any[]).filter(i => risque.indicateurIds?.includes(i.id));

    const navigateToItem = (moduleId: string, itemId: string) => {
        handleNotificationClick({
            id: `nav-${itemId}`, type: 'tache', title: '', description: '', date: new Date(),
            targetModule: moduleId, targetId: itemId
        });
        onClose();
    };

    return (
        <div className="w-full max-w-md bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={risque.nom}>{risque.nom}</h2>
                    <p className="text-sm text-gray-500">{risque.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onShowRelations(risque, 'risques')} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md" title="Voir les relations"><LinkIcon className="h-4 w-4"/></button>
                    <button onClick={() => onEdit(risque)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md" title="Modifier"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="border-b">
                <nav className="flex space-x-1 sm:space-x-2 px-2 sm:px-4">
                    {[
                        { id: 'identification', label: 'Info', icon: Info },
                        { id: 'evaluations', label: 'Évaluations', icon: ShieldCheck },
                        { id: 'maitrise', label: 'Maîtrise', icon: BookOpen },
                        { id: 'plans', label: 'Actions', icon: TrendingUp },
                        { id: 'historique', label: 'Historique', icon: History }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
                {activeTab === 'identification' && (
                    <div className="space-y-4">
                        <DetailItem label="Processus" value={processus?.nom} />
                        <DetailItem label="Propriétaire" value={proprietaire?.intitule} />
                        <DetailItem label="Catégories" value={
                            <div className="flex flex-wrap gap-1">
                                {(data.categoriesRisques as any[]).filter(c=>risque.categorieIds.includes(c.id)).map(c => <span key={c.id} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">{c.nom}</span>)}
                            </div>
                        } />
                        <DetailItem label="Causes" value={<p className="whitespace-pre-wrap">{risque.causes}</p>} />
                        <DetailItem label="Conséquences" value={<p className="whitespace-pre-wrap">{risque.consequences}</p>} />
                    </div>
                )}
                {activeTab === 'evaluations' && (
                    <div className="space-y-3">
                        <EvaluationView title="Analyse Inhérente" evaluation={risque.analyseInherente} />
                        <EvaluationView title="Analyse Résiduelle" evaluation={risque.analyseResiduelle} />
                        {risque.analyseFuture && <EvaluationView title="Analyse Future" evaluation={risque.analyseFuture} />}
                    </div>
                )}
                {activeTab === 'maitrise' && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Contrôles ({controles.length})</h4>
                            <div className="space-y-2">{controles.map(c => <MasteryItem key={c.id} item={c} icon={CheckCircle} onNavigate={() => navigateToItem('controles', c.id)} onShowRelations={() => onShowRelations(c, 'controles')} />)}</div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Documents ({documents.length})</h4>
                            <div className="space-y-2">{documents.map(d => <MasteryItem key={d.id} item={d} icon={FileText} onNavigate={() => navigateToItem('documents', d.id)} onShowRelations={() => onShowRelations(d, 'documents')} />)}</div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Procédures ({procedures.length})</h4>
                            <div className="space-y-2">{procedures.map(p => <MasteryItem key={p.id} item={p} icon={Settings} onNavigate={() => navigateToItem('procedures', p.id)} onShowRelations={() => onShowRelations(p, 'procedures')} />)}</div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Indicateurs ({indicateurs.length})</h4>
                            <div className="space-y-2">{indicateurs.map(i => <MasteryItem key={i.id} item={i} icon={BarChart3} onNavigate={() => navigateToItem('indicateurs', i.id)} onShowRelations={() => onShowRelations(i, 'indicateurs')} />)}</div>
                        </div>
                    </div>
                )}
                 {activeTab === 'plans' && (
                    <div className="text-center text-gray-500 pt-8">
                        <TrendingUp className="h-12 w-12 mx-auto text-gray-300" />
                        <p className="mt-2">Les plans d'action liés à ce risque apparaîtront ici.</p>
                    </div>
                )}
                {activeTab === 'historique' && (
                     <div className="space-y-3 text-sm">
                        <div className="flex items-start space-x-3"><Info className="h-4 w-4 mt-0.5 text-gray-500"/><p>Créé par <strong>{(data.personnes as any[]).find(p=>p.id === risque.auteurId)?.nom}</strong> le {new Date(risque.dateCreation).toLocaleDateString('fr-FR')}</p></div>
                        <div className="flex items-start space-x-3"><Edit className="h-4 w-4 mt-0.5 text-gray-500"/><p>Modifié le {new Date(risque.dateModification).toLocaleDateString('fr-FR')}</p></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiskDetailPanel;