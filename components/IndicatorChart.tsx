import React from 'react';
import type { Indicateur } from '../types';

interface IndicatorChartProps {
    indicator: Indicateur;
}

const IndicatorChart: React.FC<IndicatorChartProps> = ({ indicator }) => {
    const data = indicator.mesures.slice().sort((a, b) => a.dateMesure.getTime() - b.dateMesure.getTime());
    
    if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">Aucune donnée à afficher.</div>;
    }

    const values = data.map(d => d.valeur);
    const maxValue = Math.max(...values, indicator.objectif, indicator.seuilAlerte) * 1.1; // Add 10% buffer

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-grow relative">
                {/* Y-Axis Labels and Grid Lines */}
                <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                    <span>{maxValue.toFixed(1)}</span>
                    <span>{(maxValue / 2).toFixed(1)}</span>
                    <span>0</span>
                </div>
                <div className="absolute top-0 bottom-0 left-8 right-0 border-l border-gray-200">
                     <div className="h-1/2 w-full border-b border-gray-200"></div>
                </div>

                {/* Data Bars */}
                <div className="absolute top-0 bottom-0 left-8 right-0 flex justify-around items-end">
                    {data.map(mesure => {
                         const barColor = mesure.valeur < indicator.seuilAlerte ? 'bg-red-400' : mesure.valeur < indicator.objectif ? 'bg-yellow-400' : 'bg-green-400';
                        return (
                            <div key={mesure.id} className="w-4/5 h-full flex items-end justify-center group">
                                <div
                                    className={`w-full rounded-t transition-all duration-300 hover:opacity-80 relative ${barColor}`}
                                    style={{ height: `${(mesure.valeur / maxValue) * 100}%` }}
                                >
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2">
                                        {mesure.valeur}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Objective and Alert Lines */}
                <div 
                    className="absolute left-8 right-0 border-t-2 border-dashed border-green-600" 
                    style={{ bottom: `${(indicator.objectif / maxValue) * 100}%`}}
                >
                     <span className="text-xs bg-green-100 text-green-800 p-0.5 rounded absolute -top-2.5 -right-1">Objectif</span>
                </div>
                 <div 
                    className="absolute left-8 right-0 border-t-2 border-dashed border-red-600" 
                    style={{ bottom: `${(indicator.seuilAlerte / maxValue) * 100}%`}}
                >
                    <span className="text-xs bg-red-100 text-red-800 p-0.5 rounded absolute -top-2.5 right-0">Alerte</span>
                </div>
            </div>
            {/* X-Axis Labels */}
            <div className="flex justify-around text-xs text-gray-600 mt-2 pl-8">
                {data.map(mesure => (
                    <div key={mesure.id} className="text-center w-full">
                        {mesure.dateMesure.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IndicatorChart;