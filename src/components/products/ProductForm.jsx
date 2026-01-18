import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Calendar } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useCategories, useLocations, useProducts, useProductKnowledge } from '../../hooks/useData'
import { generateBatchId } from '../../lib/utils'
import { playSuccessSound } from '../../lib/sounds'

const ProductForm = ({ initialData, onSave, onCancel }) => {
    const [name, setName] = useState(initialData?.name || '')
    const [barcode, setBarcode] = useState(initialData?.barcode || '')
    const [categoryId, setCategoryId] = useState(initialData?.category_id || '')
    const [locationId, setLocationId] = useState(initialData?.location_id || '')
    const [batches, setBatches] = useState([
        { id: generateBatchId(), expiryDate: '', quantity: 1 }
    ])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { categories } = useCategories()
    const { locations } = useLocations()
    const { addProduct, updateProduct } = useProducts()
    const { saveProductKnowledge } = useProductKnowledge()

    const addBatch = () => {
        setBatches([...batches, { id: generateBatchId(), expiryDate: '', quantity: 1 }])
    }

    const removeBatch = (id) => {
        if (batches.length > 1) {
            setBatches(batches.filter(b => b.id !== id))
        }
    }

    const updateBatch = (id, field, value) => {
        setBatches(batches.map(b =>
            b.id === id ? { ...b, [field]: value } : b
        ))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!name.trim()) {
            setError('A termék neve kötelező!')
            return
        }

        const validBatches = batches.filter(b => b.expiryDate && b.quantity > 0)
        if (validBatches.length === 0) {
            setError('Legalább egy tételt meg kell adni!')
            return
        }

        setLoading(true)

        try {
            const productData = {
                name: name.trim(),
                barcode: barcode || null,
                category_id: categoryId || null,
                location_id: locationId || null,
                batches: validBatches.map(b => ({
                    ...b,
                    addedAt: b.addedAt || new Date().toISOString()
                }))
            }

            let result

            if (initialData?.id) {
                // Update existing product
                result = await updateProduct(initialData.id, productData)
            } else {
                // Create new product
                result = await addProduct(productData)
            }

            if (result.error) throw result.error

            // Save to learning database if barcode exists and name was edited
            // Only learn if it's a new product or significant change, avoiding spam
            if (barcode && (!initialData?.id || initialData.source !== 'learned')) {
                await saveProductKnowledge(barcode, name.trim(), categoryId, locationId)
            }

            playSuccessSound()
            onSave?.(result.data)
        } catch (err) {
            console.error('Termék mentési hiba:', err)
            setError(err.message || 'Hiba történt a mentés során')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Info */}
            <div className="space-y-4">
                <Input
                    label="Termék neve *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="pl. Tej 1L"
                    required
                />

                {initialData?.barcode && (
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Vonalkód
                        </label>
                        <div className="px-4 py-3 bg-white/5 rounded-xl text-white/60 font-mono">
                            {initialData.barcode}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Kategória
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="input-primary"
                        >
                            <option value="">Válassz...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Tárolóhely
                        </label>
                        <select
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                            className="input-primary"
                        >
                            <option value="">Válassz...</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Batches */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white/80">
                        Tételek *
                    </label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon={Plus}
                        onClick={addBatch}
                    >
                        Új tétel
                    </Button>
                </div>

                <div className="space-y-3">
                    {batches.map((batch, index) => (
                        <motion.div
                            key={batch.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-4 flex gap-3 items-end"
                        >
                            <div className="flex-1">
                                <label className="block text-xs text-white/60 mb-1">
                                    Lejárati dátum
                                </label>
                                <input
                                    type="date"
                                    value={batch.expiryDate}
                                    onChange={(e) => updateBatch(batch.id, 'expiryDate', e.target.value)}
                                    className="input-primary text-sm"
                                    required
                                />
                            </div>

                            <div className="w-24">
                                <label className="block text-xs text-white/60 mb-1">
                                    Mennyiség
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={batch.quantity}
                                    onChange={(e) => updateBatch(batch.id, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                    onBlur={() => !batch.quantity && updateBatch(batch.id, 'quantity', 1)}
                                    className="input-primary text-sm"
                                    required
                                />
                            </div>

                            {batches.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeBatch(batch.id)}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Source Info */}
            {initialData?.source && (
                <div className="text-xs text-white/40 text-center">
                    {initialData.source === 'learned' && '✨ Tanult termék - automatikusan kitöltve'}
                    {initialData.source === 'api' && '🌐 Adatok az Open Food Facts-ből'}
                    {initialData.source === 'manual' && '✍️ Kézi bevitel'}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Mégse
                </Button>

                <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    loading={loading}
                    disabled={loading}
                >
                    Mentés
                </Button>
            </div>
        </form>
    )
}

export default ProductForm
