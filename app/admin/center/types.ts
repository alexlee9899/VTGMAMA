export interface OrderItem {
  product_id: string;
  product_name: string;
  variable_id: string;
  variable_name: string;
  order_id: string;
  qty: number;
  unit_price: number;
  total_price: number;
}

export interface Address {
  _id: string;
  user_id: string;
  recipient_name: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  is_default: boolean;
}

export interface DiscountCode {
  _id: string;
  code: string;
  value: number;
  strat_time: string;
  end_time: string;
  max_usage: number;
  create_at: string;
  min_amount: number;
  discount_type: string;
}

export interface Order {
  order_id: string;
  address: Address;
  discount_code: DiscountCode | null;
  user_id: string;
  track_number: string;
  order_items: OrderItem[];
  total_amount: number;
  sale_amount: number;
  status: string;
  payment_method: string;
  placed_at: string;
  update_at: string;
}

export interface OrderResponse {
  page_idx: number;
  total_page: number;
  orders: Order[];
} 