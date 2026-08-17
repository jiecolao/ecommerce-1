export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Product & Catalog Types
export interface Product {
  id: number;
  sellerId: string;
  title: string;
  media: string[];
  type: string;
  description: string;
  developer?: string;
  publisher?: string;
  systemRequirements?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
  productVariants?: ProductVariant[];
}

export interface ProductVariant {
  productId: number;
  storeId: number;
  typeId: number;
  name: string;
  region: number;
  languageSupport: string[];
  storePage?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  title: string;
  type: string;
  description: string;
  developer?: string;
  publisher?: string;
  systemRequirements?: string;
  tags?: string;
  media?: string[];
  variants?: {
    storeId: number;
    typeId: number;
    name: string;
    region: number;
    languageSupport: string[];
    storePage?: string;
    price: number;
  }[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ListCatalogQueryDto {
  limit?: number;
  search?: string;
}

// Buyer Types
export interface CheckoutDto {
  productId: number;
  totalAmount: number;
}

export interface Order {
  id: number;
  buyerId: string;
  productId: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  product?: Product; // Populated by relations
}

// Seller Dashboard Types
export interface SellerReport {
  totalRevenueCents: number;
  totalOrders: number;
  topSellingProducts: {
    productId: number;
    title: string;
    quantitySold: number;
    revenueCents: number;
  }[];
}
