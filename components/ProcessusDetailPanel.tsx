
import React, { useState } from 'react';
import type { Processus } from '../types';
import { useDataContext, useAppContext } from '../context/AppContext';
import { X, Edit, Info, Users, BookOpen, Link as LinkIcon, Briefcase, FileText, Settings, CheckCircle, BarChart3, AlertTriangle, GitMerge, ChevronUp, ChevronDown, Workflow } from 'lucide-react';

interface ProcessusDetailPanelProps {
    processus: Processus;
    onClose: () => void;
    onEdit: (p: Processus) => void;
    onShowRelations: (entity: any, entityType: string) => void;
    onNavigate: (proc: Processus) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

const ProcessusDetailPanel: React.FC<ProcessusDetailPanelProps> = ({ processus, onClose, onEdit, onShowRelations, onNavigate }) => {
    const { data } = useDataContext();
    const { settings } = useAppContext();
    const parent = (data.processus as Processus[]).find(p => p.id === processus.parentId);
    const children = (data.processus as Processus[]).filter(p => p.parentId === processus.id);
    const proprietaire = (data.postes as any[]).find((p: any) => p.id === processus.proprietaireProcessusId);
    const mission = (data.missions as any[]).find(m => m.id === processus.missionId);
    
    const customFieldDefs = settings.customFields.processus || [];
    const hasCustomFields = customFieldDefs.length > 0 && processus.champsLibres && Object.keys(processus.champsLibres).some(key => processus.champsLibres[key]);

    return (
        <div className="w-full max-w-lg bg-white border-l shadow-lg flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={processus.nom}>{processus.nom}</h2>
                    <p className="text-sm text-gray-500">{processus.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onShowRelations(processus, 'processus')} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md" title="Voir les relations"><LinkIcon className="h-4 w-4"/></button>
                    <button onClick={() => onEdit(processus)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md" title="Modifier"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50 space-y-4">
                <DetailItem label="Type" value={processus.type} />
                <DetailItem label="Niveau" value={processus.niveau} />
                 <DetailItem label="Mission Mère" value={
                    mission ? (
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-500"/>
                            <span>{mission.nom}</span>
                        </div>
                    ) : 'Aucune'
                } />
                <DetailItem label="Propriétaire" value={proprietaire?.intitule} />
                <DetailItem label="Parent" value={parent ? <button onClick={() => onNavigate(parent)} className="text-blue-600 hover:underline">{parent.nom}</button> : 'Aucun'} />
                
                <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Sous-processus ({children.length})</h4>
                    <div className="space-y-1">
                        {children.map(child => (
                            <div key={child.id} className="p-2 bg-white border rounded-md text-sm">
                                <button onClick={() => onNavigate(child)} className="text-blue-600 hover:underline">{child.nom}</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-800 mb-2">SIPOC</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <DetailItem label="Fournisseurs" value={processus.fournisseurs} />
                        <DetailItem label="Entrées" value={processus.entrees} />
                        <DetailItem label="Sorties" value={processus.sorties} />
                        <DetailItem label="Clients" value={processus.clients} />
                    </div>
                </div>

                {hasCustomFields && (
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Champs Libres</h4>
                        <div className="space-y-3 mt-2 bg-white p-3 border rounded-md">
                            {customFieldDefs.map(field => {
                                const value = processus.champsLibres?.[field.name];
                                if (!value) return null;
                                return <DetailItem key={field.id} label={field.name} value={String(value)} />;
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProcessusDetailPanel;
