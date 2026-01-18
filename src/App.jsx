import { useState, cloneElement } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './components/auth/AuthPage'
import Navigation from './components/layout/Navigation'
import Header from './components/layout/Header'
import HomePage from './components/home/HomePage'
import ProductList from './components/products/ProductList'
import UrgentView from './components/products/UrgentView'
import { ListSkeleton } from './components/ui/LoadingSkeleton'
import './index.css'

import CalendarView from './components/calendar/CalendarView'
import StatisticsView from './components/statistics/StatisticsView'
import SettingsView from './components/settings/SettingsView'

const MainApp = () => {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState('home')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ListSkeleton count={3} />
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  const views = {
    home: <HomePage />,
    products: <ProductList />,
    urgent: <UrgentView />,
    calendar: <CalendarView />,
    dashboard: <StatisticsView />,
    settings: <SettingsView />,
  }

  return (
    <div className="flex min-h-screen">
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
        <Header />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {cloneElement(views[currentView], { setCurrentView })}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}

export default App
