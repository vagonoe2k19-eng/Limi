import { LogOut, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../ui/Button'

const Header = () => {
    const { profile, signOut } = useAuth()

    return (
        <header className="glass-card mb-6 p-4 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-white">
                    Üdv, {profile?.name || 'Felhasználó'}! 👋
                </h1>
                <p className="text-sm text-white/60 mt-1">
                    Tartsd nyilván a termékeid lejárati idejét
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl">
                    <User size={18} className="text-lime" />
                    <span className="text-sm text-white/80">{profile?.name}</span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    icon={LogOut}
                    onClick={signOut}
                >
                    <span className="hidden sm:inline">Kilépés</span>
                </Button>
            </div>
        </header>
    )
}

export default Header
