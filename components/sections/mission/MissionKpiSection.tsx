import React from 'react';
import type { Mission, Indicateur } from '../../../types';
import { useDataContext } from '../../../context/AppContext';

interface MissionKpiSectionProps {
    mission: Mission;
}

const MissionKpiSection: React.FC<MissionKpiSectionProps> = ({ mission }) => {
    const { data } = useDataContext();
    const kpis = (data.indicateurs as Indicateur[]).filter(i => mission.kpiIds?.includes(i.id));
    
    return (
        <div className="space-y-2">
            {kpis.map(kpi => {
                 const lastMeasure = kpi.mesures.length > 0 ? kpi.mesures[kpi.mesures.length - 1] : null;
                 return (
                    <div key={kpi.id} className="p-3 bg-white border rounded-md">
                        <p className="font-medium text-sm">{kpi.nom}</p>
                        <p className="text-xl font-bold text-blue-600">{lastMeasure?.valeur ?? '-'} <span className="text-sm font-normal text-gray-500">{kpi.unite}</span></p>
                    </div>
                 );
            })}
            {kpis.length === 0 && <p className="text-sm text-center text-gray-500 py-4">Aucun KPI lié à cette mission.</p>}
        </div>
    );
};

export default MissionKpiSection;
