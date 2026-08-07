import { ICategory } from '@/entities/category';
import { IProduct } from '@/entities/product';

export const SectionTypes = {
  bannerCarousel: 'banner_carousel',
  categoryGrid: 'category_grid',
  productRail: 'product_rail',
  promoBlock: 'promo_block',
} as const;

export type TSectionType = (typeof SectionTypes)[keyof typeof SectionTypes];

export const BannerActionTypes = {
  none: 'none',
  category: 'category',
  product: 'product',
  link: 'link',
} as const;

export type TBannerActionType = (typeof BannerActionTypes)[keyof typeof BannerActionTypes];

export interface IBanner {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  actionType: string;
  actionValue: string | null;
}

export interface IStorefrontSection {
  id: string;
  type: string;
  title: string | null;
  params: Record<string, unknown>;
  items: unknown[];
}

export interface ISectionHandlers {
  currencySymbol: string;
  brandTitle: string;
  onProductPress: (product: IProduct) => void;
  onCategoryPress: (category: ICategory) => void;
  onBannerPress: (banner: IBanner) => void;
}

export const SectionEmptyMessage = 'Раздел пока не заполнен';
