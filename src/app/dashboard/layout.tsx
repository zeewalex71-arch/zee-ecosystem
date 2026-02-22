"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  MessageSquare,
  Settings,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Store,
  Plus,
  HelpCircle,
  RefreshCw,
  ShoppingBasket,
  Home,
  Search,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores/app-store";

const buyerLinks = [
  {
    title: "Home",
    href: "/dashboard/buyer",
    icon: Home,
  },
  {
    title: "Categories",
    href: "/dashboard/buyer?tab=explore",
    icon: Search,
  },
  {
    title: "My Orders",
    href: "/dashboard/buyer?tab=orders",
    icon: Package,
  },
  {
    title: "Favorites",
    href: "/dashboard/buyer?tab=favorites",
    icon: Heart,
  },
  {
    title: "Wallet",
    href: "/dashboard/buyer?tab=wallet",
    icon: Wallet,
  },
];

const sellerLinks = [
  {
    title: "Dashboard",
    href: "/dashboard/seller",
    icon: LayoutDashboard,
  },
  {
    title: "Listings",
    href: "/dashboard/seller/listings",
    icon: Package,
    children: [
      { title: "All Listings", href: "/dashboard/seller/listings" },
      { title: "Create New", href: "/dashboard/seller/listings/new" },
    ],
  },
  {
    title: "Orders",
    href: "/dashboard/seller/orders",
    icon: ShoppingCart,
  },
  {
    title: "Wallet",
    href: "/dashboard/seller/wallet",
    icon: Wallet,
  },
  {
    title: "Messages",
    href: "/dashboard/seller/messages",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/dashboard/seller/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Derive role from pathname
  const userRole: "BUYER" | "SELLER" = pathname.includes("/buyer") ? "BUYER" : "SELLER";
  const sidebarLinks = userRole === "BUYER" ? buyerLinks : sellerLinks;

  const isActiveLink = (href: string) => {
    if (href === "/dashboard/seller" || href === "/dashboard/buyer") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleSwitchMode = async () => {
    try {
      const newRole = userRole === "BUYER" ? "SELLER" : "BUYER";
      
      // Update role in backend
      await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      // Redirect to appropriate dashboard
      if (newRole === "SELLER") {
        router.push("/dashboard/seller");
      } else {
        router.push("/dashboard/buyer");
      }
    } catch (error) {
      console.error("Failed to switch mode:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/zee-logo.png" alt="ZeeFix Hub" className="w-8 h-8 rounded-lg" />
            <div>
              <span className="text-lg font-bold text-gray-900">ZeeFix Hub</span>
              <p className="text-[10px] text-gray-500">{userRole} Mode</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="space-y-1 p-4">
            {sidebarLinks.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActiveLink(link.href)
                      ? "bg-[#2563EB]/10 text-[#2563EB]"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.title}</span>
                </Link>
                {link.children && isActiveLink(link.href) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition-colors",
                          pathname === child.href
                            ? "bg-[#2563EB]/10 text-[#2563EB] font-medium"
                            : "text-gray-500 hover:text-gray-700"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Quick Actions */}
          {userRole === "SELLER" && (
            <div className="border-t p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                Quick Actions
              </p>
              <Link href="/dashboard/seller/listings/new">
                <Button className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Listing
                </Button>
              </Link>
            </div>
          )}

          {/* Switch Mode */}
          <div className="border-t p-4">
            <Button
              variant="outline"
              onClick={handleSwitchMode}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Switch to {userRole === "BUYER" ? "Seller" : "Buyer"} Mode
            </Button>
          </div>

          {/* Help */}
          <div className="border-t p-4">
            <Link
              href="/help"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Help & Support</span>
            </Link>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 lg:text-xl">
              {userRole === "BUYER" ? "Buyer Dashboard" : "Seller Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#F97316]" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                    <AvatarFallback className="bg-[#2563EB] text-white text-sm">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userRole}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSwitchMode}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Switch to {userRole === "BUYER" ? "Seller" : "Buyer"} Mode
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
