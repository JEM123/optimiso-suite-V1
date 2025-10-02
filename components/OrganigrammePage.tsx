import React, { useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';
import PageHeader from './PageHeader';
import { Network } from 'lucide-react';
import { useDataContext } from '../context/AppContext';
import { buildOrganigrammeLayout } from '../utils/organigramme';
import OrganigrammeFlow from './OrganigrammeFlow';
import type { Entite, Poste, Personne } from '../types';

const OrganigrammePageContent: React.FC = () => {
    const { data } = useDataContext();
    const { entites, postes, personnes } = data as { entites: Entite[], postes: Poste[], personnes: Personne[] };

    const { nodes, edges } = useMemo(
        () => buildOrganigrammeLayout(entites, postes, personnes),
        [entites, postes, personnes]
    );

    return (
        <div className="flex-grow bg-gray-50 relative">
            {nodes.length > 0 ? (
                <OrganigrammeFlow initialNodes={nodes} initialEdges={edges} />
            ) : (
                <div className="flex h-full items-center justify-center text-center">
                    <div>
                        <Network className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700">Aucune donnée à afficher</h2>
                        <p className="text-gray-500 mt-2">Veuillez ajouter des entités et des postes pour construire l'organigramme.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const OrganigrammePage: React.FC = () => {
    return (
        <div className="flex flex-col h-full">
            <PageHeader
                title="Organigramme"
                icon={Network}
                description="Visualisez la structure hiérarchique de votre organisation."
            />
            <ReactFlowProvider>
                <OrganigrammePageContent />
            </ReactFlowProvider>
        </div>
    );
};

export default OrganigrammePage;