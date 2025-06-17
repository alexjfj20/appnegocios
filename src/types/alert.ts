export interface Alert {
  id: string;
  type: 'low_stock' | 'expiring' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertFilters {
  showRead: boolean;
} 