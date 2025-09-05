import React from 'react';
import type { AccueilComponentConfig } from '../../types';

interface TextWidgetProps {
    config: AccueilComponentConfig;
}

const TextWidget: React.FC<TextWidgetProps> = ({ config }) => {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border h-full">
            {config.title && <h3 className="text-lg font-semibold mb-2 text-gray-800">{config.title}</h3>}
            <p className="text-sm text-gray-600">{config.content || 'Contenu du widget à définir.'}</p>
        </div>
    );
};

export default TextWidget;
