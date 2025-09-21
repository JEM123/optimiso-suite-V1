import React, { useState, useMemo } from 'react';
import type { Risque } from '../types';
import { X } from 'lucide-react';

const PROBABILITY_SCALE = ['Très faible', 'Faible', 'Moyenne', 'Élevée', 'Très élevée'];
const IMPACT_SCALE = ['Négligeable', 'Mineur', 'Modéré', 'Majeur', 'Critique'];

const getCellBgColor = (level: number) => {
    if (level >= 16) return 'bg-red-100 hover:bg-red-200';
    if (level >= 10) return 'bg-orange-100 hover:bg-orange-200';
    if (level >= 5) return 'bg-yellow-100 hover:bg-yellow-200';
    return 'bg-green-100 hover:bg-green-200';
};

const getRiskBubbleColor = (level: number) => {
    if (level >= 16) return 'bg-red-500 border-red-700';
    if (level >= 10) return 'bg-orange-500 border-orange-700';
    if (level >= 5) return 'bg-yellow-400 border-yellow-600';
    return 'bg-green-500 border-green-700';
};

interface RiskMatrixProps {
    risks: Risque[];
    analysisType: keyof Pick<Risque, 'analyseInherente' | 'analyseResiduelle' | 'analyseFuture'>;
    onSelectRisk: (risk: Risque) => void;
}

const RiskMatrix: React.FC<RiskMatrixProps> = ({ risks, analysisType, onSelectRisk }) => {
    const [selectedCell, setSelectedCell] = useState<{ p: number, i: number, risks: Risque[] } | null>(null);

    const matrix = useMemo(() => {
        const grid: (Risque[])[][] = Array(5).fill(0).map(() => Array(5).fill(0).map(() => []));
        risks.forEach(risk => {
            const evalData = risk[analysisType];
            if (evalData) {
                const p = evalData.probabilite - 1; // 0-4
                const i = evalData.impact - 1; // 0-4
                if (p >= 0 && p < 5 && i >= 0 && i < 5) {
                    grid[4 - p][i].push(risk); // Y-axis is inverted for display
                }
            }
        });
        return grid;
    }, [risks, analysisType]);

    const handleCellClick = (p: number, i: number, cellRisks: Risque[]) => {
        if (cellRisks.length > 0) {
            setSelectedCell({ p, i, risks: cellRisks });
        }
    };
    
    return (
        <div className="relative p-4 bg-white border rounded-lg overflow-auto">
            <div className="flex">
                <div className="flex items-center justify-center -rotate-90 w-24 text-center font-bold text-sm text-gray-700">Probabilité →</div>
                <div className="flex-1">
                    <div className="grid grid-cols-5 gap-1">
                        {PROBABILITY_SCALE.slice().reverse().map((pLabel, p_idx) => (
                            IMPACT_SCALE.map((iLabel, i_idx) => {
                                const p = 5 - p_idx;
                                const i = i_idx + 1;
                                const level = p * i;
                                const cellRisks = matrix[p_idx][i_idx];
                                const riskCount = cellRisks.length;
                                return (
                                    <div 
                                        key={`${p_idx}-${i_idx}`} 
                                        className={`h-24 flex items-center justify-center rounded-md border border-gray-200 transition-colors ${getCellBgColor(level)} ${riskCount > 0 ? 'cursor-pointer' : ''}`}
                                        onClick={() => handleCellClick(p, i, cellRisks)}
                                    >
                                        {riskCount > 0 && (
                                            <div className={`
                                                w-10 h-10 ${getRiskBubbleColor(level)}
                                                flex items-center justify-center rounded-full text-white font-bold
                                                transition-transform transform group-hover:scale-110 shadow-md text-lg
                                            `}>
                                                {riskCount}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                    <div className="grid grid-cols-5 gap-1 mt-1">
                        {IMPACT_SCALE.map(label => <div key={label} className="text-center font-semibold text-sm">{label}</div>)}
                    </div>
                </div>
            </div>
            <div className="text-center font-bold text-gray-700 pt-2 ml-24">Impact →</div>

            {selectedCell && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-4 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Risques (P={selectedCell.p}, I={selectedCell.i})</h3>
                            <button onClick={() => setSelectedCell(null)} className="p-1 rounded-full hover:bg-gray-200"><X className="h-5 w-5"/></button>
                        </div>
                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                            {selectedCell.risks.map(risk => (
                                <li key={risk.id}>
                                    <button onClick={() => { onSelectRisk(risk); setSelectedCell(null); }} className="w-full text-left p-2 rounded-md hover:bg-blue-50 text-blue-700">
                                       <span className="font-medium">{risk.reference}:</span> {risk.nom}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskMatrix;
