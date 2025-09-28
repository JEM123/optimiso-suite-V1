
import React, { useMemo } from 'react';
import { X, Users, Briefcase, FileText, Workflow, Target, AlertTriangle, CheckCircle, TrendingUp, Shield, Link as LinkIcon, ArrowDown, ArrowUp } from 'lucide-react';
import { useDataContext } from '../context/AppContext';
import { modules } from '../constants';
import type { Personne, Poste, Processus } from '../types';

interface ImpactAnalysisModalProps {
    target: any;
    onClose: () => void;
    onExplore: (entity: any, entityType: string) => void;
}

const getModuleIdForEntityType = (entityType: string) => {
    const pluralType = entityType.endsWith('s') ? entityType : `${entityType}s`;
    const module = modules.find(m => m.id === pluralType || m.id === entityType);
    return module ? module.id : entityType;
}

const getEntityName = (entity: any) => entity.nom || entity.intitule || entity.titre;

const ICONS: Record<string, React.ElementType> = {
    personnes: Users, postes: Briefcase, documents: FileText, procedures: Workflow, processus: Target,
    risques: AlertTriangle, controles: CheckCircle, indicateurs: TrendingUp, actifs: Shield, missions: Briefcase,
};

const RelationSection: React.FC<{ title: string; items: any[]; icon: React.ElementType, onExplore: (entity: any, entityType: string) => void }> = ({ title, items, icon: Icon, onExplore }) => {
    if (items.length === 0) return null;
    return (
        <div>
            <h4 className="font-medium text-gray-900 capitalize mb-2 border-b pb-1 text-sm flex items-center gap-2">
                <Icon className="h-4 w-4 text-gray-500" />
                {title} ({items.length})
            </h4>
            <div className="space-y-1 mt-2">
                {items.map((item: any) => (
                     <button
                        key={item.id}
                        onClick={() => onExplore(item, item.entityType)}
                        className="block w-full text-left p-2 rounded-lg bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                    >
                        <div className="flex justify-between items-center">
                             <div>
                                <div className="text-sm font-medium text-blue-700">{getEntityName(item)}</div>
                                <div className="text-xs text-gray-500">{item.reference}</div>
                            </div>
                            {item.raciRole && <span className="text-lg font-bold text-blue-600">{item.raciRole}</span>}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const ImpactAnalysisModal: React.FC<ImpactAnalysisModalProps> = ({ target, onClose, onExplore }) => {
    const { data } = useDataContext();

    const { upstream, downstream } = useMemo(() => {
        if (!target) return { upstream: [], downstream: [] };
        
        const upstreamDeps: any[] = [];
        const downstreamImpacts: any[] = [];

        // UPSTREAM: what the target depends on (links defined on the target itself)
        for (const key in target) {
            if (key.endsWith('Id') && typeof target[key] === 'string') {
                const moduleName = getModuleIdForEntityType(key.slice(0, -2));
                const related = (data[moduleName] as any[])?.find(e => e.id === target[key]);
                if (related) upstreamDeps.push({ ...related, entityType: moduleName });
            } else if (key.endsWith('Ids') && Array.isArray(target[key])) {
                const moduleName = getModuleIdForEntityType(key.slice(0, -3));
                const related = (data[moduleName] as any[])?.filter(e => target[key].includes(e.id));
                if (related?.length > 0) upstreamDeps.push(...related.map(r => ({ ...r, entityType: moduleName })));
            }
        }

        // DOWNSTREAM: what depends on the target (links defined on other items)
        for (const moduleName in data) {
            if (Array.isArray(data[moduleName])) {
                (data[moduleName] as any[]).forEach(item => {
                    for (const key in item) {
                        if ((key.endsWith('Id') && item[key] === target.id) || (key.endsWith('Ids') && Array.isArray(item[key]) && item[key].includes(target.id))) {
                            if (!downstreamImpacts.some(r => r.id === item.id)) {
                                downstreamImpacts.push({ ...item, entityType: moduleName });
                            }
                        }
                    }
                });
            }
        }
        
        // Special case for RACI (downstream for a Poste)
        if (target.type === 'postes') {
             (data.raci as any[]).filter(r => r.posteId === target.id).forEach(r => {
                 const moduleName = getModuleIdForEntityType(r.objetType);
                 const obj = (data[moduleName] as any[])?.find(o => o.id === r.objetId);
                 if (obj && !downstreamImpacts.some(i => i.id === obj.id)) {
                    downstreamImpacts.push({ ...obj, entityType: moduleName, raciRole: r.role });
                 }
             });
        }
        
        return { upstream: upstreamDeps, downstream: downstreamImpacts };
    }, [target, data]);

    if (!target) return null;

    const entityName = getEntityName(target);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg max-w-2xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Analyse d'Impact</h2>
                        <p className="text-sm text-gray-500">Éléments liés à : <span className="font-medium text-gray-700">{entityName} ({target.reference})</span></p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X className="h-5 w-5"/></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-6">
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><ArrowDown className="h-5 w-5 text-red-600"/>Impacts en Aval</h3>
                        <div className="space-y-4">
                            {downstream.length > 0 ? Object.entries(downstream.reduce((acc, item) => {
                                (acc[item.entityType] = acc[item.entityType] || []).push(item);
                                return acc;
                            }, {} as Record<string, any[]>)).map(([type, items]) => (
                                <RelationSection key={type} title={type} items={items} icon={ICONS[type] || LinkIcon} onExplore={onExplore} />
                            )) : <p className="text-sm text-gray-500">Aucun élément n'est directement impacté par cet objet.</p>}
                        </div>
                    </section>
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><ArrowUp className="h-5 w-5 text-green-600"/>Dépendances en Amont</h3>
                        <div className="space-y-4">
                            {upstream.length > 0 ? Object.entries(upstream.reduce((acc, item) => {
                                (acc[item.entityType] = acc[item.entityType] || []).push(item);
                                return acc;
                            }, {} as Record<string, any[]>)).map(([type, items]) => (
                                <RelationSection key={type} title={type} items={items} icon={ICONS[type] || LinkIcon} onExplore={onExplore} />
                            )) : <p className="text-sm text-gray-500">Cet objet n'a pas de dépendances directes.</p>}
                        </div>
                    </section>
                </div>
                <div className="p-4 border-t flex justify-end bg-gray-50"><button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Fermer</button></div>
            </div>
        </div>
    );
};

export default ImpactAnalysisModal;
