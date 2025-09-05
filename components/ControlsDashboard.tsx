import React from 'react';
import type { Controle, ExecutionControle } from '../types';
import { CheckCircle, XCircle, Clock, FileWarning } from 'lucide-react';

interface ControlsDashboardProps {
    controls: Controle[];
    executions: ExecutionControle[];
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ElementType; color: string; }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-800">{value}</div>
            <div className="text-sm text-gray-600">{title}</div>
        </div>
    </div>
);

const ControlsDashboard: React.FC<ControlsDashboardProps> = ({ controls, executions }) => {
    const stats = {
        total: controls.length,
        aFaire: executions.filter(e => e.statut === 'a_faire').length,
        enRetard: executions.filter(e => e.statut === 'en_retard').length,
        termine: executions.filter(e => e.statut === 'terminé').length,
        nonConforme: executions.filter(e => e.statut === 'non-conforme').length,
    };

    const executionStatusData = [
        { label: 'À faire', value: stats.aFaire, color: 'bg-yellow-400' },
        { label: 'En retard', value: stats.enRetard, color: 'bg-red-500' },
        { label: 'Terminé', value: stats.termine, color: 'bg-green-500' },
        { label: 'Non Conforme', value: stats.nonConforme, color: 'bg-orange-500' },
    ];
    const totalExecutions = executions.length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Exécutions en retard" value={stats.enRetard} icon={Clock} color="bg-red-500" />
                <StatCard title="Exécutions à faire" value={stats.aFaire} icon={FileWarning} color="bg-yellow-500" />
                <StatCard title="Exécutions terminées" value={stats.termine} icon={CheckCircle} color="bg-green-500" />
                <StatCard title="Exécutions non conformes" value={stats.nonConforme} icon={XCircle} color="bg-orange-500" />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-semibold mb-4 text-gray-800">Répartition des statuts d'exécution</h3>
                <div className="space-y-3">
                    {executionStatusData.map(d => (
                        <div key={d.label}>
                            <div className="flex justify-between text-sm mb-1">
                                <span>{d.label}</span>
                                <span>{d.value} ({totalExecutions > 0 ? ((d.value/totalExecutions)*100).toFixed(0) : 0}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className={`${d.color} h-2.5 rounded-full`} style={{ width: totalExecutions > 0 ? `${(d.value / totalExecutions) * 100}%` : '0%' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ControlsDashboard;
