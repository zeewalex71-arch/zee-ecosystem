// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  isVerified: boolean;
}

export interface Profile {
  id: string;
  userId: string;
  fullName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  address?: string | null;
  role: UserRole;
  isVerified: boolean;
  verificationStatus?: "pending" | "approved" | "rejected" | null;
  ninNumber?: string | null;
  idDocument?: string | null;
  storeName?: string | null;
  storeSlug?: string | null;
  storeDescription?: string | null;
  totalSales: number;
  totalPurchases: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isBanned: boolean;
  bannedReason?: string | null;
  frozenUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// LISTING TYPES
// ============================================

export type ListingType = "DIGITAL" | "PHYSICAL" | "SERVICE";

export type ListingStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD_OUT" | "ARCHIVED";

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: ListingType;
  category: string;
  subcategory?: string | null;
  tags?: string[] | null;
  images?: string[] | null;
  thumbnail?: string | null;
  
  // Digital Service Fields
  portfolioUrl?: string | null;
  deliveryTime?: number | null;
  revisions?: number | null;
  requirements?: string | null;
  
  // Physical Goods Fields
  weight?: number | null;
  dimensions?: { length: number; width: number; height: number } | null;
  shippingOptions?: ShippingOption[] | null;
  stockQuantity?: number | null;
  sku?: string | null;
  
  // Service Fields
  serviceArea?: string | null;
  availability?: string | null;
  duration?: number | null;
  
  status: ListingStatus;
  isFeatured: boolean;
  viewCount: number;
  orderCount: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  seller?: User & { profile?: Profile };
}

export interface ShippingOption {
  name: string;
  price: number;
  estimatedDays: number;
}

// ============================================
// ORDER & ESCROW TYPES
// ============================================

export type OrderStatus = 
  | "PENDING" 
  | "PAID" 
  | "IN_PROGRESS" 
  | "SHIPPED" 
  | "DELIVERED" 
  | "COMPLETED" 
  | "CANCELLED" 
  | "DISPUTED" 
  | "REFUNDED";

export type EscrowStatus = "NONE" | "HOLDING" | "RELEASED" | "REFUNDED";

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  serviceFee: number;
  status: OrderStatus;
  
  paymentMethod?: string | null;
  paymentRef?: string | null;
  paidAt?: Date | null;
  
  escrowStatus: EscrowStatus;
  escrowReleasedAt?: Date | null;
  
  shippingAddress?: ShippingAddress | null;
  trackingNumber?: string | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  
  deliveryFiles?: string[] | null;
  deliveryNotes?: string | null;
  deliveredAt_digital?: Date | null;
  
  requirements?: Record<string, unknown> | null;
  
  disputeReason?: string | null;
  disputeStatus?: "open" | "resolved" | null;
  disputeResolvedBy?: string | null;
  disputeResolution?: string | null;
  
  createdAt: Date;
  updatedAt: Date;
  
  buyer?: User & { profile?: Profile };
  seller?: User & { profile?: Profile };
  listing?: Listing;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

// ============================================
// WALLET & TRANSACTION TYPES
// ============================================

export type TransactionType = 
  | "DEPOSIT" 
  | "WITHDRAWAL" 
  | "ESCROW_HOLD" 
  | "ESCROW_RELEASE" 
  | "REFUND" 
  | "PURCHASE";

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  fee: number;
  status: TransactionStatus;
  orderId?: string | null;
  paystackRef?: string | null;
  description?: string | null;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
}

// ============================================
// MESSAGING TYPES
// ============================================

export interface Message {
  id: string;
  orderId?: string | null;
  senderId: string;
  receiverId: string;
  content: string;
  attachments?: string[] | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  
  sender?: User & { profile?: Profile };
  receiver?: User & { profile?: Profile };
}

// ============================================
// SUPPORT TICKET TYPES
// ============================================

export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface SupportTicket {
  id: string;
  userId: string;
  orderId?: string | null;
  subject: string;
  category?: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  
  user?: User & { profile?: Profile };
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  attachments?: string[] | null;
  isFromAdmin: boolean;
  createdAt: Date;
  
  user?: User & { profile?: Profile };
}

// ============================================
// AD TYPES
// ============================================

export type AdPlacement = "HERO_CAROUSEL" | "SIDEBAR" | "BANNER";

export interface Ad {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  placement: AdPlacement;
  targetMarketplaces?: string[] | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  orderId: string;
  listingId: string;
  reviewerId: string;
  sellerId: string;
  rating: number;
  title?: string | null;
  content?: string | null;
  response?: string | null;
  respondedAt?: Date | null;
  isPublic: boolean;
  createdAt: Date;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = "order" | "message" | "payment" | "dispute" | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content?: string | null;
  link?: string | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
}

// ============================================
// CATEGORY TYPES
// ============================================

export const ZEEGIG_CATEGORIES = [
  { id: "ai-art", label: "AI Art & Design", icon: "Palette" },
  { id: "video-editing", label: "Video Editing", icon: "Video" },
  { id: "graphics-design", label: "Graphics Design", icon: "Image" },
  { id: "writing-translation", label: "Writing & Translation", icon: "FileText" },
  { id: "programming", label: "Programming & Tech", icon: "Code" },
  { id: "music-audio", label: "Music & Audio", icon: "Music" },
  { id: "digital-marketing", label: "Digital Marketing", icon: "TrendingUp" },
  { id: "consulting", label: "Consulting", icon: "MessageCircle" },
] as const;

export const ZEEFIX_CATEGORIES = {
  physical: [
    { id: "fashion", label: "Fashion & Apparel", icon: "Shirt" },
    { id: "herbs", label: "Herbs & Natural Products", icon: "Leaf" },
    { id: "food", label: "Food & Groceries", icon: "UtensilsCrossed" },
    { id: "electronics", label: "Electronics", icon: "Smartphone" },
    { id: "home-garden", label: "Home & Garden", icon: "Home" },
    { id: "beauty", label: "Beauty & Personal Care", icon: "Sparkles" },
  ],
  service: [
    { id: "barbers", label: "Barbers & Salons", icon: "Scissors" },
    { id: "errand-runners", label: "Errand Runners", icon: "Truck" },
    { id: "cleaning", label: "Cleaning Services", icon: "Broom" },
    { id: "repairs", label: "Repairs & Maintenance", icon: "Wrench" },
    { id: "tutoring", label: "Tutoring & Lessons", icon: "GraduationCap" },
    { id: "photography", label: "Photography", icon: "Camera" },
  ],
} as const;
