

import React, { useState } from 'react';
import type { Poste, Entite, Personne, Competence, Role, RACI, OccupationHistory, Processus, Controle } from '../types';
import { Users, Edit, Briefcase, Info, BookOpen, UserCheck, Link as LinkIcon, X, BarChart } from 'lucide-react';
import { useAppContext, useDataContext } from '../context/AppContext';

const POST_STATUS_COLORS: Record<Poste['statut'], string> = {
    'brouillon': 'bg-gray-100 text-gray-800',
    'valide': 'bg-green-100 text-green-800',
    'archive': 'bg-red-100 text-red-800',
    'à_créer': 'bg-blue-100 text-blue-800',
    'en_recrutement': 'bg-yellow-100 text-yellow-800',
    'gelé': 'bg-purple-100 text-purple-800',
    'en_cours': 'bg-yellow-100 text-yellow-800',
    'figé': 'bg-indigo-100 text-indigo-800',
    'planifié': 'bg-cyan-100 text-cyan-800',
    'terminé': 'bg-green-100 text-green-800',
    'non-conforme': 'bg-red-200 text-red-900',
    'clôturé': 'bg-gray-300 text-gray-800',
    'a_faire': 'bg-yellow-100 text-yellow-800',
    'en_retard': 'bg-red-200 text-red-900',
    'en_validation': 'bg-yellow-100 text-yellow-800',
    'publie': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800',
};

interface PosteDetailPanelProps {
    poste: Poste;
    onClose: () => void;
    onEdit: (p: Poste) => void;
    onShowRelations: (entity: any, entityType: string) => void;
    onShowImpactAnalysis: (entity: any, entityType: string) => void;
}

