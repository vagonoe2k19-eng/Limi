import { motion } from 'framer-motion'

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    icon: Icon,
    ...props
}) => {
    const baseClasses = 'font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2'

    const variants = {
        primary: 'bg-gradient-to-r from-lime to-emerald text-forest hover:scale-105 hover:shadow-lg hover:shadow-lime/50 active:scale-95',
        secondary: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-lime/50 active:scale-95',
        ghost: 'text-lime hover:bg-lime/10 active:scale-95',
        danger: 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 active:scale-95',
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    }

    const variantClass = variants[variant] || variants.primary
    const sizeClass = sizes[size] || sizes.md

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            className={`${baseClasses} ${variantClass} ${sizeClass} ${className} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {Icon && <Icon size={20} />}
                    {children}
                </>
            )}
        </motion.button>
    )
}

export default Button
