import React from 'react';
import { X, Briefcase, Users, Building2, FileText, Settings, Target, AlertTriangle, CheckCircle, BarChart3, TrendingUp, Shield, Scale } from 'lucide-react';
import { mockData } from '../constants';
import { modules } from '../constants';

interface EntityRelationsProps {
    target: any;
    onClose: () => void;
    onExplore: (entity: any, entityType: string) => void;
}

const getRelatedEntities = (entityId: string, entityType: string) => {
    const data = mockData;
    switch (entityType) {
        case 'risques':
            const risque = data.risques.find(e => e.id === entityId);
            if (!risque) return {};
            return {
                'Processus': data.processus.filter(e => e.id === risque.processusId),
                'Contrôles de Maîtrise': data.controles.filter(e => risque.controleMaitriseIds.includes(e.id)),
                'Documents de Maîtrise': data.documents.filter(e => risque.documentMaitriseIds.includes(e.id)),
                'Procédures de Maîtrise': data.procedures.filter(e => risque.procedureMaitriseIds.includes(e.id)),
                'Indicateurs': data.indicateurs.filter(e => risque.indicateurIds.includes(e.id)),
            };
        case 'controles':
            const controle = data.controles.find(e => e.id === entityId);
            if (!controle) return {};
            return {
                'Risques Maîtrisés': data.risques.filter(e => controle.risqueMaitriseIds.includes(e.id)),
                'Procédures': data.procedures.filter(e => controle.procedureIds.includes(e.id)),
                'Documents': data.documents.filter(e => controle.documentIds.includes(e.id)),
                'Indicateurs': data.indicateurs.filter(e => controle.indicateurIds.includes(e.id)),
                'Exécutants': data.personnes.filter(e => controle.executantsIds.includes(e.id)),
            };
        case 'documents':
            const document = data.documents.find(e => e.id === entityId);
            if (!document) return {};
            return {
                'Processus': data.processus.filter(e => document.processusIds.includes(e.id)),
                'Risques': data.risques.filter(e => document.risqueIds.includes(e.id)),
                'Contrôles': data.controles.filter(e => document.controleIds.includes(e.id)),
            };
        case 'procedures':
            const procedure = data.procedures.find(e => e.id === entityId);
            if(!procedure) return {};
            return {
                'Risques': data.risques.filter(e => procedure.risqueIds.includes(e.id)),
                'Contrôles': data.controles.filter(e => procedure.controleIds.includes(e.id)),
                'Documents': data.documents.filter(e => procedure.documentIds.includes(e.id)),
                'Acteurs (Postes)': data.postes.filter(e => procedure.acteursPosteIds.includes(e.id)),
            }
        case 'processus':
            const processus = data.processus.find(e => e.id === entityId);
            if (!processus) return {};
            return {
                'Missions': data.missions.filter(e => processus.missionIds?.includes(e.id)),
                'Procédures': data.procedures.filter(e => processus.procedureIds.includes(e.id)),
                'Risques': data.risques.filter(e => processus.risqueIds.includes(e.id)),
                'Contrôles': data.controles.filter(e => processus.controleIds.includes(e.id)),
                'Indicateurs': data.indicateurs.filter(e => processus.indicateurIds.includes(e.id)),
                'Documents': data.documents.filter(e => processus.documentIds.includes(e.id)),
            }
        case 'personnes':
            const personne = data.personnes.find(e => e.id === entityId);
            if (!personne) return {};
            return {
                'Postes': data.postes.filter(e => personne.posteIds.includes(e.id)),
                'Entités': data.entites.filter(e => personne.entiteIds.includes(e.id)),
                'Rôles': data.roles.filter(e => personne.roleIds.includes(e.id)),
            };
        case 'postes':
            const poste = data.postes.find(e => e.id === entityId);
            if (!poste) return {};
            return {
                'Occupants': data.personnes.filter(e => poste.occupantsIds.includes(e.id)),
                'Compétences Requises': data.competences.filter(e => poste.competencesRequisesIds?.includes(e.id)),
                'Habilitations (Rôles)': data.roles.filter(e => poste.habilitationsRoleIds?.includes(e.id)),
                'Entité': data.entites.filter(e => e.id === poste.entiteId),
            };
        case 'missions':
            const mission = data.missions.find(e => e.id === entityId);
            if(!mission) return {};
            return {
                'KPIs': data.indicateurs.filter(e => mission.kpiIds.includes(e.id)),
                'Processus': data.processus.filter(e => mission.processusIds.includes(e.id)),
                'Risques': data.risques.filter(e => mission.risqueIds.includes(e.id)),
                'Contrôles': data.controles.filter(e => mission.controleIds.includes(e.id)),
            };
        case 'indicateurs':
            const indicateur = data.indicateurs.find(e => e.id === entityId);
            if(!indicateur) return {};
            return {
                'Processus': data.processus.filter(e => indicateur.processusIds.includes(e.id)),
                'Risques': data.risques.filter(e => indicateur.risqueIds.includes(e.id)),
                'Contrôles': data.controles.filter(e => indicateur.controleIds.includes(e.id)),
            };
        case 'incidents':
            const incident = data.incidents.find(e => e.id === entityId);
            if(!incident) return {};
            return {
                'Risque lié': data.risques.filter(e => e.id === incident.lienRisqueId),
                'Contrôle lié': data.controles.filter(e => e.id === incident.lienControleId),
                'Actif lié': data.actifs.filter(e => e.id === incident.lienActifId),
            };
        case 'ameliorations':
             const amelioration = data.ameliorations.find(e => e.id === entityId);
             if(!amelioration) return {};
             return {
                'Incident lié': data.incidents.filter(e => e.id === amelioration.lienIncidentId),
                'Risque lié': data.risques.filter(e => e.id === amelioration.lienRisqueId),
                'Contrôle lié': data.controles.filter(e => e.id === amelioration.lienControleId),
             };
        default:
            return {};
    }
};

const getModuleIdForEntityType = (entityType: string) => {
    if (entityType.endsWith('s')) {
        return entityType;
    }
    const module = modules.find(m => entityType.toLowerCase().includes(m.id.slice(0, -1)));
    return module ? module.id : entityType;
}


const EntityRelations: React.FC<EntityRelationsProps> = ({ target, onClose, onExplore }) => {
    if (!target) return null;
    
    const relations = getRelatedEntities(target.id, target.type);
    const entityName = target.nom || target.intitule || target.titre;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-start justify-end z-40" onClick={onClose}>
            <div className="bg-white h-full w-full max-w-md shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Explorateur de Relations</h3>
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
                    {Object.keys(relations).length === 0 && <p className="text-gray-600 text-center pt-8">Aucune relation directe trouvée.</p>}
                    {Object.entries(relations).map(([relationKey, relationData]) => {
                        if (!relationData || (Array.isArray(relationData) && relationData.length === 0)) return null;
                        
                        const items = Array.isArray(relationData) ? relationData : [relationData];
                        const entityType = getModuleIdForEntityType(relationKey.toLowerCase());
                        
                        return (
                            <div key={relationKey}>
                                <h4 className="font-medium text-gray-900 capitalize mb-2 border-b pb-1 text-sm">
                                    {relationKey} ({items.length})
                                </h4>
                                <div className="space-y-1 mt-2">
                                    {items.map((item: any) => (
                                        <button
                                            key={item.id}
                                            onClick={() => onExplore(item, entityType)}
                                            className="block w-full text-left p-2 rounded-lg bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                                        >
                                            <div className="text-sm font-medium text-blue-700">{item.nom || item.intitule || item.titre}</div>
                                            <div className="text-xs text-gray-500">{item.reference}</div>
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