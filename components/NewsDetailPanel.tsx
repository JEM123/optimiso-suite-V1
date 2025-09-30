import React from 'react';
import type { Actualite } from '../types';
import { X, Edit } from 'lucide-react';

interface NewsDetailPanelProps {
    actualite: Actualite;
    onClose: () => void;
    onEdit: (a: Actualite) => void;
}

const NewsDetailPanel: React.FC<NewsDetailPanelProps> = ({ actualite, onClose, onEdit }) => {
    
    // Simple imitation of Tailwind prose styles
    const proseStyles = `
        .prose h1, .prose h2, .prose h3 { font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; }
        .prose p { margin-bottom: 1em; line-height: 1.6; }
        .prose a { color: #2563eb; text-decoration: underline; }
    `;

    return (
        <div className="bg-white border-l shadow-lg flex flex-col h-full animate-slide-in-right">
             <style>{proseStyles}</style>
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={actualite.nom}>{actualite.nom}</h2>
                    <p className="text-sm text-gray-500">Publié le {new Date(actualite.datePublication).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEdit(actualite)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {actualite.imageURL && (
                    <img src={actualite.imageURL} alt={actualite.nom} className="w-full h-48 object-cover bg-gray-200" />
                )}
                <div className="p-4">
                     <div 
                        className="prose max-w-none text-gray-700 text-sm" 
                        dangerouslySetInnerHTML={{ __html: actualite.contenuRiche || `<p>${actualite.resume}</p>` }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default NewsDetailPanel;