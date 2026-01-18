import { motion } from 'framer-motion'
import { Edit, Trash2, Package, MapPin, Calendar } from 'lucide-react'
import Card from '../ui/Card'
import { getExpiryStatus, getEarliestExpiry, formatDate, getTotalQuantity } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'

const ProductCard = ({ product, onEdit, onDelete }) => {
    const { profile } = useAuth()
    const warningDays = profile?.settings?.expiryWarningDays || 14

    const earliestExpiry = getEarliestExpiry(product.batches)
    const status = getExpiryStatus(earliestExpiry, warningDays)
    const totalQuantity = getTotalQuantity(product.batches)

    const statusColors = {
        expired: 'bg-red-500/20 border-red-500/50 text-red-400',
        critical: 'bg-red-500/20 border-red-500/50 text-red-400',
        warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
        good: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
        unknown: 'bg-white/10 border-white/20 text-white/60',
    }

    return (
        <Card hover className="relative overflow-hidden">
            {/* Status Indicator */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${status.status === 'expired' ? 'bg-red-500' :
                status.status === 'critical' ? 'bg-red-500' :
                    status.status === 'warning' ? 'bg-yellow-500' :
                        'bg-emerald-500'
                }`} />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                            {product.name}
                        </h3>

                        <div className="flex flex-wrap gap-2 text-sm text-white/60">
                            {product.category && (
                                <div className="flex items-center gap-1">
                                    <Package size={14} />
                                    <span>{product.category.name}</span>
                                </div>
                            )}
                            {product.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    <span>{product.location.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(product)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Edit size={18} className="text-lime" />
                            </button>
                        )}
                        <button
                            onClick={() => onDelete?.(product)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <Trash2 size={18} className="text-red-400" />
                        </button>
                    </div>
                </div>

                {/* Expiry Info */}
                <div className={`px-4 py-3 rounded-xl border ${statusColors[status.status]}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs opacity-80 mb-1">Legkorábbi lejárat</p>
                            <p className="font-bold">
                                {earliestExpiry ? formatDate(earliestExpiry) : 'Nincs megadva'}
                            </p>
                        </div>
                        {status.daysLeft !== null && (
                            <div className="text-right">
                                <p className="text-2xl font-bold">
                                    {status.daysLeft > 0 ? status.daysLeft : 0}
                                </p>
                                <p className="text-xs opacity-80">nap</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Batches */}
                {product.batches && product.batches.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-white/60">
                            {product.batches.length} tétel • Összesen: {totalQuantity} db
                        </p>

                        <div className="space-y-1">
                            {product.batches.slice(0, 3).map((batch, index) => {
                                const batchStatus = getExpiryStatus(batch.expiryDate, warningDays)
                                return (
                                    <div
                                        key={batch.id || index}
                                        className="flex items-center justify-between text-sm px-3 py-2 bg-white/5 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-white/40" />
                                            <span className="text-white/80">{formatDate(batch.expiryDate)}</span>
                                        </div>
                                        <span className="text-white/60">{batch.quantity} db</span>
                                    </div>
                                )
                            })}

                            {product.batches.length > 3 && (
                                <p className="text-xs text-white/40 text-center pt-1">
                                    +{product.batches.length - 3} további tétel
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    )
}

export default ProductCard
