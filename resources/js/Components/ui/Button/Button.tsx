import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/Utils/cn';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'warning' | 'success' | 'default';
    size?: 'sm' | 'md' | 'lg';
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    ...props
}: Props) {
    return (
        <button
            className={cn(
                'rounded-lg font-medium transition-all',

                {
                    'bg-emerald-600 text-white hover:bg-emerald-700':
                        variant === 'primary',

                    'bg-slate-100 text-slate-900':
                        variant === 'secondary',

                    'border border-slate-300 bg-white':
                        variant === 'outline',

                    'bg-red-600 text-white':
                        variant === 'danger',

                    'bg-amber-600 text-white':
                        variant === 'warning',

                    'bg-green-600 text-white':
                        variant === 'success',

                    'bg-slate-600 text-white':
                        variant === 'default',

                    'px-3 py-2 text-sm':
                        size === 'sm',

                    'px-4 py-3':
                        size === 'md',

                    'px-6 py-4 text-lg':
                        size === 'lg',
                },

                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
