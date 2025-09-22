import React from 'react';
// FIX: Import Link as LinkIcon from lucide-react.
import { X, Users, Briefcase, FileText, Workflow, Target, AlertTriangle, CheckCircle, TrendingUp, Shield, Link as LinkIcon } from 'lucide-react';
import { modules } from '../constants';
import { useDataContext } from '../context/AppContext';
import { Personne, Poste, Processus } from '../types';

interface EntityRelationsProps {
    target: any;
    onClose: () => void;
    onExplore: (entity: any, entityType: string) => void;
}

const getModuleIdForEntityType = (entityType: string) => {
    const pluralType = entityType.endsWith('s') ? entityType : `${entityType}s`;
    const module = modules.find(m => m.id === pluralType);
    return module ? module.id : entityType;
}

const getEntityName = (entity: any) => entity.nom || entity.intitule || entity.titre;

const EntityRelations: React.FC<EntityRelationsProps> = ({ target, onClose, onExplore }) => {
    const { data } = useDataContext();

    const getRelatedEntities = React.useCallback((entity: any) => {
        const relations: Record<string, any[]> = {};
        const entityType = entity.type;

        // Direct links (outgoing from the entity)
        for (const key in entity) {
            if (key.endsWith('Id') && typeof entity[key] === 'string') {
                const moduleName = getModuleIdForEntityType(key.slice(0, -2));
                const related = (data[moduleName] as any[])?.find(e => e.id === entity[key]);
                if (related) {
                    if (!relations[moduleName]) relations[moduleName] = [];
                    relations[moduleName].push(related);
                }
            } else if (key.endsWith('Ids') && Array.isArray(entity[key])) {
                const moduleName = getModuleIdForEntityType(key.slice(0, -3));
                const related = (data[moduleName] as any[])?.filter(e => entity[key].includes(e.id));
                if (related && related.length > 0) {
                    if (!relations[moduleName]) relations[moduleName] = [];
                    relations[moduleName].push(...related);
                }
            }
        }
        
        // Inverse links (incoming to the entity)
        for (const moduleName in data) {
            if (Array.isArray(data[moduleName])) {
                (data[moduleName] as any[]).forEach(item => {
                    for (const key in item) {
                        if ((key.endsWith('Id') && item[key] === entity.id) || (key.endsWith('Ids') && Array.isArray(item[key]) && item[key].includes(entity.id))) {
                            if (!relations[moduleName]) relations[moduleName] = [];
                            // Avoid duplicates
                            if (!relations[moduleName].some(r => r.id === item.id)) {
                                relations[moduleName].push(item);
                            }
                        }
                    }
                });
            }
        }

        // Special logic for deeper relationships
        if (entityType === 'postes') {
            const poste = entity as Poste;
            relations['Processus (Propriétaire)'] = (data.processus as Processus[]).filter(p => p.proprietaireProcessusId === poste.id);
            relations['RACI'] = (data.raci as any[]).filter(r => r.posteId === poste.id).map(r => {
                const obj = (data[getModuleIdForEntityType(r.objetType)] as any[])?.find(o => o.id === r.objetId);
                return obj ? { ...obj, raciRole: r.role } : null;
            }).filter(Boolean);
        }
        if (entityType === 'personnes') {
             const personne = entity as Personne;
             const postes = (data.postes as Poste[]).filter(p => p.occupantsIds.includes(personne.id));
             if (postes.length > 0) {
                if (!relations['postes']) relations['postes'] = [];
                relations['postes'].push(...postes.filter(p => !relations['postes'].some(rp => rp.id === p.id)));
             }
        }

        return relations;
    }, [data]);
    
    if (!target) return null;
    
    const relations = getRelatedEntities(target);
    const entityName = getEntityName(target);
    const ICONS: Record<string, React.ElementType> = {
        personnes: Users, postes: Briefcase, documents: FileText, procedures: Workflow, processus: Target,
        risques: AlertTriangle, controles: CheckCircle, indicateurs: TrendingUp, actifs: Shield
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-start justify-end z-40" onClick={onClose}>
            <div className="bg-white h-full w-full max-w-md shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Vue 360°</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 truncate" title={entityName}>{entityName}</p>
                        <p className="text-xs text-blue-600">{target.reference}</p>
                    </div>
                </div>
                
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {Object.keys(relations).length === 0 && <p className="text-gray-600 text-center pt-8">Aucune relation trouvée.</p>}
                    {Object.entries(relations).map(([relationKey, relationData]) => {
                        if (!relationData || (Array.isArray(relationData) && relationData.length === 0)) return null;
                        
                        const items = Array.isArray(relationData) ? relationData : [relationData];
                        const entityType = getModuleIdForEntityType(relationKey.toLowerCase());
                        const Icon = ICONS[entityType] || LinkIcon;
                        
                        return (
                            <div key={relationKey}>
                                <h4 className="font-medium text-gray-900 capitalize mb-2 border-b pb-1 text-sm flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-gray-500" />
                                    {relationKey.replace(/ \(.+?\)/, '')} ({items.length})
                                </h4>
                                <div className="space-y-1 mt-2">
                                    {items.map((item: any) => (
                                        <button
                                            key={item.id}
                                            onClick={() => onExplore(item, entityType)}
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
                    })}
                </div>
            </div>
        </div>
    );
};

export default EntityRelations;