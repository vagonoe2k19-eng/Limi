import { useMemo } from 'react'
import { AlertTriangle, Package, Check, Trash2 } from 'lucide-react'
import ProductCard from './ProductCard'
import { ListSkeleton } from '../ui/LoadingSkeleton'
import { useProducts } from '../../hooks/useData'
import { useAuth } from '../../contexts/AuthContext'
import { getExpiryStatus, getEarliestExpiry } from '../../lib/utils'
import { playDeleteSound } from '../../lib/sounds'

const UrgentView = () => {
    const { products, loading, deleteProduct, updateProduct } = useProducts()
    const { profile } = useAuth()
    const warningDays = profile?.settings?.expiryWarningDays || 14

    const urgentProducts = useMemo(() => {
        return products
            .map(product => {
                const earliestExpiry = getEarliestExpiry(product.batches)
                const status = getExpiryStatus(earliestExpiry, warningDays)
                return { ...product, status, earliestExpiry }
            })
            .filter(product =>
                product.status.status === 'expired' ||
                product.status.status === 'critical' ||
                product.status.status === 'warning'
            )
            .sort((a, b) => {
                // Sort by days left (ascending)
                if (!a.earliestExpiry) return 1
                if (!b.earliestExpiry) return -1
                return new Date(a.earliestExpiry) - new Date(b.earliestExpiry)
            })
    }, [products, warningDays])

    const handleDelete = async (product) => {
        if (confirm(`Biztosan törölni szeretnéd: ${product.name}?`)) {
            playDeleteSound()
            await deleteProduct(product.id)
        }
    }

    if (loading) {
        return <ListSkeleton count={3} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="text-red-400" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gradient">Sürgős Termékek</h2>
                    <p className="text-white/60 text-sm">
                        {urgentProducts.length} termék jár le {warningDays} napon belül
                    </p>
                </div>
            </div>

            {/* Warning Info */}
            <div className="glass-card p-4 border-l-4 border-yellow-500">
                <p className="text-sm text-white/80">
                    <span className="font-semibold text-yellow-400">Figyelem!</span> Ezek a termékek hamarosan lejárnak vagy már lejártak.
                    Ellenőrizd őket és használd fel időben!
                </p>
            </div>

            {/* Products */}
            {urgentProducts.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <Package size={40} className="text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        Minden rendben! 🎉
                    </h3>
                    <p className="text-white/60">
                        Jelenleg nincs sürgős termék. Minden termék friss!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Expired */}
                    {urgentProducts.filter(p => p.status.status === 'expired').length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-red-400 mb-3">
                                Lejárt ({urgentProducts.filter(p => p.status.status === 'expired').length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {urgentProducts
                                    .filter(p => p.status.status === 'expired')
                                    .map(product => (
                                        <div key={product.id} className="relative group">
                                            <ProductCard
                                                product={product}
                                            // No edit/delete props passed, so no default buttons
                                            />

                                            {/* Quarantine Actions Overlay */}
                                            <div className="absolute bottom-3 right-3 flex gap-2">
                                                <button
                                                    onClick={async () => {
                                                        // Extend expiry logic
                                                        const earliest = getEarliestExpiry(product.batches)
                                                        if (!earliest) return

                                                        // Find the batch to update (the exhausted one)
                                                        // In a real app we might want to select WHICH batch if multiple are expired
                                                        // For simplicity, update the earliest one
                                                        const batches = [...product.batches]
                                                        const batchIndex = batches.findIndex(b => b.expiryDate === earliest)

                                                        if (batchIndex !== -1) {
                                                            const newDate = new Date()
                                                            newDate.setDate(newDate.getDate() + 2) // +2 days from NOW (since it was expired)
                                                            batches[batchIndex].expiryDate = newDate.toISOString()

                                                            await updateProduct(product.id, { batches })
                                                        }
                                                    }}
                                                    className="p-2 bg-emerald-500 text-white rounded-lg shadow-lg hover:bg-emerald-600 transition-colors flex items-center gap-1"
                                                    title="Még jó (+2 nap)"
                                                >
                                                    <Check size={18} />
                                                    <span className="text-xs font-bold">Még jó</span>
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                                                    title="Kidobás"
                                                >
                                                    <Trash2 size={18} />
                                                    <span className="text-xs font-bold">Kuka</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Critical (1-3 days) */}
                    {urgentProducts.filter(p => p.status.status === 'critical').length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-red-400 mb-3">
                                Kritikus - 1-3 nap ({urgentProducts.filter(p => p.status.status === 'critical').length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {urgentProducts
                                    .filter(p => p.status.status === 'critical')
                                    .map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Warning */}
                    {urgentProducts.filter(p => p.status.status === 'warning').length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-yellow-400 mb-3">
                                Figyelmeztetés - {warningDays} napon belül ({urgentProducts.filter(p => p.status.status === 'warning').length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {urgentProducts
                                    .filter(p => p.status.status === 'warning')
                                    .map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default UrgentView
