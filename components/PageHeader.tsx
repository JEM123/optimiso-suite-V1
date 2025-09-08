import React from 'react';
import Button from './ui/Button';

interface Breadcrumb {
    label: string;
    onClick?: () => void;
}

interface Action {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
}

interface PageHeaderProps {
    title: string;
    icon: React.ElementType;
    description?: string;
    breadcrumbs?: Breadcrumb[];
    actions?: Action[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, icon: Icon, description, breadcrumbs, actions }) => {
    return (
        <div className="p-4 border-b bg-white rounded-t-lg">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="mb-2 text-sm text-gray-500">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            <button onClick={crumb.onClick} className="hover:underline disabled:no-underline disabled:cursor-default" disabled={!crumb.onClick}>
                                {crumb.label}
                            </button>
                            {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
                        </React.Fragment>
                    ))}
                </nav>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <Icon className="h-8 w-8 text-gray-600 flex-shrink-0" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                    </div>
                </div>
                {actions && actions.length > 0 && (
                    <div className="flex items-center gap-2">
                        {actions.map((action, index) => (
                            <Button 
                                key={index} 
                                onClick={action.onClick}
                                icon={action.icon}
                                variant={action.variant || 'secondary'}
                                disabled={action.disabled}
                                size="md"
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
