/**
 * client.js — Axios instance for DukaSync API calls.
 * All requests go through /api (proxied to FastAPI by Vite in dev).
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// --- Shops ---
export const getShops = () => api.get('/shops')
export const createShop = (data) => api.post('/shops', data)

// --- Products ---
export const getProducts = (shopId) =>
  api.get('/products', { params: shopId ? { shop_id: shopId } : {} })
export const getLowStockProducts = () => api.get('/products/low-stock')
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.patch(`/products/${id}`, data)

// --- Sales ---
export const recordSale = (data) => api.post('/sales', data)
export const getSales = (productId) =>
  api.get('/sales', { params: productId ? { product_id: productId } : {} })

// --- Suppliers ---
export const getSuppliers = () => api.get('/suppliers')
export const createSupplier = (data) => api.post('/suppliers', data)

// --- Restock Orders ---
export const getRestockOrders = (statusFilter) =>
  api.get('/restock-orders', {
    params: statusFilter ? { status_filter: statusFilter } : {},
  })
export const updateRestockOrder = (id, data) =>
  api.patch(`/restock-orders/${id}`, data)

export default api
