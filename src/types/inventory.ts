export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Movement {
  id: string;
  product_id: string;
  type: 'entry' | 'exit' | 'adjustment';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  notes?: string;
  created_at: string;
}

export interface CategoryForm {
  name: string;
  description: string;
}

export interface MovementForm {
  type: 'entry' | 'exit' | 'adjustment';
  quantity: number;
  notes: string;
} 