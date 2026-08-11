export interface IListEnvelope<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

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
  price: number;
  oldPrice: number | null;
  categoryId: string | null;
  inStock: boolean;
  attributes: Record<string, string>;
  variants: IProductVariant[];
  media: string[];
  unit?: string;
}

export interface ICategory {
  id: string;
  slug: string;
  name: string;
  parentId?: string | null;
  imageUrl?: string | null;
  position?: number;
  isActive?: boolean;
}

export interface IAttribute {
  id: string;
  code: string;
  name: string;
  isVariantOption: boolean;
  isFilterable: boolean;
  position: number;
  values: string[];
}

export interface IBanner {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  actionType: string;
  actionValue: string | null;
  position: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

export interface IStockItem {
  id: string;
  sku: string;
  options: Record<string, string>;
  stock: number;
  price: number;
  productId: string;
  productName: string;
  isActive: boolean;
}

export interface IOrderItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IOrder {
  id: string;
  number: string;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  grandTotal: number;
  currency: string;
  customer: Record<string, unknown> | null;
  comment: string | null;
  createdAt: string;
  items: IOrderItem[];
}

export type TProductList = IListEnvelope<IProduct>;

export type TCategoryList = IListEnvelope<ICategory>;

export type TAttributeList = IListEnvelope<IAttribute>;

export type TBannerList = IListEnvelope<IBanner>;

export type TStockList = IListEnvelope<IStockItem>;

export type TOrderList = IListEnvelope<IOrder>;
