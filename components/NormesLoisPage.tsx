import React, { useState, useMemo } from 'react';
import type { NormeLoiCadre, NormeLoiExigence } from '../types';
import { Plus, Search, Scale, Edit, Trash2 } from 'lucide-react';
import NormesLoisDetailPanel from './NormesLoisDetailPanel';
import { useDataContext } from '../context/AppContext';
import NormeLoiCadreFormModal from './NormeLoiCadreFormModal';
import NormeLoiExigenceFormModal from './NormeLoiExigenceFormModal';

const CADRE_TYPE_COLORS: Record<NormeLoiCadre['typeCadre'], string> = {
    'Norme': 'border-blue-500',
    'Loi': 'border-red-500',
    'Règlement': 'border-purple-500',
    'Politique interne': 'border-green-500',
};

const newCadreTemplate = (): Partial<NormeLoiCadre> => ({
    nom: '', reference: '', statut: 'brouillon', typeCadre: 'Norme',
    responsableConformiteId: '', entitesConcerneesIds: [], documentsReferenceIds: [],
    actif: true, dateCreation: new Date(), dateModification: new Date(), auteurId: 'pers-1',
});

const NormesLoisPage: React.FC = () => {
    const { data, actions } = useDataContext();
    const { normesLoisCadres, normesLoisExigences } = data;
    
    const [selectedCadre, setSelectedCadre] = useState<NormeLoiCadre | null>((normesLoisCadres as NormeLoiCadre[])[0] || null);
    const [searchTerm, setSearchTerm] = useState('');

    const [isCadreModalOpen, setCadreModalOpen] = useState(false);
    const [editingCadre, setEditingCadre] = useState<Partial<NormeLoiCadre> | null>(null);
    
    const [isExigenceModalOpen, setExigenceModalOpen] = useState(false);
    const [editingExigence, setEditingExigence] = useState<Partial<NormeLoiExigence> | null>(null);

    const filteredCadres = useMemo(() => {
        return (normesLoisCadres as NormeLoiCadre[]).filter(c => c.nom.toLowerCase().includes(searchTerm.toLowerCase()) || c.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [normesLoisCadres, searchTerm]);

    const handleOpenCadreModal = (cadre?: NormeLoiCadre) => {
        setEditingCadre(cadre || newCadreTemplate());
        setCadreModalOpen(true);
    };

    const handleSaveCadre = (cadre: NormeLoiCadre) => {
        actions.saveNormeLoiCadre(cadre);
        setCadreModalOpen(false);
    };

    const handleDeleteCadre = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce cadre et toutes ses exigences ?")) {
            actions.deleteNormeLoiCadre(id);
            if (selectedCadre?.id === id) setSelectedCadre(null);
        }
    };
    
    const handleOpenExigenceModal = (exigence?: NormeLoiExigence) => {
        if (!selectedCadre) return;
        setEditingExigence(exigence || { cadreId: selectedCadre.id });
        setExigenceModalOpen(true);
    };
    
    const handleSaveExigence = (exigence: NormeLoiExigence) => {
        actions.saveNormeLoiExigence(exigence);
        setExigenceModalOpen(false);
    };

    const handleDeleteExigence = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette exigence ?")) {
            actions.deleteNormeLoiExigence(id);
        }
    };


    return (
        <div className="flex h-[calc(100vh-150px)]">
            <div className="w-1/3 flex flex-col min-w-[350px] bg-white border-r">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Cadres Normatifs</h2>
                    <button onClick={() => handleOpenCadreModal()} className="p-1.5 hover:bg-gray-100 rounded-md"><Plus className="h-5 w-5 text-blue-600"/></button>
                </div>
                <div className="p-2 border-b">
                    <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher un cadre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 w-full border rounded-md py-1 text-sm"/></div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredCadres.map(cadre => (
                        <div key={cadre.id} onClick={() => setSelectedCadre(cadre)} className={`p-3 border-l-4 cursor-pointer group relative ${selectedCadre?.id === cadre.id ? 'bg-blue-50' : 'hover:bg-gray-50'} ${CADRE_TYPE_COLORS[cadre.typeCadre]}`}>
                            <h3 className="font-semibold text-sm text-gray-800">{cadre.nom}</h3>
                            <p className="text-xs text-gray-500">{cadre.reference}</p>
                            <span className="mt-1 inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{cadre.typeCadre}</span>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenCadreModal(cadre)}} className="p-1 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4 text-blue-600"/></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteCadre(cadre.id)}} className="p-1 hover:bg-gray-200 rounded-md"><Trash2 className="h-4 w-4 text-red-600"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 bg-gray-50">
                {selectedCadre ? (
                    <NormesLoisDetailPanel 
                        cadre={selectedCadre} 
                        exigences={ (normesLoisExigences as NormeLoiExigence[]).filter(e => e.cadreId === selectedCadre.id) }
                        onEditCadre={handleOpenCadreModal}
                        onDeleteCadre={handleDeleteCadre}
                        onAddExigence={() => handleOpenExigenceModal()}
                        onEditExigence={handleOpenExigenceModal}
                        onDeleteExigence={handleDeleteExigence}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <Scale className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun cadre sélectionné</h3>
                            <p className="mt-1 text-sm text-gray-500">Sélectionnez un cadre dans la liste pour voir ses exigences.</p>
                        </div>
                    </div>
                )}
            </div>
            <NormeLoiCadreFormModal isOpen={isCadreModalOpen} onClose={() => setCadreModalOpen(false)} onSave={handleSaveCadre} cadre={editingCadre} />
            <NormeLoiExigenceFormModal isOpen={isExigenceModalOpen} onClose={() => setExigenceModalOpen(false)} onSave={handleSaveExigence} exigence={editingExigence} />
        </div>
    );
};

export default NormesLoisPage;
