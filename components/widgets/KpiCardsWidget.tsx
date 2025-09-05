import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useDataContext } from '../../context/AppContext';
import { AlertTriangle, ShieldCheck, FileText, CheckSquare } from 'lucide-react';
import type { AccueilComponentConfig } from '../../types';

interface KpiCardsWidgetProps {
    config: AccueilComponentConfig;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string; module: string, setActiveModule: (id: string) => void; }> = ({ title, value, icon: Icon, color, module, setActiveModule }) => (
    <button onClick={() => setActiveModule(module)} className="bg-white p-3 rounded-lg shadow-sm border text-left hover:shadow-md hover:border-blue-400 transition-all w-full">
        <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">{title}</div>
            <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="text-2xl font-bold text-gray-800 mt-1">{value}</div>
    </button>
);

const KpiCardsWidget: React.FC<KpiCardsWidgetProps> = ({ config }) => {
    const { setActiveModule } = useAppContext();
    const { data } = useDataContext();

    const totalRisks = (data.risques as any[]).length;
    const openIncidents = (data.incidents as any[]).filter(i => i.statut !== 'Clôturé').length;
    const publishedDocs = (data.documents as any[]).filter(d => d.statut === 'publie' || d.statut === 'valide').length;
    const pendingValidations = (data.validationInstances as any[]).filter(v => v.statut === 'En cours').length;

    return (
         <div className="bg-white rounded-lg p-4 shadow-sm border">
            {config.title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{config.title}</h3>}
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Risques Totaux" value={totalRisks} icon={AlertTriangle} color="text-red-500" module="risques" setActiveModule={setActiveModule}/>
                <StatCard title="Incidents Ouverts" value={openIncidents} icon={ShieldCheck} color="text-orange-500" module="incidents" setActiveModule={setActiveModule}/>
                <StatCard title="Documents Publiés" value={publishedDocs} icon={FileText} color="text-blue-500" module="documents" setActiveModule={setActiveModule}/>
                {/* FIX: Added the missing 'module' prop and corrected the 'color' prop to a valid Tailwind class. */}
                <StatCard title="Validations" value={pendingValidations} icon={CheckSquare} color="text-green-500" module="mes-validations" setActiveModule={setActiveModule}/>
            </div>
        </div>
    );
};

export default KpiCardsWidget;