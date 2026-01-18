const LoadingSkeleton = ({ className = '', count = 1, height = 'h-20' }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={`skeleton ${height} ${className}`} />
            ))}
        </div>
    )
}

export const CardSkeleton = () => (
    <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
            <div className="skeleton h-6 w-32" />
            <div className="skeleton h-8 w-8 rounded-full" />
        </div>
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="flex gap-2 mt-4">
            <div className="skeleton h-10 w-24" />
            <div className="skeleton h-10 w-24" />
        </div>
    </div>
)

export const ListSkeleton = ({ count = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
)

export default LoadingSkeleton
