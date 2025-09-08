import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './components/HomePage';
import ModulePage from './components/ModulePage';
import RisksDashboard from './components/RisksDashboard';
import DocumentsDashboard from './components/DocumentsDashboard';
import ValidationModal from './components/ValidationModal';
import EntityRelations from './components/EntityRelations';
import { AppProvider, useAppContext, useDataContext } from './context/AppContext';

const AppContent: React.FC = () => {
    const { activeModule, setActiveModule, sidebarOpen, setSidebarOpen, user, notifiedTarget } = useAppContext();
    const { data, actions } = useDataContext();
    
    const [relationExplorerTarget, setRelationExplorerTarget] = React.useState<any>(null);
    const [validationModal, setValidationModal] = React.useState<{ show: boolean; documentId?: string; procedureId?: string }>({ show: false });

    const handleShowRelations = (entity: any, entityType: string) => {
        setRelationExplorerTarget({ ...entity, type: entityType });
    };

    const handleShowValidation = (docId: string) => {
        setValidationModal({ show: true, documentId: docId });
    };
    
    const documentForModal = validationModal.documentId ? data.documents.find(d => d.id === validationModal.documentId) : undefined;
    const procedureForModal = validationModal.procedureId ? data.procedures.find(p => p.id === validationModal.procedureId) : undefined;

    const renderContent = () => {
        const pageContainer = (content: React.ReactNode) => <div className="p-6">{content}</div>;

        switch (activeModule) {
            case 'accueil':
                return pageContainer(<HomePage />);
            case 'risques-dashboard':
                return pageContainer(<RisksDashboard />);
            case 'documents-dashboard':
                return pageContainer(<DocumentsDashboard onShowValidation={(doc) => handleShowValidation(doc.id)} />);
            default:
                // ModulePage and its children now control their own padding and layout within the main content area.
                return (
                    <ModulePage
                        moduleId={activeModule}
                        onShowRelations={handleShowRelations}
                        onShowValidation={(doc) => handleShowValidation(doc.id)}
                        setActiveModule={setActiveModule}
                        notifiedItemId={notifiedTarget?.moduleId === activeModule ? notifiedTarget.itemId : null}
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
                <main className="flex-1 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
            
            <EntityRelations
                target={relationExplorerTarget}
                onClose={() => setRelationExplorerTarget(null)}
                onExplore={handleShowRelations}
            />
            
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
