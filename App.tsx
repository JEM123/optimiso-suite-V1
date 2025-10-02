import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ModulePage from './components/ModulePage';
import ValidationModal from './components/ValidationModal';
import EntityRelations from './components/EntityRelations';
import { AppProvider, useAppContext, useDataContext } from './context/AppContext';
import type { Document, Procedure, ValidationInstance } from './types';
import ImpactAnalysisModal from './components/ImpactAnalysisModal';
import GeneralDashboard from './new_components/GeneralDashboard';

const AppContent: React.FC = () => {
    const { activeModule, setActiveModule, sidebarOpen, setSidebarOpen, user, notifiedTarget } = useAppContext();
    const { data, actions } = useDataContext();
    
    const [relationExplorerTarget, setRelationExplorerTarget] = React.useState<any>(null);
    const [validationModal, setValidationModal] = React.useState<{ show: boolean; document?: Document; procedure?: Procedure }>({ show: false });
    const [impactAnalysisTarget, setImpactAnalysisTarget] = React.useState<any>(null);

    const handleShowRelations = (entity: any, entityType: string) => {
        setRelationExplorerTarget({ ...entity, type: entityType });
    };

    const handleShowValidation = (element: Document | Procedure) => {
        setValidationModal({ show: true, document: 'source' in element ? element : undefined, procedure: !('source' in element) ? element : undefined });
    };

    const handleShowImpactAnalysis = (element: any, type: string) => {
        setImpactAnalysisTarget({ ...element, type });
    };
    
    const handleApproveValidation = async (element: Document | Procedure) => {
        if ('source' in element) { // It's a Document
            await actions.saveDocument({ ...element, statut: 'publie' });
        } else { // It's a Procedure
            await actions.saveProcedure({ ...element, statut: 'publie' });
        }
        
        const validationInstance = (data.validationInstances as ValidationInstance[]).find(vi => vi.id === element.validationInstanceId);
        if (validationInstance) {
            await actions.saveValidationInstance({ ...validationInstance, statut: 'Approuvé' });
        }
    };
    
    const renderContent = () => {
        if (activeModule === 'accueil') {
            return (
                <div className="p-6">
                    <GeneralDashboard setActiveModule={setActiveModule} />
                </div>
            );
        }

        return (
            <ModulePage
                moduleId={activeModule}
                onShowRelations={handleShowRelations}
                onShowValidation={handleShowValidation}
                setActiveModule={setActiveModule}
                notifiedItemId={notifiedTarget?.moduleId === activeModule ? notifiedTarget.itemId : null}
                onShowImpactAnalysis={handleShowImpactAnalysis}
            />
        );
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
            
            {relationExplorerTarget && (
                <EntityRelations
                    target={relationExplorerTarget}
                    onClose={() => setRelationExplorerTarget(null)}
                    onExplore={handleShowRelations}
                />
            )}

            {impactAnalysisTarget && (
                 <ImpactAnalysisModal
                    target={impactAnalysisTarget}
                    onClose={() => setImpactAnalysisTarget(null)}
                    onExplore={handleShowRelations}
                />
            )}
            
            <ValidationModal 
              validationModal={validationModal}
              setValidationModal={setValidationModal} 
              onApprove={handleApproveValidation}
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