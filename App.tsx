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
import type { Document, Procedure, ValidationInstance } from './types';
import ImpactAnalysisModal from './components/ImpactAnalysisModal';
import RejectionModal from './components/RejectionModal';

const AppContent: React.FC = () => {
    const { activeModule, setActiveModule, sidebarOpen, setSidebarOpen, user, notifiedTarget } = useAppContext();
    const { data, actions } = useDataContext();
    
    const [relationExplorerTarget, setRelationExplorerTarget] = React.useState<any>(null);
    const [validationModal, setValidationModal] = React.useState<{ show: boolean; document?: Document; procedure?: Procedure }>({ show: false });
    const [impactAnalysisTarget, setImpactAnalysisTarget] = React.useState<any>(null);
    const [rejectionTarget, setRejectionTarget] = React.useState<Document | Procedure | null>(null);

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
        if (element.validationInstanceId) {
            await actions.approveValidation(element.validationInstanceId);
        }
        setValidationModal({ show: false });
    };

    const handleShowRejection = (element: Document | Procedure) => {
        setValidationModal({ show: false }); // Fermer la modale de validation
        setRejectionTarget(element); // Ouvrir la modale de rejet
    };
    
    const handleConfirmRejection = async (comment: string) => {
        if (rejectionTarget?.validationInstanceId) {
            await actions.rejectValidation(rejectionTarget.validationInstanceId, comment);
        }
        setRejectionTarget(null);
    };
    
    const renderContent = () => {
        const pageContainer = (content: React.ReactNode) => <div className="p-6">{content}</div>;

        switch (activeModule) {
            case 'accueil':
                return pageContainer(<HomePage />);
            case 'risques-dashboard':
                return pageContainer(<RisksDashboard />);
            case 'documents-dashboard':
                return pageContainer(<DocumentsDashboard onShowValidation={handleShowValidation} />);
            default:
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

            <ImpactAnalysisModal
                target={impactAnalysisTarget}
                onClose={() => setImpactAnalysisTarget(null)}
                onExplore={handleShowRelations}
            />
            
            <ValidationModal 
              validationModal={validationModal}
              setValidationModal={setValidationModal} 
              onApprove={handleApproveValidation}
              onReject={handleShowRejection}
            />

            <RejectionModal
                isOpen={!!rejectionTarget}
                onClose={() => setRejectionTarget(null)}
                onConfirm={handleConfirmRejection}
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