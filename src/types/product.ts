export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  min_stock: number;
  category_id: string;
  sku: string;
  is_active: boolean;
  imageUrl?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  min_stock: number;
  category_id: string;
  sku: string;
  is_active: boolean;
  imageUrl?: string;
} 