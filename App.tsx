import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './components/HomePage';
import ModulePage from './components/ModulePage';
import RisksDashboard from './components/RisksDashboard';
import DocumentsDashboard from './components/DocumentsDashboard';
import ValidationModal from './components/ValidationModal';
import EntityRelations from './components/EntityRelations';
import MyValidationsPage from './components/MyValidationsPage';
import { AppProvider, useAppContext, useDataContext } from './context/AppContext';

const AppContent: React.FC = () => {
    const { activeModule, setActiveModule, sidebarOpen, setSidebarOpen, user } = useAppContext();
    const { data, actions } = useDataContext();
    
    // States for modals/panels that are still UI-specific to the top level
    const [selectedEntity, setSelectedEntity] = React.useState<any>(null);
    const [showRelations, setShowRelations] = React.useState(false);
    const [validationModal, setValidationModal] = React.useState<{ show: boolean; documentId?: string; procedureId?: string }>({ show: false });

    const handleShowRelations = (entity: any, entityType: string) => {
        setSelectedEntity({ ...entity, type: entityType });
        setShowRelations(true);
    };
    
    const handleNavigateFromRelations = (moduleId: string, entity: any) => {
        setActiveModule(moduleId);
        setShowRelations(false); 
    };

    const handleShowValidation = (docId: string) => {
        setValidationModal({ show: true, documentId: docId });
    };
    
    const documentForModal = validationModal.documentId ? data.documents.find(d => d.id === validationModal.documentId) : undefined;
    const procedureForModal = validationModal.procedureId ? data.procedures.find(p => p.id === validationModal.procedureId) : undefined;

    const renderContent = () => {
        switch (activeModule) {
            case 'accueil':
                return <HomePage />;
            case 'risques-dashboard':
                return <RisksDashboard />;
            case 'documents-dashboard':
                // This component might need a small refactor if it mutates data
                return <DocumentsDashboard onShowValidation={(doc) => handleShowValidation(doc.id)} />;
            case 'mes-validations':
                return <MyValidationsPage />;
            default:
                return (
                    <ModulePage
                        moduleId={activeModule}
                        onShowRelations={handleShowRelations}
                        onShowValidation={(doc) => handleShowValidation(doc.id)}
                        setActiveModule={setActiveModule}
                    />
                );
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            <Sidebar
                activeModule={activeModule}
                setActiveModule={setActiveModule}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                user={user}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <Header activeModule={activeModule} />
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
            
            {showRelations && selectedEntity && (
                <EntityRelations
                    entity={selectedEntity}
                    entityType={selectedEntity.type}
                    onClose={() => setShowRelations(false)}
                    onNavigate={handleNavigateFromRelations}
                />
            )}
            
            <ValidationModal 
              validationModal={{ show: validationModal.show, document: documentForModal, procedure: procedureForModal }}
              setValidationModal={(state) => setValidationModal({ show: state.show, documentId: state.document?.id, procedureId: state.procedure?.id })} 
            />
        </div>
    );
}


const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App;
