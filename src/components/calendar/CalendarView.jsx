import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Package } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { useProducts } from '../../hooks/useData'
import { useAuth } from '../../contexts/AuthContext'
import { getExpiryStatus, getEarliestExpiry } from '../../lib/utils'

const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(null)
    const { products } = useProducts()
    const { profile } = useAuth()
    const warningDays = profile?.settings?.expiryWarningDays || 14

    // Get calendar data
    const { year, month, monthName, daysInMonth, firstDayOfMonth, calendarDays } = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const monthName = currentDate.toLocaleDateString('hu-HU', { month: 'long', year: 'numeric' })

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const firstDayOfMonth = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // Monday = 0

        // Build calendar grid
        const days = []

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate()
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                date: new Date(year, month - 1, prevMonthLastDay - i),
                isCurrentMonth: false
            })
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                date: new Date(year, month, i),
                isCurrentMonth: true
            })
        }

        // Next month days to fill grid
        const remainingDays = 42 - days.length // 6 rows * 7 days
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            })
        }

        return { year, month, monthName, daysInMonth, firstDayOfMonth, calendarDays: days }
    }, [currentDate])

    // Map products to dates
    const productsByDate = useMemo(() => {
        const dateMap = new Map()

        products.forEach(product => {
            product.batches?.forEach(batch => {
                if (batch.expiryDate) {
                    const expiryDate = new Date(batch.expiryDate)
                    const dateKey = `${expiryDate.getFullYear()}-${expiryDate.getMonth()}-${expiryDate.getDate()}`

                    if (!dateMap.has(dateKey)) {
                        dateMap.set(dateKey, [])
                    }

                    const status = getExpiryStatus(batch.expiryDate, warningDays)
                    dateMap.get(dateKey).push({
                        ...product,
                        batch,
                        status
                    })
                }
            })
        })

        return dateMap
    }, [products, warningDays])



    // Get products for a specific date
    const getProductsForDate = (date) => {
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        return productsByDate.get(dateKey) || []
    }

    // Get status color for a date
    const getDateStatus = (date) => {
        const productsOnDate = getProductsForDate(date)
        if (productsOnDate.length === 0) return null

        const hasExpired = productsOnDate.some(p => p.status.status === 'expired')
        const hasCritical = productsOnDate.some(p => p.status.status === 'critical')
        const hasWarning = productsOnDate.some(p => p.status.status === 'warning')

        if (hasExpired) return 'expired'
        if (hasCritical) return 'critical'
        if (hasWarning) return 'warning'
        return 'ok'
    }

    const isToday = (date) => {
        const today = new Date()
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
    }

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
        setSelectedDate(null)
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
        setSelectedDate(null)
    }

    const selectedProducts = selectedDate ? getProductsForDate(selectedDate) : []

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime to-emerald flex items-center justify-center">
                            <CalendarIcon className="text-forest" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gradient capitalize">
                                {monthName}
                            </h1>
                            <p className="text-white/60 text-sm">Lejárati dátumok naptára</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={previousMonth} icon={ChevronLeft}>
                            Előző
                        </Button>
                        <Button variant="secondary" onClick={nextMonth} icon={ChevronRight}>
                            Következő
                        </Button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {/* Weekday headers */}
                    {['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'].map((day, i) => (
                        <div key={i} className="text-center text-sm font-semibold text-white/60 py-2">
                            {day}
                        </div>
                    ))}

                    {/* Calendar days */}
                    {calendarDays.map((dayData, i) => {
                        const dateStatus = getDateStatus(dayData.date)
                        const productsCount = getProductsForDate(dayData.date).length
                        const today = isToday(dayData.date)
                        const isSelected = selectedDate &&
                            selectedDate.getDate() === dayData.date.getDate() &&
                            selectedDate.getMonth() === dayData.date.getMonth() &&
                            selectedDate.getFullYear() === dayData.date.getFullYear()

                        return (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => dayData.isCurrentMonth && setSelectedDate(dayData.date)}
                                className={`
                                    relative aspect-square rounded-lg p-2 transition-all
                                    ${dayData.isCurrentMonth ? 'text-white' : 'text-white/30'}
                                    ${today ? 'ring-2 ring-lime' : ''}
                                    ${isSelected ? 'bg-lime/20' : 'bg-white/5 hover:bg-white/10'}
                                    ${!dayData.isCurrentMonth ? 'cursor-default' : 'cursor-pointer'}
                                `}
                            >
                                <span className="text-sm font-medium">{dayData.day}</span>

                                {productsCount > 0 && dayData.isCurrentMonth && (
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                        <div className={`
                                            w-1.5 h-1.5 rounded-full
                                            ${dateStatus === 'expired' ? 'bg-red-500' :
                                                dateStatus === 'critical' ? 'bg-red-400' :
                                                    dateStatus === 'warning' ? 'bg-yellow-400' :
                                                        'bg-emerald-400'}
                                        `} />
                                        {productsCount > 1 && (
                                            <span className="text-[10px] text-white/60">
                                                +{productsCount - 1}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </motion.button>
                        )
                    })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm text-white/60">Lejárt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <span className="text-sm text-white/60">Kritikus</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <span className="text-sm text-white/60">Figyelmeztetés</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="text-sm text-white/60">Rendben</span>
                    </div>
                </div>
            </Card>

            {/* Selected Date Products */}
            <AnimatePresence>
                {selectedDate && selectedProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card>
                            <h3 className="text-lg font-bold text-white mb-4">
                                {selectedDate.toLocaleDateString('hu-HU', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h3>
                            <div className="space-y-3">
                                {selectedProducts.map((product, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className={`
                                            w-3 h-3 rounded-full flex-shrink-0
                                            ${product.status.status === 'expired' ? 'bg-red-500' :
                                                product.status.status === 'critical' ? 'bg-red-400' :
                                                    product.status.status === 'warning' ? 'bg-yellow-400' :
                                                        'bg-emerald-400'}
                                        `} />
                                        <Package size={20} className="text-white/60 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white truncate">
                                                {product.name}
                                            </p>
                                            <p className="text-sm text-white/60">
                                                {product.category?.name || 'Kategória nélkül'} •
                                                {product.batch.quantity} {product.batch.unit || 'db'}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-medium text-white">
                                                {product.status.label}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedDate && selectedProducts.length === 0 && (
                <Card>
                    <p className="text-center text-white/60">
                        Nincs termék ezen a napon
                    </p>
                </Card>
            )}

            {/* Upcoming Expirations List */}

        </div>
    )
}

export default CalendarView
