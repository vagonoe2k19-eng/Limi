import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Loader, Check, AlertCircle } from 'lucide-react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import ProductForm from '../products/ProductForm'
import { useProductKnowledge } from '../../hooks/useData'
import { fetchProductFromAPI } from '../../lib/utils'
import { playScanSound } from '../../lib/sounds'

const BarcodeScanner = ({ isOpen, onClose, onProductAdded }) => {
    const [scanning, setScanning] = useState(false)
    const [scannedCode, setScannedCode] = useState(null)
    const [productData, setProductData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)

    const scannerRef = useRef(null)
    const html5QrCodeRef = useRef(null)

    const { getLearnedProduct } = useProductKnowledge()

    useEffect(() => {
        if (isOpen && scanning) {
            startScanner()
        }

        return () => {
            stopScanner()
        }
    }, [isOpen, scanning])

    const startScanner = async () => {
        try {
            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode('barcode-scanner')
            }

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            }

            await html5QrCodeRef.current.start(
                { facingMode: 'environment' },
                config,
                onScanSuccess,
                onScanError
            )
        } catch (err) {
            console.error('Szkenner indítási hiba:', err)
            setError('Nem sikerült elindítani a kamerát. Ellenőrizd az engedélyeket!')
            setScanning(false)
        }
    }

    const stopScanner = async () => {
        try {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                await html5QrCodeRef.current.stop()
                html5QrCodeRef.current.clear()
            }
        } catch (err) {
            console.error('Szkenner leállítási hiba:', err)
        }
    }

    const onScanSuccess = async (decodedText) => {
        playScanSound()
        setScannedCode(decodedText)
        setScanning(false)
        await stopScanner()
        await lookupProduct(decodedText)
    }

    const onScanError = (err) => {
        // Ignore scan errors (they happen frequently during scanning)
    }

    const lookupProduct = async (barcode) => {
        setLoading(true)
        setError('')

        try {
            // Step 1: Check custom learned products
            const learnedProduct = await getLearnedProduct(barcode)

            if (learnedProduct) {
                setProductData({
                    barcode,
                    name: learnedProduct.learned_name,
                    category_id: learnedProduct.learned_category_id,
                    location_id: learnedProduct.learned_location_id,
                    source: 'learned',
                })
                setShowForm(true)
                return
            }

            // Step 2: Check Open Food Facts API
            const apiProduct = await fetchProductFromAPI(barcode)

            if (apiProduct) {
                setProductData({
                    barcode,
                    name: apiProduct.name,
                    brand: apiProduct.brand,
                    source: 'api',
                })
                setShowForm(true)
                return
            }

            // Step 3: No data found - manual entry
            setProductData({
                barcode,
                name: '',
                source: 'manual',
            })
            setShowForm(true)
        } catch (err) {
            console.error('Termék keresési hiba:', err)
            setError('Hiba történt a termék keresésekor')
        } finally {
            setLoading(false)
        }
    }

    const handleManualEntry = () => {
        setProductData({
            barcode: null,
            name: '',
            source: 'manual',
        })
        setShowForm(true)
    }

    const handleProductSaved = (product) => {
        setShowForm(false)
        setScannedCode(null)
        setProductData(null)
        onProductAdded?.(product)
        onClose()
    }

    const handleCancel = () => {
        setShowForm(false)
        setScannedCode(null)
        setProductData(null)
        setError('')
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={showForm ? 'Termék hozzáadása' : 'Vonalkód szkennelés'}
            size="lg"
        >
            {!showForm ? (
                <div className="space-y-6">
                    {/* Scanner View */}
                    {scanning ? (
                        <div className="space-y-4">
                            <div
                                id="barcode-scanner"
                                ref={scannerRef}
                                className="w-full aspect-square rounded-xl overflow-hidden bg-black"
                            />

                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => {
                                    setScanning(false)
                                    stopScanner()
                                }}
                            >
                                Mégse
                            </Button>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader className="w-12 h-12 text-lime animate-spin mb-4" />
                            <p className="text-white/60">Termék keresése...</p>
                        </div>
                    ) : scannedCode && productData ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 rounded-full bg-lime/20 flex items-center justify-center mb-4">
                                <Check className="w-8 h-8 text-lime" />
                            </div>
                            <p className="text-white/60 mb-2">Vonalkód beolvasva</p>
                            <p className="text-2xl font-bold text-lime font-mono">{scannedCode}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col items-center justify-center py-12 space-y-6">
                                <div className="w-24 h-24 rounded-full bg-lime/10 flex items-center justify-center">
                                    <Camera className="w-12 h-12 text-lime" />
                                </div>

                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Szkennelj egy vonalkódot
                                    </h3>
                                    <p className="text-white/60">
                                        vagy add meg manuálisan a termék adatait
                                    </p>
                                </div>

                                <div className="flex gap-3 w-full">
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        icon={Camera}
                                        onClick={() => setScanning(true)}
                                    >
                                        Szkennelés
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={handleManualEntry}
                                    >
                                        Kézi bevitel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <ProductForm
                    initialData={productData}
                    onSave={handleProductSaved}
                    onCancel={handleCancel}
                />
            )}
        </Modal>
    )
}

export default BarcodeScanner
