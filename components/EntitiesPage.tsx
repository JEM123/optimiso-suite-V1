import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Entite, Processus } from '../types';
import { useDataContext } from '../context/AppContext';
import { Search, ChevronDown, ArrowUp, Filter, List, ListChecks } from 'lucide-react';

type SortConfig = { key: keyof Entite; direction: 'ascending' | 'descending' };
type ViewType = 'Liste' | 'Liste+Fiche';


const EntitiesPage: React.FC = () => {
    const { data } = useDataContext();
    const { entites, processus } = data as { entites: Entite[], processus: Processus[] };
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'reference', direction: 'ascending' });

    const [showFilters, setShowFilters] = useState(false);
    const [entityFilter, setEntityFilter] = useState('all');
    const [processusFilter, setProcessusFilter] = useState('all');
    const [currentView, setCurrentView] = useState<ViewType>('Liste');
    const [isViewDropdownOpen, setViewDropdownOpen] = useState(false);
    
    const viewDropdownRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target as Node)) {
                setViewDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [viewDropdownRef]);

    const sortedAndFilteredEntities = useMemo(() => {
        let filteredItems = [...entites];

        if (searchTerm) {
            filteredItems = filteredItems.filter(item =>
                item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.reference.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (entityFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.parentId === entityFilter);
        }
        
        if (processusFilter !== 'all') {
            const selectedProcessus = processus.find(p => p.id === processusFilter);
            if (selectedProcessus) {
                const relatedEntityIds = new Set(selectedProcessus.entitesConcerneesIds);
                filteredItems = filteredItems.filter(item => relatedEntityIds.has(item.id));
            } else {
                filteredItems = []; 
            }
        }

        filteredItems.sort((a, b) => {
            const key = sortConfig.key as keyof Entite;
            const valA = a[key] || '';
            const valB = b[key] || '';
            if (valA < valB) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (valA > valB) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        return filteredItems;
    }, [entites, processus, searchTerm, sortConfig, entityFilter, processusFilter]);

    const requestSort = (key: keyof Entite) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleViewChange = (view: ViewType) => {
        setCurrentView(view);
        setViewDropdownOpen(false);
    }

    const totalEntities = entites.length;

    return (
        <div className="p-6 bg-white h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-800">Entités</h1>
                    <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-md">{totalEntities}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 border rounded-md transition-colors ${showFilters ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-100'}`}
                        aria-label="Toggle filters"
                    >
                        <Filter className={`h-5 w-5 ${showFilters ? 'text-blue-600' : 'text-gray-600'}`} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Recherche..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Rechercher une entité"
                        />
                    </div>
                     <div className="relative" ref={viewDropdownRef}>
                        <button 
                            onClick={() => setViewDropdownOpen(!isViewDropdownOpen)}
                            className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-100 text-gray-700 font-medium transition-colors bg-white shadow-sm"
                        >
                            {currentView === 'Liste' ? <List className="h-5 w-5"/> : <ListChecks className="h-5 w-5" />}
                            <span>{currentView}</span>
                            <ChevronDown className="h-4 w-4 text-gray-500"/>
                        </button>
                        {isViewDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20">
                                <button onClick={() => handleViewChange('Liste')} className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 text-sm">
                                    <List className="h-4 w-4"/>
                                    <span>Liste</span>
                                </button>
                                <button onClick={() => handleViewChange('Liste+Fiche')} className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 text-sm">
                                    <ListChecks className="h-4 w-4"/>
                                    <span>Liste+Fiche</span>
                                </button>
                            </div>
                        )}
                     </div>
                </div>
            </div>

            {showFilters && (
                <div className="flex space-x-4 mb-4 pb-4 border-b">
                    <select
                        value={entityFilter}
                        onChange={(e) => setEntityFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="all">Filtrer par entité (parente)</option>
                        {entites.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                    </select>
                    <select
                        value={processusFilter}
                        onChange={(e) => setProcessusFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="all">Filtrer par processus</option>
                        {processus.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                    </select>
                </div>
            )}

            <div className="flex-1 overflow-y-auto -mx-6">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b">
                            <th scope="col" className="px-6 py-4 font-medium text-gray-600">
                                <button onClick={() => requestSort('reference')} className="flex items-center space-x-1 hover:text-gray-900">
                                    <span>Référence</span>
                                    {sortConfig.key === 'reference' && <ArrowUp className={`h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />}
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-4 font-medium text-gray-600">
                                <button onClick={() => requestSort('nom')} className="flex items-center space-x-1 hover:text-gray-900">
                                    <span>Titre</span>
                                    {sortConfig.key === 'nom' && <ArrowUp className={`h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />}
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sortedAndFilteredEntities.map(entity => (
                            <tr key={entity.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-800">{entity.reference}</td>
                                <td className="px-6 py-4 text-gray-800">{entity.nom}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedAndFilteredEntities.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500">Aucune entité trouvée pour les filtres actuels.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EntitiesPage;
