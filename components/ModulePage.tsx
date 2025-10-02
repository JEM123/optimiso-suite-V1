import React from 'react';
import { modules } from '../constants';
import type { Document, Procedure } from '../types';
import EntitiesPage from './EntitiesPage';
import PostesPage from './PostesPage';
import RisksPage from './RisksPage';
import ControlsPage from './ControlsPage';
import DocumentsPage from './DocumentsPage';
import ProceduresPage from './ProceduresPage';
import PeoplePage from './PeoplePage';
import RolesPage from './RolesPage';
import ToDoPage from './ToDoPage';
import IncidentsPage from './IncidentsPage';
import AmeliorationsPage from './AmeliorationsPage';
import ActifsPage from './ActifsPage';
import IndicatorsPage from './IndicatorsPage';
import SyncAndFlowPage from './SyncAndFlowPage';
import MyValidationsPage from './MyValidationsPage';
import NormesLoisPage from './NormesLoisPage';
import CompetencesPage from './CompetencesPage';
import MissionsPage from './MissionsPage';
import ProcessusPage from './ProcessusPage';
import NewsPage from './NewsPage';
import SettingsModule from './SettingsModule';
import PageHeader from './PageHeader'; // Importation générique pour les placeholders
import OrganigrammePage from './OrganigrammePage';

// --- PROPS INTERFACES ---

interface ModulePageProps {
  moduleId: string;
  onShowRelations: (entity: any, entityType: string) => void;
  onShowValidation: (element: Document | Procedure) => void;
  onShowImpactAnalysis: (element: any, type: string) => void;
  setActiveModule: (moduleId: string) => void;
  notifiedItemId: string | null;
}

// --- MODULE-SPECIFIC VIEW COMPONENTS (Defined outside main component) ---

const GenericModulePlaceholder: React.FC<{ name: string; icon: React.ElementType }> = ({ name, icon: Icon }) => (
    <div className="h-full flex flex-col">
        <PageHeader title={name} icon={Icon} description={`Le module ${name} est en cours de développement.`} />
        <div className="flex-grow p-6 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">Bientôt disponible</h2>
                <p className="text-gray-500 mt-2">Cette fonctionnalité sera bientôt prête pour vous.</p>
            </div>
        </div>
    </div>
);


// --- MAIN PAGE COMPONENT ---

const ModulePage: React.FC<ModulePageProps> = ({ moduleId, onShowRelations, onShowValidation, onShowImpactAnalysis, setActiveModule, notifiedItemId }) => {
    const module = modules.find(m => m.id === moduleId);

    const renderModuleContent = () => {
        switch (moduleId) {
            case 'personnes': return <PeoplePage onShowRelations={onShowRelations} setActiveModule={setActiveModule} />;
            case 'roles': return <RolesPage />;
            case 'entites': return <EntitiesPage />;
            case 'postes': return <PostesPage onShowRelations={onShowRelations} />;
            case 'organigramme': return <OrganigrammePage />;
            case 'missions': return <MissionsPage onShowRelations={onShowRelations} />;
            case 'processus': return <ProcessusPage onShowRelations={onShowRelations} />;
            case 'risques': return <RisksPage onShowRelations={onShowRelations} notifiedItemId={notifiedItemId} />;
            case 'documents': return <DocumentsPage onShowValidation={onShowValidation} onShowRelations={onShowRelations} notifiedItemId={notifiedItemId} />;
            case 'controles': return <ControlsPage onShowRelations={onShowRelations} />;
            case 'procedures': return <ProceduresPage onShowRelations={onShowRelations} onShowValidation={onShowValidation} onShowImpactAnalysis={onShowImpactAnalysis} setActiveModule={setActiveModule} />;
            case 'todo': return <ToDoPage notifiedItemId={notifiedItemId} onShowRelations={onShowRelations} />;
            case 'incidents': return <IncidentsPage onShowRelations={onShowRelations} notifiedItemId={notifiedItemId} />;
            case 'ameliorations': return <AmeliorationsPage onShowRelations={onShowRelations} />;
            case 'actifs': return <ActifsPage />;
            case 'indicateurs': return <IndicatorsPage onShowRelations={onShowRelations} />;
            case 'sync-flux': return <SyncAndFlowPage />;
            case 'mes-validations': return <MyValidationsPage />;
            case 'normes-lois': return <NormesLoisPage />;
            case 'competences': return <CompetencesPage notifiedItemId={notifiedItemId} />;
            case 'actualites': return <NewsPage />;
            case 'settings': return <SettingsModule />;
            default:
                return module ? <GenericModulePlaceholder name={module.nom} icon={module.icon} /> : <p>Module non trouvé</p>;
        }
    };
    
    // The specific page components now handle their own headers.
    // This component is now just a router.
    return (
        <div className="h-full bg-gray-50">
            {renderModuleContent()}
        </div>
    );
};

export default ModulePage;