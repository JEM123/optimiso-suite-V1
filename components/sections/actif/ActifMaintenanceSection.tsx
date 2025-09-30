import React from 'react';
import type { Actif } from '../../../types';
import { useDataContext } from '../../../context/AppContext';
import { Plus } from 'lucide-react';

interface ActifMaintenanceSectionProps {
    actif: Actif;
    onAddMaintenance: (actifId: string) => void;
}

const ActifMaintenanceSection: React.FC<ActifMaintenanceSectionProps> = ({ actif, onAddMaintenance }) => {
    const { data } = useDataContext();
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-700">Historique des interventions</h4>
                <button onClick={() => onAddMaintenance(actif.id)} className="text-sm text-blue-600 font-medium flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Ajouter
                </button>
            </div>
            <div className="space-y-2">
                {actif.maintenanceLogs?.map(log => (
                    <div key={log.id} className="p-2 bg-white border-b">
                        <p className="text-sm font-medium">{new Date(log.date).toLocaleDateString('fr-FR')} - {log.description}</p>
                        <p className="text-xs text-gray-500">Technicien: {(data.personnes as any[]).find(p=>p.id === log.technicien)?.nom}</p>
                    </div>
                ))}
                 {(!actif.maintenanceLogs || actif.maintenanceLogs.length === 0) && (
                    <p className="text-sm text-center text-gray-500 py-4">Aucune intervention enregistrée.</p>
                )}
            </div>
        </div>
    );
};

export default ActifMaintenanceSection;
