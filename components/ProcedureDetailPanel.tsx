import React, { useState } from 'react';
import type { Procedure, EtapeProcedure } from '../types';
import { mockData } from '../constants';
import { Edit, FileText, Settings, AlertTriangle, CheckCircle, Copy, Download, Trash2, Briefcase, FileInput, FileOutput } from 'lucide-react';
import ProcedureFlow from './ProcedureFlow';

interface ProcedureDetailPanelProps {
    procedure: Procedure;
    onEditProcedure: (proc: Procedure) => void;
    onDuplicateProcedure: (procId: string) => void;
    onDeleteProcedure: (procId: string) => void;
    onEditStep: (procId: string, step: EtapeProcedure) => void;
    onAddStep: (procId: string) => void;
    onDeleteStep: (procId: string, stepId: string) => void;
    onReorderStep: (procId: string, stepId: string, direction: 'up' | 'down') => void;
    onShowRelations: (entity: any, entityType: string) => void;
}

const RelationItem: React.FC<{ item: any; icon: React.ElementType, onClick: () => void }> = ({ item, icon: Icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50 cursor-pointer text-left">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </button>
);

const StepItem: React.FC<{ etape: EtapeProcedure }> = ({ etape }) => {
    const responsable = mockData.postes.find(p => p.id === etape.responsablePosteId);
    const entrees = mockData.documents.filter(d => etape.entreesIds.includes(d.id));
    const sorties = mockData.documents.filter(d => etape.sortiesIds.includes(d.id));
    return (
        <div className="p-3 bg-white border rounded-lg">
            <div className="flex items-start">
                <div className="bg-blue-500 text-white rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold text-sm">
                    {etape.ordre}
                </div>
                <div className="ml-3 flex-1">
                    <h5 className="font-semibold text-gray-800">{etape.libelle}</h5>
                    {responsable && <p className="text-xs text-gray-600 flex items-center mt-1"><Briefcase className="h-3 w-3 mr-1"/>{responsable.intitule}</p>}
                    {etape.description && <p className="text-sm text-gray-600 mt-2">{etape.description}</p>}
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <p className="font-medium flex items-center gap-1"><FileInput className="h-3 w-3"/>Entrées ({entrees.length})</p>
                            {entrees.map(d => <p key={d.id} className="text-gray-600 truncate"> - {d.nom}</p>)}
                        </div>
                        <div>
                            <p className="font-medium flex items-center gap-1"><FileOutput className="h-3 w-3"/>Sorties ({sorties.length})</p>
                            {sorties.map(d => <p key={d.id} className="text-gray-600 truncate"> - {d.nom}</p>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProcedureDetailPanel: React.FC<ProcedureDetailPanelProps> = ({ procedure, onEditProcedure, onDuplicateProcedure, onDeleteProcedure, onEditStep, onAddStep, onDeleteStep, onReorderStep, onShowRelations }) => {
    const [activeTab, setActiveTab] = useState<'flow' | 'sheet'>('flow');

    const { risques, controles, documents, postes } = mockData;
    const acteurs = postes.filter(p => procedure.acteursPosteIds.includes(p.id));
    const linkedRisques = risques.filter(r => procedure.risqueIds.includes(r.id));
    const linkedControles = controles.filter(c => procedure.controleIds.includes(c.id));
    const linkedDocuments = documents.filter(d => procedure.documentIds.includes(d.id));

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="p-4 border-b bg-white flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">{procedure.nom}</h2>
                    <p className="text-sm text-gray-500">{procedure.reference}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => onEditProcedure(procedure)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Modifier"><Edit className="h-4 w-4"/></button>
                    <button onClick={() => onDuplicateProcedure(procedure.id)} title="Dupliquer" className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><Copy className="h-4 w-4"/></button>
                    <button onClick={() => onDeleteProcedure(procedure.id)} title="Supprimer" className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><Trash2 className="h-4 w-4 text-red-500"/></button>
                    <button title="Exporter" className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><Download className="h-4 w-4"/></button>
                </div>
            </div>

            <div className="border-b bg-white">
                <nav className="flex space-x-4 px-4">
                    <button onClick={() => setActiveTab('flow')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'flow' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Flux</button>
                    <button onClick={() => setActiveTab('sheet')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'sheet' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Fiche</button>
                </nav>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'flow' && (
                    <ProcedureFlow 
                        procedure={procedure}
                        onEditStep={onEditStep}
                        onAddStep={onAddStep}
                        onDeleteStep={onDeleteStep}
                        onReorderStep={onReorderStep}
                    />
                )}
                {activeTab === 'sheet' && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded-md border">{procedure.description}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Étapes</h3>
                            <div className="space-y-2">
                                {procedure.etapes.sort((a,b) => a.ordre - b.ordre).map(etape => <StepItem key={etape.id} etape={etape} />)}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Acteurs</h3>
                            <div className="flex flex-wrap gap-2">{acteurs.map(a => <span key={a.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{a.intitule}</span>)}</div>
                        </div>
                         <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Relations</h3>
                            <div className="space-y-4">
                                <div><h4 className="font-medium text-gray-700 mb-2 text-sm">Risques Liés ({linkedRisques.length})</h4><div className="space-y-2">{linkedRisques.map(r => <RelationItem key={r.id} item={r} icon={AlertTriangle} onClick={() => onShowRelations(r, 'risques')} />)}</div></div>
                                <div><h4 className="font-medium text-gray-700 mb-2 text-sm">Contrôles Liés ({linkedControles.length})</h4><div className="space-y-2">{linkedControles.map(c => <RelationItem key={c.id} item={c} icon={CheckCircle} onClick={() => onShowRelations(c, 'controles')} />)}</div></div>
                                <div><h4 className="font-medium text-gray-700 mb-2 text-sm">Documents Liés ({linkedDocuments.length})</h4><div className="space-y-2">{linkedDocuments.map(d => <RelationItem key={d.id} item={d} icon={FileText} onClick={() => onShowRelations(d, 'documents')} />)}</div></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProcedureDetailPanel;