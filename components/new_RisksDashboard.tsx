import React from 'react';
import { useDataContext } from '../context/AppContext';
import { BarChart2, TrendingUp } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string | number; children?: React.ReactNode }> = ({ title, value, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="text-sm text-gray-600">{title}</div>
        <div className="text-3xl font-bold text-gray-800 mt-1">{value}</div>
        {children}
    </div>
);

const RisksDashboard: React.FC = () => {
    const { data } = useDataContext();
    const dashboardStats = data.dashboardStats as any;
    
    return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Risques Totaux" value={dashboardStats.risques.total} />
            <StatCard title="Risques Critiques" value={dashboardStats.risques.parNiveau.critique}>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-red-600 h-1.5 rounded-full" style={{ width: `${(dashboardStats.risques.parNiveau.critique / dashboardStats.risques.total) * 100}%` }}></div>
                </div>
            </StatCard>
            <StatCard title="Risques Élevés" value={dashboardStats.risques.parNiveau.eleve}>
                 <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${(dashboardStats.risques.parNiveau.eleve / dashboardStats.risques.total) * 100}%` }}></div>
                </div>
            </StatCard>
            <StatCard title="Risques Moyens" value={dashboardStats.risques.parNiveau.moyen} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-semibold mb-4 flex items-center"><BarChart2 className="h-5 w-5 mr-2 text-blue-500" />Risques par processus</h3>
                <div className="space-y-3">
                    {dashboardStats.risques.parProcessus.map((p: any) => (
                        <div key={p.nom}>
                            <div className="flex justify-between text-sm mb-1">
                                <span>{p.nom}</span>
                                <span>{p.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className={`${p.couleur} h-2.5 rounded-full`} style={{ width: `${(p.count / dashboardStats.risques.total) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-semibold mb-4 flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-green-500" />Tendance des risques</h3>
                 <div className="h-40 flex items-center justify-center">{/* Placeholder for a chart */}
                    <p className="text-center text-gray-500">Graphique de tendance des risques.</p>
                </div>
            </div>
        </div>
    </div>
)};

export default RisksDashboard;