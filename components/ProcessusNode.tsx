
import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { useDataContext } from '../context/AppContext';
import type { Processus, Risque, Indicateur } from '../types';
import { Plus, Minus, AlertTriangle, TrendingUp, Edit, Trash2, Link as LinkIcon, Briefcase, GitMerge, Shield, Settings, Target } from 'lucide-react';

const typeInfo: Record<Processus['type'], { border: string, bg: string, icon: React.ElementType }> = {
    'Management': { border: 'border-purple-500', bg: 'bg-purple-50', icon: Shield },
    'Métier': { border: 'border-blue-500', bg: 'bg-blue-50', icon: GitMerge },
    'Support': { border: 'border-green-500', bg: 'bg-green-50', icon: Settings },
};

// Helper to get risk status
const getRiskStatus = (risks: Risque[]) => {
    if (!risks || risks.length === 0) {
        return { maxLevel: 0, color: 'text-gray-400' };
    }
    const maxLevel = Math.max(...risks.map(r => r.analyseResiduelle.probabilite * r.analyseResiduelle.impact));
    let color = 'text-green-500';
    if (maxLevel >= 16) color = 'text-red-500';
    else if (maxLevel >= 10) color = 'text-orange-500';
    else if (maxLevel >= 5) color = 'text-yellow-500';
    return { maxLevel, color };
};

// Helper to get KPI status
const getKpiStatus = (indicators: Indicateur[]) => {
    if (!indicators || indicators.length === 0) {
        return 'text-gray-400';
    }
    let hasRed = false;
    let hasOrange = false;
    indicators.forEach(ind => {
        const lastMeasure = ind.mesures.length > 0 ? ind.mesures[ind.mesures.length - 1] : null;
        if (lastMeasure) {
            if (lastMeasure.valeur < ind.seuilAlerte) hasRed = true;
            else if (lastMeasure.valeur < ind.objectif) hasOrange = true;
        }
    });
    if (hasRed) return 'text-red-500';
    if (hasOrange) return 'text-orange-500';
    return 'text-green-500';
};

const ProcessusNode = ({ data, selected }: NodeProps<Processus & { onEdit: (p: Processus) => void, onAddSub: (p: Processus) => void, onDelete: (p: Processus) => void, onShowRelations: (p: any, type: string) => void, childrenCount: number, isExpanded: boolean, onExpandCollapse: (id: string) => void, isDimmed?: boolean }>) => {
    const { data: appData } = useDataContext();
    
    const { onEdit, onAddSub, onDelete, onShowRelations, childrenCount, isExpanded, onExpandCollapse, isDimmed, ...processus } = data;
    
    const linkedRisks = (appData.risques as Risque[]).filter(r => processus.risqueIds.includes(r.id));
    const linkedIndicators = (appData.indicateurs as Indicateur[]).filter(i => processus.indicateurIds.includes(i.id));
    const proprietaire = (appData.postes as any[]).find(p => p.id === processus.proprietaireProcessusId);

    const riskStatus = getRiskStatus(linkedRisks);
    const kpiStatusColor = getKpiStatus(linkedIndicators);
    
    const { border, bg, icon: Icon } = typeInfo[processus.type] || { border: 'border-gray-500', bg: 'bg-gray-50', icon: Target };

    return (
        <div className={`p-3 rounded-lg shadow-md border-l-4 w-64 group relative ${border} ${bg} transition-opacity duration-300 ${isDimmed ? 'opacity-30' : 'opacity-100'} ${selected ? 'ring-2 ring-offset-2 ring-blue-600' : ''}`}>
            <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />
            
            <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${border.replace('border-', 'text-')}`} />
                <div className="font-bold text-sm text-gray-800 truncate">{processus.nom}</div>
            </div>
            <p className="text-xs text-gray-500 ml-7">{processus.reference}</p>
            {proprietaire && <p className="text-xs text-gray-600 mt-2 flex items-center gap-1.5"><Briefcase className="h-3 w-3" />{proprietaire.intitule}</p>}

            <div className="flex items-center justify-between mt-3 pt-2 border-t">
                <div className="flex items-center gap-3">
                    <div title="Niveau de risque maximal" className={`flex items-center gap-1 ${riskStatus.color}`}>
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-bold text-xs">{riskStatus.maxLevel}</span>
                    </div>
                     <div title="Performance des indicateurs" className={`flex items-center gap-1 ${kpiStatusColor}`}>
                        <TrendingUp className="h-4 w-4" />
                    </div>
                </div>
                {childrenCount > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); onExpandCollapse(processus.id); }} className="p-1 text-gray-500 hover:bg-gray-200 rounded-full">
                        {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                )}
            </div>

             <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white/50 backdrop-blur-sm rounded-md p-1 space-x-1 z-10">
                <button onClick={(e) => { e.stopPropagation(); onShowRelations(processus, 'processus') }} title="Voir les relations" className="p-1 hover:bg-gray-200 rounded"><LinkIcon className="h-4 w-4 text-gray-500"/></button>
                {processus.niveau !== 'L3' && <button onClick={(e) => { e.stopPropagation(); onAddSub(processus); }} title="Ajouter sous-processus" className="p-1 hover:bg-gray-200 rounded"><Plus className="h-4 w-4 text-green-600"/></button>}
                <button onClick={(e) => { e.stopPropagation(); onEdit(processus); }} title="Modifier" className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(processus); }} title="Supprimer" className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3" />
        </div>
    );
};

export default ProcessusNode;
