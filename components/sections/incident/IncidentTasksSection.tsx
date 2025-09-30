import React from 'react';
import type { Incident, IncidentTask } from '../../../types';
import { Plus, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';

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

interface IncidentTasksSectionProps {
    incident: Incident;
    onOpenTaskModal: (task?: IncidentTask) => void;
    onDeleteTask: (incidentId: string, taskId: string) => void;
}

const IncidentTasksSection: React.FC<IncidentTasksSectionProps> = ({ incident, onOpenTaskModal, onDeleteTask }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-800">Tâches de résolution ({incident.taches.length})</h4>
                <button onClick={() => onOpenTaskModal()} className="flex items-center gap-1 text-sm bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"><Plus className="h-4 w-4"/>Ajouter</button>
            </div>
            <div className="space-y-1 bg-white rounded-md border">
                {incident.taches.map(t => <TaskItem key={t.id} task={t} onEdit={() => onOpenTaskModal(t)} onDelete={() => onDeleteTask(incident.id, t.id)} />)}
                 {incident.taches.length === 0 && <p className="text-sm text-center text-gray-500 p-4">Aucune tâche définie.</p>}
            </div>
        </div>
    );
};

export default IncidentTasksSection;
