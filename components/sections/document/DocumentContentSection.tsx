import React from 'react';
import type { Document } from '../../../types';
import { Download, ExternalLink } from 'lucide-react';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface DocumentContentSectionProps {
    document: Document;
}

const DocumentContentSection: React.FC<DocumentContentSectionProps> = ({ document }) => {
    return (
        <div className="space-y-4">
            <DetailItem label="Source" value={document.source} />
            {document.source === 'Fichier' && (
                <div className="space-y-2">
                    <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"><Download className="h-4 w-4" /><span>Télécharger (PDF)</span></button>
                </div>
            )}
            {document.source === 'Lien' && (
                <a href={document.lien} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                    <ExternalLink className="h-4 w-4" /><span>Ouvrir le lien</span>
                </a>
            )}
            {document.source === 'Description' && (
                <div>
                    <h4 className="font-semibold text-gray-800 mb-2 pb-2 border-b">Contenu</h4>
                    <div className="p-3 bg-white border rounded-md text-sm whitespace-pre-wrap">{document.description}</div>
                </div>
            )}
        </div>
    );
};

export default DocumentContentSection;
