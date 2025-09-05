import React from 'react';

interface CompetenceData {
    competence: { nom: string };
    niveauAttendu: number;
    niveauEvalue?: number;
}

interface Props {
    competenceData: CompetenceData[];
    size?: number;
}

const CompetenceRadarChart: React.FC<Props> = ({ competenceData, size = 250 }) => {
    const FONT_SIZE = 10;
    const center = size / 2;
    const maxRadius = center - FONT_SIZE * 3.5;
    const numLevels = 5;
    const numAxes = competenceData.length;
    
    if (numAxes < 3) {
        return <div className="flex items-center justify-center h-full text-sm text-gray-500">Besoin d'au moins 3 compétences pour afficher le radar.</div>;
    }

    const levelPoints = Array.from({ length: numLevels }, (_, i) => {
        const radius = maxRadius * ((i + 1) / numLevels);
        const points = Array.from({ length: numAxes }, (__, j) => {
            const angle = (j * 2 * Math.PI / numAxes) - (Math.PI / 2);
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
        return <polygon key={i} points={points} className="fill-none stroke-gray-200" strokeWidth="1"/>;
    });

    const axisLines = Array.from({ length: numAxes }, (_, i) => {
        const angle = (i * 2 * Math.PI / numAxes) - (Math.PI / 2);
        const x2 = center + maxRadius * Math.cos(angle);
        const y2 = center + maxRadius * Math.sin(angle);
        return <line key={i} x1={center} y1={center} x2={x2} y2={y2} className="stroke-gray-200" strokeWidth="1"/>;
    });

    const labels = competenceData.map((data, i) => {
        const angle = (i * 2 * Math.PI / numAxes) - (Math.PI / 2);
        const labelRadius = maxRadius + FONT_SIZE;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        const textAnchor = Math.abs(x - center) < 1 ? "middle" : x > center ? "start" : "end";
        return (
            <text key={i} x={x} y={y} fontSize={FONT_SIZE} textAnchor={textAnchor} dominantBaseline="middle" className="fill-gray-600">
                {data.competence.nom}
            </text>
        );
    });

    const generateDataPolygon = (dataKey: 'niveauAttendu' | 'niveauEvalue', className: string) => {
        const points = competenceData.map((data, i) => {
            const value = data[dataKey] || 0;
            const radius = maxRadius * (value / numLevels);
            const angle = (i * 2 * Math.PI / numAxes) - (Math.PI / 2);
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
        return <polygon points={points} className={className} />;
    };

    const attenduPolygon = generateDataPolygon('niveauAttendu', 'fill-blue-500/20 stroke-blue-700 stroke-width-1');
    const evaluéPolygon = generateDataPolygon('niveauEvalue', 'fill-green-500/40 stroke-green-700 stroke-width-1');

    return (
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
            <g>
                {levelPoints}
                {axisLines}
                {attenduPolygon}
                {evaluéPolygon}
                {labels}
            </g>
        </svg>
    );
};

export default CompetenceRadarChart;
