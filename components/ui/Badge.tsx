import React from 'react';

type BadgeColor = 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';

interface BadgeProps {
    children: React.ReactNode;
    color?: BadgeColor;
    className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    indigo: 'bg-indigo-100 text-indigo-800',
};

const Badge: React.FC<BadgeProps> = ({ children, color = 'gray', className = '' }) => {
    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full inline-block ${colorClasses[color]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
