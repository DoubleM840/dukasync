export interface Shop {
  id: number
  name: string
  location?: string | null
  owner_name?: string | null
  phone?: string | null
}

export interface Product {
  id: number
  shop_id: number
  name: string
  sku?: string | null
  quantity_in_stock: number
  reorder_threshold: number
  unit_price: number
  is_low_stock: boolean
}

export interface Sale {
  id: number
  shop_id: number
  product_id: number
  quantity_sold: number
  sale_price: number
  sold_at: string
}

export interface RestockOrder {
  id: number
  product_id: number
  supplier_id?: number | null
  quantity_ordered: number
  status: string
  triggered_at: string
  created_at?: string
  product_name?: string
  supplier_name?: string | null
}
