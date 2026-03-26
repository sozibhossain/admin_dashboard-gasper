export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
};

export type AuthUser = {
  _id: string;
  email: string;
  role: "admin" | "manager" | "user";
};

export type AuthLoginResponse = {
  accessToken: string;
  refreshToken: string;
  role: AuthUser["role"];
  _id: string;
};

export type UserProfile = {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  nationality?: string;
  role?: AuthUser["role"];
  avatar?: {
    public_id?: string;
    url?: string;
  };
};

export type Product = {
  _id: string;
  title: string;
  brand?: string;
  description: string;
  price: number;
  colors?: string[];
  stock: number;
  sku: string;
  status: "in_stock" | "out_of_stock" | "low_stock";
  verified: boolean;
  soldCount?: number;
  rating?: number;
  reviewsCount?: number;
  category?: {
    _id: string;
    name: string;
  };
  vendor?: {
    _id: string;
    name?: string;
    email?: string;
    storeName?: string;
  };
  photos?: Array<{
    public_id?: string;
    url?: string;
  }>;
  createdAt?: string;
};

export type ProductsResponse = {
  products: Product[];
  pagination: PaginationMeta;
};

export type Vendor = {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  storeName?: string;
  storeDescription?: string;
  vendorStatus: "pending" | "approved" | "rejected";
  role: "manager" | "admin" | "user";
  address?: string;
  city?: string;
  country?: string;
  idCard?: string;
  passport?: string;
  createdAt?: string;
  storeLogo?: {
    public_id?: string;
    url?: string;
  };
  avatar?: {
    public_id?: string;
    url?: string;
  };
};

export type Coupon = {
  _id: string;
  code: string;
  description: string;
  discount: number;
  discountType: "percentage" | "fixed";
  validityStart: string;
  validityEnd: string;
  status: "active" | "inactive";
  usageLimit?: number;
  usedCount?: number;
  couponImage?: {
    public_id?: string;
    url?: string;
  };
  createdAt?: string;
};

export type Category = {
  _id: string;
  name: string;
  level?: number;
  path?: string;
  parent?: {
    _id: string;
    name: string;
  };
  children?: Array<{
    _id: string;
    name: string;
    level?: number;
  }>;
  image?: {
    public_id?: string;
    url?: string;
  };
  productCount?: number;
  associatedProducts?: Product[];
};

export type Order = {
  _id: string;
  orderId: string;
  items: Array<{
    product: {
      _id: string;
      title: string;
      price: number;
      photos?: Array<{ url?: string }>;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  discount: number;
  status: "pending" | "in_progress" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  expectedDeliveryDate?: string;
  customer?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    createdAt?: string;
    avatar?: {
      url?: string;
    };
  };
  vendor?: {
    _id: string;
    name?: string;
    storeName?: string;
  };
  createdAt?: string;
};

export type CustomerSummary = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  orders: number;
  moneySpent: number;
  lastOrderAt?: string;
  avatarUrl?: string;
};

export type CustomersResponse = {
  customers: CustomerSummary[];
  pagination: PaginationMeta;
};

export type DashboardStats = {
  ordersPending: number;
  ordersProcessing: number;
  ordersCompleted: number;
  totalProducts: number;
  totalCustomers: number;
  totalCommission: number;
};
