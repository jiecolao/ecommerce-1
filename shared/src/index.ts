// User Types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Product & Catalog Types
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Product {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  inventoryCount: number;
  isFeatured: boolean;
  status: ProductStatus;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  title: string;
  description: string;
  priceCents: number;
  inventoryCount: number;
  isFeatured?: boolean;
  status?: ProductStatus;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ListCatalogQueryDto {
  limit?: number;
  search?: string;
}

// Buyer Types
export interface CheckoutItemDto {
  productId: string;
  quantity: number;
}

export interface CheckoutDto {
  billingName: string;
  billingEmail: string;
  notes?: string;
  items: CheckoutItemDto[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceCents: number;
  product?: Product;
}

export interface Order {
  id: string;
  buyerId: string;
  totalCents: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  items: OrderItem[];
}

export interface OrderInvoice {
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  totalCents: number;
  date: string;
  items: {
    title: string;
    quantity: number;
    priceCents: number;
  }[];
}

// Seller Dashboard Types
export interface SellerReport {
  totalRevenueCents: number;
  totalOrders: number;
  topSellingProducts: {
    productId: string;
    title: string;
    quantitySold: number;
  }[];
}
