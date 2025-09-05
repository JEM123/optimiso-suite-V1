import React, { useState, useEffect, useMemo } from 'react';
import { useDataContext } from '../context/AppContext';
import type { EvaluationCompetence, Competence, Personne, Poste } from '../types';
import { X } from 'lucide-react';

interface EvaluationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (evaluation: EvaluationCompetence) => void;
    evaluation: EvaluationCompetence;
}

const formInputClasses = "block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";

const EvaluationFormModal: React.FC<EvaluationFormModalProps> = ({ isOpen, onClose, onSave, evaluation }) => {
    const { data } = useDataContext();
    const { personnes, competences, postes } = data as { personnes: Personne[], competences: Competence[], postes: Poste[] };
    
    const [formData, setFormData] = useState<Partial<EvaluationCompetence>>(evaluation);

    const competence = competences.find(c => c.id === evaluation.competenceId);
    const personne = personnes.find(p => p.id === evaluation.personneId);
    
    const posteRequisInfo = useMemo(() => {
        if (!competence || !personne) return null;
        // Find the first matching post for simplicity
        const poste = postes.find(p => personne.posteIds.includes(p.id));
        if (!poste) return null;
        return competence.postesRequis.find(pr => pr.posteId === poste.id);
    }, [competence, personne, postes]);


    useEffect(() => {
        if (isOpen) {
            setFormData(evaluation);
        }
    }, [evaluation, isOpen]);

    if (!isOpen || !competence || !personne) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLevelSelect = (niveau: number) => {
        setFormData(prev => ({ ...prev, niveauEvalue: niveau }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as EvaluationCompetence);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-3xl w-full flex flex-col shadow-2xl animate-fade-in-up max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold">Évaluation de Compétence</h2>
                        <p className="text-sm text-gray-500">Pour : {personne.prenom} {personne.nom}</p>
                    </div>
                    <button type="button" onClick={onClose}><X/></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <h3 className="text-lg font-bold text-blue-800">{competence.nom}</h3>
                        <p className="text-sm text-gray-600 mt-1">{competence.description}</p>
                        {posteRequisInfo && (
                            <p className="text-sm font-semibold mt-2">Niveau attendu pour le poste : <span className="text-blue-700">{posteRequisInfo.niveauAttendu}</span></p>
                        )}
                    </div>
                    
                    <div>
                        <h4 className="font-semibold mb-2">Veuillez sélectionner un niveau :</h4>
                        <div className="space-y-2">
                            {competence.echelleNiveaux.map(niveau => (
                                <div key={niveau.niveau} onClick={() => handleLevelSelect(niveau.niveau)}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${formData.niveauEvalue === niveau.niveau ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300' : 'bg-white hover:bg-gray-50'}`}>
                                    <label className="flex items-center">
                                        <input 
                                            type="radio"
                                            name="niveauEvalue"
                                            value={niveau.niveau}
                                            checked={formData.niveauEvalue === niveau.niveau}
                                            onChange={() => handleLevelSelect(niveau.niveau)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <div className="ml-3">
                                            <p className="font-semibold text-sm">Niveau {niveau.niveau}: {niveau.libelle}</p>
                                            <p className="text-xs text-gray-600 mt-1 italic">"{niveau.criteres}"</p>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold mb-1">Commentaires & Exemples</label>
                        <textarea name="commentaire" value={formData.commentaire || ''} onChange={handleChange} rows={4} className={formInputClasses} placeholder="Apportez des exemples concrets pour justifier l'évaluation..."></textarea>
                    </div>
                </div>
                <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                    <button type="submit" disabled={!formData.niveauEvalue} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400">Soumettre l'évaluation</button>
                </div>
            </form>
        </div>
    );
};

export default EvaluationFormModal;