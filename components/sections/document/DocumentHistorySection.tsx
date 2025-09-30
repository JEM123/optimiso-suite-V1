import React from 'react';
import type { Document } from '../../../types';

interface DocumentHistorySectionProps {
    document: Document;
}

const DocumentHistorySection: React.FC<DocumentHistorySectionProps> = ({ document }) => {
    return (
        <div className="space-y-3 text-sm">
            <div className="p-2 bg-white border rounded">
                <p>Version actuelle: <strong>{document.version}</strong></p>
                <p>Modifié le {new Date(document.dateModification).toLocaleDateString('fr-FR')}</p>
            </div>
            {document.versionHistory?.map(vh => (
                <div key={vh.version} className="p-2 bg-white border rounded">
                    <p>Version: <strong>{vh.version}</strong></p>
                    <p>Publiée le {new Date(vh.date).toLocaleDateString('fr-FR')}</p>
                </div>
            ))}
        </div>
    );
};

export default DocumentHistorySection;
