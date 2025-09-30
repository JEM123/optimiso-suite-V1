import React from 'react';
import type { Document } from '../../../types';
import { useDataContext } from '../../../context/AppContext';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface DocumentMetadataSectionProps {
    document: Document;
    onShowValidation: (d: Document) => void;
}

const DocumentMetadataSection: React.FC<DocumentMetadataSectionProps> = ({ document, onShowValidation }) => {
    const { data } = useDataContext();
    const categoriesDocuments = data.categoriesDocuments as any[];
    return (
        <div className="space-y-4">
            <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm font-semibold text-gray-700">Validation</p>
                <p className={`text-sm font-semibold mt-1 ${document.statut === 'en_validation' ? 'text-yellow-600' : (document.statut === 'publie' || document.statut === 'valide') ? 'text-green-600' : 'text-gray-600'}`}>
                    {document.statut.replace(/_/g, ' ')}
                </p>
                {document.validationInstanceId &&
                    <button onClick={() => onShowValidation(document)} className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium p-2 bg-blue-50 rounded-md mt-2">
                        Voir le flux de validation
                    </button>
                }
            </div>
            <DetailItem label="Version" value={document.version} />
            <DetailItem label="Date d'échéance" value={document.champsLibres?.dateEcheance ? new Date(document.champsLibres.dateEcheance).toLocaleDateString('fr-FR') : 'Aucune'} />
            <DetailItem label="Catégories" value={
                <div className="flex flex-wrap gap-1">
                    {categoriesDocuments.filter(c => document.categorieIds.includes(c.id)).map(c => <span key={c.id} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">{c.nom}</span>)}
                </div>
            } />
        </div>
    );
};

export default DocumentMetadataSection;
