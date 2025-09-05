import React from 'react';
import type { AccueilComponentConfig } from '../../types';

interface WelcomeWidgetProps {
    config: AccueilComponentConfig;
}

const WelcomeWidget: React.FC<WelcomeWidgetProps> = ({ config }) => (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">BIENVENUE SUR OPTIMISO SUITE</h1>
            <p className="text-blue-100">Système de contrôle interne de l'entreprise</p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-500 to-transparent opacity-20"></div>
    </div>
);

export default WelcomeWidget;
