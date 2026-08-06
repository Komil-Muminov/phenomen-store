export interface IProductVariant {
  id: string;
  sku: string;
  options: Record<string, string>;
  price: number;
  oldPrice: number | null;
  stock: number;
}

export interface IProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  brand: string | null;
  categoryId: string | null;
  productType: string;
  unit: string;
  price: number;
  oldPrice: number | null;
  currency: string;
  attributes: Record<string, string>;
  rating: number;
  reviewsCount: number;
  media: string[];
  inStock: boolean;
  variants: IProductVariant[];
}

export const VariantOptionCodes = {
  size: 'size',
  color: 'color',
} as const;

export const ProductPlaceholderImage = 'https://placehold.co/600x800/f6f6f7/6b7280?text=PHENOMEN';
