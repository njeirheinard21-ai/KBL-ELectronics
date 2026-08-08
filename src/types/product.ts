export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockCount: number;
  features: string[];
  isNew?: boolean;
  hasDeal?: boolean;
}
