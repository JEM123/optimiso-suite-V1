import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useDataContext } from '../context/AppContext';
import type { Document } from '../types';

interface DocumentsDashboardProps {
  onShowValidation: (doc: Document) => void;
}

const DocumentsDashboard: React.FC<DocumentsDashboardProps> = ({ onShowValidation }) => {
  const { data } = useDataContext();
  const documents = data.documents as Document[];

  const stats = React.useMemo(() => {
    return {
      total: documents.length,
      publies: documents.filter(d => d.statut === 'publie' || d.statut === 'valide').length,
      enCours: documents.filter(d => d.statut === 'en_validation').length,
      archives: documents.filter(d => d.statut === 'archive').length,
    };
  }, [documents]);


  return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">Tableau de bord - Documents</h2>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
        Rapport de validation
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border"><div className="text-3xl font-bold text-blue-600">{stats.total}</div><div className="text-sm text-gray-600">Total documents</div></div>
      <div className="bg-white p-4 rounded-lg shadow-sm border"><div className="text-3xl font-bold text-green-600">{stats.publies}</div><div className="text-sm text-gray-600">Publiés</div></div>
      <div className="bg-white p-4 rounded-lg shadow-sm border"><div className="text-3xl font-bold text-orange-600">{stats.enCours}</div><div className="text-sm text-gray-600">En cours validation</div></div>
      <div className="bg-white p-4 rounded-lg shadow-sm border"><div className="text-3xl font-bold text-gray-600">{stats.archives}</div><div className="text-sm text-gray-600">Archivés</div></div>
    </div>

    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="font-semibold mb-4">Documents en attente de validation</h3>
      <div className="space-y-3">
        {documents.filter(doc => doc.statut === 'en_validation').map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{doc.nom}</div>
              <div className="text-xs text-gray-500">{doc.reference} | Version {doc.version}</div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
              <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">En validation</span>
              <button onClick={() => onShowValidation(doc)} className="text-blue-600 hover:text-blue-800" title="Voir flux de validation">
                <CheckCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)};

export default DocumentsDashboard;