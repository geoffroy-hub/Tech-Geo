export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  images?: string[];
  image_url?: string;
  stock: number;
  available: boolean;
  featured?: boolean;
  rating?: number;
  created_at: string;
}

export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  category: string;
  level: 'debutant' | 'intermediaire' | 'avance';
  image?: string;
  published: boolean;
  views?: number;
  created_at: string;
}

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  is_base64?: boolean;
  mime_type?: string;
  created_at: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: string;
  payment_status: string;
  customer: any;
  user_id?: string;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock?: number;
}

export interface WishlistItem {
  id: string;
  item_id: string;
  item_type: 'product' | 'tutorial';
  created_at: string;
}

export interface SiteSettings {
  id?: string;
  map_iframe_url?: string;
  [key: string]: any;
}
