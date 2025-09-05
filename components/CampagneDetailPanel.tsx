import React, { useState, useMemo } from 'react';
import type { CampagneEvaluation, Personne, EvaluationCompetence } from '../types';
import { useDataContext } from '../context/AppContext';
import { X, Edit, Info, Users, BookOpen, Clock, CheckCircle } from 'lucide-react';

interface CampagneDetailPanelProps {
    campagne: CampagneEvaluation;
    onClose: () => void;
    onEdit: (c: CampagneEvaluation) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div><p className="text-sm font-semibold text-gray-700">{label}</p><div className="text-sm text-gray-900 mt-1">{value || '-'}</div></div>
);

const CampagneDetailPanel: React.FC<CampagneDetailPanelProps> = ({ campagne, onClose, onEdit }) => {
    const [activeTab, setActiveTab] = useState('suivi');
    const { data } = useDataContext();
    const { personnes, postes, entites, competences, evaluationsCompetences } = data as {
        personnes: Personne[], postes: any[], entites: any[], competences: any[], evaluationsCompetences: EvaluationCompetence[]
    };

    const participants = useMemo(() => {
        const participantSet = new Set<Personne>();
        
        // This is a simplified logic. A real app would resolve entities/posts to people.
        // For now, we'll just check evaluations linked to the campaign.
        const evaluations = evaluationsCompetences.filter(e => e.campagneId === campagne.id);
        evaluations.forEach(ev => {
            const person = personnes.find(p => p.id === ev.personneId);
            if (person) participantSet.add(person);
        });

        return Array.from(participantSet).map(person => {
            const personEvals = evaluations.filter(e => e.personneId === person.id);
            const isCompleted = personEvals.every(e => e.statut === 'completee');
            return { person, isCompleted };
        });

    }, [campagne.id, personnes, evaluationsCompetences]);


    return (
        <div className="w-full max-w-lg bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate">{campagne.nom}</h2>
                    <p className="text-sm text-gray-500">{campagne.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEdit(campagne)} className="p-2"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="border-b">
                <nav className="flex space-x-2 px-2">
                    {[{ id: 'suivi', label: 'Suivi', icon: Clock }, { id: 'details', label: 'Détails', icon: Info }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-2 text-sm font-medium flex items-center gap-1.5 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
                            <tab.icon className="h-4 w-4" />{tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
                {activeTab === 'details' && (
                    <div className="space-y-4">
                        <DetailItem label="Description" value={<p className="whitespace-pre-wrap">{campagne.description}</p>} />
                        <DetailItem label="Période" value={`${new Date(campagne.periodeDebut).toLocaleDateString('fr-FR')} au ${new Date(campagne.periodeFin).toLocaleDateString('fr-FR')}`} />
                        <DetailItem label="Méthodes" value={campagne.methodes.join(', ')} />
                    </div>
                )}
                 {activeTab === 'suivi' && (
                    <div className="space-y-2">
                         <h3 className="font-semibold text-gray-800 mb-2">Suivi des Évaluations ({participants.length})</h3>
                        {participants.map(({ person, isCompleted }) => (
                            <div key={person.id} className="p-3 bg-white border rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-sm">{person.prenom} {person.nom}</p>
                                    <p className="text-xs text-gray-500">{person.email}</p>
                                </div>
                                <div className={`flex items-center gap-1.5 text-xs font-medium ${isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {isCompleted ? <CheckCircle className="h-4 w-4"/> : <Clock className="h-4 w-4"/>}
                                    <span>{isCompleted ? 'Complétée' : 'À faire'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampagneDetailPanel;
