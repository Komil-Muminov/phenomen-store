export interface ISectionRow {
  id: string;
  type: string;
  title: string | null;
  position: number;
  params: Record<string, unknown>;
}

export interface IBannerRow {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  action_type: string;
  action_value: string | null;
}

export interface IResolvedSection {
  id: string;
  type: string;
  title: string | null;
  params: Record<string, unknown>;
  items: unknown[];
}

export const SectionTypes = {
  bannerCarousel: 'banner_carousel',
  categoryGrid: 'category_grid',
  productRail: 'product_rail',
  promoBlock: 'promo_block',
} as const;

export const SectionDefaults = {
  railLimit: 10,
  categoryLimit: 8,
} as const;
