"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  Shield,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Order, Wallet, Listing } from "@/types/index";

interface DashboardStats {
  totalSales: number;
  pendingOrders: number;
  totalRevenue: number;
  walletBalance: number;
  totalListings: number;
  activeListings: number;
}

interface VerificationStatus {
  isVerified: boolean;
  verificationStatus: string;
  rejectionReason: string | null;
}

interface RecentOrder extends Order {
  listing?: {
    id: string;
    title: string;
    thumbnail?: string | null;
  };
  buyer?: {
    id: string;
    name?: string | null;
    email: string;
    profile?: {
      fullName?: string | null;
      avatar?: string | null;
    } | null;
  };
}

// Revenue chart data (placeholder)
const revenueData = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 7200 },
  { month: "Jun", revenue: 8500 },
];

export default function SellerDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topListings, setTopListings] = useState<Listing[]>([]);
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30days");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch verification status
        const verificationRes = await fetch("/api/verification/status");
        const verificationData = await verificationRes.json();
        setVerification(verificationData.verification);

        // Fetch wallet data
        const walletRes = await fetch("/api/wallet");
        const walletData: { wallet: Wallet } = await walletRes.json();

        // Fetch seller orders
        const ordersRes = await fetch("/api/orders/seller");
        const ordersData: { orders: RecentOrder[] } = await ordersRes.json();

        // Fetch seller listings
        const listingsRes = await fetch("/api/listings?sellerId=current");
        const listingsData: { listings: Listing[]; total: number } =
          await listingsRes.json();

        // Calculate stats
        const orders = ordersData.orders || [];
        const listings = listingsData.listings || [];
        const wallet = walletData.wallet;

        const totalSales = orders.filter((o) => o.status === "COMPLETED").length;
        const pendingOrders = orders.filter(
          (o) => o.status === "PENDING" || o.status === "PAID" || o.status === "IN_PROGRESS"
        ).length;
        const totalRevenue = orders
          .filter((o) => o.status === "COMPLETED")
          .reduce((sum, o) => sum + o.totalAmount, 0);

        setStats({
          totalSales,
          pendingOrders,
          totalRevenue,
          walletBalance: wallet?.balance || 0,
          totalListings: listings.length,
          activeListings: listings.filter((l) => l.status === "ACTIVE").length,
        });

        setRecentOrders(orders.slice(0, 5));
        setTopListings(
          listings.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0)).slice(0, 5)
        );
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      PENDING: { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      PAID: { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200" },
      IN_PROGRESS: { variant: "outline", className: "bg-purple-50 text-purple-700 border-purple-200" },
      SHIPPED: { variant: "outline", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      DELIVERED: { variant: "outline", className: "bg-teal-50 text-teal-700 border-teal-200" },
      COMPLETED: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
      CANCELLED: { variant: "outline", className: "bg-red-50 text-red-700 border-red-200" },
      DISPUTED: { variant: "destructive", className: "" },
    };

    const config = statusConfig[status] || { variant: "outline", className: "" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isVerified = verification?.verificationStatus === "verified";
  const isPending = verification?.verificationStatus === "pending";
  const isRejected = verification?.verificationStatus === "rejected";

  // Create Listing Button with tooltip
  const CreateListingButton = () => {
    if (!isVerified) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="bg-gray-300 text-gray-500 cursor-not-allowed"
                disabled
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Listing
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#112240] text-[#E6E6E6] border-[#233554]">
              <p className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#FFD700]" />
                Account Verification Required
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link href="/dashboard/seller/listings/new">
        <Button className="bg-[#2563EB] hover:bg-[#2563EB]/90">
          <Plus className="mr-2 h-4 w-4" />
          Create Listing
        </Button>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      {/* Verification Submitted Toast */}
      {searchParams.get("verification") === "submitted" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Verification Submitted!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your verification documents are being reviewed. You&apos;ll be notified once approved.
          </AlertDescription>
        </Alert>
      )}

      {/* Trust-Wall Verification Banner */}
      {verification && !isVerified && (
        <Alert className={`border-l-4 ${
          isPending 
            ? "bg-yellow-50 border-yellow-500" 
            : isRejected 
            ? "bg-red-50 border-red-500"
            : "bg-blue-50 border-blue-500"
        }`}>
          {isPending ? (
            <Clock className="h-5 w-5 text-yellow-600" />
          ) : isRejected ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : (
            <Shield className="h-5 w-5 text-blue-600" />
          )}
          <AlertTitle className={
            isPending 
              ? "text-yellow-800" 
              : isRejected 
              ? "text-red-800"
              : "text-blue-800"
          }>
            {isPending 
              ? "Verification Under Review" 
              : isRejected 
              ? "Verification Rejected"
              : "Trust-Wall Verification Required"
            }
          </AlertTitle>
          <AlertDescription className={
            isPending 
              ? "text-yellow-700" 
              : isRejected 
              ? "text-red-700"
              : "text-blue-700"
          }>
            {isPending ? (
              "Your verification documents are being reviewed by our team. This usually takes 1-2 business days."
            ) : isRejected ? (
              <>
                Your verification was rejected: <strong>{verification.rejectionReason}</strong>.
                Please correct the issues and resubmit.
              </>
            ) : (
              "Complete your account verification to start listing products and services on ZeeFix Hub."
            )}
          </AlertDescription>
          <Button
            onClick={() => router.push("/dashboard/seller/verification")}
            className={`mt-3 ${
              isPending 
                ? "bg-yellow-600 hover:bg-yellow-700" 
                : isRejected 
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isPending ? "View Status" : isRejected ? "Resubmit Verification" : "Get Verified Now"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">
            {isVerified 
              ? "Welcome back! Here's what's happening with your store."
              : "Complete verification to unlock all seller features."
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <CreateListingButton />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Sales
            </CardTitle>
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">
                  {stats?.totalSales || 0}
                </div>
                <div className="mt-1 flex items-center text-xs">
                  <span className="flex items-center text-green-600">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    12%
                  </span>
                  <span className="ml-1 text-gray-500">from last month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Orders
            </CardTitle>
            <div className="rounded-full bg-orange-100 p-2">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">
                  {stats?.pendingOrders || 0}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Require your attention
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </div>
                <div className="mt-1 flex items-center text-xs">
                  <span className="flex items-center text-green-600">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    8.2%
                  </span>
                  <span className="ml-1 text-gray-500">from last month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Wallet Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Wallet Balance
            </CardTitle>
            <div className="rounded-full bg-purple-100 p-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.walletBalance || 0)}
                </div>
                <Link
                  href="/dashboard/seller/wallet"
                  className="mt-1 flex items-center text-xs text-[#2563EB] hover:underline"
                >
                  View transactions
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href={isVerified ? "/dashboard/seller/listings/new" : "#"}
                className={isVerified ? "" : "pointer-events-none"}
              >
                <Card className={`cursor-pointer transition-all ${isVerified ? "hover:border-[#2563EB] hover:shadow-md" : "opacity-60"}`}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="rounded-lg bg-[#2563EB]/10 p-3">
                      <Package className="h-6 w-6 text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Create Listing</p>
                      <p className="text-sm text-gray-500">
                        {!isVerified ? "Verification required" : "Add a new product or service"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            {!isVerified && (
              <TooltipContent className="bg-[#112240] text-[#E6E6E6] border-[#233554]">
                <p className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#FFD700]" />
                  Account Verification Required
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <Link href="/dashboard/seller/orders">
          <Card className="cursor-pointer transition-all hover:border-[#2563EB] hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-[#F97316]/10 p-3">
                <ShoppingCart className="h-6 w-6 text-[#F97316]" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Orders</p>
                <p className="text-sm text-gray-500">Manage your incoming orders</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/seller/listings">
          <Card className="cursor-pointer transition-all hover:border-[#2563EB] hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-green-100 p-3">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Listings</p>
                <p className="text-sm text-gray-500">
                  {isLoading ? "Loading..." : `${stats?.activeListings || 0} active`}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/seller/wallet">
          <Card className="cursor-pointer transition-all hover:border-[#2563EB] hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Withdraw Funds</p>
                <p className="text-sm text-gray-500">Transfer to bank account</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
            <Link href="/dashboard/seller/orders">
              <Button variant="ghost" size="sm" className="text-[#2563EB]">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-300" />
                <p className="mt-4 text-sm text-gray-500">No orders yet</p>
                <p className="text-xs text-gray-400">
                  Orders will appear here when customers make purchases
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      {order.listing?.thumbnail ? (
                        <img
                          src={order.listing.thumbnail}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {order.listing?.title || "Unknown Listing"}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {order.buyer?.profile?.fullName || order.buyer?.name || order.buyer?.email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(order.status)}
                      <span className="text-xs text-gray-400">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[280px] items-end justify-between gap-2 px-4">
              {revenueData.map((data, index) => {
                const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));
                const height = (data.revenue / maxRevenue) * 100;
                return (
                  <div
                    key={data.month}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all",
                        index === revenueData.length - 1
                          ? "bg-[#2563EB]"
                          : "bg-[#2563EB]/40"
                      )}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-500">{data.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-[#2563EB]" />
                <span className="text-gray-600">This Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-[#2563EB]/40" />
                <span className="text-gray-600">Previous Period</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Top Performing Listings</CardTitle>
          <Link href="/dashboard/seller/listings">
            <Button variant="ghost" size="sm" className="text-[#2563EB]">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : topListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">No listings yet</p>
              {!isVerified ? (
                <p className="text-xs text-gray-400 mt-2">
                  Complete verification to create your first listing
                </p>
              ) : (
                <Link href="/dashboard/seller/listings/new">
                  <Button size="sm" className="mt-4 bg-[#2563EB]">
                    Create Your First Listing
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {topListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/dashboard/seller/listings/${listing.id}`}
                  className="group"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    {listing.thumbnail ? (
                      <img
                        src={listing.thumbnail}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {listing.title}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatCurrency(listing.price)}</span>
                      <span>{listing.orderCount || 0} orders</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
