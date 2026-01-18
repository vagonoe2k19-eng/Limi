import { differenceInDays, format, parseISO, isBefore, isAfter, startOfDay } from 'date-fns'
import { hu } from 'date-fns/locale'

// Get expiry status for a product
export const getExpiryStatus = (expiryDate, warningDays = 14) => {
    if (!expiryDate) return { status: 'unknown', daysLeft: null, color: 'gray' }

    const today = startOfDay(new Date())
    const expiry = startOfDay(parseISO(expiryDate))
    const daysLeft = differenceInDays(expiry, today)

    if (isBefore(expiry, today)) {
        return { status: 'expired', daysLeft, color: 'red', label: 'Lejárt' }
    } else if (daysLeft <= 3) {
        return { status: 'critical', daysLeft, color: 'red', label: 'Kritikus' }
    } else if (daysLeft <= warningDays) {
        return { status: 'warning', daysLeft, color: 'yellow', label: 'Figyelem' }
    } else {
        return { status: 'good', daysLeft, color: 'green', label: 'Rendben' }
    }
}

// Get the earliest expiry date from batches
export const getEarliestExpiry = (batches) => {
    if (!batches || batches.length === 0) return null

    const validBatches = batches.filter(b => b.expiryDate)
    if (validBatches.length === 0) return null

    return validBatches.reduce((earliest, batch) => {
        const batchDate = parseISO(batch.expiryDate)
        return isBefore(batchDate, parseISO(earliest)) ? batch.expiryDate : earliest
    }, validBatches[0].expiryDate)
}

// Format date in Hungarian
export const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
        return format(parseISO(dateString), 'yyyy. MMM d.', { locale: hu })
    } catch {
        return dateString
    }
}

// Get total quantity from batches
export const getTotalQuantity = (batches) => {
    if (!batches || batches.length === 0) return 0
    return batches.reduce((total, batch) => total + (batch.quantity || 0), 0)
}

// Fetch product info from Open Food Facts API
export const fetchProductFromAPI = async (barcode) => {
    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
        const data = await response.json()

        if (data.status === 1 && data.product) {
            return {
                name: data.product.product_name || data.product.product_name_hu || 'Ismeretlen termék',
                brand: data.product.brands || '',
                category: data.product.categories_tags?.[0]?.replace('en:', '') || '',
                image: data.product.image_url || null,
            }
        }
        return null
    } catch (error) {
        console.error('API lekérdezési hiba:', error)
        return null
    }
}

// Generate unique ID for batches
export const generateBatchId = () => {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
