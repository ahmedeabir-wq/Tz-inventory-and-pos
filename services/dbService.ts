import { supabase } from './supabase';
import { Product, Transaction, TransactionItem } from '../types';

export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as Product[];
};

export const addProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const createTransaction = async (
  userId: string,
  items: { product: Product; quantity: number }[],
  paymentMethod: 'cash' | 'card'
) => {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // 1. Create Transaction Record
  const { data: transaction, error: transError } = await supabase
    .from('transactions')
    .insert([{ user_id: userId, total_amount: total, payment_method: paymentMethod }])
    .select()
    .single();

  if (transError) throw transError;

  // 2. Create Transaction Items
  const transactionItems = items.map(item => ({
    transaction_id: transaction.id,
    product_id: item.product.id,
    product_name: item.product.name,
    quantity: item.quantity,
    price_at_sale: item.product.price
  }));

  const { error: itemsError } = await supabase
    .from('transaction_items')
    .insert(transactionItems);

  if (itemsError) throw itemsError;

  // 3. Update Inventory (Decrement Stock)
  // Note: ideally done via RPC for atomicity, but loop update works for simple POS
  for (const item of items) {
    const newStock = item.product.stock - item.quantity;
    await supabase.from('products').update({ stock: newStock }).eq('id', item.product.id);
  }

  return transaction;
};

export const getTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, transaction_items(*)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};