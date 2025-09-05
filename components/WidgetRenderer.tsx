import React from 'react';
import type { AccueilComponent } from '../types';
import { Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

// Import all widget components
import WelcomeWidget from './widgets/WelcomeWidget';
import NewsWidget from './widgets/NewsWidget';
import MyTasksWidget from './widgets/MyTasksWidget';
import RiskListWidget from './widgets/RiskListWidget';
import IndicatorChartWidget from './widgets/IndicatorChartWidget';
import UsefulDocsWidget from './widgets/UsefulDocsWidget';
import TextWidget from './widgets/TextWidget';
import KpiCardsWidget from './widgets/KpiCardsWidget';

interface WidgetRendererProps {
    component: AccueilComponent;
    isEditing: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onMove: (id: string, direction: 'up' | 'down') => void;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ component, isEditing, onEdit, onDelete, onMove }) => {
    
    const renderWidget = () => {
        switch (component.type) {
            case 'welcome': return <WelcomeWidget config={component.config} />;
            case 'news': return <NewsWidget config={component.config} />;
            case 'my-tasks': return <MyTasksWidget config={component.config} />;
            case 'risk-list': return <RiskListWidget config={component.config} />;
            case 'indicator-chart': return <IndicatorChartWidget config={component.config} />;
            case 'useful-docs': return <UsefulDocsWidget config={component.config} />;
            case 'text': return <TextWidget config={component.config} />;
            case 'kpi-card-group': return <KpiCardsWidget config={component.config} />;
            default: return <div className="p-4 bg-red-100 border border-red-400 rounded-lg">Widget de type '{component.type}' non trouvé.</div>;
        }
    };
    
    if (isEditing) {
        return (
            <div className="relative border-2 border-dashed border-blue-400 rounded-lg p-1 bg-blue-50/50">
                <div className="absolute top-1 right-1 z-10 bg-white/70 backdrop-blur-sm rounded-md p-1 flex items-center space-x-1">
                    <button onClick={() => onMove(component.id, 'up')} className="p-1 hover:bg-gray-200 rounded"><ArrowUp className="h-4 w-4"/></button>
                    <button onClick={() => onMove(component.id, 'down')} className="p-1 hover:bg-gray-200 rounded"><ArrowDown className="h-4 w-4"/></button>
                    <button onClick={onEdit} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                    <button onClick={onDelete} className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                </div>
                {renderWidget()}
            </div>
        );
    }

    return renderWidget();
};

export default WidgetRenderer;