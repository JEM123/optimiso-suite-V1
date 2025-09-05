import React, { useState } from 'react';
import { mockData } from '../constants';
import WidgetRenderer from './WidgetRenderer';
import { Plus, Edit, Check } from 'lucide-react';
import AddComponentModal from './AddComponentModal';
import ComponentSettingsModal from './ComponentSettingsModal';
import { AccueilPage, ComponentType, AccueilComponent } from '../types';

const HomePage: React.FC = () => {
    const [pageConfig, setPageConfig] = useState<AccueilPage>(mockData.mockAccueilPages[0]);
    const [isEditing, setIsEditing] = useState(false);
    
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [addColumnIndex, setAddColumnIndex] = useState<number | null>(null);

    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [editingComponent, setEditingComponent] = useState<AccueilComponent | null>(null);

    const handleOpenAddModal = (columnIndex: number) => {
        setAddColumnIndex(columnIndex);
        setAddModalOpen(true);
    };

    const handleAddComponent = (type: ComponentType) => {
        if (addColumnIndex === null) return;

        const newComponent: AccueilComponent = {
            id: `${type}-${Date.now()}`,
            type: type,
            config: { title: `Nouveau ${type}` }
        };

        setPageConfig(prevConfig => {
            const newComponents = { ...prevConfig.components, [newComponent.id]: newComponent };
            const newColumns = prevConfig.layout.columns.map((col, index) => 
                index === addColumnIndex ? [...col, newComponent.id] : col
            );
            return { ...prevConfig, components: newComponents, layout: { ...prevConfig.layout, columns: newColumns }};
        });
        
        setAddModalOpen(false);
        setAddColumnIndex(null);
    };

    const handleOpenSettingsModal = (component: AccueilComponent) => {
        setEditingComponent(component);
        setSettingsModalOpen(true);
    };

    const handleSaveSettings = (componentId: string, newConfig: any) => {
        setPageConfig(prevConfig => {
            const updatedComponent = { ...prevConfig.components[componentId], config: newConfig };
            return { ...prevConfig, components: { ...prevConfig.components, [componentId]: updatedComponent } };
        });
        setSettingsModalOpen(false);
        setEditingComponent(null);
    };

    const handleDeleteComponent = (componentId: string) => {
        setPageConfig(prevConfig => {
            const { [componentId]: _, ...remainingComponents } = prevConfig.components;
            const newColumns = prevConfig.layout.columns.map(col => col.filter(id => id !== componentId));
            return { ...prevConfig, components: remainingComponents, layout: { ...prevConfig.layout, columns: newColumns } };
        });
    };
    
    const handleMoveComponent = (componentId: string, direction: 'up' | 'down') => {
        let colIndex = -1;
        let itemIndex = -1;

        for (let i = 0; i < pageConfig.layout.columns.length; i++) {
            const foundIndex = pageConfig.layout.columns[i].indexOf(componentId);
            if (foundIndex !== -1) {
                colIndex = i;
                itemIndex = foundIndex;
                break;
            }
        }

        if (colIndex === -1) return;

        const newColumns = [...pageConfig.layout.columns];
        const column = [...newColumns[colIndex]];
        
        const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
        if (targetIndex < 0 || targetIndex >= column.length) return;

        [column[itemIndex], column[targetIndex]] = [column[targetIndex], column[itemIndex]];
        newColumns[colIndex] = column;

        setPageConfig(prev => ({...prev, layout: {...prev.layout, columns: newColumns}}));
    };

    const getGridLayoutClass = () => {
        switch (pageConfig.layout.type) {
            case '1-col': return 'grid-cols-1';
            case '2-col': return 'grid-cols-1 md:grid-cols-2';
            case '3-col':
            default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">{pageConfig.title}</h1>
                <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white text-gray-700 border hover:bg-gray-50'
                    }`}
                >
                    {isEditing ? <><Check className="h-4 w-4" />Terminer l'édition</> : <><Edit className="h-4 w-4" />Modifier la page</>}
                </button>
            </div>
            
            <div className={`grid ${getGridLayoutClass()} gap-6`}>
                {pageConfig.layout.columns.map((columnComponentIds, colIndex) => (
                    <div key={colIndex} className="space-y-6">
                        {columnComponentIds.map(componentId => {
                            const component = pageConfig.components[componentId];
                            if (!component) return null;
                            return (
                                <WidgetRenderer 
                                    key={componentId} 
                                    component={component} 
                                    isEditing={isEditing}
                                    onEdit={() => handleOpenSettingsModal(component)}
                                    onDelete={() => handleDeleteComponent(component.id)}
                                    onMove={handleMoveComponent}
                                />
                            );
                        })}
                        {isEditing && (
                            <button 
                                onClick={() => handleOpenAddModal(colIndex)} 
                                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100 hover:border-gray-400"
                            >
                                <Plus className="h-5 w-5" />
                                Ajouter un widget
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <AddComponentModal 
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSelect={handleAddComponent}
            />
            {editingComponent && (
                <ComponentSettingsModal 
                    isOpen={isSettingsModalOpen}
                    onClose={() => setSettingsModalOpen(false)}
                    onSave={handleSaveSettings}
                    component={editingComponent}
                />
            )}
        </div>
    );
};

export default HomePage;
