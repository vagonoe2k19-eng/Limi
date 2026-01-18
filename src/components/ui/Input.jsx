import { forwardRef } from 'react'

const Input = forwardRef(({
    label,
    error,
    className = '',
    icon: Icon,
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-white/80 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                        <Icon size={20} />
                    </div>
                )}
                <input
                    ref={ref}
                    className={`input-primary ${Icon ? 'pl-12' : ''} ${className} ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''
                        }`}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
        </div>
    )
})

Input.displayName = 'Input'

export default Input
