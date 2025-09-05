import React from 'react';
import { mockData } from '../../constants';
import type { AccueilComponentConfig, Document } from '../../types';

interface UsefulDocsWidgetProps {
    config: AccueilComponentConfig;
}

const UsefulDocsWidget: React.FC<UsefulDocsWidgetProps> = ({ config }) => {
    const usefulDocs = mockData.documents.filter(d => d.miseEnAvant);
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="bg-blue-600 text-white p-3 rounded-lg mb-4">
                <h3 className="font-semibold">{config.title || 'Documents mis en avant'}</h3>
            </div>
            <ul className="space-y-2">
                {usefulDocs.map((doc: Document) => (
                    <li key={doc.id}>
                        <button className="text-blue-600 hover:text-blue-800 text-sm hover:underline text-left">
                            • {doc.nom}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UsefulDocsWidget;
