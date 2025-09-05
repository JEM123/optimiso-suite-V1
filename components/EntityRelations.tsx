
import React from 'react';
import { X } from 'lucide-react';
import { mockData } from '../constants';

interface EntityRelationsProps {
    entity: any;
    entityType: string;
    onClose: () => void;
    onNavigate: (moduleId: string, entity: any) => void;
}

const getRelatedEntities = (entityId: string, entityType: string) => {
    switch (entityType) {
        case 'risques':
        case 'risque':
            const risque = mockData.risques.find(r => r.id === entityId);
            if (!risque) return {};
            return {
                processus: mockData.processus.find(p => p.id === risque.processusId),
                controles: mockData.controles.filter(c => risque.controleMaitriseIds.includes(c.id)),
                documents: mockData.documents.filter(d => risque.documentMaitriseIds.includes(d.id)),
                procedures: mockData.procedures.filter(p => risque.procedureMaitriseIds.includes(p.id))
            };
        case 'controles':
        case 'controle':
            const controle = mockData.controles.find(c => c.id === entityId);
            if (!controle) return {};
            return {
                risques: mockData.risques.filter(r => controle.risqueMaitriseIds.includes(r.id)),
                // Fix: 'responsableIds' does not exist on type 'Controle'. Use 'executantsIds' instead.
                responsables: mockData.personnes.filter(p => controle.executantsIds.includes(p.id))
            };
        default:
            return {};
    }
};

const EntityRelations: React.FC<EntityRelationsProps> = ({ entity, entityType, onClose, onNavigate }) => {
    const relations = getRelatedEntities(entity.id, entityType);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-start justify-end z-40" onClick={onClose}>
            <div className="bg-white h-full w-full max-w-md shadow-2xl p-6 overflow-y-auto animate-slide-in-right" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Relations - {entity.reference}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    {Object.keys(relations).length === 0 && <p className="text-gray-600">Aucune relation directe trouvée pour cet élément.</p>}
                    {Object.entries(relations).map(([relationKey, relationData]) => {
                        if (!relationData || (Array.isArray(relationData) && relationData.length === 0)) return null;
                        
                        const items = Array.isArray(relationData) ? relationData : [relationData];
                        
                        return (
                            <div key={relationKey}>
                                <h4 className="font-medium text-gray-900 capitalize mb-2 border-b pb-2">
                                    {relationKey} ({items.length})
                                </h4>
                                <div className="space-y-2 mt-2">
                                    {items.map((item: any) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                const moduleMap: Record<string, string> = {
                                                    processus: 'processus',
                                                    controles: 'controles', 
                                                    documents: 'documents',
                                                    procedures: 'procedures',
                                                    risques: 'risques',
                                                    responsables: 'personnes'
                                                };
                                                if (moduleMap[relationKey]) {
                                                    onNavigate(moduleMap[relationKey], item);
                                                }
                                            }}
                                            className="block w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-transparent transition-colors"
                                        >
                                            <div className="text-sm font-medium text-blue-600">{item.reference}</div>
                                            <div className="text-sm text-gray-600">{item.nom}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default EntityRelations;