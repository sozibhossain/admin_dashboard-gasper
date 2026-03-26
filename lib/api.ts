import axios from "axios";
import apiClient from "@/lib/axios";
import { API_BASE_URL } from "@/lib/constants";
import type {
  ApiResponse,
  AuthLoginResponse,
  Category,
  Coupon,
  CustomerSummary,
  CustomersResponse,
  DashboardStats,
  Order,
  PaginationMeta,
  Product,
  ProductsResponse,
  UserProfile,
  Vendor,
} from "@/types/api";

type QueryParams = Record<string, string | number | boolean | undefined | null>;

function withParams(url: string, params?: QueryParams) {
  if (!params) return url;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const suffix = searchParams.toString();
  return suffix ? `${url}?${suffix}` : url;
}

export async function loginAdmin(payload: { email: string; password: string }) {
  const response = await axios.post<ApiResponse<AuthLoginResponse>>(`${API_BASE_URL}/auth/login`, payload);
  return response.data;
}

export async function refreshAuthToken(payload: { refreshToken: string }) {
  const response = await axios.post<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }>
  >(`${API_BASE_URL}/auth/refresh-token`, payload);
  return response.data;
}

export async function forgotPassword(payload: { email: string }) {
  try {
    const response = await axios.post<ApiResponse<null>>(`${API_BASE_URL}/auth/forgot-password`, payload);
    return response.data;
  } catch {
    const fallback = await axios.post<ApiResponse<null>>(`${API_BASE_URL}/auth/forget`, payload);
    return fallback.data;
  }
}

export async function verifyOtp(payload: {
  email: string;
  otp: string;
  purpose: "verify_email" | "reset_password";
}) {
  const response = await axios.post<ApiResponse<{ email: string }>>(`${API_BASE_URL}/auth/verify`, payload);
  return response.data;
}

export async function resetPassword(payload: {
  email: string;
  otp: string;
  password: string;
  confirmPassword?: string;
}) {
  const response = await axios.post<ApiResponse<null>>(`${API_BASE_URL}/auth/reset-password`, payload);
  return response.data;
}

export async function getProfile() {
  const response = await apiClient.get<ApiResponse<UserProfile>>(`/user/profile`);
  return response.data;
}

