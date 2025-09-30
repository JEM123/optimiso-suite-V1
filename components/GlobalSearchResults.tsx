import React from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, User, Briefcase, AlertTriangle, HelpCircle } from 'lucide-react';
import type { Document, Personne, Poste, Risque } from '../types';

type SearchResultItem = (Document | Personne | Poste | Risque) & { type: 'document' | 'personne' | 'poste' | 'risque' };

interface GlobalSearchResultsProps {
    results: SearchResultItem[];
    onResultClick: () => void;
}

const ICONS: Record<SearchResultItem['type'], React.ElementType> = {
    document: FileText,
    personne: User,
    poste: Briefcase,
    risque: AlertTriangle
};

const MODULE_MAP: Record<SearchResultItem['type'], string> = {
    document: 'documents',
    personne: 'personnes',
    poste: 'postes',
    risque: 'risques'
};

const getName = (item: SearchResultItem) => {
    switch(item.type) {
        case 'document':
        case 'risque':
            return (item as Document | Risque).nom;
        case 'personne':
            const p = item as Personne;
            return `${p.prenom} ${p.nom}`;
        case 'poste':
            return (item as Poste).intitule;
        default:
            return 'Résultat';
    }
}

const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({ results, onResultClick }) => {
    const { handleNotificationClick } = useAppContext();

    const handleClick = (item: SearchResultItem) => {
        const moduleId = MODULE_MAP[item.type];
        // We can reuse the notification click logic for navigation
        handleNotificationClick({
            id: `search-${item.id}`,
            type: 'alerte', // type doesn't matter much here
            title: '',
            description: '',
            date: new Date(),
            targetModule: moduleId,
            targetId: item.id
        });
        onResultClick();
    };

    return (
        <div className="absolute top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border z-50 animate-fade-in-down max-h-96 overflow-y-auto">
            <div className="divide-y divide-gray-100">
                {results.map(item => {
                    const Icon = ICONS[item.type] || HelpCircle;
                    return (
                        <button
                            key={`${item.type}-${item.id}`}
                            onClick={() => handleClick(item)}
                            className="w-full text-left p-3 hover:bg-gray-50 flex items-start gap-3"
                        >
                            <Icon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{getName(item)}</p>
                                <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GlobalSearchResults;
