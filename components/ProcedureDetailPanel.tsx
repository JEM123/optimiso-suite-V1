import React, { useState } from 'react';
import type { Procedure, EtapeProcedure, Poste, Document, Risque, Controle } from '../types';
import { useDataContext } from '../context/AppContext';
import { X, Briefcase, FileInput, FileOutput, Edit, BookOpen, Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProcedureStepDetailPanelProps {
    etape: EtapeProcedure;
    procedure: Procedure;
    onClose: () => void;
    onShowRelations: (entity: any, entityType: string) => void;
    onEdit: (etape: EtapeProcedure) => void;
}

const RelationItem: React.FC<{ item: any; icon: React.ElementType, onClick: () => void }> = ({ item, icon: Icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50 text-left">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </button>
);


const ProcedureStepDetailPanel: React.FC<ProcedureStepDetailPanelProps> = ({ etape, procedure, onClose, onShowRelations, onEdit }) => {
    const { data } = useDataContext();
    const [activeTab, setActiveTab] = useState('details');

    const responsable = (data.postes as Poste[]).find(p => p.id === etape.responsablePosteId);
    const entrees = (data.documents as Document[]).filter(d => etape.entreesIds?.includes(d.id));
    const sorties = (data.documents as Document[]).filter(d => etape.sortiesIds?.includes(d.id));
    const risques = (data.risques as Risque[]).filter(r => etape.risqueIds?.includes(r.id));
    const controles = (data.controles as Controle[]).filter(c => etape.controleIds?.includes(c.id));

    return (
        <div className="w-full max-w-sm bg-white border-l shadow-lg flex flex-col h-full animate-slide-in-right z-10">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <p className="text-xs text-gray-500">Étape {etape.ordre}</p>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={etape.libelle}>{etape.libelle}</h2>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEdit(etape)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md" title="Modifier l'étape"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="border-b">
                <nav className="flex space-x-1 px-2">
                    <button onClick={() => setActiveTab('details')} className={`py-2 px-2 text-sm font-medium flex items-center gap-1.5 ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><Info className="h-4 w-4" />Détails</button>
                    <button onClick={() => setActiveTab('maitrise')} className={`py-2 px-2 text-sm font-medium flex items-center gap-1.5 ${activeTab === 'maitrise' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><BookOpen className="h-4 w-4" />Maîtrise</button>
                </nav>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50 space-y-4">
                {activeTab === 'details' && (
                    <>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><Briefcase className="h-4 w-4" />Responsable</h4>
                            {responsable ? (
                                <div className="p-2 bg-white border rounded-md text-sm">{responsable.intitule}</div>
                            ) : (
                                <div className="p-2 bg-white border rounded-md text-sm text-gray-500">Non défini</div>
                            )}
                        </div>
                        
                        {etape.description && <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                            <p className="text-sm text-gray-700 p-3 bg-white border rounded-md whitespace-pre-wrap">{etape.description}</p>
                        </div>}

                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><FileInput className="h-4 w-4" />Documents en Entrée ({entrees.length})</h4>
                            <div className="space-y-2">
                                {entrees.map(doc => <RelationItem key={doc.id} item={doc} icon={FileInput} onClick={() => onShowRelations(doc, 'documents')} />)}
                                {entrees.length === 0 && <p className="text-xs text-gray-500 italic">Aucun document en entrée.</p>}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><FileOutput className="h-4 w-4" />Documents en Sortie ({sorties.length})</h4>
                            <div className="space-y-2">
                                {sorties.map(doc => <RelationItem key={doc.id} item={doc} icon={FileOutput} onClick={() => onShowRelations(doc, 'documents')} />)}
                                {sorties.length === 0 && <p className="text-xs text-gray-500 italic">Aucun document en sortie.</p>}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'maitrise' && (
                     <>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Risques liés ({risques.length})</h4>
                            <div className="space-y-2">
                                {risques.map(risk => <RelationItem key={risk.id} item={risk} icon={AlertTriangle} onClick={() => onShowRelations(risk, 'risques')} />)}
                                {risques.length === 0 && <p className="text-xs text-gray-500 italic">Aucun risque lié.</p>}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><CheckCircle className="h-4 w-4" />Contrôles de maîtrise ({controles.length})</h4>
                            <div className="space-y-2">
                                {controles.map(ctrl => <RelationItem key={ctrl.id} item={ctrl} icon={CheckCircle} onClick={() => onShowRelations(ctrl, 'controles')} />)}
                                {controles.length === 0 && <p className="text-xs text-gray-500 italic">Aucun contrôle lié.</p>}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProcedureStepDetailPanel;