export async function updateProfile(payload: FormData) {
  const response = await apiClient.put<ApiResponse<UserProfile>>(`/user/profile`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const response = await apiClient.put<ApiResponse<null>>(`/user/password`, payload);
  return response.data;
}

export async function getProducts(params: QueryParams) {
  const response = await apiClient.get<ApiResponse<ProductsResponse>>(withParams("/product", params));
  return response.data;
}

export async function getProductById(id: string) {
  const response = await apiClient.get<ApiResponse<Product>>(`/product/${id}`);
  return response.data;
}

export async function createProduct(payload: FormData) {
  const response = await apiClient.post<ApiResponse<Product>>(`/product/add`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updateProduct(id: string, payload: FormData) {
  const response = await apiClient.put<ApiResponse<Product>>(`/product/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function verifyProduct(id: string) {
  const response = await apiClient.patch<ApiResponse<Product>>(`/product/${id}/verify`);
  return response.data;
}

export async function deleteProduct(id: string) {
  const response = await apiClient.delete<ApiResponse<Product>>(`/product/${id}`);
  return response.data;
}

export async function getOrders(params: QueryParams) {
  const response = await apiClient.get<ApiResponse<Order[]>>(withParams("/order", params));
  return response.data;
}

export async function getOrderById(orderId: string) {
  const response = await apiClient.get<ApiResponse<Order>>(`/order/${orderId}`);
  return response.data;
}

export async function updateOrderStatus(
  orderId: string,
  payload: { status: Order["status"]; trackingNumber?: string }
) {
  const response = await apiClient.patch<ApiResponse<Order>>(`/order/${orderId}/status`, payload);
  return response.data;
}

export async function getCategories(params?: QueryParams) {
  const response = await apiClient.get<ApiResponse<Category[]>>(withParams("/category", params));
  return response.data;
}

export async function getCategoryTree() {
  const response = await apiClient.get<ApiResponse<Category[]>>(`/category/tree/all`);
  return response.data;
}

export async function addCategory(payload: FormData) {
  const response = await apiClient.post<ApiResponse<Category>>(`/category/add`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updateCategory(id: string, payload: FormData) {
  const response = await apiClient.put<ApiResponse<Category>>(`/category/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function deleteCategory(id: string) {
  const response = await apiClient.delete<ApiResponse<null>>(`/category/${id}`);
  return response.data;
}

export async function getVendors() {
  const response = await apiClient.get<ApiResponse<Vendor[]>>(`/vendor`);
  return response.data;
}

export async function getVendorById(id: string) {
  const response = await apiClient.get<ApiResponse<Vendor>>(`/vendor/${id}`);
  return response.data;
}

export async function approveVendor(id: string) {
  const response = await apiClient.patch<ApiResponse<Vendor>>(`/vendor/${id}/approve`);
  return response.data;
}

export async function getCoupons(params?: QueryParams) {
  const response = await apiClient.get<ApiResponse<Coupon[]>>(withParams("/coupon", params));
  return response.data;
}

export async function createCoupon(payload: {
  code: string;
  description: string;
  discount: number;
  discountType: "percentage" | "fixed";
  validityStart: string;
  validityEnd: string;
  status: "active" | "inactive";
}) {
  const response = await apiClient.post<ApiResponse<Coupon>>(`/coupon/create`, payload);
  return response.data;
}

export async function updateCoupon(
  id: string,
  payload: Partial<{
    code: string;
    description: string;
    discount: number;
    discountType: "percentage" | "fixed";
    validityStart: string;
    validityEnd: string;
    status: "active" | "inactive";
  }>
) {
  const response = await apiClient.put<ApiResponse<Coupon>>(`/coupon/${id}`, payload);
  return response.data;
}

export async function deleteCoupon(id: string) {
  const response = await apiClient.delete<ApiResponse<null>>(`/coupon/${id}`);
  return response.data;
}

function createPagination(total: number, page: number, limit: number): PaginationMeta {
  const safeLimit = Math.max(limit, 1);
  return {
    total,
    page,
    limit: safeLimit,
    totalPages: Math.max(Math.ceil(total / safeLimit), 1),
  };
}

export async function getCustomersFromOrders(params?: { page?: number; limit?: number }) {
  const page = params?.page || 1;
  const limit = params?.limit || 10;

  // fetch a large batch to derive unique customers because backend does not expose dedicated customers route
  const response = await getOrders({ page: 1, limit: 200 });
  const orders = response.data || [];

  const map = new Map<string, CustomerSummary>();

  for (const order of orders) {
    const customer = order.customer;
    if (!customer?._id) continue;

    const prev = map.get(customer._id);
    if (prev) {
      prev.orders += 1;
      prev.moneySpent += order.totalAmount || 0;
      if (!prev.lastOrderAt || new Date(order.createdAt || 0) > new Date(prev.lastOrderAt)) {
        prev.lastOrderAt = order.createdAt;
      }
      continue;
    }

    map.set(customer._id, {
      _id: customer._id,
      name: customer.name || "Customer",
      email: customer.email || "-",
      phone: customer.phone,
      orders: 1,
      moneySpent: order.totalAmount || 0,
      lastOrderAt: order.createdAt,
      avatarUrl: customer.avatar?.url,
    });
  }

  const customers = Array.from(map.values()).sort((a, b) => {
    const dateA = new Date(a.lastOrderAt || 0).getTime();
    const dateB = new Date(b.lastOrderAt || 0).getTime();
    return dateB - dateA;
  });

  const start = (page - 1) * limit;
  const end = start + limit;

  const result: CustomersResponse = {
    customers: customers.slice(start, end),
    pagination: createPagination(customers.length, page, limit),
  };

  return {
    success: true,
    message: "Customers fetched",
    data: result,
  } as ApiResponse<CustomersResponse>;
}

export async function getDashboardStats() {
  const [productsRes, ordersRes, vendorsRes] = await Promise.all([
    getProducts({ page: 1, limit: 200 }),
    getOrders({ page: 1, limit: 200 }),
    getVendors(),
  ]);

  const products = productsRes.data.products;
  const orders = ordersRes.data;
  const vendors = vendorsRes.data;

  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const processingOrders = orders.filter((order) => order.status === "in_progress").length;
  const completedOrders = orders.filter((order) => order.status === "delivered").length;

  const uniqueCustomers = new Set(
    orders.map((order) => order.customer?._id).filter((id): id is string => Boolean(id))
  );

  const totalCommission = orders.reduce((acc, order) => acc + (order.totalAmount || 0) * 0.1, 0);

  const stats: DashboardStats = {
    ordersPending: pendingOrders,
    ordersProcessing: processingOrders,
    ordersCompleted: completedOrders,
    totalProducts: products.length,
    totalCustomers: uniqueCustomers.size,
    totalCommission,
  };

  return {
    success: true,
    message: "Dashboard stats fetched",
    data: {
      stats,
      products,
      orders,
      vendors,
    },
  } as ApiResponse<{
    stats: DashboardStats;
    products: Product[];
    orders: Order[];
    vendors: Vendor[];
  }>;
}
