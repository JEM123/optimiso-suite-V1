import React, { useState } from 'react';
import { mockData } from '../constants';
import type { FluxDefinition } from '../types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import FluxFormModal from './FluxFormModal';

const FluxWorkflowPanel: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFlux, setEditingFlux] = useState<Partial<FluxDefinition> | null>(null);

    const handleOpenModal = (flux?: FluxDefinition) => {
        setEditingFlux(flux || {});
        setIsModalOpen(true);
    };
    
    const handleSaveFlux = (flux: FluxDefinition) => {
        // Mock save
        console.log("Saving flux", flux);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Modèles de Flux</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                    <Plus className="h-4 w-4" />
                    Nouveau Flux
                </button>
            </div>

            <div className="bg-white border rounded-lg">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Modules Cibles</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Étapes</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {mockData.fluxDefinitions.map(flux => (
                            <tr key={flux.id}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{flux.nom}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    <div className="flex flex-wrap gap-1">
                                        {flux.modulesCibles.map(m => <span key={m} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">{m}</span>)}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-center text-gray-600">{flux.etapes.length}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleOpenModal(flux)} className="p-1 hover:bg-gray-200 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
                                        <button className="p-1 hover:bg-gray-200 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <FluxFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveFlux}
                flux={editingFlux}
            />
        </div>
    );
};

export default FluxWorkflowPanel;
