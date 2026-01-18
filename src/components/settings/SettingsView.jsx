import { useState } from 'react'
import {
    User, Lock, Bell, Moon, Sun, Database,
    Download, Trash2, LogOut, Save, AlertCircle, Check
} from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Input from '../ui/Input'
import { useAuth } from '../../contexts/AuthContext'
import { useProducts, useCategories, useLocations, useProductKnowledge } from '../../hooks/useData'

const SettingsView = () => {
    const { user, profile, updateProfile, updatePassword, signOut, resetDefaults } = useAuth()
    const { products } = useProducts()
    const { categories } = useCategories()
    const { locations } = useLocations()

    // State for profile form
    const [name, setName] = useState(profile?.name || '')
    const [loadingProfile, setLoadingProfile] = useState(false)
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })

    // State for password change
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loadingPassword, setLoadingPassword] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })

    // State for preferences
    const [expiryDays, setExpiryDays] = useState(profile?.settings?.expiryWarningDays || 14)
    const [loadingPrefs, setLoadingPrefs] = useState(false)
    const [prefsMessage, setPrefsMessage] = useState({ type: '', text: '' })

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setLoadingProfile(true)
        setProfileMessage({ type: '', text: '' })

        try {
            const { error } = await updateProfile({ name })
            if (error) throw error
            setProfileMessage({ type: 'success', text: 'Profil sikeresen frissítve!' })
        } catch (err) {
            setProfileMessage({ type: 'error', text: 'Hiba a mentés során: ' + err.message })
        } finally {
            setLoadingProfile(false)
        }
    }

    const handlePasswordUpdate = async (e) => {
        e.preventDefault()
        setLoadingPassword(true)
        setPasswordMessage({ type: '', text: '' })

        if (password !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'A jelszavak nem egyeznek!' })
            setLoadingPassword(false)
            return
        }

        if (password.length < 6) {
            setPasswordMessage({ type: 'error', text: 'A jelszónak legalább 6 karakternek kell lennie!' })
            setLoadingPassword(false)
            return
        }

        try {
            const { error } = await updatePassword(password)
            if (error) throw error
            setPasswordMessage({ type: 'success', text: 'Jelszó sikeresen módosítva!' })
            setPassword('')
            setConfirmPassword('')
        } catch (err) {
            setPasswordMessage({ type: 'error', text: 'Hiba a jelszó módosítása során: ' + err.message })
        } finally {
            setLoadingPassword(false)
        }
    }

    const handlePrefsUpdate = async () => {
        setLoadingPrefs(true)
        setPrefsMessage({ type: '', text: '' })

        try {
            const currentSettings = profile?.settings || {}
            const { error } = await updateProfile({
                settings: {
                    ...currentSettings,
                    expiryWarningDays: parseInt(expiryDays)
                }
            })
            if (error) throw error
            setPrefsMessage({ type: 'success', text: 'Beállítások mentve!' })
        } catch (err) {
            setPrefsMessage({ type: 'error', text: 'Hiba a mentés során: ' + err.message })
        } finally {
            setLoadingPrefs(false)
        }
    }

    const handleExportData = () => {
        const data = {
            profile,
            products,
            categories,
            locations
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `limi-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gradient">Beállítások</h2>

            {/* Profile Settings */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <User className="text-lime" size={24} />
                    <h3 className="text-lg font-bold text-white">Profil Adatai</h3>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Megjelenített Név"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Add meg a neved"
                        />
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Email Cím
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {profileMessage.text && (
                        <div className={`text-sm ${profileMessage.type === 'success' ? 'text-lime' : 'text-red-400'}`}>
                            {profileMessage.text}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            variant="primary"
                            icon={Save}
                            loading={loadingProfile}
                        >
                            Mentés
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Password Change */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <Lock className="text-lime" size={24} />
                    <h3 className="text-lg font-bold text-white">Jelszó Módosítása</h3>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            type="password"
                            label="Új Jelszó"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimum 6 karakter"
                            autoComplete="new-password"
                        />
                        <Input
                            type="password"
                            label="Jelszó Megerősítése"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ismételd meg a jelszót"
                            autoComplete="new-password"
                        />
                    </div>

                    {passwordMessage.text && (
                        <div className={`text-sm ${passwordMessage.type === 'success' ? 'text-lime' : 'text-red-400'}`}>
                            {passwordMessage.text}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            variant="secondary"
                            icon={Check}
                            loading={loadingPassword}
                            disabled={!password || !confirmPassword}
                        >
                            Jelszó Frissítése
                        </Button>
                    </div>
                </form>
            </Card>

            {/* App Preferences */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="text-lime" size={24} />
                    <h3 className="text-lg font-bold text-white">Értesítések és Működés</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Lejárati figyelmeztetés kezdete (nap)
                        </label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={expiryDays}
                                onChange={(e) => setExpiryDays(e.target.value)}
                                className="input-primary w-32"
                            />
                            <span className="text-white/60 text-sm">
                                nappal a lejárati dátum előtt
                            </span>
                        </div>
                        <p className="text-xs text-white/40 mt-2">
                            Akkor jelzi a rendszer "Kritikus" (narancs) színnel a terméket, ha ezen az időablakon belül van.
                        </p>
                    </div>

                    {prefsMessage.text && (
                        <div className={`text-sm ${prefsMessage.type === 'success' ? 'text-lime' : 'text-red-400'}`}>
                            {prefsMessage.text}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button
                            onClick={handlePrefsUpdate}
                            variant="primary"
                            icon={Save}
                            loading={loadingPrefs}
                        >
                            Beállítások Mentése
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Data Management */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <Database className="text-lime" size={24} />
                    <h3 className="text-lg font-bold text-white">Adatkezelés</h3>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-medium">Biztonsági mentés</h4>
                            <p className="text-white/60 text-sm">
                                Minden adat (termékek, kategóriák, beállítások) letöltése egy JSON fájlba.
                            </p>
                        </div>
                        <Button
                            onClick={handleExportData}
                            variant="secondary"
                            icon={Download}
                        >
                            Letöltés
                        </Button>
                    </div>

                    <div className="p-4 bg-lime/10 border border-lime/20 rounded-xl flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-medium">Kategóriák és Helyek Bővítése</h4>
                            <p className="text-white/60 text-sm">
                                Az új, bővített (emojis) kategóriák és tárolóhelyek hozzáadása.
                            </p>
                        </div>
                        <Button
                            onClick={async () => {
                                if (confirm('Ez hozzáadja az új kategóriákat és helyeket a meglévőkhöz. Folytatod?')) {
                                    await resetDefaults()
                                    window.location.reload()
                                }
                            }}
                            className="bg-lime/20 text-lime hover:bg-lime/30 border-lime/50"
                            icon={Database}
                        >
                            Frissítés
                        </Button>
                    </div>

                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-medium">Kijelentkezés</h4>
                            <p className="text-white/60 text-sm">
                                Biztonságos kijelentkezés az eszközről.
                            </p>
                        </div>
                        <Button
                            onClick={signOut}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50"
                            icon={LogOut}
                        >
                            Kijelentkezés
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="text-center text-white/20 text-xs py-4">
                Limi App v1.0.0 • Made with ❤️ for Noé
            </div>
        </div>
    )
}

export default SettingsView
