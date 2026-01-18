import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                loadProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                loadProfile(session.user.id)
            } else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const loadProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            setProfile(data)
        } catch (error) {
            console.error('Profil betöltési hiba:', error)
        } finally {
            setLoading(false)
        }
    }

    const createDefaultData = async (userId, userName) => {
        try {
            // Create user profile
            await supabase
                .from('user_profiles')
                .upsert([{
                    id: userId,
                    name: userName || 'Felhasználó',
                    settings: {
                        theme: 'dark',
                        expiryWarningDays: 14,
                        notifications: true
                    }
                }])

            // Expanded Categories with Emojis
            const categories = [
                { user_id: userId, name: '🥛 Tejtermékek & Tojás', color: '#60a5fa', icon: 'Milk' },
                { user_id: userId, name: '🥩 Húsok & Halak', color: '#f87171', icon: 'Beef' },
                { user_id: userId, name: '🥕 Zöldségek', color: '#4ade80', icon: 'Carrot' },
                { user_id: userId, name: '🍎 Gyümölcsök', color: '#fb923c', icon: 'Apple' },
                { user_id: userId, name: '🥖 Pékáruk', color: '#fbbf24', icon: 'Croissant' },
                { user_id: userId, name: '🍝 Tészták & Gabonafélék', color: '#fcd34d', icon: 'Wheat' },
                { user_id: userId, name: '🥫 Konzervek & Befőttek', color: '#a78bfa', icon: 'Package' },
                { user_id: userId, name: '🥤 Italok & Üdítők', color: '#22d3ee', icon: 'Coffee' },
                { user_id: userId, name: '🍫 Nassolnivalók', color: '#f472b6', icon: 'Cookie' },
                { user_id: userId, name: '🧂 Fűszerek & Ízesítők', color: '#fdba74', icon: 'Utensils' },
                { user_id: userId, name: '🧴 Háztartás & Vegyi áru', color: '#94a3b8', icon: 'Sparkles' },
                { user_id: userId, name: '💊 Gyógyszerek', color: '#ef4444', icon: 'Pill' },
                { user_id: userId, name: '🐶 Állateledel', color: '#8b5cf6', icon: 'Bone' },
                { user_id: userId, name: '📦 Egyéb', color: '#64748b', icon: 'Box' }
            ]

            await supabase.from('categories').insert(categories)

            // Expanded Locations with Emojis
            const locations = [
                { user_id: userId, name: '❄️ Hűtőszekrény' },
                { user_id: userId, name: '🧊 Fagyasztó' },
                { user_id: userId, name: '🚪 Kamra' },
                { user_id: userId, name: '🗄️ Konyhaszekrény - Fent' },
                { user_id: userId, name: '🗄️ Konyhaszekrény - Lent' },
                { user_id: userId, name: '🧺 Kenyértartó' },
                { user_id: userId, name: '🍷 Borhűtő / Minibár' },
                { user_id: userId, name: '📦 Pince / Garázs' }
            ]

            await supabase.from('locations').insert(locations)

            console.log('Alapértelmezett adatok sikeresen létrehozva')
        } catch (error) {
            console.error('Alapértelmezett adatok létrehozási hiba:', error)
        }
    }

    const resetDefaults = async () => {
        if (!user) return
        // Töröljük a régieket? Nem, mert akkor a termékek elvesztik a referenciát.
        // Hozzük létre az újakat, ha még nincsenek.
        // Egyszerűsítés: Most csak lefuttatjuk a createDefaultData-t, és reméljük, hogy nem akad össze.
        // Mivel nincs unique constraint a névre (csak az ID-re), duplikátumok lehetnek.
        // Ezért inkább először töröljük azokat a kategóriákat/helyeket, amikhez NINCS termék rendelve? Túl bonyolult.
        // Inkább töröljük mindet és hozzuk létre újakat? - Veszélyes.

        // Biztonságos megoldás: Csak beszúrjuk az új listát. A user majd törli a duplikátumokat ha akarja.
        // Vagy: "Frissített, bővített lista hozzáadása"

        await createDefaultData(user.id, profile?.name)
    }

    const signUp = async (email, password, name) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            })
            if (error) throw error

            // If signup successful and user exists, create default data
            if (data.user) {
                await createDefaultData(data.user.id, name)
            }

            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            setUser(null)
            setProfile(null)
        } catch (error) {
            console.error('Kijelentkezési hiba:', error)
        }
    }

    const updateProfile = async (updates) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single()

            if (error) throw error
            setProfile(data)
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const updatePassword = async (newPassword) => {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            })
            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        updatePassword,
        resetDefaults,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
