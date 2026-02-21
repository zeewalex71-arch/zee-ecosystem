---
## Task ID: Main Build - Zee Ecosystem Super-App

### Work Task
Build a comprehensive, unified Super-App called "Zee Ecosystem" that integrates two distinct marketplaces (ZeeGig and ZeeFix Hub) into a single Next.js codebase with built-in Escrow payments, real-time chat, and Admin Command Center.

### Work Summary

#### 1. Database Schema (Prisma)
- **File**: `prisma/schema.prisma`
- Created comprehensive schema with:
  - User authentication (User, Account, Session, VerificationToken)
  - User profiles with role-based access (BUYER, SELLER, ADMIN)
  - Wallet & Transactions for unified payments
  - Listings (unified for DIGITAL, PHYSICAL, SERVICE types)
  - Orders with escrow status tracking
  - Messages for transactional chat
  - Support tickets with ticket messages
  - Ads for hero carousel management
  - Notifications for user alerts
  - Reviews for seller ratings

#### 2. Authentication System
- **Files**: 
  - `src/lib/auth.ts` - NextAuth.js configuration
  - `src/app/api/auth/[...nextauth]/route.ts` - Auth API route
  - `src/app/api/auth/signup/route.ts` - User registration
- JWT-based session strategy
- Role-based access control
- Password hashing with bcryptjs

#### 3. API Routes
- **Listings**: CRUD operations with type-specific fields
- **Orders**: Create, update status, buyer/seller views
- **Wallet**: Balance, transactions, deposit/withdraw
- **Admin**: Dashboard stats, user management, ads management, verification
- **Messages**: Order-based chat
- **Ads**: Public carousel endpoint

#### 4. Landing Page (`src/app/page.tsx`)
- Hero Carousel with admin-managed ads
- Marketplace navigation (ZeeGig vs ZeeFix Hub)
- Featured listings grid
- Category browsing for both marketplaces
- Why Choose Zee Ecosystem section
- CTA for sellers
- Responsive footer
- Auth dialog for login/signup

#### 5. Seller Dashboard (`src/app/dashboard/seller/`)
- **Overview page**: Stats cards, recent orders, revenue chart
- **Create Listing** (`listings/new/`): Dynamic form based on listing type
  - Digital: portfolio URL, delivery time, revisions
  - Physical: weight, dimensions, shipping options
  - Service: service area, availability, duration
- **Manage Listings** (`listings/`): Table with status, actions
- **Order Management** (`orders/`): Status tabs, order details drawer

#### 6. Dashboard Layout (`src/app/dashboard/layout.tsx`)
- Responsive sidebar navigation
- Header with user dropdown
- Quick actions button
- Mobile-friendly design

#### 7. Admin Command Center (`src/app/admin/`)
- **Dashboard**: Metrics cards, revenue chart, recent orders
- **User Management** (`users/`): User table, filters, ban/unban actions
- **Ad Manager** (`ads/`): Create, edit, delete hero carousel ads
- **Verification Queue** (`verifications/`): Pending seller approvals
- **Disputes Management** (`disputes/`): Order disputes resolution

#### 8. Wallet Page (`src/app/dashboard/wallet/page.tsx`)
- Balance cards (available, pending, earned, spent)
- Deposit/Withdraw dialogs
- Transaction history with filters

#### 9. Chat System
- **WebSocket Service** (`mini-services/chat-service/`):
  - Socket.io server on port 3003
  - Order-based chat rooms
  - Typing indicators
  - Message read status
  - Support ticket chat
- **Chat UI** (`src/app/dashboard/chat/[id]/`):
  - Message list with timestamps
  - Order context sidebar
  - Escrow status display
  - Quick actions (confirm delivery, dispute)

#### 10. Listing Detail Page (`src/app/listing/[id]/page.tsx`)
- Image carousel
- Seller info card
- Description with tabs
- Reviews section
- Order dialog with escrow protection
- Requirements input

#### 11. Types & Stores
- **Types** (`src/types/index.ts`): Complete TypeScript definitions
- **Stores** (`src/stores/app-store.ts`):
  - Auth store with persistence
  - Cart store for physical goods
  - Chat store for messages
  - Notification store
  - UI store

#### 12. Utilities
- **API client** (`src/lib/api.ts`): Typed API functions
- **Providers** (`src/components/providers/`): Query client, Theme provider

### Technical Stack
- Framework: Next.js 16 with App Router
- Database: Prisma ORM with SQLite
- Auth: NextAuth.js v4 with JWT
- Styling: Tailwind CSS
- UI: shadcn/ui components
- Icons: Lucide React
- State: Zustand for client, TanStack Query for server
- Real-time: Socket.io for chat

### Design Guidelines Implemented
- Primary Blue: #2563EB
- Accent Orange: #F97316
- Light Grey Background: #F8FAFC
- Mobile-first responsive design
- Consistent card alignment and padding
- Custom scrollbar styling
- Sticky footer implementation

### Files Created/Modified
- `prisma/schema.prisma` - Complete database schema
- `src/lib/auth.ts` - Authentication configuration
- `src/lib/api.ts` - API utility functions
- `src/types/index.ts` - TypeScript type definitions
- `src/stores/app-store.ts` - Zustand stores
- `src/components/providers/index.tsx` - React providers
- `src/app/page.tsx` - Landing page
- `src/app/layout.tsx` - Root layout
- `src/app/globals.css` - Global styles
- `src/app/api/*` - All API routes
- `src/app/dashboard/*` - Dashboard pages
- `src/app/admin/*` - Admin pages
- `src/app/listing/[id]/page.tsx` - Listing detail
- `mini-services/chat-service/` - WebSocket chat service

### Integration Notes
- All pages use client-side data fetching with mock data for demo
- Real API integration ready with typed API client
- WebSocket chat service runs independently on port 3003
- Escrow flow implemented in order creation
- Role-based access control in admin routes
