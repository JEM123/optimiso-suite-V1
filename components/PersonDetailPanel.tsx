import React, { useState, useMemo } from 'react';
import type { Personne, Competence } from '../types';
import { mockData } from '../constants';
import { X, Edit, Info, Briefcase, Building, KeyRound, History, TrendingUp, Link as LinkIcon } from 'lucide-react';
import CompetenceRadarChart from './CompetenceRadarChart';

interface PersonDetailPanelProps {
    person: Personne;
    onClose: () => void;
    onEdit: (p: Personne) => void;
    onNavigate: (moduleId: string) => void;
    onShowRelations: (entity: any, entityType: string) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

const RelationItem: React.FC<{ item: any; icon: React.ElementType, onClick: () => void }> = ({ item, icon: Icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center space-x-3 p-2 bg-white border rounded-md hover:bg-gray-50 cursor-pointer text-left">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nom || item.intitule}</p>
            <p className="text-xs text-gray-500">{item.reference}</p>
        </div>
    </button>
);


const PersonDetailPanel: React.FC<PersonDetailPanelProps> = ({ person, onClose, onEdit, onNavigate, onShowRelations }) => {
    const [activeTab, setActiveTab] = useState('info');
    
    const { postes: allPostes, entites, roles, competences: allCompetences, evaluationsCompetences } = mockData;
    const postes = allPostes.filter(p => person.posteIds.includes(p.id));
    const personCompetences = useMemo(() => {
        const required = new Map<string, { competence: Competence, niveauAttendu: number }>();
        person.posteIds.forEach(posteId => {
            const poste = allPostes.find(p => p.id === posteId);
            
            allCompetences.forEach(competence => {
                const requis = competence.postesRequis.find(pr => pr.posteId === posteId);
                if(requis && !required.has(competence.id)) {
                    required.set(competence.id, { competence, niveauAttendu: requis.niveauAttendu });
                }
            });
        });

        return Array.from(required.values()).map(req => {
            const evaluation = evaluationsCompetences.find(e => e.personneId === person.id && e.competenceId === req.competence.id);
            return {
                ...req,
                niveauEvalue: evaluation?.niveauEvalue,
            };
        });
    }, [person.id, person.posteIds, allPostes, allCompetences, evaluationsCompetences]);
    
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
                {activeTab === 'info' && (
                    <div className="space-y-4">
                        <DetailItem label="Profil" value={<span className="capitalize">{person.profil}</span>} />
                        <DetailItem label="Statut" value={<span className="capitalize">{person.statut}</span>} />
                        <DetailItem label="Synchronisé Azure AD" value={person.synchroniseAzureAD ? 'Oui' : 'Non'} />
                        <DetailItem label="Description" value={person.description} />
                    </div>
                )}
                {activeTab === 'affectations' && (
                     <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Postes Occupés ({postes.length})</h4>
                            <div className="space-y-2">{postes.map(p => <RelationItem key={p.id} item={p} icon={Briefcase} onClick={() => onShowRelations(p, 'postes')} />)}</div>
                        </div>
                         <div>
                            <h4 className="font-medium text-gray-700 mb-2">Entités de Rattachement ({person.entiteIds.length})</h4>
                            <div className="space-y-2">{entites.filter(e => person.entiteIds.includes(e.id)).map(e => <RelationItem key={e.id} item={e} icon={Building} onClick={() => onShowRelations(e, 'entites')} />)}</div>
                        </div>
                    </div>
                )}
                {activeTab === 'competences' && (
                    <div className="space-y-4">
                        {personCompetences.length > 0 ? (
                            <>
                                <div className="h-64 p-4 bg-white rounded-lg border">
                                    <CompetenceRadarChart competenceData={personCompetences} />
                                </div>
                                <div className="bg-white border rounded-md">
                                    {personCompetences.map(({ competence, niveauAttendu, niveauEvalue }) => {
                                        const gap = (niveauEvalue ?? -1) - niveauAttendu;
                                        let color = 'text-gray-500';
                                        if (niveauEvalue !== undefined) {
                                            color = gap >= 0 ? 'text-green-600' : gap === -1 ? 'text-yellow-600' : 'text-red-600';
                                        }
                                        
                                        return (
                                             <div key={competence.id} className="p-3 border-b last:border-0 flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-sm">{competence.nom}</p>
                                                    <p className="text-xs text-gray-500">{competence.domaine}</p>
                                                </div>
                                                <div className={`text-sm font-bold ${color}`}>
                                                    {niveauEvalue ?? 'N/A'} / {niveauAttendu}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-sm text-gray-500 pt-4">Aucune compétence requise pour les postes de cette personne.</p>
                        )}
                    </div>
                )}
                 {activeTab === 'access' && (
                    <div className="space-y-2">
                         <h4 className="font-medium text-gray-700 mb-2">Rôles ({person.roleIds.length})</h4>
                         {roles.filter(r => person.roleIds.includes(r.id)).map(r => <RelationItem key={r.id} item={r} icon={KeyRound} onClick={() => onShowRelations(r, 'roles')} />)}
                    </div>
                )}
                {activeTab === 'history' && (
                     <div className="space-y-3 text-sm">
                        <div className="flex items-start space-x-3"><Info className="h-4 w-4 mt-0.5 text-gray-500"/><p>Créé par <strong>{mockData.personnes.find(p=>p.id === person.auteurId)?.nom || 'system'}</strong> le {person.dateCreation.toLocaleDateString('fr-FR')}</p></div>
                        <div className="flex items-start space-x-3"><Edit className="h-4 w-4 mt-0.5 text-gray-500"/><p>Modifié le {person.dateModification.toLocaleDateString('fr-FR')}</p></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonDetailPanel;