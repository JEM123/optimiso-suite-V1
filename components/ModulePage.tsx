import React from 'react';
import { modules } from '../constants';
import type { Document } from '../types';
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

// --- PROPS INTERFACES ---

interface ModulePageProps {
  moduleId: string;
  onShowRelations: (entity: any, entityType: string) => void;
  onShowValidation: (doc: Document) => void;
  setActiveModule: (moduleId: string) => void;
  notifiedItemId: string | null;
}

// --- MODULE-SPECIFIC VIEW COMPONENTS (Defined outside main component) ---

const GenericModulePlaceholder: React.FC<{ name: string; icon: React.ElementType }> = ({ name, icon: Icon }) => (
    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4"><Icon className="h-8 w-8 text-gray-400" /></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Module {name}</h2>
        <p className="text-gray-600 mb-6">Ce module est en cours de développement.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">Commencer la configuration</button>
    </div>
);

// --- MAIN PAGE COMPONENT ---

const ModulePage: React.FC<ModulePageProps> = ({ moduleId, onShowRelations, onShowValidation, setActiveModule, notifiedItemId }) => {
    const module = modules.find(m => m.id === moduleId);

    const renderModuleContent = () => {
        switch (moduleId) {
            case 'personnes': return <PeoplePage onShowRelations={onShowRelations} setActiveModule={setActiveModule} />;
            case 'roles': return <RolesPage />;
            case 'entites': return <EntitiesPage />;
            case 'postes': return <PostesPage onShowRelations={onShowRelations} />;
            case 'missions': return <MissionsPage onShowRelations={onShowRelations} />;
            case 'processus': return <ProcessusPage onShowRelations={onShowRelations} />;
            case 'risques': return <RisksPage onShowRelations={onShowRelations} notifiedItemId={notifiedItemId} />;
            case 'documents': return <DocumentsPage onShowValidation={onShowValidation} onShowRelations={onShowRelations} notifiedItemId={notifiedItemId} />;
            case 'controles': return <ControlsPage onShowRelations={onShowRelations} />;
            case 'procedures': return <ProceduresPage onShowRelations={onShowRelations} />;
            case 'todo': return <ToDoPage notifiedItemId={notifiedItemId} />;
            case 'incidents': return <IncidentsPage onShowRelations={onShowRelations} notifiedItemId={notifiedItemId} />;
            case 'ameliorations': return <AmeliorationsPage onShowRelations={onShowRelations} />;
            case 'actifs': return <ActifsPage />;
            case 'indicateurs': return <IndicatorsPage onShowRelations={onShowRelations} />;
            case 'sync-flux': return <SyncAndFlowPage />;
            case 'mes-validations': return <MyValidationsPage />;
            case 'normes-lois': return <NormesLoisPage />;
            case 'competences': return <CompetencesPage notifiedItemId={notifiedItemId} />;
            case 'actualites': return <NewsPage />;
            default:
                return module ? <GenericModulePlaceholder name={module.nom} icon={module.icon} /> : <p>Module non trouvé</p>;
        }
    };
    
    // The specific page components now handle their own headers.
    // This component is now just a router.
    return (
        <div className="h-full">
            {renderModuleContent()}
        </div>
    );
};

export default ModulePage;
