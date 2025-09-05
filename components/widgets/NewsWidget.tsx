import React from 'react';
import { useDataContext, useAppContext } from '../../context/AppContext';
import type { AccueilComponentConfig, Actualite } from '../../types';
import { Bell, ArrowRight } from 'lucide-react';

interface NewsWidgetProps {
    config: AccueilComponentConfig;
}

const NewsWidget: React.FC<NewsWidgetProps> = ({ config }) => {
    const { data } = useDataContext();
    const { setActiveModule } = useAppContext();
    
    const publishedNews = (data.actualites as Actualite[])
        .filter(a => a.statut === 'publie' && (!a.dateExpiration || new Date(a.dateExpiration) > new Date()))
        .sort((a, b) => new Date(b.datePublication).getTime() - new Date(a.datePublication).getTime())
        .slice(0, 3);

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <Bell className="mr-2 h-5 w-5 text-blue-500" />
                {config.title || 'Dernières actualités'}
            </h3>
            <div className="space-y-4 flex-grow">
                {publishedNews.length > 0 ? publishedNews.map((actualite: Actualite) => (
                    <div key={actualite.id} className="flex items-start space-x-3">
                        {actualite.imageURL ? (
                            <img src={actualite.imageURL} alt={actualite.nom} className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-gray-100" />
                        ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center">
                                <Bell className="h-6 w-6 text-gray-400"/>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">{actualite.nom}</h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{actualite.resume}</p>
                            <a href={actualite.lienCible || '#'} className="text-xs text-blue-600 hover:underline mt-1 inline-block">Lire la suite</a>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-gray-500 text-center py-8">Aucune actualité pour le moment.</p>
                )}
            </div>
            <div className="mt-4 border-t pt-2">
                <button 
                    onClick={() => setActiveModule('actualites')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 w-full text-left flex items-center justify-between"
                >
                    <span>Voir toutes les actualités</span>
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default NewsWidget;
