import React from 'react';
import type { Incident, IncidentTask } from '../types';
import { X, Edit, Link as LinkIcon } from 'lucide-react';
import GenericFicheContent from './GenericFicheContent';
import IncidentTaskFormModal from './IncidentTaskFormModal';

interface IncidentDetailPanelProps {
    incident: Incident;
    onClose: () => void;
    onEdit: (i: Incident) => void;
    onShowRelations: (entity: any, entityType: string) => void;
    onSaveTask: (incidentId: string, task: IncidentTask) => void;
    onDeleteTask: (incidentId: string, taskId: string) => void;
}


const IncidentDetailPanel: React.FC<IncidentDetailPanelProps> = (props) => {
    const { incident, onClose, onEdit, onShowRelations } = props;
    const [isTaskModalOpen, setTaskModalOpen] = React.useState(false);
    const [editingTask, setEditingTask] = React.useState<Partial<IncidentTask> | null>(null);

    const handleOpenTaskModal = (task?: IncidentTask) => {
        setEditingTask(task || {});
        setTaskModalOpen(true);
    };

    const handleSaveTask = (taskToSave: IncidentTask) => {
        props.onSaveTask(incident.id, taskToSave);
        setTaskModalOpen(false);
    };

    return (
        <>
            <div className="bg-white border-l shadow-lg flex flex-col h-full animate-slide-in-right">
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <div><h2 className="text-lg font-semibold text-gray-800">{incident.titre}</h2><p className="text-sm text-gray-500">{incident.reference}</p></div>
                    <div className="flex space-x-1">
                        <button onClick={() => onShowRelations(incident, 'incidents')} className="p-2"><LinkIcon className="h-4 w-4"/></button>
                        <button onClick={() => onEdit(incident)} className="p-2"><Edit className="h-4 w-4"/></button>
                        <button onClick={onClose} className="p-2"><X className="h-5 w-5"/></button>
                    </div>
                </div>
                
                <GenericFicheContent 
                    moduleId="incidents"
                    item={incident}
                    onOpenTaskModal={handleOpenTaskModal}
                    {...props}
                />
            </div>
            <IncidentTaskFormModal isOpen={isTaskModalOpen} onClose={() => setTaskModalOpen(false)} onSave={handleSaveTask} task={editingTask} />
        </>
    );
};

export default IncidentDetailPanel;
