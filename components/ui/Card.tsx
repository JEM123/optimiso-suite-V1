import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
    const baseClasses = "bg-white rounded-lg shadow-sm border";
    const clickableClasses = onClick ? "cursor-pointer hover:shadow-md hover:border-blue-400 transition-all" : "";

    return (
        <div className={`${baseClasses} ${clickableClasses} ${className}`} onClick={onClick}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`p-4 border-b ${className}`}>
        {children}
    </div>
);

export const CardContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`p-4 ${className}`}>
        {children}
    </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`p-4 border-t bg-gray-50/50 rounded-b-lg ${className}`}>
        {children}
    </div>
);

export default Card;
