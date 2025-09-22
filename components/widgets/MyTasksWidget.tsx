import React from 'react';
import { useDataContext, useAppContext } from '../../context/AppContext';
import type { AccueilComponentConfig, Tache } from '../../types';
import { Calendar } from 'lucide-react';

interface MyTasksWidgetProps {
    config: AccueilComponentConfig;
}

const MyTasksWidget: React.FC<MyTasksWidgetProps> = ({ config }) => {
    const { user } = useAppContext();
    const { data } = useDataContext();
    const tasks = data.taches as Tache[];

    const currentUserTasks = tasks.filter(t => t.assigneA === user.id);
    const lateTasks = currentUserTasks.filter(t => new Date(t.dateEcheance) < new Date() && t.statut !== 'Fait' && t.statut !== 'Annulee');
    const otherActiveTasks = currentUserTasks.filter(t => !lateTasks.some(lt => lt.id === t.id) && t.statut !== 'Fait' && t.statut !== 'Annulee');

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                {config.title || 'Mes Tâches'}
            </h3>
            <div className="space-y-2">
                {lateTasks.length > 0 && (
                    <>
                        <div className="text-sm font-medium text-red-600 mb-2">En retard ({lateTasks.length})</div>
                        {lateTasks.map((tache: Tache) => (
                            <div key={tache.id} className="flex items-start space-x-3 py-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5"></div>
                                <div>
                                    <p className="text-sm text-gray-800">{tache.titre}</p>
                                    <p className="text-xs text-gray-500">{tache.sourceModule} - Échéance: {new Date(tache.dateEcheance).toLocaleDateString('fr-FR')}</p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
                {otherActiveTasks.length > 0 && (
                    <>
                        <div className="text-sm font-medium text-orange-600 mb-2 mt-4">À faire / En cours ({otherActiveTasks.length})</div>
                        {otherActiveTasks.map((tache: Tache) => (
                            <div key={tache.id} className="flex items-start space-x-3 py-1">
                                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5"></div>
                                <div>
                                    <p className="text-sm text-gray-800">{tache.titre}</p>
                                    <p className="text-xs text-gray-500">{tache.sourceModule} - Échéance: {new Date(tache.dateEcheance).toLocaleDateString('fr-FR')}</p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
            <div className="mt-4 text-center"><button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Voir toutes mes tâches</button></div>
        </div>
    );
};

export default MyTasksWidget;
