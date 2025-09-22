import React, { useState } from 'react';
import type { Amelioration, AmeliorationAction, Personne, Entite, Risque, Incident, Controle } from '../types';
import { useDataContext } from '../context/AppContext';
import { X, Edit, Info, List, Link as LinkIcon, Plus, Trash2, CheckCircle, Clock, History, AlertTriangle, User, Building, Euro } from 'lucide-react';
import AmeliorationActionFormModal from './AmeliorationActionFormModal';

interface AmeliorationDetailPanelProps {
    amelioration: Amelioration;
    onClose: () => void;
    onEdit: (a: Amelioration) => void;
    onShowRelations: (entity: any, entityType: string) => void;
    onSaveAction: (ameliorationId: string, action: AmeliorationAction) => void;
    onDeleteAction: (ameliorationId: string, actionId: string) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div><p className="text-sm font-semibold text-gray-700">{label}</p><div className="text-sm text-gray-900 mt-1">{value || '-'}</div></div>
);

const ActionItem: React.FC<{ action: AmeliorationAction; onEdit: () => void; onDelete: () => void; }> = ({ action, onEdit, onDelete }) => (
    <div className="p-2 bg-white border-b flex items-center gap-3 group">
        {action.statut === 'Fait' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-500" />}
        <div className="flex-1">
            <p className="text-sm">{action.titre}</p>
            <p className="text-xs text-gray-500">Échéance: {new Date(action.dateEcheance).toLocaleDateString('fr-FR')}</p>
        </div>
        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1 hover:bg-gray-100 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
            <button onClick={onDelete} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
        </div>
    </div>
);


const AmeliorationDetailPanel: React.FC<AmeliorationDetailPanelProps> = ({ amelioration, onClose, onEdit, onShowRelations, onSaveAction, onDeleteAction }) => {
    const { data } = useDataContext();
    const [activeTab, setActiveTab] = useState('details');
    const [isActionModalOpen, setActionModalOpen] = useState(false);
    const [editingAction, setEditingAction] = useState<Partial<AmeliorationAction> | null>(null);

    const pilote = (data.personnes as Personne[]).find(p => p.id === amelioration.piloteId);
    const commanditaire = (data.personnes as Personne[]).find(p => p.id === amelioration.commanditaireId);
    const entite = (data.entites as Entite[]).find(e => e.id === amelioration.entiteId);
    const linkedRisk = (data.risques as Risque[]).find(r => r.id === amelioration.lienRisqueId);
    const linkedIncident = (data.incidents as Incident[]).find(i => i.id === amelioration.lienIncidentId);
    const linkedControl = (data.controles as Controle[]).find(c => c.id === amelioration.lienControleId);
    
    const totalActions = amelioration.actions.length;
    const doneActions = amelioration.actions.filter(a => a.statut === 'Fait').length;
    const progress = totalActions > 0 ? (doneActions / totalActions) * 100 : 0;

    const handleOpenActionModal = (action?: AmeliorationAction) => {
        setEditingAction(action || {});
        setActionModalOpen(true);
    };

    const handleSaveAction = (actionToSave: AmeliorationAction) => {
        onSaveAction(amelioration.id, actionToSave);
        setActionModalOpen(false);
    };

    return (
        <>
            <div className="w-full max-w-lg bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <div><h2 className="text-lg font-semibold text-gray-800">{amelioration.titre}</h2><p className="text-sm text-gray-500">{amelioration.reference}</p></div>
                    <div className="flex space-x-1"><button onClick={() => onEdit(amelioration)} className="p-2"><Edit className="h-4 w-4"/></button><button onClick={onClose} className="p-2"><X className="h-5 w-5"/></button></div>
                </div>
                <div className="border-b"><nav className="flex space-x-2 px-2">
                    {[{ id: 'details', label: 'Détails', icon: Info }, { id: 'plan', label: 'Plan d’actions', icon: List }, { id: 'links', label: 'Liens', icon: LinkIcon }, { id: 'history', label: 'Historique', icon: History }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-2 text-sm font-medium flex items-center gap-1.5 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><tab.icon className="h-4 w-4" />{tab.label}</button>
                    ))}
                </nav></div>
                <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50 space-y-5">
                    {activeTab === 'details' && <>
                        <DetailItem label="Pilote" value={<div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-500"/><span>{pilote ? `${pilote.prenom} ${pilote.nom}` : '-'}</span></div>} />
                        {commanditaire && <DetailItem label="Commanditaire" value={<div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-500"/><span>{`${commanditaire.prenom} ${commanditaire.nom}`}</span></div>} />}
                        {entite && <DetailItem label="Entité" value={<div className="flex items-center gap-2"><Building className="h-4 w-4 text-gray-500"/><span>{entite.nom}</span></div>} />}
                        <DetailItem label="Type" value={amelioration.type} />
                        <DetailItem label="Priorité" value={<span className="capitalize">{amelioration.priorite}</span>} />
                        <DetailItem label="Origine" value={amelioration.origine.join(', ')} />
                        <DetailItem label="Objectif Mesurable" value={<p className="whitespace-pre-wrap">{amelioration.objectifMesurable}</p>} />
                        {amelioration.budget && <DetailItem label="Budget" value={<div className="flex items-center gap-2"><Euro className="h-4 w-4 text-gray-500"/><span>{amelioration.budget.toLocaleString('fr-FR')} CHF</span></div>} />}
                        <DetailItem label="Échéance Cible" value={new Date(amelioration.echeanceCible).toLocaleDateString('fr-FR')} />

                    </>}
                     {activeTab === 'plan' && (
                        <div>
                             <div className="mb-4">
                                <div className="flex justify-between items-center text-sm text-gray-600 mb-1"><span>Progression</span><span>{doneActions}/{totalActions}</span></div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-gray-800">Actions ({amelioration.actions.length})</h4>
                                <button onClick={() => handleOpenActionModal()} className="flex items-center gap-1 text-sm bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"><Plus className="h-4 w-4"/>Ajouter</button>
                            </div>
                            <div className="space-y-1 bg-white rounded-md border">{amelioration.actions.map(a => <ActionItem key={a.id} action={a} onEdit={() => handleOpenActionModal(a)} onDelete={() => onDeleteAction(amelioration.id, a.id)} />)}</div>
                        </div>
                    )}
                    {activeTab === 'links' && <div className="space-y-2">
                         {linkedRisk && <button onClick={() => onShowRelations(linkedRisk, 'risques')} className="w-full p-2 bg-white border rounded-md text-left flex items-center gap-2 hover:bg-gray-50"><AlertTriangle className="h-4 w-4 text-red-500"/>{linkedRisk.nom}</button>}
                         {linkedIncident && <button onClick={() => onShowRelations(linkedIncident, 'incidents')} className="w-full p-2 bg-white border rounded-md text-left flex items-center gap-2 hover:bg-gray-50"><AlertTriangle className="h-4 w-4 text-orange-500"/>{linkedIncident.titre}</button>}
                         {linkedControl && <button onClick={() => onShowRelations(linkedControl, 'controles')} className="w-full p-2 bg-white border rounded-md text-left flex items-center gap-2 hover:bg-gray-50"><CheckCircle className="h-4 w-4 text-green-500"/>{linkedControl.nom}</button>}
                         {!linkedRisk && !linkedIncident && !linkedControl && <p className="text-sm text-gray-500 text-center pt-4">Aucun élément lié.</p>}
                    </div>}
                    {activeTab === 'history' && (
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start space-x-3"><Info className="h-4 w-4 mt-0.5 text-gray-500"/><p>Créé le {new Date(amelioration.dateCreation).toLocaleDateString('fr-FR')}</p></div>
                            <div className="flex items-start space-x-3"><Edit className="h-4 w-4 mt-0.5 text-gray-500"/><p>Modifié le {new Date(amelioration.dateModification).toLocaleDateString('fr-FR')}</p></div>
                        </div>
                    )}
                </div>
            </div>
            <AmeliorationActionFormModal isOpen={isActionModalOpen} onClose={() => setActionModalOpen(false)} onSave={handleSaveAction} action={editingAction} />
        </>
    );
};

export default AmeliorationDetailPanel;
