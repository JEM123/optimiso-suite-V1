import React, { useState, useMemo, DragEvent } from 'react';
import type { ISettings, FicheLayout } from '../types';
import { Plus, Trash2, GripVertical, PackagePlus, ArrowRight } from 'lucide-react';
import Button from './ui/Button';
import { v4 as uuidv4 } from 'uuid';

interface FicheLayoutSettingsProps {
    localSettings: ISettings;
    setLocalSettings: React.Dispatch<React.SetStateAction<ISettings>>;
}

const sectionManifest: Record<string, { id: string, name: string }[]> = {
    documents: [
        { id: 'validationSection', name: 'Statut de Validation' }, { id: 'metadataSection', name: 'Métadonnées' },
        { id: 'contentSection', name: 'Contenu du Document' }, { id: 'relationsSection', name: 'Relations' },
        { id: 'historySection', name: 'Historique des Versions' },
    ],
    personnes: [
        { id: 'generalInfoSection', name: 'Informations Générales' }, { id: 'customFieldsSection', name: 'Champs Libres' },
        { id: 'historySection', name: 'Historique' }, { id: 'affectationsSection', name: 'Affectations' },
        { id: 'competencesSection', name: 'Compétences' }, { id: 'accessSection', name: 'Accès & Rôles' },
    ],
    postes: [
        { id: 'detailsSection', name: 'Détails du Poste' }, { id: 'customFieldsSection', name: 'Champs Libres' },
        { id: 'missionSection', name: 'Mission & Responsabilités' }, { id: 'skillsSection', name: 'Compétences Requises' },
        { id: 'occupantsSection', name: 'Occupants' }, { id: 'historySection', name: 'Historique Occupants' },
        { id: 'raciSection', name: 'Matrice RACI' },
    ],
    risques: [
        { id: 'identificationSection', name: 'Identification' }, { id: 'historySection', name: 'Historique' },
        { id: 'evaluationSection', name: 'Évaluation' }, { id: 'masterySection', name: 'Maîtrise' },
        { id: 'actionsSection', name: 'Plans d\'action' },
    ],
    controles: [
        { id: 'detailsSection', name: 'Détails du Contrôle' }, { id: 'planningSection', name: 'Planification' },
        { id: 'masterySection', name: 'Maîtrise' }, { id: 'executionsSection', name: 'Exécutions' },
    ],
    entites: [
        { id: 'hierarchySection', name: 'Hiérarchie' }, { id: 'relationsSection', name: 'Éléments Liés' },
        { id: 'generalInfoSection', name: 'Informations Générales' }, { id: 'contactSection', name: 'Contact' },
        { id: 'customFieldsSection', name: 'Champs Libres' },
    ],
    missions: [
      { id: 'detailsSection', name: 'Détails Mission' }, { id: 'historySection', name: 'Historique' },
      { id: 'kpiSection', name: 'Indicateurs' }, { id: 'linksSection', name: 'Liens & Interfaces' },
    ],
    actifs: [
      { id: 'detailsSection', name: 'Détails de l\'Actif' }, { id: 'treeSection', name: 'Arborescence' },
      { id: 'maintenanceSection', name: 'Maintenance' }, { id: 'linksSection', name: 'Liens' },
    ],
};

const modulesWithOptions = Object.keys(sectionManifest);

