import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Hook for managing categories
export const useCategories = () => {
    const { user } = useAuth()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        loadCategories()

        // Subscribe to realtime changes
        const subscription = supabase
            .channel('categories_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${user.id}` },
                () => loadCategories()
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [user])

    const loadCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', user.id)
                .order('name')

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Kategóriák betöltési hiba:', error)
        } finally {
            setLoading(false)
        }
    }

    const addCategory = async (name, color, icon) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([{ user_id: user.id, name, color, icon }])
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const updateCategory = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const deleteCategory = async (id) => {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    return { categories, loading, addCategory, updateCategory, deleteCategory }
}

// Hook for managing locations
export const useLocations = () => {
    const { user } = useAuth()
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        loadLocations()

        // Subscribe to realtime changes
        const subscription = supabase
            .channel('locations_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'locations', filter: `user_id=eq.${user.id}` },
                () => loadLocations()
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [user])

    const loadLocations = async () => {
        try {
            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .eq('user_id', user.id)
                .order('name')

            if (error) throw error
            setLocations(data || [])
        } catch (error) {
            console.error('Tárolóhelyek betöltési hiba:', error)
        } finally {
            setLoading(false)
        }
    }

    const addLocation = async (name) => {
        try {
            const { data, error } = await supabase
                .from('locations')
                .insert([{ user_id: user.id, name }])
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const updateLocation = async (id, name) => {
        try {
            const { data, error } = await supabase
                .from('locations')
                .update({ name })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const deleteLocation = async (id) => {
        try {
            const { error } = await supabase
                .from('locations')
                .delete()
                .eq('id', id)

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    return { locations, loading, addLocation, updateLocation, deleteLocation }
}

// Hook for managing products
export const useProducts = () => {
    const { user } = useAuth()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        loadProducts()

        // Subscribe to realtime changes
        const subscription = supabase
            .channel('products_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'products', filter: `user_id=eq.${user.id}` },
                () => loadProducts()
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [user])

    const loadProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          category:categories(*),
          location:locations(*)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Termékek betöltési hiba:', error)
        } finally {
            setLoading(false)
        }
    }

    const addProduct = async (productData) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([{ ...productData, user_id: user.id }])
                .select(`
          *,
          category:categories(*),
          location:locations(*)
        `)
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const updateProduct = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id)
                .select(`
          *,
          category:categories(*),
          location:locations(*)
        `)
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const deleteProduct = async (id) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id)

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    return { products, loading, addProduct, updateProduct, deleteProduct, reload: loadProducts }
}

// Hook for smart product knowledge
export const useProductKnowledge = () => {
    const { user } = useAuth()

    const getLearnedProduct = async (barcode) => {
        try {
            const { data, error } = await supabase
                .from('custom_product_knowledge')
                .select(`
          *,
          category:categories(*),
          location:locations(*)
        `)
                .eq('user_id', user.id)
                .eq('barcode', barcode)
                .single()

            if (error && error.code !== 'PGRST116') throw error
            return data
        } catch (error) {
            console.error('Tanult termék lekérdezési hiba:', error)
            return null
        }
    }

    const saveProductKnowledge = async (barcode, name, categoryId, locationId) => {
        try {
            const { data, error } = await supabase
                .from('custom_product_knowledge')
                .upsert({
                    user_id: user.id,
                    barcode,
                    learned_name: name,
                    learned_category_id: categoryId,
                    learned_location_id: locationId,
                    use_count: 1
                }, {
                    onConflict: 'user_id,barcode',
                    ignoreDuplicates: false
                })
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    return { getLearnedProduct, saveProductKnowledge }
}
