import axios from 'axios'
import toast from 'react-hot-toast'
import type { Product, RestockOrder, Sale, Shop } from '../types/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  shop_id: number
  role?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface ProductCreate {
  shop_id: number
  name: string
  sku?: string
  quantity_in_stock?: number
  reorder_threshold?: number
  reorder_quantity?: number
  unit_price?: number
  supplier_id?: number
}

export interface StockAdjustmentCreate {
  quantity_change: number
  reason: string
}

export interface SaleCreate {
  shop_id: number
  product_id: number
  quantity_sold: number
  sale_price: number
  notes?: string
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  const maskedToken = token ? `${token.slice(0, 10)}...${token.slice(-6)}` : 'none'
  console.debug('[API request]', {
    url: `${config.baseURL ?? ''}${config.url ?? ''}`,
    headers: { ...config.headers, Authorization: `Bearer ${maskedToken}` },
  })
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url ?? '')
    if (error.response?.status === 401 && !requestUrl.includes('/auth/')) {
      window.localStorage.removeItem('access_token')
      toast.error('Session expired. Please log in again.')
      if (window.location.pathname !== '/login') window.location.assign('/login')
    } else if (!error.response || error.response.status >= 500) {
      toast.error('Connection issue. Tap to retry.')
    }
    return Promise.reject(error)
  },
)

export const getShops = () => api.get<Shop[]>('/shops')
export const login = (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data)
export const register = (data: RegisterRequest) => api.post('/auth/register', data)
export const listInventory = (shopId: number) =>
  api.get<Product[]>(`/../shops/${shopId}/inventory`)
export const createProduct = (data: ProductCreate) => api.post<Product>('/products', data)
export const updateProduct = (id: number, data: Partial<ProductCreate>) => api.patch<Product>(`/products/${id}`, data)
export const adjustStock = (id: number, data: StockAdjustmentCreate) => api.patch<Product>(`/products/${id}/stock`, data)
export const createSale = (data: SaleCreate) => api.post<Sale>('/sales', data)
export const getProducts = (shopId?: number) =>
  api.get<Product[]>('/products', { params: shopId ? { shop_id: shopId } : {} })
export const getSales = (productId?: number) =>
  api.get<Sale[]>('/sales', { params: productId ? { product_id: productId } : {} })
export const getRestockOrders = (status?: string) =>
  api.get<RestockOrder[]>('/restock-orders', {
    params: status ? { status_filter: status } : {},
  })
export const listRestockOrders = (status?: string) => getRestockOrders(status)
export const listShopRestockOrders = (shopId: number, status?: string) =>
  api.get<RestockOrder[]>(`/../shops/${shopId}/restock-orders`, {
    params: status ? { status_filter: status } : {},
  })
export const receiveRestockOrder = (shopId: number, orderId: number) =>
  api.patch<RestockOrder>(`/../shops/${shopId}/restock-orders/${orderId}/receive`)

export default api
