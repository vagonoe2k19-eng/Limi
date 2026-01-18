import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Package, AlertCircle, TrendingUp, TrendingDown, PieChart, Clock } from 'lucide-react'
import Card from '../ui/Card'
import { useProducts, useCategories } from '../../hooks/useData'
import { useAuth } from '../../contexts/AuthContext'
import { getExpiryStatus, getEarliestExpiry } from '../../lib/utils'

const StatisticsView = () => {
    const { products } = useProducts()
    const { categories } = useCategories()
    const { profile } = useAuth()
    const warningDays = profile?.settings?.expiryWarningDays || 14

    // Calculate statistics
    const stats = useMemo(() => {
        const total = products.length

        const byStatus = {
            expired: 0,
            critical: 0,
            warning: 0,
            ok: 0
        }

        let totalDaysToExpiry = 0
        let productsWithExpiry = 0

        products.forEach(product => {
            const expiry = getEarliestExpiry(product.batches)
            if (expiry) {
                const status = getExpiryStatus(expiry, warningDays)
                byStatus[status.status]++

                if (status.daysLeft !== null && status.daysLeft >= 0) {
                    totalDaysToExpiry += status.daysLeft
                    productsWithExpiry++
                }
            }
        })

        const avgDaysToExpiry = productsWithExpiry > 0
            ? Math.round(totalDaysToExpiry / productsWithExpiry)
            : 0

        return {
            total,
            byStatus,
            avgDaysToExpiry,
            urgent: byStatus.expired + byStatus.critical + byStatus.warning
        }
    }, [products, warningDays])

    // Category distribution
    const categoryStats = useMemo(() => {
        const categoryMap = new Map()

        products.forEach(product => {
            const categoryName = product.category?.name || 'Kategória nélkül'
            categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1)
        })

        const data = Array.from(categoryMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)

        const maxCount = Math.max(...data.map(d => d.count), 1)

        return { data, maxCount }
    }, [products])

    // Monthly expiry trend (last 6 months)
    const monthlyTrend = useMemo(() => {
        const months = []
        const now = new Date()

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthName = date.toLocaleDateString('hu-HU', { month: 'short' })

            let count = 0
            products.forEach(product => {
                product.batches?.forEach(batch => {
                    if (batch.expiryDate) {
                        const expiry = new Date(batch.expiryDate)
                        if (expiry.getMonth() === date.getMonth() &&
                            expiry.getFullYear() === date.getFullYear()) {
                            count++
                        }
                    }
                })
            })

            months.push({ month: monthName, count })
        }

        const maxCount = Math.max(...months.map(m => m.count), 1)
        return { months, maxCount }
    }, [products])

    // Status distribution percentages
    const statusPercentages = useMemo(() => {
        const total = stats.total || 1
        return {
            expired: Math.round((stats.byStatus.expired / total) * 100),
            critical: Math.round((stats.byStatus.critical / total) * 100),
            warning: Math.round((stats.byStatus.warning / total) * 100),
            ok: Math.round((stats.byStatus.ok / total) * 100)
        }
    }, [stats])

    // Get sorted upcoming expirations (flattened)
    const upcomingExpirations = useMemo(() => {
        const all = []
        products.forEach(product => {
            product.batches?.forEach(batch => {
                if (batch.expiryDate) {
                    const status = getExpiryStatus(batch.expiryDate, warningDays)
                    all.push({
                        ...product,
                        batch,
                        status,
                        expiryDate: new Date(batch.expiryDate)
                    })
                }
            })
        })

        // Filter for items expiring today or in future (or recently expired within 7 days for context)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const cutoff = new Date(today)
        cutoff.setDate(cutoff.getDate() - 7) // Show items expired in last week too

        return all
            .filter(item => item.expiryDate >= cutoff)
            .sort((a, b) => a.expiryDate - b.expiryDate)
            .slice(0, 10) // Show top 10
    }, [products, warningDays])

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime to-emerald flex items-center justify-center">
                        <BarChart3 className="text-forest" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gradient">Statisztika</h1>
                        <p className="text-white/60 text-sm">Termékek és lejáratok elemzése</p>
                    </div>
                </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                >
                    <Card hover>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-lime/20 flex items-center justify-center">
                                <Package className="text-lime" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                                <p className="text-xs text-white/60">Összes termék</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card hover>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                <AlertCircle className="text-yellow-400" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.urgent}</p>
                                <p className="text-xs text-white/60">Sürgős</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card hover>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                <TrendingDown className="text-red-400" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.byStatus.expired}</p>
                                <p className="text-xs text-white/60">Lejárt</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card hover>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <TrendingUp className="text-emerald-400" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.avgDaysToExpiry}</p>
                                <p className="text-xs text-white/60">Átlag nap</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <BarChart3 size={20} className="text-lime" />
                            Kategóriák szerinti eloszlás
                        </h3>
                        <div className="space-y-3">
                            {categoryStats.data.length > 0 ? (
                                categoryStats.data.map((cat, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white/80">{cat.name}</span>
                                            <span className="text-white font-semibold">{cat.count}</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(cat.count / categoryStats.maxCount) * 100}%` }}
                                                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                                                className="h-full bg-gradient-to-r from-lime to-emerald rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white/60 text-center py-4">Nincs adat</p>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Status Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <PieChart size={20} className="text-lime" />
                            Lejárati státusz eloszlás
                        </h3>

                        {stats.total > 0 ? (
                            <div className="space-y-4">
                                {/* Visual pie representation */}
                                <div className="flex items-center justify-center">
                                    <div className="relative w-32 h-32">
                                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                            {/* Background circle */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke="rgba(255,255,255,0.1)"
                                                strokeWidth="20"
                                            />

                                            {/* Status segments */}
                                            {(() => {
                                                let offset = 0
                                                const segments = [
                                                    { percent: statusPercentages.ok, color: '#10b981', label: 'Rendben' },
                                                    { percent: statusPercentages.warning, color: '#fbbf24', label: 'Figyelmeztetés' },
                                                    { percent: statusPercentages.critical, color: '#f87171', label: 'Kritikus' },
                                                    { percent: statusPercentages.expired, color: '#ef4444', label: 'Lejárt' }
                                                ]

                                                return segments.map((seg, i) => {
                                                    if (seg.percent === 0) return null

                                                    const circumference = 2 * Math.PI * 40
                                                    const dashLength = (seg.percent / 100) * circumference
                                                    const dashOffset = -offset * circumference / 100

                                                    offset += seg.percent

                                                    return (
                                                        <motion.circle
                                                            key={i}
                                                            cx="50"
                                                            cy="50"
                                                            r="40"
                                                            fill="none"
                                                            stroke={seg.color}
                                                            strokeWidth="20"
                                                            strokeDasharray={`${dashLength} ${circumference}`}
                                                            strokeDashoffset={dashOffset}
                                                            initial={{ strokeDasharray: `0 ${circumference}` }}
                                                            animate={{ strokeDasharray: `${dashLength} ${circumference}` }}
                                                            transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                                                        />
                                                    )
                                                })
                                            })()}
                                        </svg>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                            <span className="text-sm text-white/80">Rendben</span>
                                        </div>
                                        <span className="text-sm text-white font-semibold">
                                            {stats.byStatus.ok} ({statusPercentages.ok}%)
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                            <span className="text-sm text-white/80">Figyelmeztetés</span>
                                        </div>
                                        <span className="text-sm text-white font-semibold">
                                            {stats.byStatus.warning} ({statusPercentages.warning}%)
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400" />
                                            <span className="text-sm text-white/80">Kritikus</span>
                                        </div>
                                        <span className="text-sm text-white font-semibold">
                                            {stats.byStatus.critical} ({statusPercentages.critical}%)
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <span className="text-sm text-white/80">Lejárt</span>
                                        </div>
                                        <span className="text-sm text-white font-semibold">
                                            {stats.byStatus.expired} ({statusPercentages.expired}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-white/60 text-center py-4">Nincs adat</p>
                        )}
                    </Card>
                </motion.div>
            </div>

            {/* Monthly Trend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-lime" />
                        Havi lejáratok trendje (utolsó 6 hónap)
                    </h3>
                    <div className="flex items-end justify-between gap-2 h-40">
                        {monthlyTrend.months.map((month, i) => {
                            const height = monthlyTrend.maxCount > 0
                                ? (month.count / monthlyTrend.maxCount) * 100
                                : 0

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="relative w-full flex items-end justify-center h-32">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                                            className="w-full bg-gradient-to-t from-lime to-emerald rounded-t-lg min-h-[4px] relative group"
                                        >
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs font-semibold text-white bg-forest px-2 py-1 rounded whitespace-nowrap">
                                                    {month.count}
                                                </span>
                                            </div>
                                        </motion.div>
                                    </div>
                                    <span className="text-xs text-white/60 capitalize">{month.month}</span>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </motion.div>

            {/* Upcoming Expirations List */}
            <div>
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="text-lime" size={24} />
                        <h3 className="text-lg font-bold text-white">Következő Lejáratok</h3>
                    </div>

                    <div className="space-y-3">
                        {upcomingExpirations.length === 0 ? (
                            <p className="text-center text-white/40 py-4">Nincs közelgő lejárat 🎉</p>
                        ) : (
                            upcomingExpirations.map((item, i) => (
                                <div
                                    key={`${item.id}-${item.batch.id || i}`}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                                >
                                    {/* Status Dot */}
                                    <div className={`
                                        w-3 h-3 rounded-full flex-shrink-0
                                        ${item.status.status === 'expired' ? 'bg-red-500' :
                                            item.status.status === 'critical' ? 'bg-red-400' :
                                                item.status.status === 'warning' ? 'bg-yellow-400' :
                                                    'bg-emerald-400'}
                                    `} />

                                    {/* Product Icon */}
                                    <Package size={20} className="text-white/60 flex-shrink-0" />

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-semibold text-white truncate mr-2">
                                                {item.name}
                                            </p>
                                            <span className={`text-xs font-bold whitespace-nowrap
                                                ${item.status.status === 'expired' ? 'text-red-400' :
                                                    item.status.status === 'critical' ? 'text-red-400' :
                                                        item.status.status === 'warning' ? 'text-yellow-400' :
                                                            'text-white/40'}
                                            `}>
                                                {item.status.daysLeft !== null
                                                    ? (item.status.daysLeft < 0
                                                        ? `${Math.abs(item.status.daysLeft)} napja lejárt`
                                                        : item.status.daysLeft === 0
                                                            ? 'Ma jár le!'
                                                            : `${item.status.daysLeft} nap múlva`)
                                                    : ''}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/60 flex justify-between">
                                            <span>
                                                {item.category?.name || 'Kategória nélkül'} • {item.batch.quantity} {item.batch.unit || 'db'}
                                            </span>
                                            <span className="text-white/40">
                                                {item.expiryDate.toLocaleDateString('hu-HU')}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default StatisticsView
