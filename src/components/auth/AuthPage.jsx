import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Sparkles } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Card from '../ui/Card'

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { signIn, signUp } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLogin) {
                const { error } = await signIn(email, password)
                if (error) throw error
            } else {
                if (!name.trim()) {
                    throw new Error('A név megadása kötelező')
                }
                const { error } = await signUp(email, password, name)
                if (error) throw error
            }
        } catch (err) {
            setError(err.message || 'Hiba történt. Próbáld újra!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-lime to-emerald mb-4">
                        <Sparkles size={40} className="text-forest" />
                    </div>
                    <h1 className="text-4xl font-bold text-gradient mb-2">Limi</h1>
                    <p className="text-white/60">Prémium lejárati idő követő</p>
                </motion.div>

                {/* Auth Card */}
                <Card>
                    {/* Tab Switcher */}
                    <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 rounded-lg font-medium transition-all duration-300 ${isLogin
                                ? 'bg-gradient-to-r from-lime to-emerald text-forest'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            Bejelentkezés
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 rounded-lg font-medium transition-all duration-300 ${!isLogin
                                ? 'bg-gradient-to-r from-lime to-emerald text-forest'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            Regisztráció
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <Input
                                label="Név"
                                type="text"
                                placeholder="Teljes neved"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                icon={User}
                                autoComplete="name"
                                required
                            />
                        )}

                        <Input
                            label="Email"
                            type="email"
                            placeholder="pelda@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={Mail}
                            autoComplete="email"
                            required
                        />

                        <Input
                            label="Jelszó"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={Lock}
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            required
                        />

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            loading={loading}
                            disabled={loading}
                        >
                            {isLogin ? 'Bejelentkezés' : 'Regisztráció'}
                        </Button>
                    </form>

                    {!isLogin && (
                        <p className="mt-4 text-xs text-white/40 text-center">
                            A regisztrációval elfogadod az Általános Szerződési Feltételeket
                        </p>
                    )}
                </Card>

                {/* Footer */}
                <p className="mt-6 text-center text-white/40 text-sm">
                    Készítve ❤️ -vel a Limi csapat által
                </p>
            </div>
        </div>
    )
}

export default AuthPage
