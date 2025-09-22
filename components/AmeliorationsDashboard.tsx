import React from 'react';
import type { Amelioration } from '../types';
import { useDataContext } from '../context/AppContext';
import { AlertTriangle, Clock, TrendingUp, CheckCircle, BarChart2 } from 'lucide-react';

interface AmeliorationsDashboardProps {
    ameliorations: Amelioration[];
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

const AmeliorationsDashboard: React.FC<AmeliorationsDashboardProps> = ({ ameliorations }) => {
    const { data } = useDataContext();
    const stats = (data.dashboardStats as any).ameliorations;
    const actionsEnRetard = ameliorations.flatMap(a => a.actions).filter(ac => ac.statut !== 'Fait' && new Date(ac.dateEcheance) < new Date());

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Améliorations Nouvelles" value={stats.nouveau} icon={TrendingUp} color="bg-blue-500" />
                <StatCard title="En cours" value={stats.enCours} icon={Clock} color="bg-yellow-500" />
                <StatCard title="Actions en retard" value={actionsEnRetard.length} icon={AlertTriangle} color="bg-red-500" />
                <StatCard title="Clôturées" value={stats.cloture} icon={CheckCircle} color="bg-green-500" />
            </div>
        </div>
    );
};

export default AmeliorationsDashboard;
