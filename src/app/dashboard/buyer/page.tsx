"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/app-store";
import {
  Home,
  Search,
  User,
  ShoppingBag,
  Scissors,
  Shirt,
  Leaf,
  Truck,
  Wrench,
  Zap,
  Bell,
  ChevronRight,
  Star,
  Shield,
  Clock,
  Award,
  Package,
  Heart,
  Wallet,
  CheckCircle2,
  MessageCircle,
  LayoutDashboard,
  Settings,
  TrendingUp,
  ArrowRight,
  MapPin,
  Eye,
  Loader2,
  Menu,
  Store,
  RefreshCw,
} from "lucide-react";

// Categories for buyer
const EXPLORE_CATEGORIES = [
  { id: "fashion", label: "Fashion & Fabrics", icon: Shirt, color: "bg-pink-500", count: "2.5k+" },
  { id: "herbs", label: "Herbs & Wellness", icon: Leaf, color: "bg-green-500", count: "1.2k+" },
  { id: "errands", label: "Errands & Delivery", icon: Truck, color: "bg-blue-500", count: "800+" },
  { id: "repairs", label: "Repairs & Services", icon: Wrench, color: "bg-orange-500", count: "950+" },
  { id: "barbers", label: "Barbers & Beauty", icon: Scissors, color: "bg-purple-500", count: "500+" },
  { id: "electricians", label: "Electricians", icon: Zap, color: "bg-yellow-500", count: "300+" },
];

// Mock orders data
const MOCK_ORDERS = [
  {
    id: "1",
    title: "Premium Ankara Dress",
    vendor: "Lagos Fashion House",
    status: "IN_PROGRESS",
    statusLabel: "In Progress",
    amount: 35000,
    image: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=100&h=100&fit=crop",
    date: "2024-02-20",
    tracking: "Order confirmed, tailor working",
  },
  {
    id: "2",
    title: "Home Plumbing Service",
    vendor: "Pro Plumber NG",
    status: "DELIVERED",
    statusLabel: "Completed",
    amount: 15000,
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=100&h=100&fit=crop",
    date: "2024-02-18",
    tracking: "Service completed",
  },
  {
    id: "3",
    title: "Herbal Wellness Package",
    vendor: "Mama Nkechi Herbs",
    status: "SHIPPED",
    statusLabel: "Shipped",
    amount: 8500,
    image: "https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=100&h=100&fit=crop",
    date: "2024-02-19",
    tracking: "Out for delivery",
  },
];

// Mock favorites
const MOCK_FAVORITES = [
  { id: "1", name: "Lagos Fashion House", category: "Fashion", rating: 4.9, reviews: 234, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop" },
  { id: "2", name: "Mama Nkechi Herbs", category: "Wellness", rating: 4.8, reviews: 189, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop" },
  { id: "3", name: "Pro Plumber NG", category: "Services", rating: 4.7, reviews: 156, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
];

export default function BuyerDashboard() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("explore");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState({ available: 25000, escrow: 15000 });

  // Check auth and load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check session
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        
        if (!sessionData?.user) {
          router.push("/");
          return;
        }

        setUser({
          id: sessionData.user.id,
          email: sessionData.user.email,
          name: sessionData.user.name,
          role: sessionData.user.role,
          isVerified: sessionData.user.isVerified,
        });

        // Load wallet data
        const walletRes = await fetch("/api/wallet");
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWalletBalance({
            available: walletData.wallet?.balance || 0,
            escrow: walletData.wallet?.pendingBalance || 0,
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, setUser]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      IN_PROGRESS: "bg-blue-100 text-blue-700",
      SHIPPED: "bg-purple-100 text-purple-700",
      DELIVERED: "bg-green-100 text-green-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Image 
              src="/zee-logo.png" 
              alt="ZeeFix Hub" 
              width={36} 
              height={36}
              className="rounded-lg"
            />
            <div>
              <span className="font-bold text-gray-900">ZeeFix Hub</span>
              <p className="text-xs text-gray-500">Buyer Mode</p>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search services, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-gray-100 border-0"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => router.push("/dashboard/seller")}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Switch to Seller
            </button>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-gray-600">What would you like to explore today?</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "explore", label: "Explore", icon: Search },
            { id: "orders", label: "My Orders", icon: Package },
            { id: "favorites", label: "Favorites", icon: Heart },
            { id: "wallet", label: "Wallet", icon: Wallet },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeTab === "explore" && (
          <div className="space-y-6">
            {/* Categories Grid */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {EXPLORE_CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.id}`}
                    className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow"
                  >
                    <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{category.label}</p>
                    <p className="text-xs text-gray-500">{category.count} vendors</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <p className="text-sm text-gray-500">Completed Orders</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <p className="text-sm text-gray-500">Active Orders</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                    <p className="text-sm text-gray-500">Saved Vendors</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My Orders</h2>
              <select className="text-sm border rounded-lg px-3 py-2">
                <option>All Orders</option>
                <option>Active</option>
                <option>Completed</option>
              </select>
            </div>

            {MOCK_ORDERS.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={order.image}
                      alt={order.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.title}</h3>
                          <p className="text-sm text-gray-500">{order.vendor}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.statusLabel}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-semibold text-gray-900">{formatCurrency(order.amount)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{order.date}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">{order.tracking}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Saved Vendors</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_FAVORITES.map((vendor) => (
                <Card key={vendor.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={vendor.image}
                        alt={vendor.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                        <p className="text-sm text-gray-500">{vendor.category}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{vendor.rating}</span>
                          <span className="text-sm text-gray-400">({vendor.reviews})</span>
                        </div>
                      </div>
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "wallet" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Zee-Shield Wallet</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Available Balance</span>
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(walletBalance.available)}</p>
                  <p className="text-sm text-white/70 mt-2">Ready for withdrawal</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="font-medium">In Escrow</span>
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(walletBalance.escrow)}</p>
                  <p className="text-sm text-white/70 mt-2">Protected by Zee-Shield</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">How Zee-Shield Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <p className="font-medium text-gray-900">Payment Held Securely</p>
                    <p className="text-sm text-gray-500">Your payment is held in escrow when you place an order</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <p className="font-medium text-gray-900">Complete Your Order</p>
                    <p className="text-sm text-gray-500">Receive your product/service and confirm delivery</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <p className="font-medium text-gray-900">Funds Released</p>
                    <p className="text-sm text-gray-500">Vendor receives payment after your confirmation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="flex justify-around py-2">
          {[
            { icon: Home, label: "Home", active: true },
            { icon: Search, label: "Explore", active: false },
            { icon: Package, label: "Orders", active: false },
            { icon: MessageCircle, label: "Chat", active: false },
            { icon: User, label: "Profile", active: false },
          ].map((item, i) => (
            <button
              key={i}
              className={`flex flex-col items-center py-2 px-3 ${
                item.active ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
