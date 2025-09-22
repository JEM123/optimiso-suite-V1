import React, { useState } from 'react';
import type { Indicateur } from '../types';
import { useDataContext } from '../context/AppContext';
import { Edit, BarChart3, Settings, Database, Link as LinkIcon, Plus, User, CheckCircle, AlertTriangle, X } from 'lucide-react';
import IndicatorChart from './IndicatorChart';

interface IndicatorDetailPanelProps {
    indicator: Indicateur;
    onEdit: (indicator: Indicateur) => void;
    onAddMeasure: () => void;
    onShowRelations: (entity: any, entityType: string) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

const StatCard: React.FC<{ title: string, value: string | number, subtext: string, colorClass: string }> = ({ title, value, subtext, colorClass }) => (
    <div className="bg-white p-3 rounded-lg border">
        <p className="text-xs text-gray-500">{title}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        <p className="text-xs text-gray-500">{subtext}</p>
    </div>
);


const IndicatorDetailPanel: React.FC<IndicatorDetailPanelProps> = ({ indicator, onEdit, onAddMeasure, onShowRelations }) => {
    const { data } = useDataContext();
    const [activeTab, setActiveTab] = useState('dashboard');

    const responsable = (data.personnes as any[]).find(p => p.id === indicator.responsableId);
    const lastMeasure = indicator.mesures.length > 0 ? indicator.mesures.slice().sort((a,b) => new Date(b.dateMesure).getTime() - new Date(a.dateMesure).getTime())[0] : null;

    const lastValue = lastMeasure?.valeur ?? 0;
    const diff = lastMeasure ? (lastValue - indicator.objectif).toFixed(2) : 'N/A';
    const performanceColor = !lastMeasure ? 'text-gray-700' : lastValue >= indicator.objectif ? 'text-green-600' : lastValue >= indicator.seuilAlerte ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-white flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">{indicator.nom}</h2>
                    <p className="text-sm text-gray-500">{indicator.reference}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => onShowRelations(indicator, 'indicateurs')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Voir les relations"><LinkIcon className="h-4 w-4"/></button>
                    <button onClick={() => onEdit(indicator)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md" title="Modifier"><Edit className="h-4 w-4"/></button>
                </div>
            </div>
             <div className="border-b bg-white">
                <nav className="flex space-x-4 px-4">
                    <button onClick={() => setActiveTab('dashboard')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Tableau de bord</button>
                    <button onClick={() => setActiveTab('params')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'params' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Paramètres</button>
                    <button onClick={() => setActiveTab('data')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'data' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Données & Historique</button>
                    <button onClick={() => setActiveTab('relations')} className={`py-2 px-1 text-sm font-medium ${activeTab === 'relations' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Relations</button>
                </nav>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'dashboard' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <StatCard title="Dernière Valeur" value={`${lastValue} ${indicator.unite}`} subtext={lastMeasure ? new Date(lastMeasure.dateMesure).toLocaleDateString('fr-FR') : '-'} colorClass="text-blue-600" />
                            <StatCard title="Objectif" value={`${indicator.objectif} ${indicator.unite}`} subtext="Valeur cible" colorClass="text-gray-700" />
                            <StatCard title="Écart / Objectif" value={`${diff}`} subtext="Performance" colorClass={performanceColor} />
                        </div>
                        <div className="bg-white p-4 rounded-lg border h-80">
                            <IndicatorChart indicator={indicator} />
                        </div>
                    </div>
                )}
                {activeTab === 'params' && (
                    <div className="bg-white p-4 rounded-lg border space-y-4">
                        <DetailItem label="Description" value={indicator.description} />
                        <DetailItem label="Unité" value={indicator.unite} />
                        <DetailItem label="Responsable" value={responsable ? `${responsable.prenom} ${responsable.nom}` : '-'} />
                        <DetailItem label="Fréquence" value={indicator.frequence} />
                        <DetailItem label="Source des données" value={indicator.sourceDonnee} />
                    </div>
                )}
                {activeTab === 'data' && (
                    <div className="bg-white p-4 rounded-lg border">
                         <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Historique des mesures</h3>
                            <button onClick={onAddMeasure} className="flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"><Plus className="h-4 w-4"/><span>Ajouter</span></button>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Valeur</th><th className="px-4 py-2">Commentaire</th></tr>
                            </thead>
                            <tbody>
                                {indicator.mesures.slice().sort((a,b) => new Date(b.dateMesure).getTime() - new Date(a.dateMesure).getTime()).map(m => (
                                    <tr key={m.id} className="bg-white border-b"><td className="px-4 py-2">{new Date(m.dateMesure).toLocaleDateString('fr-FR')}</td><td className="px-4 py-2 font-medium">{m.valeur} {indicator.unite}</td><td className="px-4 py-2 italic text-gray-600">{m.commentaire}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 {activeTab === 'relations' && (
                     <div className="bg-white p-4 rounded-lg border space-y-3">
                         <DetailItem label="Risques liés" value={indicator.risqueIds.map(id => (data.risques as any[]).find(r=>r.id===id)?.nom).join(', ')} />
                         <DetailItem label="Contrôles liés" value={indicator.controleIds.map(id => (data.controles as any[]).find(c=>c.id===id)?.nom).join(', ')} />
                     </div>
                )}
            </div>
        </div>
    );
};

export default IndicatorDetailPanel;
