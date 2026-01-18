import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Package, TrendingUp, AlertCircle, Plus } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import BarcodeScanner from '../scanner/BarcodeScanner'
import { useProducts } from '../../hooks/useData'
import { useAuth } from '../../contexts/AuthContext'
import { getExpiryStatus, getEarliestExpiry } from '../../lib/utils'

const HomePage = (props) => {
    const [scannerOpen, setScannerOpen] = useState(false)
    const { products } = useProducts()
    const { profile } = useAuth()
    const warningDays = profile?.settings?.expiryWarningDays || 14

    // Calculate statistics
    const totalProducts = products.length
    const urgentCount = products.filter(p => {
        const expiry = getEarliestExpiry(p.batches)
        const status = getExpiryStatus(expiry, warningDays)
        return ['expired', 'critical', 'warning'].includes(status.status)
    }).length

    const expiredCount = products.filter(p => {
        const expiry = getEarliestExpiry(p.batches)
        const status = getExpiryStatus(expiry, warningDays)
        return status.status === 'expired'
    }).length

    const recentProducts = products.slice(0, 5)

    // Greeting logic
    const hour = new Date().getHours()
    const greeting = hour < 10 ? 'Jó reggelt' : hour < 18 ? 'Jó napot' : 'Jó estét'

    const criticalCount = products.filter(p => {
        const expiry = getEarliestExpiry(p.batches)
        const status = getExpiryStatus(expiry, warningDays)
        return status.status === 'critical'
    }).length

    return (
        <div className="space-y-6">
            {/* Daily Dashboard */}
            <Card className="relative overflow-hidden border-lime/30 bg-gradient-to-br from-lime/10 to-emerald/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-lime/20 rounded-full blur-3xl -mr-32 -mt-32" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-2">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {greeting}, {profile?.name?.split(' ')[0] || 'Felhasználó'}! 👋
                        </h1>
                        <p className="text-white/80 text-lg">
                            Ma <span className="text-white font-bold bg-red-500/20 px-2 py-0.5 rounded-lg border border-red-500/30">
                                {expiredCount + criticalCount} teendőd
                            </span> van a boltban.
                        </p>
                    </div>

                    <div className="flex items-stretch gap-4">
                        <div className="flex gap-2">
                            <div className="bg-black/30 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/5 min-w-[80px]">
                                <p className="text-2xl font-bold text-red-500 leading-none mb-1">{expiredCount}</p>
                                <p className="text-xs text-white/50 font-medium">Lejárt</p>
                            </div>
                            <div className="bg-black/30 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/5 min-w-[80px]">
                                <p className="text-2xl font-bold text-yellow-500 leading-none mb-1">{criticalCount}</p>
                                <p className="text-xs text-white/50 font-medium">Kritikus</p>
                            </div>
                        </div>

                        <div className="w-px bg-white/10 mx-2 hidden md:block" />

                        <div className="flex flex-col justify-center gap-2">

                            <Button
                                variant="secondary"
                                icon={Plus}
                                onClick={() => setScannerOpen(true)}
                                className="w-full justify-center text-sm py-1.5 min-h-0 h-auto opacity-80 hover:opacity-100"
                            >
                                Gyors Bevitel
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card hover>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-lime/20 flex items-center justify-center">
                            <Package className="text-lime" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{totalProducts}</p>
                            <p className="text-sm text-white/60">Összes termék</p>
                        </div>
                    </div>
                </Card>

                <Card hover>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <AlertCircle className="text-yellow-400" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{urgentCount}</p>
                            <p className="text-sm text-white/60">Sürgős termék</p>
                        </div>
                    </div>
                </Card>

                <Card hover>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <TrendingUp className="text-red-400" size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{expiredCount}</p>
                            <p className="text-sm text-white/60">Lejárt</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Products */}
            {recentProducts.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">
                        Legutóbb hozzáadott termékek
                    </h2>
                    <div className="space-y-3">
                        {recentProducts.map((product) => {
                            const expiry = getEarliestExpiry(product.batches)
                            const status = getExpiryStatus(expiry, warningDays)

                            return (
                                <Card key={product.id} hover>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ${status.status === 'expired' ? 'bg-red-500' :
                                                status.status === 'critical' ? 'bg-red-500' :
                                                    status.status === 'warning' ? 'bg-yellow-500' :
                                                        'bg-emerald-500'
                                                }`} />
                                            <div>
                                                <p className="font-semibold text-white">{product.name}</p>
                                                <p className="text-sm text-white/60">
                                                    {product.category?.name || 'Kategória nélkül'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-white">
                                                {status.daysLeft !== null ? `${status.daysLeft} nap` : '-'}
                                            </p>
                                            <p className="text-xs text-white/60">{status.label}</p>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Quick Tips */}
            <Card className="border-l-4 border-lime">
                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles size={18} className="text-lime" />
                    Tipp
                </h3>
                <p className="text-sm text-white/80">
                    Használd a vonalkód szkennelést a gyorsabb bevitelhez! A rendszer megtanulja a termékeidet,
                    és legközelebb automatikusan kitölti az adatokat.
                </p>
            </Card>

            {/* Scanner Modal */}
            <BarcodeScanner
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onProductAdded={() => setScannerOpen(false)}
            />
        </div>
    )
}

export default HomePage
