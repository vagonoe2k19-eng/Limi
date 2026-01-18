import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Package } from 'lucide-react'
import ProductCard from './ProductCard'
import ProductForm from './ProductForm'
import BarcodeScanner from '../scanner/BarcodeScanner'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import { ListSkeleton } from '../ui/LoadingSkeleton'
import { useProducts, useCategories, useLocations } from '../../hooks/useData'

const ProductList = () => {
    const [editingProduct, setEditingProduct] = useState(null)
    const [scannerOpen, setScannerOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const [filterLocation, setFilterLocation] = useState('')

    const { products, loading, deleteProduct, reload } = useProducts()
    const { categories } = useCategories()
    const { locations } = useLocations()

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !filterCategory || product.category_id === filterCategory
        const matchesLocation = !filterLocation || product.location_id === filterLocation
        return matchesSearch && matchesCategory && matchesLocation
    })

    const handleDelete = async (product) => {
        if (confirm(`Biztosan törölni szeretnéd: ${product.name}?`)) {
            await deleteProduct(product.id)
        }
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
    }

    const handleProductUpdated = async () => {
        setEditingProduct(null)
        await reload()
    }

    if (loading) {
        return <ListSkeleton count={4} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gradient">Termékek</h2>
                    <p className="text-white/60 text-sm mt-1">
                        {filteredProducts.length} termék
                    </p>
                </div>

                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => setScannerOpen(true)}
                >
                    Új termék
                </Button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 space-y-4">
                <Input
                    placeholder="Keresés név alapján..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={Search}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Kategória
                        </label>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="input-primary"
                        >
                            <option value="">Összes kategória</option>
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
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="input-primary"
                        >
                            <option value="">Összes tárolóhely</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Package size={40} className="text-white/40" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {searchQuery || filterCategory || filterLocation
                            ? 'Nincs találat'
                            : 'Még nincs termék'}
                    </h3>
                    <p className="text-white/60 mb-6">
                        {searchQuery || filterCategory || filterLocation
                            ? 'Próbálj meg más keresési feltételeket'
                            : 'Kezdd el a vonalkód szkennelésével vagy kézi bevitellel'}
                    </p>
                    {!searchQuery && !filterCategory && !filterLocation && (
                        <Button
                            variant="primary"
                            icon={Plus}
                            onClick={() => setScannerOpen(true)}
                        >
                            Első termék hozzáadása
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Scanner Modal */}
            <BarcodeScanner
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onProductAdded={() => {
                    setScannerOpen(false)
                    reload()
                }}
            />

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingProduct}
                onClose={() => setEditingProduct(null)}
                title="Termék szerkesztése"
            >
                {editingProduct && (
                    <ProductForm
                        initialData={editingProduct}
                        onSave={handleProductUpdated}
                        onCancel={() => setEditingProduct(null)}
                    />
                )}
            </Modal>
        </div>
    )
}

export default ProductList
