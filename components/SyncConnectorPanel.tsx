import React, { useState } from 'react';
import { mockData } from '../constants';
import type { SyncConnector, SyncLogEntry } from '../types';
import { Edit, RefreshCw, Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import SyncConnectorFormModal from './SyncConnectorFormModal';

const newConnectorTemplate = (): Partial<SyncConnector> => ({
    nom: 'Nouveau Connecteur CSV',
    type: 'CSV',
    parametres: { delimiter: ';', encoding: 'UTF-8' },
    mappingAttributs: { nom: '', prenom: '', email: '', groupes: '' },
    groupesMappingRoles: [],
    planification: '0 2 * * *',
    modePilote: true,
    dernierStatut: 'Jamais exécuté'
});


const SyncConnectorPanel: React.FC = () => {
    const [connectors, setConnectors] = useState<SyncConnector[]>(mockData.syncConnectors);
    const [logs, setLogs] = useState<SyncLogEntry[]>(mockData.syncLogs);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConnector, setEditingConnector] = useState<Partial<SyncConnector> | null>(null);

    const handleOpenModal = (connector?: SyncConnector) => {
        setEditingConnector(connector || newConnectorTemplate());
        setIsModalOpen(true);
    };

    const handleSaveConnector = (connectorToSave: SyncConnector) => {
        if (connectorToSave.id) {
            setConnectors(connectors.map(c => c.id === connectorToSave.id ? { ...c, ...connectorToSave } : c));
        } else {
            const newConnector = { ...connectorToSave, id: `sync-${Date.now()}` } as SyncConnector;
            setConnectors([...connectors, newConnector]);
        }
        setIsModalOpen(false);
    };
    
    const handleDeleteConnector = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce connecteur ?")) {
            setConnectors(connectors.filter(c => c.id !== id));
            // Also remove related logs for cleanup
            setLogs(logs.filter(l => l.connectorId !== id));
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Connecteurs CSV</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                    <Plus className="h-4 w-4" />
                    Nouveau Connecteur
                </button>
            </div>

            <div className="space-y-4">
                {connectors.map(connector => (
                    <div key={connector.id} className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-800">{connector.nom}</h3>
                            <div className="flex items-center gap-2">
                                 <button className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"><RefreshCw className="h-4 w-4"/>Lancer</button>
                                 <button onClick={() => handleOpenModal(connector)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><Edit className="h-4 w-4"/></button>
                                 <button onClick={() => handleDeleteConnector(connector.id)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><Trash2 className="h-4 w-4 text-red-500"/></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                             <div><p className="text-gray-500">Dernière Exécution</p><p className="font-medium">{connector.derniereExecution?.toLocaleString('fr-FR') || 'Jamais'}</p></div>
                            <div><p className="text-gray-500">Dernier Statut</p><p className={`font-medium ${connector.dernierStatut === 'Succès' ? 'text-green-600' : connector.dernierStatut === 'Échec' ? 'text-red-600' : 'text-gray-600'}`}>{connector.dernierStatut}</p></div>
                             <div><p className="text-gray-500">Planification</p><p className="font-medium">{connector.planification}</p></div>
                            <div><p className="text-gray-500">Mode Pilote</p><p className={`font-medium ${connector.modePilote ? 'text-yellow-600' : 'text-gray-600'}`}>{connector.modePilote ? 'Activé' : 'Désactivé'}</p></div>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Historique Global des Synchronisations</h3>
                <div className="bg-white border rounded-lg">
                     <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Connecteur</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Résumé</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {logs.map(log => {
                                const connector = connectors.find(c => c.id === log.connectorId);
                                return (
                                <tr key={log.id}>
                                    <td className="px-4 py-3 text-sm">{log.dateExecution.toLocaleString('fr-FR')}</td>
                                    <td className="px-4 py-3 text-sm font-medium">{connector?.nom || log.connectorId}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`flex items-center gap-1.5 font-medium ${log.statut === 'Succès' ? 'text-green-600' : 'text-red-600'}`}>
                                            {log.statut === 'Succès' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                            {log.statut}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        C: {log.summary.creations} | M: {log.summary.misesAJour} | D: {log.summary.desactivations} | E: {log.summary.erreurs}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{log.details || '-'}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            <SyncConnectorFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveConnector} connector={editingConnector} />
        </div>
    );
};

export default SyncConnectorPanel;