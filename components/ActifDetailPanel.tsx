

import React, { useState } from 'react';
import type { Actif } from '../types';
import { mockData } from '../constants';
// FIX: 'Tool' is not an exported member of 'lucide-react'. Replaced with 'Wrench' which is suitable for "Maintenance".
import { X, Edit, Info, Users, Calendar, Link as LinkIcon, Wrench, History, HardDrive, Network, Server, FileText, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import ActifTree from './ActifTree';

interface ActifDetailPanelProps {
    actif: Actif;
    onClose: () => void;
    onEdit: (a: Actif) => void;
    onAddMaintenance: (actifId: string) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => (
    <div className="flex items-start space-x-3">
        {Icon && <Icon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />}
        <div>
            <p className="text-sm font-semibold text-gray-700">{label}</p>
            <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
        </div>
    </div>
);

const ActifDetailPanel: React.FC<ActifDetailPanelProps> = ({ actif, onClose, onEdit, onAddMaintenance }) => {
    const [activeTab, setActiveTab] = useState('details');
    
    const owner = mockData.personnes.find(p => p.id === actif.proprietaireId) || mockData.postes.find(p => p.id === actif.proprietaireId);
    const manager = mockData.personnes.find(p => p.id === actif.gestionnaireId) || mockData.postes.find(p => p.id === actif.gestionnaireId);
    
    const linkedRisks = (mockData.risques as any[]).filter(r => actif.lienRisqueIds?.includes(r.id));
    const linkedControls = (mockData.controles as any[]).filter(c => actif.lienControleIds?.includes(c.id));

    const getNextMaintenanceDate = () => {
        if (!actif.frequenceEntretien || !actif.dateDernierEntretien) return 'N/A';
        const lastDate = new Date(actif.dateDernierEntretien);
        switch (actif.frequenceEntretien) {
            case 'hebdomadaire': return new Date(lastDate.setDate(lastDate.getDate() + 7)).toLocaleDateString('fr-FR');
            case 'mensuelle': return new Date(lastDate.setMonth(lastDate.getMonth() + 1)).toLocaleDateString('fr-FR');
            case 'trimestrielle': return new Date(lastDate.setMonth(lastDate.getMonth() + 3)).toLocaleDateString('fr-FR');
            case 'annuelle': return new Date(lastDate.setFullYear(lastDate.getFullYear() + 1)).toLocaleDateString('fr-FR');
            default: return 'N/A';
        }
    };

    return (
        <div className="w-full max-w-lg bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={actif.nom}>{actif.nom}</h2>
                    <p className="text-sm text-gray-500">{actif.reference}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEdit(actif)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="border-b">
                <nav className="flex space-x-1 sm:space-x-2 px-2 sm:px-4">
                    {[
                        { id: 'details', label: 'Détails', icon: Info },
                        { id: 'tree', label: 'Arborescence', icon: Network },
                        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
                        { id: 'links', label: 'Liens', icon: LinkIcon }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
                {activeTab === 'details' && (
                    <div className="space-y-4">
                        {/* FIX: The 'owner' object is a union type of Personne | Poste. Used a type guard to access the correct name property ('intitule' for Poste, 'nom' for Personne). */}
                        <DetailItem label="Propriétaire" value={owner ? ('intitule' in owner ? owner.intitule : `${owner.prenom} ${owner.nom}`) : undefined} icon={Users} />
                        {/* FIX: The 'manager' object is a union type of Personne | Poste. Used a type guard to access the correct name property ('intitule' for Poste, 'nom' for Personne). */}
                        <DetailItem label="Gestionnaire" value={manager ? ('intitule' in manager ? manager.intitule : `${manager.prenom} ${manager.nom}`) : undefined} icon={Users} />
                        <DetailItem label="Date d'achat" value={actif.dateAchat ? new Date(actif.dateAchat).toLocaleDateString('fr-FR') : 'N/A'} icon={Calendar} />
                        <DetailItem label="Valeur" value={actif.valeur ? `${actif.valeur.toLocaleString('fr-FR')} CHF` : 'N/A'} icon={Info} />
                    </div>
                )}
                {activeTab === 'tree' && <ActifTree rootActifId={actif.id} allActifs={mockData.actifs as any[]} />}
                {activeTab === 'maintenance' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-white border rounded-lg">
                            <DetailItem label="Prochaine échéance" value={getNextMaintenanceDate()} icon={Calendar} />
                        </div>
                        <div>
                             <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-gray-700">Historique des interventions</h4>
                                <button onClick={() => onAddMaintenance(actif.id)} className="text-sm text-blue-600 font-medium">Ajouter</button>
                            </div>
                            <div className="space-y-2">
                                {actif.maintenanceLogs?.map(log => (
                                    <div key={log.id} className="p-2 bg-white border-b">
                                        <p className="text-sm font-medium">{new Date(log.date).toLocaleDateString('fr-FR')} - {log.description}</p>
                                        <p className="text-xs text-gray-500">Technicien: {mockData.personnes.find(p=>p.id === log.technicien)?.nom}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'links' && (
                     <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Risques Liés ({linkedRisks.length})</h4>
                            {/* Render linked items */}
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Contrôles Liés ({linkedControls.length})</h4>
                           {/* Render linked items */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActifDetailPanel;