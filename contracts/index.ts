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
  isActive?: boolean;
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

export interface IOrderTotals {
  itemsTotal: number;
  discountTotal: number;
  deliveryTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
}

export interface IOrder {
  id: string;
  number: string;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  totals: IOrderTotals;
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

export interface ITicket {
  id: string;
  tenantId: string;
  tenantKey: string;
  tenantName: string;
  subject: string;
  topic: string;
  status: string;
  authorLogin: string;
  unreadForPlatform: number;
  unreadForShop: number;
  lastText: string | null;
  lastMessageAt: string;
  createdAt: string;
}

export interface ITicketMessage {
  id: string;
  author: string;
  authorName: string | null;
  text: string;
  unread: boolean;
  createdAt: string;
}

export interface ITicketThread {
  ticket: ITicket;
  messages: ITicketMessage[];
}

export type TTicketList = IListEnvelope<ITicket>;

export interface IPlanLimits {
  products: number | null;
  banners: number | null;
  promotions: number | null;
  categories: number | null;
}

export interface IPlan {
  code: string;
  name: string;
  description: string;
  price: number;
  limits: IPlanLimits;
}

export interface IPlanUsageItem {
  resource: string;
  used: number;
  limit: number | null;
}

export interface IPlanState {
  plan: IPlan;
  usage: IPlanUsageItem[];
}

export interface IOrderPayment {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string | null;
  method: string;
  amount: number;
  currency: string;
  status: string;
  receiptUrl: string | null;
  receiptNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string;
}

export interface IOrderHistoryEntry {
  status: string;
  comment: string | null;
  createdAt: string;
}

export interface IOrderDetail extends IOrder {
  delivery: Record<string, unknown> | null;
  payment: IOrderPayment | null;
  history: IOrderHistoryEntry[];
}

export type TPaymentList = IListEnvelope<IOrderPayment>;
