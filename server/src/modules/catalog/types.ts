export interface ICategoryRow {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  description?: string | null;
  image_url: string | null;
  position: number;
  is_active?: boolean;
}

export interface IVariantRow {
  id: string;
  sku: string;
  options: Record<string, string>;
  price: string;
  old_price: string | null;
  stock: number;
  is_active: boolean;
}

export interface IProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  brand: string | null;
  category_id: string | null;
  product_type: string;
  unit: string;
  base_price: string;
  old_price: string | null;
  currency: string;
  attributes: Record<string, unknown>;
  rating: string;
  reviews_count: number;
  media: string[];
  variants: IVariantRow[];
  min_price: string | null;
  in_stock: boolean;
}

export interface IProductSearchParams {
  query: string | null;
  categoryId: string | null;
  sort: string;
  minPrice: number | null;
  maxPrice: number | null;
  options: Record<string, string[]>;
  limit: number;
  offset: number;
}

export const ProductSort = {
  popular: 'popular',
  priceAsc: 'price_asc',
  priceDesc: 'price_desc',
  newest: 'newest',
} as const;

export const ProductSortSql: Record<string, string> = {
  popular: 'p.rating DESC, p.reviews_count DESC',
  price_asc: 'min_price ASC',
  price_desc: 'min_price DESC',
  newest: 'p.created_at DESC',
};

export const SearchLanguage = 'russian';

export const DemoSizes = ['XS', 'S', 'M', 'L', 'XL'];

export const DemoProducts = [
  {
    slug: 'oversize-hoodie',
    name: 'Худи oversize',
    category: 'women',
    brand: 'PHENOMEN',
    price: 5490,
    oldPrice: 6990,
    colors: ['Чёрный', 'Молочный'],
    attributes: { material: 'Хлопок 80%', season: 'Демисезон', fit: 'Oversize' },
    media: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    slug: 'straight-jeans',
    name: 'Джинсы прямого кроя',
    category: 'women',
    brand: 'PHENOMEN',
    price: 6990,
    oldPrice: null,
    colors: ['Синий', 'Чёрный'],
    attributes: { material: 'Деним', season: 'Всесезон', fit: 'Straight' },
    media: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582418702059-97ebdfb35d09?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    slug: 'wool-coat',
    name: 'Пальто шерстяное',
    category: 'women',
    brand: 'PHENOMEN',
    price: 18900,
    oldPrice: 24900,
    colors: ['Бежевый', 'Графит'],
    attributes: { material: 'Шерсть 70%', season: 'Зима', fit: 'Regular' },
    media: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    slug: 'basic-tshirt',
    name: 'Футболка базовая',
    category: 'men',
    brand: 'PHENOMEN',
    price: 1990,
    oldPrice: null,
    colors: ['Белый', 'Чёрный', 'Хаки'],
    attributes: { material: 'Хлопок 100%', season: 'Лето', fit: 'Regular' },
    media: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    slug: 'bomber-jacket',
    name: 'Бомбер утеплённый',
    category: 'men',
    brand: 'PHENOMEN',
    price: 12400,
    oldPrice: 14900,
    colors: ['Хаки', 'Чёрный'],
    attributes: { material: 'Нейлон', season: 'Демисезон', fit: 'Regular' },
    media: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    slug: 'leather-belt',
    name: 'Ремень кожаный',
    category: 'accessories',
    brand: 'PHENOMEN',
    price: 3200,
    oldPrice: null,
    colors: ['Чёрный', 'Коричневый'],
    attributes: { material: 'Натуральная кожа', season: 'Всесезон' },
    media: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614252369475-531eda835eb1?q=80&w=800&auto=format&fit=crop',
    ],
  },
];
