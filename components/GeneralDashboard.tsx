import React from 'react';
import { mockData } from '../constants';
import { AlertTriangle, ShieldCheck, FileText, CheckSquare, ArrowRight } from 'lucide-react';

interface GeneralDashboardProps {
    setActiveModule: (moduleId: string) => void;
}

// Reusable Stat Card Component
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string; module: string, setActiveModule: (id: string) => void; }> = ({ title, value, icon: Icon, color, module, setActiveModule }) => (
    <button onClick={() => setActiveModule(module)} className="bg-white p-4 rounded-lg shadow-sm border text-left hover:shadow-lg hover:border-blue-500 transition-all w-full">
        <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">{title}</div>
            <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="text-3xl font-bold text-gray-800 mt-2">{value}</div>
    </button>
);

// Reusable Widget Panel Component
const WidgetPanel: React.FC<{ title: string; children: React.ReactNode; ctaText: string; module: string; setActiveModule: (id: string) => void; }> = ({ title, children, ctaText, module, setActiveModule }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border h-full flex flex-col">
        <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex-grow space-y-3 overflow-y-auto pr-2">
            {children}
        </div>
        <div className="mt-4 border-t pt-2">
            <button onClick={() => setActiveModule(module)} className="text-sm font-medium text-blue-600 hover:text-blue-800 w-full text-left flex items-center justify-between">
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    </div>
);

// Helper function for risk level
const getRiskLevelColor = (level: number) => {
    if (level >= 16) return 'bg-red-500';
    if (level >= 10) return 'bg-orange-500';
    if (level >= 5) return 'bg-yellow-400';
    return 'bg-green-500';
};

const GeneralDashboard: React.FC<GeneralDashboardProps> = ({ setActiveModule }) => {
    // Calculate KPIs
    const totalRisks = mockData.risques.length;
    const openIncidents = mockData.incidents.filter(i => i.statut !== 'Clôturé').length;
    const publishedDocs = mockData.documents.filter(d => d.statut === 'publie' || d.statut === 'valide').length;
    const pendingValidations = mockData.validationInstances.filter(v => v.statut === 'En cours').length;

    // Data for Widgets
    const highRisks = mockData.risques
        .map(r => ({ ...r, level: r.analyseResiduelle.probabilite * r.analyseResiduelle.impact }))
        .filter(r => r.level >= 10)
        .sort((a, b) => b.level - a.level)
        .slice(0, 5);
    
    const validations = mockData.validationInstances
        .filter(v => v.statut === 'En cours')
        .slice(0, 5);

    const getElementDetails = (elementId: string, elementModule: string) => {
        switch (elementModule) {
            case 'Documents':
                return mockData.documents.find(d => d.id === elementId);
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Risques Totaux" value={totalRisks} icon={AlertTriangle} color="text-red-500" module="risques" setActiveModule={setActiveModule}/>
                <StatCard title="Incidents Ouverts" value={openIncidents} icon={ShieldCheck} color="text-orange-500" module="incidents" setActiveModule={setActiveModule}/>
                <StatCard title="Documents Publiés" value={publishedDocs} icon={FileText} color="text-blue-500" module="documents" setActiveModule={setActiveModule}/>
                <StatCard title="Validations en Attente" value={pendingValidations} icon={CheckSquare} color="text-green-500" module="mes-validations" setActiveModule={setActiveModule}/>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WidgetPanel title="Risques Critiques et Élevés" ctaText="Voir tous les risques" module="risques" setActiveModule={setActiveModule}>
                    {highRisks.length > 0 ? highRisks.map(risk => (
                         <div key={risk.id} className="flex items-center justify-between p-2 border-b last:border-0">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{risk.nom}</p>
                                <p className="text-xs text-gray-500">{risk.reference}</p>
                            </div>
                            <div className={`text-sm font-bold text-white w-8 h-6 flex items-center justify-center rounded-md ${getRiskLevelColor(risk.level)}`}>
                                {risk.level}
                            </div>
                        </div>
                    )) : <p className="text-sm text-gray-500 text-center py-4">Aucun risque élevé ou critique.</p>}
                </WidgetPanel>
                
                <WidgetPanel title="Demandes de Validation en Attente" ctaText="Voir toutes les validations" module="mes-validations" setActiveModule={setActiveModule}>
                   {validations.length > 0 ? validations.map(v => {
                       const element = getElementDetails(v.elementId, v.elementModule);
                       const demandeur = mockData.personnes.find(p => p.id === v.demandeurId);
                       if(!element) return null;
                       return (
                           <div key={v.id} className="p-2 border-b last:border-0">
                               <p className="text-sm font-medium text-gray-800 truncate">{element.nom}</p>
                               <p className="text-xs text-gray-500">Demandé par {demandeur?.prenom} {demandeur?.nom} le {v.dateDemande.toLocaleDateString('fr-FR')}</p>
                           </div>
                       )
                   }) : <p className="text-sm text-gray-500 text-center py-4">Aucune demande en attente.</p>}
                </WidgetPanel>
            </div>
        </div>
    );
};

export default GeneralDashboard;
