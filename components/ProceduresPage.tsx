import React, { useState, useMemo } from 'react';
import { mockData } from '../constants';
import type { Procedure, EtapeProcedure } from '../types';
import { Plus, Search, Trash2, Edit, Workflow } from 'lucide-react';
import ProcedureFormModal from './ProcedureFormModal';
import StepFormModal from './StepFormModal';
import ProcedureFlow from './ProcedureFlow';

const PROC_STATUS_COLORS: Record<Procedure['statut'], string> = {
    'brouillon': 'bg-gray-200 text-gray-800', 'en_cours': 'bg-yellow-100 text-yellow-800',
    'valide': 'bg-green-100 text-green-800', 'archive': 'bg-red-100 text-red-800',
    'à_créer': 'bg-cyan-100 text-cyan-800', 'en_recrutement': 'bg-yellow-100 text-yellow-800',
    'gelé': 'bg-purple-100 text-purple-800', 'figé': 'bg-indigo-100 text-indigo-800',
    'planifié': 'bg-blue-100 text-blue-800', 'terminé': 'bg-green-100 text-green-800',
    'non-conforme': 'bg-red-200 text-red-900', 'clôturé': 'bg-gray-300 text-gray-800',
    'a_faire': 'bg-yellow-100 text-yellow-800', 'en_retard': 'bg-red-100 text-red-800',
    'en_validation': 'bg-yellow-100 text-yellow-800',
    'publie': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800',
};

interface ProceduresPageProps {
    onShowRelations: (entity: any, entityType: string) => void;
}

const ProceduresPage: React.FC<ProceduresPageProps> = ({ onShowRelations }) => {
    const [procedures, setProcedures] = useState<Procedure[]>(mockData.procedures);
    const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(procedures[0] || null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcModalOpen, setProcModalOpen] = useState(false);
    const [editingProcedure, setEditingProcedure] = useState<Partial<Procedure> | null>(null);
    const [isStepModalOpen, setStepModalOpen] = useState(false);
    const [editingStep, setEditingStep] = useState<{ procId: string, step?: Partial<EtapeProcedure> } | null>(null);

    const filteredProcedures = useMemo(() => {
        return procedures.filter(p => p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || p.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [procedures, searchTerm]);

    const handleOpenProcModal = (proc?: Procedure) => {
        setEditingProcedure(proc || {});
        setProcModalOpen(true);
    };

    const handleSaveProcedure = (procToSave: Procedure) => {
        if (procToSave.id) {
            const updated = { ...procedures.find(p => p.id === procToSave.id), ...procToSave, dateModification: new Date() } as Procedure;
            setProcedures(procedures.map(p => p.id === procToSave.id ? updated : p));
            if (selectedProcedure?.id === updated.id) setSelectedProcedure(updated);
        } else {
            const newProc = { ...procToSave, id: `proc-${Date.now()}`, reference: procToSave.reference || `PROC-${Date.now()}`, etapes: [], liens: [] } as Procedure;
            setProcedures([...procedures, newProc]);
        }
        setProcModalOpen(false);
    };

    const handleDeleteProcedure = (procId: string) => {
        setProcedures(procs => procs.filter(p => p.id !== procId));
        if (selectedProcedure?.id === procId) {
            setSelectedProcedure(null);
        }
    };
    
    const handleOpenStepModal = (etape: EtapeProcedure) => {
        if (!selectedProcedure) return;
        setEditingStep({ procId: selectedProcedure.id, step: etape });
        setStepModalOpen(true);
    };

    const handleSaveStep = (procId: string, stepToSave: EtapeProcedure) => {
        const procedureToUpdate = procedures.find(p => p.id === procId);
        if (!procedureToUpdate) return;

        const stepExists = procedureToUpdate.etapes.some(s => s.id === stepToSave.id);
        const newEtapes = stepExists
            ? procedureToUpdate.etapes.map(s => s.id === stepToSave.id ? { ...s, ...stepToSave } : s)
            : [...procedureToUpdate.etapes, { ...stepToSave, id: `etape-${Date.now()}` }];
        
        const updatedProcedure = { ...procedureToUpdate, etapes: newEtapes };
        const newProcedures = procedures.map(p => p.id === procId ? updatedProcedure : p);
        
        setProcedures(newProcedures);
        if (selectedProcedure?.id === procId) {
            setSelectedProcedure(updatedProcedure);
        }
        setStepModalOpen(false);
    };

    return (
        <div className="flex h-[calc(100vh-150px)]">
            <div className="w-1/3 flex flex-col min-w-[350px] bg-white border-r">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Procédures</h2>
                    <button onClick={() => handleOpenProcModal()} className="p-1.5 hover:bg-gray-100 rounded-md"><Plus className="h-5 w-5 text-blue-600"/></button>
                </div>
                <div className="p-2 border-b">
                    <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 w-full border rounded-md py-1 text-sm"/></div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredProcedures.map(proc => (
                        <div key={proc.id} onClick={() => setSelectedProcedure(proc)} className={`p-3 border-b cursor-pointer group relative ${selectedProcedure?.id === proc.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                            <h3 className="font-semibold text-sm text-gray-800">{proc.nom}</h3>
                            <p className="text-xs text-gray-500">{proc.reference}</p>
                            <span className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${PROC_STATUS_COLORS[proc.statut]}`}>{proc.statut.replace(/_/g, ' ')}</span>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenProcModal(proc)}} className="p-1 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4 text-blue-600"/></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteProcedure(proc.id)}} className="p-1 hover:bg-gray-200 rounded-md"><Trash2 className="h-4 w-4 text-red-600"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 bg-gray-50 relative">
                {selectedProcedure ? (
                    <ProcedureFlow
                        key={selectedProcedure.id}
                        procedure={selectedProcedure}
                        onShowRelations={onShowRelations}
                        onEditStep={handleOpenStepModal}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <Workflow className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune procédure sélectionnée</h3>
                            <p className="mt-1 text-sm text-gray-500">Sélectionnez une procédure pour afficher le flux.</p>
                        </div>
                    </div>
                )}
            </div>
            <ProcedureFormModal isOpen={isProcModalOpen} onClose={() => setProcModalOpen(false)} onSave={handleSaveProcedure} procedure={editingProcedure} />
            {editingStep && <StepFormModal isOpen={isStepModalOpen} onClose={() => setStepModalOpen(false)} onSave={handleSaveStep} context={editingStep} />}
        </div>
    );
};

export default ProceduresPage;