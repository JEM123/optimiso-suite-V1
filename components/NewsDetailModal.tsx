import React from 'react';
import type { Actualite } from '../types';
import { useDataContext } from '../context/AppContext';
import { X, Calendar } from 'lucide-react';

interface NewsDetailModalProps {
    actualite: Actualite;
    onClose: () => void;
}

const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ actualite, onClose }) => {
    const { data } = useDataContext();
    const { categoriesActualites } = data as { categoriesActualites: any[] };
    const categorie = categoriesActualites.find(c => c.id === actualite.categorieId);

    // This is a simple Tailwind 'prose' imitation for basic styling of the rich content
    const proseStyles = `
        .prose h1, .prose h2, .prose h3 { font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
        .prose h1 { font-size: 1.875rem; }
        .prose h2 { font-size: 1.5rem; }
        .prose h3 { font-size: 1.25rem; }
        .prose p { margin-bottom: 1em; line-height: 1.6; }
        .prose a { color: #2563eb; text-decoration: underline; }
        .prose strong { font-weight: 700; }
        .prose ul, .prose ol { margin-left: 1.5em; margin-bottom: 1em; }
        .prose ul { list-style-type: disc; }
        .prose ol { list-style-type: decimal; }
    `;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <style>{proseStyles}</style>
            <div className="bg-white rounded-lg max-w-3xl w-full flex flex-col shadow-2xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-lg z-10">
                    <h2 className="text-xl font-semibold text-gray-800">{actualite.nom}</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <X className="h-5 w-5"/>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {actualite.imageURL && (
                        <img src={actualite.imageURL} alt={actualite.nom} className="w-full h-64 object-cover bg-gray-200" />
                    )}
                    <div className="p-6">
                        <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                            {categorie && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{categorie.nom}</span>}
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>Publié le {new Date(actualite.datePublication).toLocaleDateString('fr-FR')}</span>
                            </div>
                        </div>
                        <div 
                            className="prose max-w-none text-gray-700" 
                            dangerouslySetInnerHTML={{ __html: actualite.contenuRiche || `<p>${actualite.resume}</p>` }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsDetailModal;
