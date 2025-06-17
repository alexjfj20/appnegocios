export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  total: number;
  status: string;
  payment_method: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
} 