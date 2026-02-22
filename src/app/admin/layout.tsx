"use client";

import { useEffect, useState } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Megaphone,
  UserCheck,
  Users,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Crown,
  Bell,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "next-auth/react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Ad Manager",
    href: "/admin/ads",
    icon: Megaphone,
  },
  {
    name: "Verifications",
    href: "/admin/verifications",
    icon: UserCheck,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Disputes",
    href: "/admin/disputes",
    icon: AlertTriangle,
  },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/?callbackUrl=/admin");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen bg-[#0A192F]">
        <div className="hidden lg:flex lg:w-64 lg:flex-col bg-[#112240]">
          <Skeleton className="h-full w-full rounded-none bg-[#112240]" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-full w-full bg-[#112240]" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#0A192F]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#112240] border-r border-[#233554] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-[#233554]">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] shadow-lg shadow-[#FFD700]/20">
                <Crown className="h-5 w-5 text-[#0A192F]" />
              </div>
              <div>
                <span className="text-base font-bold text-[#FFD700]">Command Centre</span>
                <p className="text-xs text-[#8892B0]">Admin Panel</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-[#8892B0] hover:text-[#E6E6E6] hover:bg-[#233554]"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#FFD700] text-[#0A192F]"
                        : "text-[#8892B0] hover:bg-[#233554] hover:text-[#E6E6E6]"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User section */}
          <div className="border-t border-[#233554] p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-[#FFD700]">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-[#233554] text-[#FFD700] text-sm">
                  {session?.user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#E6E6E6] truncate">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="text-xs text-[#8892B0] truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-[#8892B0] hover:text-[#E6E6E6] hover:bg-[#233554]"
                asChild
              >
                <Link href="/">
                  <Settings className="mr-2 h-4 w-4" />
                  Main Site
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#233554] bg-[#112240] px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-[#8892B0] hover:text-[#E6E6E6]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-[#8892B0]">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-[#8892B0] hover:text-[#FFD700] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#0A192F]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SessionProvider>
  );
}
