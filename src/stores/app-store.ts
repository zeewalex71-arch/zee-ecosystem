import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================
// AUTH STORE
// ============================================

interface AuthState {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    isVerified: boolean;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthState["user"]) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "zee-auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ============================================
// CART STORE (for ZeeFix Hub - Physical Goods)
// ============================================

interface CartItem {
  listingId: string;
  quantity: number;
  listing: {
    id: string;
    title: string;
    price: number;
    thumbnail?: string | null;
    type: string;
    sellerId: string;
  };
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (listingId: string) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.listingId === item.listingId);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.listingId === item.listingId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: (listingId) => {
        set((state) => ({
          items: state.items.filter((i) => i.listingId !== listingId),
        }));
      },
      updateQuantity: (listingId, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.listingId === listingId ? { ...i, quantity } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.listing.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "zee-cart-storage",
    }
  )
);

// ============================================
// CHAT STORE
// ============================================

interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatState {
  messages: Record<string, ChatMessage[]>; // orderId -> messages
  activeChat: string | null; // orderId
  unreadCount: Record<string, number>; // orderId -> count
  addMessage: (orderId: string, message: ChatMessage) => void;
  setMessages: (orderId: string, messages: ChatMessage[]) => void;
  setActiveChat: (orderId: string | null) => void;
  markAsRead: (orderId: string) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: {},
  activeChat: null,
  unreadCount: {},
  addMessage: (orderId, message) => {
    set((state) => {
      const orderMessages = state.messages[orderId] || [];
      return {
        messages: {
          ...state.messages,
          [orderId]: [...orderMessages, message],
        },
        unreadCount: {
          ...state.unreadCount,
          [orderId]: (state.unreadCount[orderId] || 0) + (message.isRead ? 0 : 1),
        },
      };
    });
  },
  setMessages: (orderId, messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [orderId]: messages,
      },
    }));
  },
  setActiveChat: (orderId) => set({ activeChat: orderId }),
  markAsRead: (orderId) => {
    set((state) => ({
      unreadCount: {
        ...state.unreadCount,
        [orderId]: 0,
      },
    }));
  },
}));

// ============================================
// NOTIFICATION STORE
// ============================================

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  content?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: NotificationItem) => void;
  setNotifications: (notifications: NotificationItem[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    }));
  },
  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  },
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

// ============================================
// UI STORE
// ============================================

interface UIState {
  isSidebarOpen: boolean;
  isSearchOpen: boolean;
  currentMarketplace: "zeegig" | "zeefix" | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setCurrentMarketplace: (marketplace: UIState["currentMarketplace"]) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isSidebarOpen: false,
  isSearchOpen: false,
  currentMarketplace: null,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setCurrentMarketplace: (marketplace) => set({ currentMarketplace: marketplace }),
}));
