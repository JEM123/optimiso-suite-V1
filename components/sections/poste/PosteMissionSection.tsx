import React from 'react';
import type { Poste } from '../../../types';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <div className="text-sm text-gray-900 mt-1">{value || '-'}</div>
    </div>
);

interface PosteMissionSectionProps {
    poste: Poste;
}

const PosteMissionSection: React.FC<PosteMissionSectionProps> = ({ poste }) => {
    return (
        <div className="space-y-4">
            <DetailItem label="Mission principale" value={<p className="whitespace-pre-wrap">{poste.mission}</p>} />
            <DetailItem label="Responsabilités" value={<p className="whitespace-pre-wrap">{poste.responsabilites}</p>} />
            <DetailItem label="Activités clés" value={<p className="whitespace-pre-wrap">{poste.activitesCles}</p>} />
        </div>
    );
};

export default PosteMissionSection;
