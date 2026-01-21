export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  category: string;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  total_amount: number;
  payment_method: 'cash' | 'card';
  created_at: string;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id?: string;
  transaction_id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price_at_sale: number;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'staff';
}