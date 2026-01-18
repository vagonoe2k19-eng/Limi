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
        <div className="min-h-screen w-full flex bg-forest text-white overflow-hidden">
            {/* Left Side - Visual (Desktop only) */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex w-1/2 relative bg-cover bg-center overflow-hidden"
                style={{ backgroundImage: "url('/login-bg.png')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/20 to-transparent" />
                <div className="absolute inset-0 bg-lime/10 mix-blend-overlay" />

                <div className="absolute bottom-16 left-12 z-10 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-lime/20 backdrop-blur-md rounded-xl border border-lime/30">
                                <Sparkles className="text-lime" size={24} />
                            </div>
                            <span className="text-xl font-medium text-lime tracking-widest uppercase">Limi App</span>
                        </div>
                        <h1 className="text-6xl font-bold mb-6 text-white leading-tight">
                            A frissesség <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime to-emerald">
                                új szintje.
                            </span>
                        </h1>
                        <p className="text-xl text-white/70 max-w-lg leading-relaxed">
                            Kövesd nyomon készleteidet stílusosan. Kevesebb hulladék, több megtakarítás, prémium élmény.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                {/* Mobile Background Texture */}
                <div className="absolute inset-0 lg:hidden bg-[url('/login-bg.png')] bg-cover bg-center opacity-10 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-md z-10 relative"
                >
                    <div className="mb-10">
                        <h2 className="text-4xl font-bold mb-3 text-white">
                            {isLogin ? 'Üdvözöllek!' : 'Fiók létrehozása'}
                        </h2>
                        <p className="text-white/50 text-lg">
                            {isLogin ? 'Add meg adataidat a belépéshez.' : 'Csatlakozz a Limi közösséghez még ma.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <Input
                                label="Teljes Név"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                icon={User}
                                placeholder="pl. Kovács János"
                                required={!isLogin}
                                className="bg-white/5 border-white/10 focus:bg-white/10"
                            />
                        )}

                        <Input
                            label="Email Cím"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={Mail}
                            placeholder="pelda@email.com"
                            required
                            className="bg-white/5 border-white/10 focus:bg-white/10"
                        />

                        <Input
                            label="Jelszó"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={Lock}
                            placeholder="••••••••"
                            required
                            className="bg-white/5 border-white/10 focus:bg-white/10"
                        />

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-4 text-lg shadow-lg shadow-lime/20 hover:shadow-lime/40 mt-4"
                            loading={loading}
                        >
                            {isLogin ? 'Belépés a fiókba' : 'Regisztráció indítása'}
                        </Button>
                    </form>

                    {/* Switcher */}
                    <div className="mt-8 text-center pt-6 border-t border-white/5">
                        <p className="text-white/40">
                            {isLogin ? 'Nincs még fiókod?' : 'Már van fiókod?'}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin)
                                    setError('')
                                }}
                                className="ml-2 text-lime hover:text-white font-medium transition-colors hover:underline underline-offset-4"
                            >
                                {isLogin ? 'Regisztrálj ingyen' : 'Jelentkezz be'}
                            </button>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default AuthPage
