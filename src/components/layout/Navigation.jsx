import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Home,
    Package,
    Calendar,
    BarChart3,
    Settings,
    AlertCircle,
    Menu,
    X
} from 'lucide-react'

const Navigation = ({ currentView, setCurrentView }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navItems = [
        { id: 'home', label: 'Kezdőlap', icon: Home },
        { id: 'products', label: 'Termékek', icon: Package },
        { id: 'urgent', label: 'Sürgős', icon: AlertCircle },
        { id: 'calendar', label: 'Naptár', icon: Calendar },
        { id: 'dashboard', label: 'Statisztika', icon: BarChart3 },
        { id: 'settings', label: 'Beállítások', icon: Settings },
    ]

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
    }, [isMobileMenuOpen])

    const NavButton = ({ item }) => {
        const Icon = item.icon
        const isActive = currentView === item.id

        return (
            <button
                onClick={() => {
                    setCurrentView(item.id)
                    setIsMobileMenuOpen(false)
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                        ? 'bg-gradient-to-r from-lime to-emerald text-forest'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
            >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
            </button>
        )
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 glass-card h-screen sticky top-0 p-4">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gradient">Limi</h2>
                    <p className="text-xs text-white/40 mt-1">Prémium lejárat követő</p>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <NavButton key={item.id} item={item} />
                    ))}
                </nav>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 z-30">
                <div className="flex justify-around items-center p-2">
                    {navItems.slice(0, 5).map((item) => {
                        const Icon = item.icon
                        const isActive = currentView === item.id

                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${isActive
                                        ? 'text-lime'
                                        : 'text-white/60'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="text-xs">{item.label}</span>
                            </button>
                        )
                    })}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-white/60"
                    >
                        <Menu size={20} />
                        <span className="text-xs">Több</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Modal */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 bottom-0 w-64 glass-card z-50 p-4 lg:hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-gradient">Menü</h2>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg"
                                >
                                    <X size={24} className="text-white/60" />
                                </button>
                            </div>

                            <nav className="space-y-2">
                                {navItems.map((item) => (
                                    <NavButton key={item.id} item={item} />
                                ))}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default Navigation
