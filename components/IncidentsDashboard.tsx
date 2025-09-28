import React from 'react';
import type { Incident, IncidentCategorie } from '../types';
import { useDataContext } from '../context/AppContext';
import { AlertTriangle, Clock, Shield, CheckCircle } from 'lucide-react';

interface IncidentsDashboardProps {
    incidents: Incident[];
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

const CATEGORY_COLORS: Record<IncidentCategorie, string> = {
    'SI': 'bg-red-500',
    'Qualité': 'bg-blue-500',
    'Sécurité': 'bg-purple-500',
    'RH': 'bg-green-500',
    'Environnement': 'bg-teal-500',
};

const IncidentsDashboard: React.FC<IncidentsDashboardProps> = ({ incidents }) => {
    const stats = React.useMemo(() => {
        const total = incidents.length;
        const nouveau = incidents.filter(i => i.statut === 'Nouveau').length;
        const enCours = incidents.filter(i => i.statut === 'En cours').length;
        const slaDepasse = incidents.filter(i => i.statut !== 'Clôturé' && new Date(i.echeanceSLA) < new Date()).length;
        const cloture = incidents.filter(i => i.statut === 'Clôturé').length;

        const parCategorie = incidents.reduce((acc, i) => {
            const existing = acc.find(item => item.categorie === i.categorie);
            if (existing) {
                existing.count++;
            } else {
                acc.push({ categorie: i.categorie, count: 1, color: CATEGORY_COLORS[i.categorie] || 'bg-gray-500' });
            }
            return acc;
        }, [] as {categorie: string, count: number, color: string}[]);

        return { total, nouveau, enCours, slaDepasse, cloture, parCategorie };
    }, [incidents]);

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Incidents Nouveaux" value={stats.nouveau} icon={AlertTriangle} color="bg-blue-500" />
                <StatCard title="En cours de traitement" value={stats.enCours} icon={Clock} color="bg-yellow-500" />
                <StatCard title="SLA Dépassé" value={stats.slaDepasse} icon={AlertTriangle} color="bg-red-500" />
                <StatCard title="Incidents Clôturés" value={stats.cloture} icon={CheckCircle} color="bg-green-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-semibold mb-4 text-gray-800">Répartition par catégorie</h3>
                    <div className="space-y-3">
                        {stats.parCategorie.map(d => (
                            <div key={d.categorie}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{d.categorie}</span>
                                    <span>{d.count} ({stats.total > 0 ? ((d.count/stats.total)*100).toFixed(0) : 0}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className={`${d.color} h-2.5 rounded-full`} style={{ width: stats.total > 0 ? `${(d.count / stats.total) * 100}%` : '0%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-semibold mb-4 text-gray-800">Incidents critiques ouverts</h3>
                    <div className="space-y-2">
                        {incidents.filter(i => i.priorite === 'Critique' && i.statut !== 'Clôturé').map(inc => (
                            <div key={inc.id} className="p-2 border-l-4 border-red-500 bg-red-50 rounded-r-md">
                                <p className="font-medium text-sm text-red-800">{inc.titre}</p>
                                <p className="text-xs text-gray-600">{inc.reference}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncidentsDashboard;