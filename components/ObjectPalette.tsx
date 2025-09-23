
import React, { useState, DragEvent } from 'react';
import { useDataContext } from '../context/AppContext';
import { ChevronLeft, ChevronRight, FileText, AlertTriangle } from 'lucide-react';
import type { Document, Risque } from '../types';

const DraggableItem: React.FC<{
    item: { id: string, nom: string, reference: string };
    type: 'document' | 'risk';
    icon: React.ElementType;
}> = ({ item, type, icon: Icon }) => {
    
    const onDragStart = (event: DragEvent, itemType: string, itemId: string) => {
        const payload = JSON.stringify({ type: itemType, id: itemId });
        event.dataTransfer.setData('application/optimiso-object', payload);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            className="p-2 border-b bg-white hover:bg-gray-50 cursor-grab flex items-start gap-2"
            draggable
            onDragStart={(e) => onDragStart(e, type, item.id)}
        >
            <Icon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.nom}</p>
                <p className="text-xs text-gray-500">{item.reference}</p>
            </div>
        </div>
    );
};

const ObjectPalette: React.FC = () => {
    const { data } = useDataContext();
    const [isOpen, setIsOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'documents' | 'risks'>('documents');

    const documents = data.documents as Document[];
    const risks = data.risques as Risque[];

    if (!isOpen) {
        return (
            <div className="absolute top-1/2 -translate-y-1/2 right-0 z-10">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-white p-2 rounded-l-md shadow-lg border-l border-t border-b"
                    aria-label="Ouvrir la palette d'objets"
                >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
            </div>
        );
    }

    return (
        <div className="absolute top-0 right-0 h-full w-80 bg-gray-50 border-l shadow-lg flex flex-col z-10 animate-slide-in-right">
            <div className="p-2 border-b flex items-center justify-between bg-white">
                <h3 className="font-semibold text-gray-700">Objets réutilisables</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded hover:bg-gray-100"
                    aria-label="Fermer la palette d'objets"
                >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
            </div>
            
            <div className="border-b bg-white">
                <nav className="flex">
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'documents' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    >
                        <FileText className="h-4 w-4" /> Documents ({documents.length})
                    </button>
                     <button
                        onClick={() => setActiveTab('risks')}
                        className={`flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'risks' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    >
                        <AlertTriangle className="h-4 w-4" /> Risques ({risks.length})
                    </button>
                </nav>
            </div>

            <div className="flex-grow overflow-y-auto">
                {activeTab === 'documents' && (
                    <div>
                        {documents.map(doc => <DraggableItem key={doc.id} item={doc} type="document" icon={FileText} />)}
                    </div>
                )}
                 {activeTab === 'risks' && (
                    <div>
                        {risks.map(risk => <DraggableItem key={risk.id} item={risk} type="risk" icon={AlertTriangle} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ObjectPalette;
