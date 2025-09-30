
import React, { useState, useMemo } from 'react';
import { useDataContext } from '../context/AppContext';
import type { Entite, Personne, Poste, Document, Risque, Controle, Amelioration, Incident } from '../types';
import { FileText, AlertTriangle, CheckCircle, TrendingUp, AlertCircle as IncidentIcon, Link as LinkIcon, Briefcase, Users } from 'lucide-react';

interface EntityFicheContentProps {
    entite: Entite;
    onShowRelations: (entity: any, entityType: string) => void;
}

const ICONS: Record<string, React.ElementType> = {
    documents: FileText,
    risques: AlertTriangle,
    controles: CheckCircle,
    ameliorations: TrendingUp,
    incidents: IncidentIcon,
    postes: Briefcase,
    personnes: Users,
};

const EntityFicheContent: React.FC<EntityFicheContentProps> = ({ entite, onShowRelations }) => {
    const { data } = useDataContext();
    const { entites, personnes, postes, documents, risques, controles, ameliorations, incidents } = data as {
        entites: Entite[], personnes: Personne[], postes: Poste[], documents: Document[], risques: Risque[],
        controles: Controle[], ameliorations: Amelioration[], incidents: Incident[]
    };
    const [activeTab, setActiveTab] = useState('liens');

    const parent = entites.find(e => e.id === entite.parentId);
    const responsable = personnes.find(p => p.id === entite.responsableId);

    const relatedItems = useMemo(() => {
        const relations: Record<string, any[]> = {};
        relations['postes'] = postes.filter(p => p.entiteId === entite.id);
        relations['documents'] = documents.filter(d => d.entiteIds.includes(entite.id));
        relations['ameliorations'] = ameliorations.filter(a => a.entiteId === entite.id);
        relations['incidents'] = incidents.filter(i => i.entiteId === entite.id);
        relations['risques'] = risques.filter(r => r.entiteIds.includes(entite.id));
        relations['controles'] = controles.filter(c => c.executantsIds.some(execId => personnes.some(p => p.id === execId && p.entiteIds.includes(entite.id))));
        return relations;
    }, [entite.id, documents, risques, controles, ameliorations, incidents, postes, personnes]);

    const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <div className="text-base text-gray-900 mt-1">{value || '-'}</div>
        </div>
    );
    
    return (
        <>
            <div className="border-b">
                <nav className="flex space-x-4 px-4">
                    <button onClick={() => setActiveTab('liens')} className={`py-3 px-1 text-sm font-medium ${activeTab === 'liens' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Liens</button>
                    <button onClick={() => setActiveTab('general')} className={`py-3 px-1 text-sm font-medium ${activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Général</button>
                </nav>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                {activeTab === 'liens' && (
                     <div className="space-y-6">
                        <div className="flex flex-col items-center">
                            {parent && (
                                <>
                                    <div className="p-2 px-4 border-2 border-blue-500 bg-white rounded-full text-sm font-medium text-blue-800 shadow-sm">{parent.nom} ({parent.code})</div>
                                    <div className="h-6 w-0.5 bg-gray-300 my-1"></div>
                                </>
                            )}
                            <div className="p-3 px-6 border-4 border-gray-800 bg-white rounded-full text-base font-bold text-gray-900 shadow-lg">{entite.nom} ({entite.code})</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(relatedItems).map(([key, items]) => {
                                if ((items as any[]).length === 0) return null;
                                const Icon = ICONS[key] || LinkIcon;
                                return (
                                    <div key={key}>
                                        <h4 className="text-base font-semibold text-gray-700 capitalize mb-3 flex items-center gap-2">
                                            <Icon className="h-5 w-5"/>{key.replace(/_/g, ' ')}
                                        </h4>
                                        <div className="space-y-2">
                                            {(items as any[]).map(item => (
                                                <div key={item.id} className="p-2 bg-white border rounded-md text-sm hover:bg-gray-50">
                                                    {item.nom || item.intitule || `${item.prenom} ${item.nom}`} ({item.reference})
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
                 {activeTab === 'general' && (
                    <div className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white p-6 rounded-lg border">
                        <DetailItem label="Responsable" value={responsable ? `${responsable.prenom} ${responsable.nom}` : 'Non assigné'} />
                        <DetailItem label="Statut" value={<span className="capitalize">{entite.statut.replace(/_/g, ' ')}</span>} />
                        <DetailItem label="Type" value={entite.type} />
                        <DetailItem label="Confidentialité" value={<span className="capitalize">{entite.confidentialite}</span>} />
                        <DetailItem label="Email de contact" value={entite.emailContact} />
                        <DetailItem label="Téléphone" value={entite.telephoneContact} />
                        <div className="md:col-span-2">
                            <DetailItem label="Adresse" value={entite.siteAdresse} />
                        </div>
                         {entite.champsLibres && Object.keys(entite.champsLibres).length > 0 && (
                            <>
                                <hr className="md:col-span-2 my-2"/>
                                {Object.entries(entite.champsLibres).map(([key, value]) => (
                                     <DetailItem key={key} label={key} value={String(value)} />
                                ))}
                            </>
                         )}
                    </div>
                )}
            </div>
        </>
    );
};

export default EntityFicheContent;
