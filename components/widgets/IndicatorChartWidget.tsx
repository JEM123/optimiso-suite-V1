import React from 'react';
import { mockData } from '../../constants';
import type { AccueilComponentConfig } from '../../types';

interface IndicatorChartWidgetProps {
    config: AccueilComponentConfig;
}

const IndicatorChartWidget: React.FC<IndicatorChartWidgetProps> = ({ config }) => {
    const indicator = (mockData.indicateurs as any[]).find(i => i.id === config.indicatorId);

    if (!indicator) {
        return (
            <div className="bg-white rounded-lg p-4 shadow-sm border h-full flex flex-col items-center justify-center">
                <p className="text-gray-600">Veuillez sélectionner un indicateur dans les paramètres.</p>
            </div>
        );
    }
    
    const data = indicator.mesures;
    const title = indicator.nom;
    const maxValue = data.length > 0 ? Math.max(...data.map((d: any) => d.valeur)) : 1;
    
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
            <div className="flex-grow flex items-end space-x-2">
                {data.map((mesure: any) => (
                    <div key={mesure.id} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 relative group"
                            style={{ height: `${(mesure.valeur / maxValue) * 100}%` }}>
                             <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2">
                                {mesure.valeur.toLocaleString('fr-FR')}
                             </div>
                        </div>
                        <div className="text-xs mt-2 text-gray-600">{new Date(mesure.dateMesure).toLocaleDateString('fr-FR', { month: 'short' })}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IndicatorChartWidget;
