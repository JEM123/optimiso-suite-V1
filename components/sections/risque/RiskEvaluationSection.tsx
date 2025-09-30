import React from 'react';
import type { Risque } from '../../../types';

const getRiskLevel = (p: number, i: number) => p * i;
const getRiskColor = (level: number) => {
    if (level >= 16) return 'bg-red-500';
    if (level >= 10) return 'bg-orange-500';
    if (level >= 5) return 'bg-yellow-400';
    return 'bg-green-500';
};

const EvaluationCard: React.FC<{ title: string, evaluation: Risque['analyseInherente'] }> = ({ title, evaluation }) => {
    const level = getRiskLevel(evaluation.probabilite, evaluation.impact);
    return (
        <div className="p-3 bg-white border rounded-lg">
            <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
            <div className="flex items-center justify-between mt-2">
                <div className="text-center">
                    <p className="text-xs text-gray-500">Prob.</p>
                    <p className="font-bold text-lg">{evaluation.probabilite}</p>
                </div>
                 <div className="text-center">
                    <p className="text-xs text-gray-500">Impact</p>
                    <p className="font-bold text-lg">{evaluation.impact}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getRiskColor(level)}`}>
                    {level}
                </div>
            </div>
        </div>
    );
};

interface RiskEvaluationSectionProps {
    risque: Risque;
}

const RiskEvaluationSection: React.FC<RiskEvaluationSectionProps> = ({ risque }) => {
    return (
        <div className="space-y-3">
            <EvaluationCard title="Évaluation Inhérente" evaluation={risque.analyseInherente} />
            <EvaluationCard title="Évaluation Résiduelle" evaluation={risque.analyseResiduelle} />
        </div>
    );
};

export default RiskEvaluationSection;