const PosteDetailPanel: React.FC<PosteDetailPanelProps> = ({ poste, onClose, onEdit, onShowRelations, onShowImpactAnalysis }) => {
    const [activeTab, setActiveTab] = useState('details');
    const { settings } = useAppContext();
    const { data } = useDataContext();
    const { entites, personnes, competences, roles, raci, occupationHistory, processus, controles } = data as {
        entites: Entite[], personnes: Personne[], competences: Competence[], roles: Role[], raci: RACI[],
        occupationHistory: OccupationHistory[], processus: Processus[], controles: Controle[]
    };
    
    const entite = entites.find(e => e.id === poste.entiteId);
    const occupants = personnes.filter(p => poste.occupantsIds.includes(p.id));
    const requiredCompetences = competences.filter(c => poste.competencesRequisesIds?.includes(c.id));
    const requiredRoles = roles.filter(r => poste.habilitationsRoleIds?.includes(r.id));
    const raciLinks = raci.filter(r => r.posteId === poste.id);
    const history = occupationHistory.filter(h => h.posteId === poste.id);

    const customFieldDefs = settings.customFields.postes || [];
    const hasCustomFields = customFieldDefs.length > 0 && poste.champsLibres && Object.keys(poste.champsLibres).some(key => poste.champsLibres[key]);


    // FIX: Changed component definition to use React.FC to correctly handle the 'key' prop provided by React during list rendering, resolving a TypeScript error.
    const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
        <div><p className="text-sm font-semibold text-gray-700">{label}</p><p className="text-sm text-gray-900 mt-1">{value || '-'}</p></div>
    );
    
    const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <h4 className="text-base font-semibold text-gray-800 mb-2 pb-2 border-b">{children}</h4>
    );

    return (
        <div className="w-full max-w-md bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div><h2 className="text-lg font-semibold text-gray-800">{poste.intitule}</h2><p className="text-sm text-gray-500">{poste.reference}</p></div>
                <div className="flex space-x-1">
                    <button onClick={() => onShowImpactAnalysis(poste, 'postes')} title="Analyser l'impact" className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><BarChart className="h-4 w-4"/></button>
                    <button onClick={() => onEdit(poste)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5" /></button>
                </div>
            </div>
            <div className="border-b"><nav className="flex space-x-1 sm:space-x-2 px-2 sm:px-4">
                {[ {id: 'details', label: 'Détails', icon: Info}, {id: 'mission', label: 'Mission', icon: BookOpen}, {id: 'competences', label: 'Compétences', icon: UserCheck}, {id: 'occupants', label: 'Occupants', icon: Users}, {id: 'raci', label: 'RACI', icon: LinkIcon} ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>{<tab.icon className="h-4 w-4" />}<span className="hidden sm:inline">{tab.label}</span></button>
                ))}
            </nav></div>
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
                {activeTab === 'details' && <div className="space-y-4">
                    <SectionTitle>Informations Générales</SectionTitle>
                    <DetailItem label="Entité de rattachement" value={entite?.nom} />
                    <DetailItem label="Statut" value={<span className={`px-2 py-0.5 text-xs rounded-full capitalize ${POST_STATUS_COLORS[poste.statut]}`}>{poste.statut.replace(/_/g, ' ')}</span>} />
                    
                    {hasCustomFields && (
                        <div className="pt-2">
                            <SectionTitle>Informations Complémentaires</SectionTitle>
                            <div className="space-y-3 mt-2">
                                {customFieldDefs.map(field => {
                                    const value = poste.champsLibres?.[field.name];
                                    if (!value) return null;
                                    return <DetailItem key={field.id} label={field.name} value={String(value)} />;
                                })}
                            </div>
                        </div>
                    )}
                </div>}
                {activeTab === 'mission' && <div className="space-y-4">
                    <div><SectionTitle>Mission</SectionTitle><p className="text-sm text-gray-700 whitespace-pre-wrap">{poste.mission || 'Non définie'}</p></div>
                    <div><SectionTitle>Responsabilités</SectionTitle><p className="text-sm text-gray-700 whitespace-pre-wrap">{poste.responsabilites || 'Non définies'}</p></div>
                </div>}
                {activeTab === 'competences' && <div className="space-y-4">
                    <div><SectionTitle>Compétences Requises ({requiredCompetences.length})</SectionTitle><div className="flex flex-wrap gap-1">{requiredCompetences.map(c => <span key={c.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{c.nom}</span>)}</div></div>
                    <div><SectionTitle>Habilitations (Rôles) ({requiredRoles.length})</SectionTitle><div className="flex flex-wrap gap-1">{requiredRoles.map(r => <span key={r.id} className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">{r.nom}</span>)}</div></div>
                </div>}
                {activeTab === 'occupants' && <div className="space-y-4">
                    <div className="p-3 bg-white border rounded-lg">
                        <p className="text-sm font-semibold text-gray-700">Effectif</p>
                        <div className="flex items-baseline space-x-2 mt-1"><span className="text-2xl font-bold text-gray-900">{occupants.length}</span><span className="text-gray-600">/ {poste.effectifCible} occupant(s)</span></div>
                    </div>
                     <div><SectionTitle>Occupants Actuels</SectionTitle><div className="divide-y border rounded-md">{occupants.map(o => <div key={o.id} className="text-sm p-2 bg-white">{o.prenom} {o.nom}</div>)}</div></div>
                     <div><SectionTitle>Historique</SectionTitle><div className="divide-y border rounded-md">{history.map(h => { const p = personnes.find(pe => pe.id === h.personneId); return (<div key={h.id} className="text-sm p-2 bg-white">{p?.prenom} {p?.nom} (du {new Date(h.dateDebut).toLocaleDateString('fr-FR')} au {h.dateFin ? new Date(h.dateFin).toLocaleDateString('fr-FR') : 'présent'})</div>)})}</div></div>
                </div>}
                {activeTab === 'raci' && <div className="space-y-2">
                    {raciLinks.map(link => {
                        const obj = link.objetType === 'processus' ? processus.find(p => p.id === link.objetId) : controles.find(c => c.id === link.objetId);
                        return (<div key={link.id} className="flex items-center justify-between p-2 bg-white border rounded-lg"><div className="flex-1"><p className="text-sm font-medium">{obj?.nom}</p><p className="text-xs text-gray-500 capitalize">{link.objetType}</p></div><span className="font-bold text-lg text-blue-600 w-8 text-center">{link.role}</span></div>);
                    })}
                </div>}
            </div>
        </div>
    );
};

export default PosteDetailPanel;