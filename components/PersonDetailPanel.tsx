import React, { useState } from 'react';
import type { Personne } from '../types';
import { X, Edit, Info, Briefcase, KeyRound, History, TrendingUp, Link as LinkIcon } from 'lucide-react';
import PersonGeneralInfoSection from './sections/personne/PersonGeneralInfoSection';
import PersonAffectationsSection from './sections/personne/PersonAffectationsSection';
import PersonCompetencesSection from './sections/personne/PersonCompetencesSection';
import PersonAccessSection from './sections/personne/PersonAccessSection';
import PersonHistorySection from './sections/personne/PersonHistorySection';

interface PersonDetailPanelProps {
    person: Personne;
    onClose: () => void;
    onEdit: (p: Personne) => void;
    onNavigate: (moduleId: string) => void;
    onShowRelations: (entity: any, entityType: string) => void;
}

const PersonDetailPanel: React.FC<PersonDetailPanelProps> = ({ person, onClose, onEdit, onNavigate, onShowRelations }) => {
    const [activeTab, setActiveTab] = useState('info');
    
    return (
        <div className="w-full max-w-md bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={`${person.prenom} ${person.nom}`}>{person.prenom} {person.nom}</h2>
                    <p className="text-sm text-gray-500">{person.email}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onShowRelations(person, 'personnes')} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><LinkIcon className="h-4 w-4"/></button>
                    <button onClick={() => onEdit(person)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="border-b">
                <nav className="flex space-x-1 sm:space-x-2 px-2 sm:px-4">
                    {[
                        { id: 'info', label: 'Informations', icon: Info },
                        { id: 'affectations', label: 'Affectations', icon: Briefcase },
                        { id: 'competences', label: 'Compétences', icon: TrendingUp },
                        { id: 'access', label: 'Accès', icon: KeyRound },
                        { id: 'history', label: 'Historique', icon: History }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
                {activeTab === 'info' && <PersonGeneralInfoSection person={person} />}
                {activeTab === 'affectations' && <PersonAffectationsSection person={person} onShowRelations={onShowRelations} />}
                {activeTab === 'competences' && <PersonCompetencesSection person={person} />}
                {activeTab === 'access' && <PersonAccessSection person={person} onShowRelations={onShowRelations} />}
                {activeTab === 'history' && <PersonHistorySection person={person} />}
            </div>
        </div>
    );
};

export default PersonDetailPanel;
