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

export interface IOrderList {
  items: IOrder[];
  total: number;
}

export interface IProductVariant {
  id: string;
  sku: string;
  options: Record<string, string>;
  price: number;
  oldPrice: number | null;
  stock: number;
}

export interface IShopProduct {
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
}

export interface IShopAttribute {
  id: string;
  code: string;
  name: string;
  isVariantOption: boolean;
  isFilterable: boolean;
  position: number;
  values: string[];
}

export interface IShopProductList {
  items: IShopProduct[];
  total: number;
}

export interface IShopCategory {
  id: string;
  slug: string;
  name: string;
}

export interface IShopSession {
  token: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
}
