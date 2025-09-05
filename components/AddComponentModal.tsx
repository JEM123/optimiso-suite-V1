import React from 'react';
import type { ComponentType } from '../types';
import { X, Heading1, Newspaper, CheckSquare, FileText, BarChart3, AlertTriangle, Home, LayoutDashboard } from 'lucide-react';

interface AddComponentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: ComponentType) => void;
}

const WIDGET_TYPES: { type: ComponentType, label: string, icon: React.ElementType, description: string }[] = [
    { type: 'welcome', label: 'Bannière', icon: Home, description: "Message de bienvenue." },
    { type: 'kpi-card-group', label: 'Groupe de KPIs', icon: LayoutDashboard, description: "Affiche les 4 indicateurs clés." },
    { type: 'text', label: 'Texte', icon: Heading1, description: "Bloc de texte libre." },
    { type: 'news', label: 'Actualités', icon: Newspaper, description: "Affiche les dernières actualités." },
    { type: 'my-tasks', label: 'Mes Tâches', icon: CheckSquare, description: "Liste de vos tâches assignées." },
    { type: 'risk-list', label: 'Liste des Risques', icon: AlertTriangle, description: "Top risques filtrés." },
    { type: 'useful-docs', label: 'Documents', icon: FileText, description: "Documents mis en avant." },
    { type: 'indicator-chart', label: 'Graphique', icon: BarChart3, description: "Graphique d'un indicateur." },
];

const AddComponentModal: React.FC<AddComponentModalProps> = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Ajouter un Widget</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {WIDGET_TYPES.map(({ type, label, icon: Icon, description }) => (
                        <button 
                            key={type}
                            onClick={() => onSelect(type)}
                            className="p-4 border rounded-lg text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                            <Icon className="h-6 w-6 text-blue-600 mb-2" />
                            <h3 className="font-semibold text-gray-800">{label}</h3>
                            <p className="text-xs text-gray-500 mt-1">{description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddComponentModal;