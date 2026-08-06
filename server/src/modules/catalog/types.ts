export interface ICategoryRow {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  image_url: string | null;
  position: number;
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
  },
];
