// API utility functions for Zee Ecosystem

const API_BASE = "/api";

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || "An error occurred" };
    }

    return { data: result };
  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
  signup: async (data: {
    email: string;
    password: string;
    name: string;
    role: "BUYER" | "SELLER";
  }) => {
    return fetchApi<{ message: string; userId: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  signin: async (data: { email: string; password: string }) => {
    return fetchApi<{ user: any }>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  signout: async () => {
    return fetchApi<{ message: string }>("/auth/signout", {
      method: "POST",
    });
  },

  getSession: async () => {
    return fetchApi<{ user: any }>("/auth/session");
  },
};

// ============================================
// LISTINGS API
// ============================================

export const listingsApi = {
  getAll: async (params?: {
    type?: string;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return fetchApi<{ listings: any[]; total: number; page: number }>(
      `/listings?${searchParams.toString()}`
    );
  },

  getById: async (id: string) => {
    return fetchApi<{ listing: any }>(`/listings/${id}`);
  },

  create: async (data: any) => {
    return fetchApi<{ listing: any }>("/listings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return fetchApi<{ listing: any }>(`/listings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<{ message: string }>(`/listings/${id}`, {
      method: "DELETE",
    });
  },

  getBySeller: async (sellerId: string) => {
    return fetchApi<{ listings: any[] }>(`/listings/seller/${sellerId}`);
  },
};

// ============================================
// ORDERS API
// ============================================

export const ordersApi = {
  create: async (data: {
    listingId: string;
    quantity: number;
    requirements?: any;
    shippingAddress?: any;
  }) => {
    return fetchApi<{ order: any }>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getById: async (id: string) => {
    return fetchApi<{ order: any }>(`/orders/${id}`);
  },

  getByBuyer: async () => {
    return fetchApi<{ orders: any[] }>("/orders/buyer");
  },

  getBySeller: async () => {
    return fetchApi<{ orders: any[] }>("/orders/seller");
  },

  updateStatus: async (id: string, status: string, data?: any) => {
    return fetchApi<{ order: any }>(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, ...data }),
    });
  },

  confirmDelivery: async (id: string) => {
    return fetchApi<{ order: any }>(`/orders/${id}/confirm-delivery`, {
      method: "POST",
    });
  },

  initiateDispute: async (id: string, reason: string) => {
    return fetchApi<{ order: any }>(`/orders/${id}/dispute`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};

// ============================================
// WALLET API
// ============================================

export const walletApi = {
  getBalance: async () => {
    return fetchApi<{ wallet: any }>("/wallet");
  },

  getTransactions: async (params?: { type?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return fetchApi<{ transactions: any[] }>(`/wallet/transactions?${searchParams.toString()}`);
  },

  deposit: async (amount: number) => {
    return fetchApi<{ authorizationUrl: string; reference: string }>("/wallet/deposit", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },

  withdraw: async (amount: number, bankDetails: any) => {
    return fetchApi<{ message: string }>("/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount, bankDetails }),
    });
  },
};

// ============================================
// MESSAGES API
// ============================================

export const messagesApi = {
  getByOrder: async (orderId: string) => {
    return fetchApi<{ messages: any[] }>(`/messages/order/${orderId}`);
  },

  send: async (data: { orderId: string; content: string; attachments?: string[] }) => {
    return fetchApi<{ message: any }>("/messages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  markAsRead: async (orderId: string) => {
    return fetchApi<{ message: string }>(`/messages/order/${orderId}/read`, {
      method: "POST",
    });
  },
};

// ============================================
// SUPPORT TICKETS API
// ============================================

export const supportApi = {
  create: async (data: { subject: string; category: string; orderId?: string }) => {
    return fetchApi<{ ticket: any }>("/support", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getAll: async () => {
    return fetchApi<{ tickets: any[] }>("/support");
  },

  getById: async (id: string) => {
    return fetchApi<{ ticket: any }>(`/support/${id}`);
  },

  addMessage: async (id: string, content: string) => {
    return fetchApi<{ message: any }>(`/support/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },
};

// ============================================
// ADMIN API
// ============================================

export const adminApi = {
  getDashboard: async () => {
    return fetchApi<{
      totalRevenue: number;
      totalUsers: number;
      totalListings: number;
      totalOrders: number;
      pendingVerifications: number;
      activeDisputes: number;
    }>("/admin/dashboard");
  },

  getUsers: async (params?: { role?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
    }
    return fetchApi<{ users: any[] }>(`/admin/users?${searchParams.toString()}`);
  },

  verifySeller: async (userId: string, approve: boolean) => {
    return fetchApi<{ message: string }>(`/admin/users/${userId}/verify`, {
      method: "POST",
      body: JSON.stringify({ approve }),
    });
  },

  banUser: async (userId: string, reason: string) => {
    return fetchApi<{ message: string }>(`/admin/users/${userId}/ban`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  // Ads management
  getAds: async () => {
    return fetchApi<{ ads: any[] }>("/admin/ads");
  },

  createAd: async (data: any) => {
    return fetchApi<{ ad: any }>("/admin/ads", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateAd: async (id: string, data: any) => {
    return fetchApi<{ ad: any }>(`/admin/ads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteAd: async (id: string) => {
    return fetchApi<{ message: string }>(`/admin/ads/${id}`, {
      method: "DELETE",
    });
  },

  resolveDispute: async (orderId: string, resolution: string, refundBuyer: boolean) => {
    return fetchApi<{ order: any }>(`/admin/disputes/${orderId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolution, refundBuyer }),
    });
  },
};
