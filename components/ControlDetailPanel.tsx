import React, { useState } from 'react';
import type { Controle, ExecutionControle } from '../types';
import { mockData } from '../constants';
import { X, Edit, Info, Clock, BookOpen, History, FileText, Settings, AlertTriangle, Check, XCircle, Loader, Link as LinkIcon } from 'lucide-react';

interface ControlDetailPanelProps {
    control: Controle;
    onClose: () => void;
    onEdit: (c: Controle) => void;
    onShowRelations: (entity: any, entityType: string) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

const MasteryItem: React.FC<{ item: any, icon: React.ElementType, onClick: () => void }> = ({ item, icon: Icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50 cursor-pointer text-left">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </button>
);

const ExecutionStatusIcon: React.FC<{ status: ExecutionControle['statut'] }> = ({ status }) => {
    switch (status) {
        case 'terminé': return <Check className="h-5 w-5 text-green-500" />;
        case 'non-conforme': return <XCircle className="h-5 w-5 text-red-500" />;
        case 'en_retard': return <Clock className="h-5 w-5 text-red-500" />;
        case 'a_faire': return <Loader className="h-5 w-5 text-yellow-500 animate-spin" />;
        default: return <Info className="h-5 w-5 text-gray-500" />;
    }
};


const ControlDetailPanel: React.FC<ControlDetailPanelProps> = ({ control, onClose, onEdit, onShowRelations }) => {
    const [activeTab, setActiveTab] = useState('details');
    
    const { personnes, risques, documents, procedures, executionsControles } = mockData;
    const executants = personnes.filter(p => control.executantsIds.includes(p.id));
    const superviseur = personnes.find(p => p.id === control.superviseurId);
    const linkedRisks = risques.filter(r => control.risqueMaitriseIds.includes(r.id));
    const linkedDocuments = documents.filter(d => control.documentIds.includes(d.id));
    const linkedProcedures = procedures.filter(p => control.procedureIds.includes(p.id));
    const controlExecutions = executionsControles.filter(e => e.controleId === control.id);

    return (
        <div className="w-full max-w-md bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={control.nom}>{control.nom}</h2>
                    <p className="text-sm text-gray-500">{control.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onShowRelations(control, 'controles')} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><LinkIcon className="h-4 w-4"/></button>
                    <button onClick={() => onEdit(control)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="border-b">
                <nav className="flex space-x-1 sm:space-x-2 px-2 sm:px-4">
                    {[
                        { id: 'details', label: 'Détails', icon: Info },
                        { id: 'planification', label: 'Planification', icon: Clock },
                        { id: 'maitrise', label: 'Maîtrise', icon: BookOpen },
                        { id: 'executions', label: 'Exécutions', icon: History }
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
                        <DetailItem label="Méthode d'exécution" value={<p className="whitespace-pre-wrap">{control.methodeExecution}</p>} />
                        <DetailItem label="Catégories" value={
                            <div className="flex flex-wrap gap-1">
                                {mockData.categoriesControles.filter(c=>control.categorieIds.includes(c.id)).map(c => <span key={c.id} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">{c.nom}</span>)}
                            </div>
                        } />
                    </div>
                )}
                {activeTab === 'planification' && (
                    <div className="space-y-4">
                        <DetailItem label="Type de Planification" value={control.typePlanification.replace('_', ' ')} />
                        {control.frequence && <DetailItem label="Fréquence" value={control.frequence} />}
                        <DetailItem label="Exécutants" value={executants.map(e => `${e.prenom} ${e.nom}`).join(', ')} />
                        {superviseur && <DetailItem label="Superviseur" value={`${superviseur.prenom} ${superviseur.nom}`} />}
                    </div>
                )}
                {activeTab === 'maitrise' && (
                     <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Risques Maîtrisés ({linkedRisks.length})</h4>
                            <div className="space-y-2">{linkedRisks.map(r => <MasteryItem key={r.id} item={r} icon={AlertTriangle} onClick={() => onShowRelations(r, 'risques')} />)}</div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Documents Liés ({linkedDocuments.length})</h4>
                            <div className="space-y-2">{linkedDocuments.map(d => <MasteryItem key={d.id} item={d} icon={FileText} onClick={() => onShowRelations(d, 'documents')} />)}</div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Procédures Liées ({linkedProcedures.length})</h4>
                            <div className="space-y-2">{linkedProcedures.map(p => <MasteryItem key={p.id} item={p} icon={Settings} onClick={() => onShowRelations(p, 'procedures')} />)}</div>
                        </div>
                    </div>
                )}
                {activeTab === 'executions' && (
                    <div className="space-y-2">
                        {controlExecutions.map(exec => (
                             <div key={exec.id} className="flex items-center space-x-3 p-2 bg-white border rounded-md">
                                <ExecutionStatusIcon status={exec.statut} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{exec.nom}</p>
                                    <p className="text-xs text-gray-500">Échéance: {exec.dateEcheance.toLocaleDateString('fr-FR')}</p>
                                </div>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ControlDetailPanel;