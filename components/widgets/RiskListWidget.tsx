import React from 'react';
import { useDataContext } from '../../context/AppContext';
import type { AccueilComponentConfig, Risque } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface RiskListWidgetProps {
    config: AccueilComponentConfig;
}

const RiskListWidget: React.FC<RiskListWidgetProps> = ({ config }) => {
    const { data } = useDataContext();
    const risques = data.risques as Risque[];

    return (
    <div className="bg-white rounded-lg p-4 shadow-sm border h-full">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            {config.title || 'Risques Principaux'}
        </h3>
        <div className="space-y-3">
            {risques.slice(0, 3).map((risque: Risque) => (
                <div key={risque.id} className="border-b pb-3 last:border-b-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{risque.nom}</h4>
                    <div className="flex space-x-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Inhérent: {risque.analyseInherente.probabilite * risque.analyseInherente.impact}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Résiduel: {risque.analyseResiduelle.probabilite * risque.analyseResiduelle.impact}
                        </span>
                    </div>
                </div>
            ))}
        </div>
        <div className="mt-4 text-center"><button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Voir tous les risques</button></div>
    </div>
)};

export default RiskListWidget;
