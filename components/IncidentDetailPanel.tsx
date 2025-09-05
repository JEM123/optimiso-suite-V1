import React, { useState, useEffect } from 'react';
import type { Incident, IncidentTask } from '../types';
import { mockData } from '../constants';
import { X, Edit, Info, Shield, CheckCircle, AlertTriangle, Link as LinkIcon, List, Clock, User, GitBranch, Plus, Trash2 } from 'lucide-react';
import IncidentTaskFormModal from './IncidentTaskFormModal';

interface IncidentDetailPanelProps {
    incident: Incident;
    onClose: () => void;
    onEdit: (i: Incident) => void;
    onShowRelations: (entity: any, entityType: string) => void;
    onSaveTask: (incidentId: string, task: IncidentTask) => void;
    onDeleteTask: (incidentId: string, taskId: string) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; icon: React.ElementType }> = ({ label, value, icon: Icon }) => (
    <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
        <div>
            <p className="text-sm font-semibold text-gray-700">{label}</p>
            <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
        </div>
    </div>
);

const TaskItem: React.FC<{ task: IncidentTask; onEdit: () => void; onDelete: () => void; }> = ({ task, onEdit, onDelete }) => (
    <div className="p-2 bg-white border-b flex items-center gap-3 group">
        {task.statut === 'Fait' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-500" />}
        <div className="flex-1">
            <p className="text-sm">{task.titre}</p>
            <p className="text-xs text-gray-500">Échéance: {new Date(task.dateEcheance).toLocaleDateString('fr-FR')}</p>
        </div>
        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1 hover:bg-gray-100 rounded"><Edit className="h-4 w-4 text-blue-600"/></button>
            <button onClick={onDelete} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="h-4 w-4 text-red-600"/></button>
        </div>
    </div>
);

const IncidentDetailPanel: React.FC<IncidentDetailPanelProps> = ({ incident, onClose, onEdit, onShowRelations, onSaveTask, onDeleteTask }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [slaProgress, setSlaProgress] = useState(0);
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<IncidentTask> | null>(null);

    const declarant = mockData.personnes.find(p => p.id === incident.declarantId);
    const assignee = mockData.personnes.find(p => p.id === incident.assigneAId);
    const linkedRisk = mockData.risques.find(r => r.id === incident.lienRisqueId);
    const linkedControl = mockData.controles.find(c => c.id === incident.lienControleId);
    
    useEffect(() => {
        const now = new Date().getTime();
        const start = new Date(incident.dateOuverture).getTime();
        const end = new Date(incident.echeanceSLA).getTime();
        
        if (incident.statut === 'Clôturé') {
             setSlaProgress(100);
             return;
        }
        const totalDuration = end - start;
        const elapsed = now - start;
        const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        setSlaProgress(progress);
    }, [incident]);

    const isSlaBreached = slaProgress >= 100 && incident.statut !== 'Clôturé';

    const handleOpenTaskModal = (task?: IncidentTask) => {
        setEditingTask(task || {});
        setTaskModalOpen(true);
    };

    const handleSaveTask = (taskToSave: IncidentTask) => {
        onSaveTask(incident.id, taskToSave);
        setTaskModalOpen(false);
    };

    return (
        <>
            <div className="w-full max-w-lg bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <div><h2 className="text-lg font-semibold text-gray-800">{incident.titre}</h2><p className="text-sm text-gray-500">{incident.reference}</p></div>
                    <div className="flex space-x-1">
                        <button onClick={() => onEdit(incident)} className="p-2"><Edit className="h-4 w-4"/></button>
                        <button onClick={onClose} className="p-2"><X className="h-5 w-5"/></button>
                    </div>
                </div>
                <div className="border-b"><nav className="flex space-x-2 px-2">
                    {[{ id: 'details', label: 'Détails', icon: Info }, { id: 'tasks', label: 'Tâches', icon: List }, { id: 'links', label: 'Liens', icon: LinkIcon }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-2 text-sm font-medium flex items-center gap-1.5 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}><tab.icon className="h-4 w-4" />{tab.label}</button>
                    ))}
                </nav></div>
                <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50 space-y-5">
                    {activeTab === 'details' && <>
                        <div className="p-3 bg-white border rounded-lg">
                            <p className="text-sm font-semibold text-gray-700">SLA</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 my-2"><div className={`${isSlaBreached ? 'bg-red-500' : 'bg-green-500'} h-2.5 rounded-full`} style={{ width: `${slaProgress}%` }}></div></div>
                            <p className={`text-xs ${isSlaBreached ? 'text-red-600 font-bold' : 'text-gray-600'}`}>Échéance: {new Date(incident.echeanceSLA).toLocaleString('fr-FR')} {isSlaBreached ? '(Dépassé)' : ''}</p>
                        </div>
                        <DetailItem label="Description" value={<p className="whitespace-pre-wrap">{incident.description}</p>} icon={Info} />
                        <DetailItem label="Déclarant" value={declarant ? `${declarant.prenom} ${declarant.nom}` : '-'} icon={User} />
                        <DetailItem label="Assigné à" value={assignee ? `${assignee.prenom} ${assignee.nom}` : 'Non assigné'} icon={User} />
                        <DetailItem label="Catégorie" value={incident.categorie} icon={GitBranch} />
                        <DetailItem label="Priorité / Gravité" value={`${incident.priorite} / ${incident.gravite}`} icon={AlertTriangle} />
                    </>}
                    {activeTab === 'tasks' && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-gray-800">Tâches de résolution ({incident.taches.length})</h4>
                                <button onClick={() => handleOpenTaskModal()} className="flex items-center gap-1 text-sm bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"><Plus className="h-4 w-4"/>Ajouter</button>
                            </div>
                            <div className="space-y-1 bg-white rounded-md border">{incident.taches.map(t => <TaskItem key={t.id} task={t} onEdit={() => handleOpenTaskModal(t)} onDelete={() => onDeleteTask(incident.id, t.id)} />)}</div>
                        </div>
                    )}
                    {activeTab === 'links' && <div className="space-y-2">
                        {linkedRisk && <button onClick={() => onShowRelations(linkedRisk, 'risques')} className="w-full p-2 bg-white border rounded-md text-left flex items-center gap-2 hover:bg-gray-50"><AlertTriangle className="h-4 w-4 text-red-500"/>{linkedRisk.nom}</button>}
                        {linkedControl && <button onClick={() => onShowRelations(linkedControl, 'controles')} className="w-full p-2 bg-white border rounded-md text-left flex items-center gap-2 hover:bg-gray-50"><CheckCircle className="h-4 w-4 text-green-500"/>{linkedControl.nom}</button>}
                         {!linkedRisk && !linkedControl && <p className="text-sm text-gray-500 text-center pt-4">Aucun élément lié.</p>}
                    </div>}
                </div>
            </div>
            <IncidentTaskFormModal isOpen={isTaskModalOpen} onClose={() => setTaskModalOpen(false)} onSave={handleSaveTask} task={editingTask} />
        </>
    );
};

export default IncidentDetailPanel;