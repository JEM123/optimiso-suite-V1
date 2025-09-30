import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { sectionRegistry } from './sectionRegistry';
import { AlertTriangle } from 'lucide-react';

interface GenericFicheContentProps {
    moduleId: string;
    item: any;
    // We can pass through any specific props needed by sections
    [key: string]: any; 
}

const GenericFicheContent: React.FC<GenericFicheContentProps> = ({ moduleId, item, ...rest }) => {
    const { settings } = useAppContext();
    const layout = settings.ficheLayouts[moduleId];

    const [activeTabId, setActiveTabId] = useState(layout?.tabs[0]?.id || null);
    
    // Fallback to first tab if current active tab is removed
    React.useEffect(() => {
        if(layout && !layout.tabs.some(t => t.id === activeTabId)) {
            setActiveTabId(layout.tabs[0]?.id || null);
        }
    }, [layout, activeTabId]);

    if (!layout || !layout.tabs || layout.tabs.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500">
                <AlertTriangle className="mx-auto h-8 w-8 text-yellow-400" />
                <p className="mt-2">Aucune mise en page n'est configurée pour le module "{moduleId}".</p>
                <p className="text-sm">Veuillez configurer la mise en page dans les Paramètres.</p>
            </div>
        );
    }
    
    const activeSections = layout.sections[activeTabId] || [];
    
    // Determine the prop name for the main item (e.g., 'document' for 'documents', 'poste' for 'postes')
    const itemPropName = moduleId.endsWith('s') ? moduleId.slice(0, -1) : moduleId;
    // Special case for 'taches' from 'todo' module
    const finalItemPropName = itemPropName === 'todo' ? 'task' : itemPropName;

    return (
        <div className="flex flex-col h-full">
            <div className="border-b bg-white">
                <nav className="flex space-x-4 px-4">
                    {layout.tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={`py-3 px-1 text-sm font-medium ${activeTabId === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                <div className="space-y-6">
                    {activeSections.map(sectionId => {
                        const originalId = sectionId.split('-')[0];
                        const componentKey = sectionId.includes('-') ? sectionId : `${itemPropName}-${sectionId}`;
                        const SectionComponent = sectionRegistry[componentKey] || sectionRegistry[originalId];
                        
                        if (SectionComponent) {
                            // Pass the main item with the correct prop name (e.g., document={...})
                            // and all other props down to the section
                            const sectionProps = {
                                ...rest,
                                [finalItemPropName]: item,
                            };
                            return <SectionComponent key={sectionId} {...sectionProps} />;
                        }
                        return (
                            <div key={sectionId} className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                Section "{sectionId}" (clé: "{componentKey}") non trouvée dans le registre.
                            </div>
                        );
                    })}
                    {activeSections.length === 0 && (
                        <div className="text-center text-sm text-gray-500 py-8">
                            Aucune section dans cet onglet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenericFicheContent;
