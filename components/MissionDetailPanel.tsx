

import React, { useState } from 'react';
import type { Mission } from '../types';
import { useDataContext } from '../context/AppContext';
// FIX: Import the 'Settings' icon from lucide-react.
import { X, Edit, Info, BarChart3, Link as LinkIcon, History, Briefcase, Building, Target, FileText, CheckCircle, AlertTriangle, Settings } from 'lucide-react';

interface MissionDetailPanelProps {
    mission: Mission;
    onClose: () => void;
    onEdit: (m: Mission) => void;
    onShowRelations: (entity: any, entityType: string) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div><p className="text-sm font-semibold text-gray-700">{label}</p><div className="text-sm text-gray-900 mt-1">{value || '-'}</div></div>
);

const RelationItem: React.FC<{ item: any; icon: React.ElementType }> = ({ item, icon: Icon }) => (
    <div className="flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </div>
);

const MissionDetailPanel: React.FC<MissionDetailPanelProps> = ({ mission, onClose, onEdit, onShowRelations }) => {
    const [activeTab, setActiveTab] = useState('details');
    const { data } = useDataContext();
    const { entites, postes, indicateurs, processus, procedures, documents, risques, controles } = data;

    const getRattachement = () => {
        if (mission.rattachementType === 'Entite') {
            return { item: (entites as any[]).find(e => e.id === mission.rattachementId), icon: Building };
        }
        return { item: (postes as any[]).find(p => p.id === mission.rattachementId), icon: Briefcase };
    };
    const { item: rattachement, icon: RattachementIcon } = getRattachement();
    const responsable = (postes as any[]).find(p => p.id === mission.responsablePosteId);
    
    const kpis = (indicateurs as any[]).filter(i => mission.kpiIds.includes(i.id));
    const linkedProcessus = (processus as any[]).filter(p => mission.processusIds.includes(p.id));
    const linkedProcedures = (procedures as any[]).filter(p => mission.procedureIds.includes(p.id));
    const linkedDocuments = (documents as any[]).filter(d => mission.documentIds.includes(d.id));
    const linkedRisques = (risques as any[]).filter(r => mission.risqueIds.includes(r.id));
    const linkedControles = (controles as any[]).filter(c => mission.controleIds.includes(c.id));

    return (
        <div className="w-full max-w-lg bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div><h2 className="text-lg font-semibold text-gray-800 truncate">{mission.nom}</h2><p className="text-sm text-gray-500">{mission.reference}</p></div>
                <div className="flex space-x-1">
                    <button onClick={() => onEdit(mission)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="border-b"><nav className="flex space-x-2 px-2">
                <button onClick={() => setActiveTab('details')} className={`py-2 px-2 text-sm font-medium flex items-center gap-1.5 ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><Info className="h-4 w-4"/>Détails</button>
                <button onClick={() => setActiveTab('kpi')} className={`py-2 px-2 text-sm font-medium flex items-center gap-1.5 ${activeTab === 'kpi' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><BarChart3 className="h-4 w-4"/>KPI</button>
                <button onClick={() => setActiveTab('liens')} className={`py-2 px-2 text-sm font-medium flex items-center gap-1.5 ${activeTab === 'liens' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><LinkIcon className="h-4 w-4"/>Liens & Interfaces</button>
                <button onClick={() => setActiveTab('historique')} className={`py-2 px-2 text-sm font-medium flex items-center gap-1.5 ${activeTab === 'historique' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><History className="h-4 w-4"/>Historique</button>
            </nav></div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
                {activeTab === 'details' && <div className="space-y-4">
                    <DetailItem label="Description" value={<p className="whitespace-pre-wrap">{mission.description}</p>} />
                    <DetailItem label="Objectifs" value={<p className="whitespace-pre-wrap">{mission.objectifs}</p>} />
                    <DetailItem label="Rattachement" value={<div className="flex items-center gap-2"><RattachementIcon className="h-4 w-4" /><span>{rattachement?.nom || rattachement?.intitule}</span></div>} />
                    <DetailItem label="Responsable (Poste)" value={<div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /><span>{responsable?.intitule}</span></div>} />
                    <DetailItem label="Portée (Clients)" value={mission.portee} />
                </div>}
                
                {activeTab === 'kpi' && <div className="space-y-2">
                    {kpis.map(kpi => {
                         const lastMeasure = kpi.mesures.length > 0 ? kpi.mesures[kpi.mesures.length - 1] : null;
                         return <div key={kpi.id} className="p-3 bg-white border rounded-md"><p className="font-medium text-sm">{kpi.nom}</p><p className="text-xl font-bold text-blue-600">{lastMeasure?.valeur ?? '-'} <span className="text-sm font-normal text-gray-500">{kpi.unite}</span></p></div>
                    })}
                    {kpis.length === 0 && <p className="text-sm text-center text-gray-500 py-4">Aucun KPI lié à cette mission.</p>}
                </div>}

                {activeTab === 'liens' && <div className="space-y-4">
                    <div><h4 className="font-semibold text-gray-800 mb-2">Interfaces (SIPOC)</h4><div className="grid grid-cols-2 gap-4 text-sm"><DetailItem label="Entrées" value={mission.entrees} /><DetailItem label="Sorties" value={mission.sorties} /></div></div>
                    <div><h4 className="font-semibold text-gray-800 mb-2">Processus ({linkedProcessus.length})</h4><div className="space-y-2">{linkedProcessus.map((item: any) => <RelationItem key={item.id} item={item} icon={Target} />)}</div></div>
                    <div><h4 className="font-semibold text-gray-800 mb-2">Procédures ({linkedProcedures.length})</h4><div className="space-y-2">{linkedProcedures.map((item: any) => <RelationItem key={item.id} item={item} icon={Settings} />)}</div></div>
                    <div><h4 className="font-semibold text-gray-800 mb-2">Documents ({linkedDocuments.length})</h4><div className="space-y-2">{linkedDocuments.map((item: any) => <RelationItem key={item.id} item={item} icon={FileText} />)}</div></div>
                    <div><h4 className="font-semibold text-gray-800 mb-2">Risques ({linkedRisques.length})</h4><div className="space-y-2">{linkedRisques.map((item: any) => <RelationItem key={item.id} item={item} icon={AlertTriangle} />)}</div></div>
                    <div><h4 className="font-semibold text-gray-800 mb-2">Contrôles ({linkedControles.length})</h4><div className="space-y-2">{linkedControles.map((item: any) => <RelationItem key={item.id} item={item} icon={CheckCircle} />)}</div></div>
                </div>}
                
                {activeTab === 'historique' && <div className="space-y-3 text-sm">
                    <DetailItem label="Créé le" value={mission.dateCreation.toLocaleDateString('fr-FR')} />
                    <DetailItem label="Dernière modification" value={mission.dateModification.toLocaleDateString('fr-FR')} />
                    <DetailItem label="Auteur" value={(data.personnes as any[]).find((p: any) => p.id === mission.auteurId)?.nom || 'N/A'} />
                </div>}
            </div>
        </div>
    );
};

export default MissionDetailPanel;