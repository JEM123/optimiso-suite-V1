import React from 'react';
import type { Poste, RACI } from '../../../types';
import { useDataContext } from '../../../context/AppContext';

interface PosteRaciSectionProps {
    poste: Poste;
}

const PosteRaciSection: React.FC<PosteRaciSectionProps> = ({ poste }) => {
    const { data } = useDataContext();
    const raciLinks = (data.raci as RACI[]).filter(r => r.posteId === poste.id);

    const getObjectName = (objetId: string, objetType: 'processus' | 'procedure' | 'controle') => {
        const collection = data[`${objetType}s` as keyof typeof data] as any[];
        return collection?.find(item => item.id === objetId)?.nom || 'Objet non trouvé';
    };

    return (
        <div className="space-y-2">
            {raciLinks.map(link => (
                <div key={link.id} className="flex items-center justify-between p-3 bg-white border rounded-md">
                    <div>
                        <p className="font-medium text-sm">{getObjectName(link.objetId, link.objetType)}</p>
                        <p className="text-xs text-gray-500 capitalize">{link.objetType}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {link.role}
                    </div>
                </div>
            ))}
            {raciLinks.length === 0 && <p className="text-sm text-gray-500">Ce poste n'est impliqué dans aucune matrice RACI.</p>}
        </div>
    );
};

export default PosteRaciSection;
