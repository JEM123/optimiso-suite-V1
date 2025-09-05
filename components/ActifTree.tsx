import React from 'react';
import type { Actif } from '../types';
import { Server, HardDrive, Cpu } from 'lucide-react';

interface ActifTreeProps {
    rootActifId: string;
    allActifs: Actif[];
    level?: number;
}

const getIconForType = (type: Actif['type']) => {
    switch(type) {
        case 'Matériel': return Server;
        case 'Logiciel': return HardDrive;
        default: return Cpu;
    }
}

const ActifNode: React.FC<{ actif: Actif; allActifs: Actif[]; level: number }> = ({ actif, allActifs, level }) => {
    const children = allActifs.filter(a => a.parentId === actif.id);
    const Icon = getIconForType(actif.type);

    return (
        <div style={{ paddingLeft: `${level * 20}px` }}>
            <div className="flex items-center space-x-2 py-1">
                <Icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800">{actif.nom}</span>
                <span className="text-xs text-gray-500">({actif.type})</span>
            </div>
            {children.length > 0 && (
                <div>
                    {children.map(child => (
                        <ActifNode key={child.id} actif={child} allActifs={allActifs} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ActifTree: React.FC<ActifTreeProps> = ({ rootActifId, allActifs }) => {
    const findRoot = (id: string): Actif | undefined => {
        const actif = allActifs.find(a => a.id === id);
        if (!actif || !actif.parentId) return actif;
        return findRoot(actif.parentId);
    };

    const rootActif = findRoot(rootActifId);

    if (!rootActif) {
        return <p className="text-sm text-gray-500">Impossible de construire l'arborescence.</p>;
    }

    return (
        <div>
            <ActifNode actif={rootActif} allActifs={allActifs} level={0} />
        </div>
    );
};

export default ActifTree;
