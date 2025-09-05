import React from 'react';
import type { Tache } from '../types';
import { mockData } from '../constants';
import { X, Edit, Info, Clock, User, GitBranch, AlertCircle, CheckCircle, Settings, FileText, Calendar } from 'lucide-react';

interface TaskDetailPanelProps {
    task: Tache;
    onClose: () => void;
    onEdit: (t: Tache) => void;
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

const PRIORITY_STYLES: Record<Tache['priorite'], string> = {
    'Basse': 'bg-gray-100 text-gray-800', 'Normale': 'bg-blue-100 text-blue-800',
    'Haute': 'bg-yellow-100 text-yellow-800', 'Critique': 'bg-red-100 text-red-800'
};

const STATUS_STYLES: Record<Tache['statut'], string> = {
    'A faire': 'bg-blue-100 text-blue-800', 'En cours': 'bg-yellow-100 text-yellow-800',
    'En attente': 'bg-purple-100 text-purple-800', 'Bloquee': 'bg-red-100 text-red-800',
    'Fait': 'bg-green-100 text-green-800', 'Annulee': 'bg-gray-100 text-gray-800'
};

const SOURCE_ICONS: Record<Tache['sourceModule'], React.ElementType> = {
    'Controle': CheckCircle, 'FluxValidation': Settings, 'AdHoc': User,
    'Incident': AlertCircle, 'Amelioration': AlertCircle, 'Actif': AlertCircle, 'NormesLois': FileText
};


const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ task, onClose, onEdit }) => {
    const assignee = mockData.personnes.find(p => p.id === task.assigneA);
    const creator = mockData.personnes.find(p => p.id === task.createur);
    const SourceIcon = SOURCE_ICONS[task.sourceModule];

    const getSourceElement = () => {
        if (!task.sourceId) return null;
        switch (task.sourceModule) {
            case 'Controle':
                const exec = mockData.executionsControles.find(e => e.id === task.sourceId);
                return mockData.controles.find(c => c.id === exec?.controleId);
            case 'FluxValidation':
                return mockData.documents.find(d => d.id === task.sourceId);
            default: return null;
        }
    }
    const sourceElement = getSourceElement();

    return (
        <div className="w-full max-w-md bg-white border-l shadow-lg flex flex-col h-full absolute right-0 top-0 md:relative animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 truncate" title={task.titre}>{task.titre}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[task.statut]}`}>{task.statut}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${PRIORITY_STYLES[task.priorite]}`}>{task.priorite}</span>
                    </div>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEdit(task)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><Edit className="h-4 w-4"/></button>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"><X className="h-5 w-5"/></button>
                </div>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50 space-y-5">
                {task.description && <DetailItem label="Description" value={<p className="whitespace-pre-wrap">{task.description}</p>} icon={Info} />}
                
                <DetailItem 
                    label="Assigné à" 
                    value={assignee ? `${assignee.prenom} ${assignee.nom}` : 'Non assigné'} 
                    icon={User}
                />
                <DetailItem 
                    label="Échéance" 
                    value={task.dateEcheance.toLocaleDateString('fr-FR')} 
                    icon={Calendar}
                />
                 <DetailItem 
                    label="Source" 
                    value={
                        <div>
                            <div className="flex items-center gap-2">
                                <SourceIcon className="h-4 w-4" />
                                <span>{task.sourceModule}</span>
                            </div>
                            {sourceElement && (
                                <button className="text-blue-600 hover:underline text-sm mt-1">
                                    Voir: {sourceElement.nom} ({sourceElement.reference})
                                </button>
                            )}
                        </div>
                    } 
                    icon={GitBranch}
                />
                <DetailItem 
                    label="Historique" 
                    value={
                        <div>
                            <p>Créé par {creator ? `${creator.prenom} ${creator.nom}` : 'Système'} le {task.dateCreation.toLocaleDateString('fr-FR')}</p>
                            {task.dateCloture && <p>Clôturé le {task.dateCloture.toLocaleDateString('fr-FR')}</p>}
                        </div>
                    } 
                    icon={Clock}
                />
            </div>
        </div>
    );
};

export default TaskDetailPanel;