import React from 'react';
import type { Controle, ExecutionControle } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { Check, X } from 'lucide-react';

interface ControlExecutionsSectionProps {
    control: Controle;
}

const ControlExecutionsSection: React.FC<ControlExecutionsSectionProps> = ({ control }) => {
    const { data } = useDataContext();
    const executions = (data.executionsControles as ExecutionControle[]).filter(e => e.controleId === control.id);

    return (
        <div className="space-y-2">
            {executions.map(exec => (
                <div key={exec.id} className="p-3 bg-white border rounded-md">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">
                            {exec.dateExecution ? `Exécuté le ${new Date(exec.dateExecution).toLocaleDateString('fr-FR')}` : `À faire pour le ${new Date(exec.dateEcheance).toLocaleDateString('fr-FR')}`}
                        </p>
                        <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${exec.statut === 'terminé' ? 'bg-green-100 text-green-800' : exec.statut === 'non-conforme' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {exec.statut === 'terminé' ? <Check className="h-3 w-3"/> : exec.statut === 'non-conforme' ? <X className="h-3 w-3"/> : null}
                            {exec.statut.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ControlExecutionsSection;
