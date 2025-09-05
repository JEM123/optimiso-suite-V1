import React, { useState, useMemo } from 'react';
import type { Risque } from '../types';
import { X } from 'lucide-react';

const PROBABILITY_SCALE = ['Très faible', 'Faible', 'Moyenne', 'Élevée', 'Très élevée'];
const IMPACT_SCALE = ['Négligeable', 'Mineur', 'Modéré', 'Majeur', 'Critique'];

const getRiskLevelColor = (level: number) => {
    if (level >= 16) return 'bg-red-500 hover:bg-red-600 border-red-700';
    if (level >= 10) return 'bg-orange-500 hover:bg-orange-600 border-orange-700';
    if (level >= 5) return 'bg-yellow-400 hover:bg-yellow-500 border-yellow-600';
    return 'bg-green-500 hover:bg-green-600 border-green-700';
};

interface RiskMapProps {
    risks: Risque[];
    analysisType: keyof Pick<Risque, 'analyseInherente' | 'analyseResiduelle' | 'analyseFuture'>;
    onSelectRisk: (risk: Risque) => void;
}

const RiskMap: React.FC<RiskMapProps> = ({ risks, analysisType, onSelectRisk }) => {
    const [selectedCell, setSelectedCell] = useState<{ p: number, i: number, risks: Risque[] } | null>(null);

    const matrix = useMemo(() => {
        const grid: (Risque[])[][] = Array(5).fill(0).map(() => Array(5).fill(0).map(() => []));
        risks.forEach(risk => {
            const evalData = risk[analysisType];
            if (evalData) {
                const p = evalData.probabilite - 1;
                const i = evalData.impact - 1;
                if (p >= 0 && p < 5 && i >= 0 && i < 5) {
                    grid[4 - p][i].push(risk);
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
        <div className="relative p-4 bg-white border rounded-lg overflow-x-auto">
            <div className="grid grid-cols-6 gap-2 min-w-[700px]">
                {/* Y-axis label */}
                <div className="flex items-center justify-center -rotate-90 row-span-5"><div className="font-semibold text-sm">Probabilité</div></div>
                
                {/* Matrix cells */}
                {matrix.map((row, p) => (
                    row.map((cellRisks, i) => {
                        const level = (5 - p) * (i + 1);
                        const riskCount = cellRisks.length;
                        let bubbleSize = 'w-8 h-8';
                        if (riskCount > 0) bubbleSize = 'w-12 h-12 text-lg';
                        if (riskCount > 2) bubbleSize = 'w-16 h-16 text-xl';
                        if (riskCount > 5) bubbleSize = 'w-20 h-20 text-2xl';

                        return (
                            <div 
                                key={`${p}-${i}`} 
                                className={`h-32 flex items-center justify-center rounded-lg border-2 border-dashed ${riskCount === 0 ? 'bg-gray-50' : 'bg-gray-100'}`}
                                onClick={() => handleCellClick(p, i, cellRisks)}
                            >
                                {riskCount > 0 && (
                                    <div className={`
                                        ${bubbleSize} ${getRiskLevelColor(level)}
                                        flex items-center justify-center rounded-full text-white font-bold
                                        cursor-pointer transition-transform transform hover:scale-110 shadow-lg
                                    `}>
                                        {riskCount}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ))}
                
                {/* X-axis labels */}
                <div />
                {IMPACT_SCALE.map((label, i) => <div key={i} className="text-center font-semibold text-sm pt-2">{label}</div>)}
                 <div className="col-span-1"></div>
                 <div className="col-span-5 flex justify-center items-center"><div className="font-semibold text-sm">Impact</div></div>
            </div>
            
            {/* Modal for selected cell */}
            {selectedCell && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-4 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Risques (P={5 - selectedCell.p}, I={selectedCell.i + 1})</h3>
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

export default RiskMap;