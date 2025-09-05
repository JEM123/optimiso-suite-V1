import React, { useState } from 'react';
import type { Processus } from '../types';
import { useDataContext } from '../context/AppContext';
import { X, Edit, Info, Users, BookOpen, Link as LinkIcon, Briefcase, FileText, Settings, CheckCircle, BarChart3, AlertTriangle, GitMerge, ChevronUp, ChevronDown, Workflow } from 'lucide-react';

interface ProcessusDetailPanelProps {
    processus: Processus;
    onClose: () => void;
    onEdit: (p: Processus) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

const RelationItem: React.FC<{ item: any, icon: React.ElementType }> = ({ item, icon: Icon }) => (
    <div className="flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </div>
);

const ProcessusDetailPanel: React.FC<ProcessusDetailPanelProps> = ({ processus, onClose, onEdit }) => {
    const [activeTab, setActiveTab] = useState('details');
    const { data } = useDataContext();
    const { postes, entites, missions, procedures, indicateurs, risques, controles, documents } = data;

    const proprietaire = postes.find((p: any) => p.id === processus.proprietaireProcessusId);
    const parent = data.processus.find((p: any) => p.id === processus.parentId);
    const children = data.processus.filter((p: any) => p.parentId === processus.id);

    return (
        <div className="w-full max-w-lg bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={processus.nom}>{processus.nom}</h2>
                    <p className="text-sm text-gray-500">{processus.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEdit(processus)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="border-b">
                <nav className="flex space-x-2 px-2">
                    <button onClick={() => setActiveTab('details')} className={`py-2 px-2 text-sm font-medium flex items-center gap-1.5 ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><Info className="h-4 w-4"/>Détails & SIPOC</button>
                    <button onClick={() => setActiveTab('liens')} className={`py-2 px-1 text-sm font-medium flex items-center gap-1.5 ${activeTab === 'liens' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><LinkIcon className="h-4 w-4"/>Liens</button>
                    <button onClick={() => setActiveTab('hierarchie')} className={`py-2 px-1 text-sm font-medium flex items-center gap-1.5 ${activeTab === 'hierarchie' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><GitMerge className="h-4 w-4"/>Hiérarchie</button>
                </nav>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
                {activeTab === 'details' && <div className="space-y-4">
                    <DetailItem label="Description" value={<p className="whitespace-pre-wrap">{processus.description}</p>} />
                    <DetailItem label="Propriétaire" value={<div className="flex items-center gap-2"><Briefcase className="h-4 w-4"/><span>{proprietaire?.intitule}</span></div>} />
                    <DetailItem label="Type" value={processus.type} />
                     <fieldset className="border p-4 rounded-lg bg-white"><legend className="px-2 text-base font-semibold">SIPOC</legend>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <DetailItem label="Fournisseurs" value={processus.fournisseurs} />
                            <DetailItem label="Clients" value={processus.clients} />
                            <DetailItem label="Entrées" value={processus.entrees} />
                            <DetailItem label="Sorties" value={processus.sorties} />
                        </div>
                    </fieldset>
                </div>}
                
                {activeTab === 'liens' && <div className="space-y-4">
                     <div><h4 className="font-semibold text-gray-800 mb-2">Missions ({processus.missionIds?.length || 0})</h4><div className="space-y-2">{missions.filter((m: any) => processus.missionIds?.includes(m.id)).map((item: any) => <RelationItem key={item.id} item={item} icon={Briefcase} />)}</div></div>
                    <div><h4 className="font-semibold text-gray-800 mb-2">Procédures ({processus.procedureIds.length})</h4><div className="space-y-2">{procedures.filter((p: any) => processus.procedureIds.includes(p.id)).map((item: any) => <RelationItem key={item.id} item={item} icon={Settings} />)}</div></div>
                    <div><h4 className="font-semibold text-gray-800 mb-2">Indicateurs ({processus.indicateurIds.length})</h4><div className="space-y-2">{indicateurs.filter((i: any) => processus.indicateurIds.includes(i.id)).map((item: any) => <RelationItem key={item.id} item={item} icon={BarChart3} />)}</div></div>
                    <div><h4 className="font-semibold text-gray-800 mb-2">Risques ({processus.risqueIds.length})</h4><div className="space-y-2">{risques.filter((r: any) => processus.risqueIds.includes(r.id)).map((item: any) => <RelationItem key={item.id} item={item} icon={AlertTriangle} />)}</div></div>
                    <div><h4 className="font-semibold text-gray-800 mb-2">Contrôles ({processus.controleIds.length})</h4><div className="space-y-2">{controles.filter((c: any) => processus.controleIds.includes(c.id)).map((item: any) => <RelationItem key={item.id} item={item} icon={CheckCircle} />)}</div></div>
                </div>}

                {activeTab === 'hierarchie' && <div className="space-y-4">
                    <div><h4 className="font-semibold text-gray-800 mb-2">Parent</h4>
                        {parent ? <RelationItem item={parent} icon={ChevronUp} /> : <p className="text-sm text-gray-500">Aucun (processus racine)</p>}
                    </div>
                     <div><h4 className="font-semibold text-gray-800 mb-2">Enfants ({children.length})</h4>
                        <div className="space-y-2">{children.map((item: any) => <RelationItem key={item.id} item={item} icon={ChevronDown} />)}</div>
                    </div>
                </div>}

            </div>
        </div>
    );
};

export default ProcessusDetailPanel;
