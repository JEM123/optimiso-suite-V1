import React from 'react';
import { Loader } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ElementType;
    loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 disabled:text-gray-400',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, variant = 'primary', size = 'md', icon: Icon, loading = false, className = '', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
                disabled={loading || props.disabled}
                {...props}
            >
                {loading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                ) : (
                    Icon && <Icon className="h-4 w-4" />
                )}
                {children}
            </button>
        );
    }
);

export default Button;