const FicheLayoutSettings: React.FC<FicheLayoutSettingsProps> = ({ localSettings, setLocalSettings }) => {
    const [selectedModule, setSelectedModule] = useState(modulesWithOptions[0]);
    const [draggedSection, setDraggedSection] = useState<{ id: string; fromTabId: string | 'bank' } | null>(null);

    const currentLayout = localSettings.ficheLayouts[selectedModule];

    const handleLayoutChange = (newLayout: FicheLayout) => {
        setLocalSettings(prev => ({
            ...prev,
            ficheLayouts: { ...prev.ficheLayouts, [selectedModule]: newLayout }
        }));
    };
    
    const handleAddTab = () => {
        const newTab = { id: uuidv4(), label: 'Nouvel Onglet' };
        const newLayout = { ...currentLayout, tabs: [...currentLayout.tabs, newTab], sections: { ...currentLayout.sections, [newTab.id]: [] } };
        handleLayoutChange(newLayout);
    };
    
    const handleRenameTab = (tabId: string, newLabel: string) => {
        const newTabs = currentLayout.tabs.map(t => t.id === tabId ? { ...t, label: newLabel } : t);
        handleLayoutChange({ ...currentLayout, tabs: newTabs });
    };

    const handleDeleteTab = (tabId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet onglet et toutes ses sections ?")) {
            const newTabs = currentLayout.tabs.filter(t => t.id !== tabId);
            const { [tabId]: _, ...newSections } = currentLayout.sections;
            handleLayoutChange({ tabs: newTabs, sections: newSections });
        }
    };

    const handleDragStart = (e: DragEvent<HTMLDivElement>, id: string, fromTabId: string | 'bank') => {
        setDraggedSection({ id, fromTabId });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>, toTabId: string) => {
        e.preventDefault();
        if (!draggedSection) return;

        const { id: sectionId, fromTabId } = draggedSection;
        let newSections = JSON.parse(JSON.stringify(currentLayout.sections));

        // Remove from original position
        if (fromTabId !== 'bank') {
            newSections[fromTabId] = newSections[fromTabId].filter((s: string) => s !== sectionId);
        }

        // Add to new position
        if (!newSections[toTabId].includes(sectionId)) {
            newSections[toTabId].push(sectionId);
        }
        
        handleLayoutChange({ ...currentLayout, sections: newSections });
        setDraggedSection(null);
        e.currentTarget.classList.remove('bg-blue-100');
    };
    
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-blue-100');
    };
    
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('bg-blue-100');
    };

    const availableSections = useMemo(() => {
        const allModuleSections = sectionManifest[selectedModule] || [];
        const usedSections = Object.values(currentLayout.sections).flat();
        return allModuleSections.filter(s => !usedSections.includes(s.id));
    }, [selectedModule, currentLayout]);

    return (
        <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                Organisez les fiches de détail pour chaque module en glissant-déposant les sections dans les onglets de votre choix.
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Sélectionner un module à configurer:</label>
                <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)} className={"block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors max-w-xs"}>
                    {modulesWithOptions.map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Structure des onglets</h3>
                    {currentLayout.tabs.map(tab => (
                        <div 
                            key={tab.id}
                            className="bg-white p-4 rounded-lg border transition-colors"
                            onDrop={(e) => handleDrop(e, tab.id)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <input type="text" value={tab.label} onChange={e => handleRenameTab(tab.id, e.target.value)} className="font-semibold text-gray-800 border-b-2 border-transparent focus:border-blue-500 outline-none bg-transparent" />
                                <button onClick={() => handleDeleteTab(tab.id)}><Trash2 className="h-4 w-4 text-red-500 hover:text-red-700"/></button>
                            </div>
                            <div className="space-y-2 min-h-[50px]">
                                {(currentLayout.sections[tab.id] || []).map(sectionId => {
                                    const section = sectionManifest[selectedModule].find(s => s.id === sectionId);
                                    return (
                                        <div 
                                            key={sectionId}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, sectionId, tab.id)}
                                            className="p-2 bg-gray-100 rounded-md text-sm flex items-center gap-2 cursor-grab"
                                        >
                                            <GripVertical className="h-4 w-4 text-gray-400" />
                                            {section?.name || sectionId}
                                        </div>
                                    );
                                })}
                                 {(currentLayout.sections[tab.id] || []).length === 0 && (
                                    <div className="text-center text-xs text-gray-400 py-4">Glissez une section ici</div>
                                 )}
                            </div>
                        </div>
                    ))}
                    <Button onClick={handleAddTab} variant="secondary" size="sm" icon={Plus}>Ajouter un onglet</Button>
                </div>
                <div className="lg:col-span-1">
                     <div className="bg-white p-4 rounded-lg border sticky top-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Sections Disponibles</h3>
                        <div className="space-y-2">
                             {availableSections.map(section => (
                                 <div 
                                    key={section.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, section.id, 'bank')}
                                    className="p-2 bg-blue-50 border border-blue-200 rounded-md text-sm flex items-center gap-2 cursor-grab"
                                >
                                    <PackagePlus className="h-4 w-4 text-blue-600" />
                                    {section.name}
                                </div>
                            ))}
                            {availableSections.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">Toutes les sections sont utilisées.</p>
                            )}
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default FicheLayoutSettings;
