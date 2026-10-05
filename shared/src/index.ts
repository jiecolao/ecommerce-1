export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Product & Catalog Types
export interface Product {
  id: number;
  adminId: string;
  title: string;
  media: string[];
  description: string;
  developer?: string;
  publisher?: string;
  systemRequirements?: string;
  tags?: string[];
  status: string;
  rating?: string;
  createdAt: string;
  updatedAt: string;
  productVariants?: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  productId: number;
  storeId: number;
  typeId: number;
  name: string;
  region: number;
  languageSupport: string[];
  activationGuide?: string;
  storePage?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  title: string;
  description: string;
  developer?: string;
  publisher?: string;
  systemRequirements?: string;
  tags?: string;
  status?: string;
  rating?: string;
  media?: string[];
  variants?: {
    storeId: number;
    typeId: number;
    name: string;
    region: number;
    languageSupport: string[];
    activationGuide?: string;
    storePage?: string;
    price: number;
    keys?: string[];
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
  discountCode?: string;
}

export interface Order {
  id: number;
  customerId: string;
  productId: number;
  orderDate: string;
  totalAmount: number;
  discountCode?: string | null;
  discountAmount?: number;
  paymentMethodId?: number | null;
  amountPaid?: number;
  status: string;
  createdAt: string;
  product?: Product; // Populated by relations
}

// admin Dashboard Types
export interface AdminReport {
  totalRevenueCents: number;
  totalOrders: number;
  topSellingProducts: {
    productId: number;
    title: string;
    quantitySold: number;
    revenueCents: number;
  }[];
}

// Steam Login Data
export interface SteamProfile {
  steamId: string;
  personaName?: string;
  avatar?: string;
  profileUrl?: string;
}

// Google Login Data
export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken?: string;
}