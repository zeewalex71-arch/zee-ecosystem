"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  Users,
  Package,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Search,
  Download,
  Plane,
  LogOut,
  BarChart3,
  CreditCard,
  Settings,
  Bell,
  Activity,
  Globe,
  UserCheck,
  Ban,
  Crown,
  Zap,
  Store,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for analytics
const ANALYTICS_DATA = {
  totalRevenue: 48750000,
  platformCommission: 9750000,
  activeVendors: 1247,
  activeBuyers: 8543,
  activeExports: 89,
  pendingVendors: 23,
  openDisputes: 7,
  todayOrders: 156,
  monthlyGrowth: 12.5,
  totalTransactions: 4521,
};

// Mock pending vendors
const PENDING_VENDORS = [
  {
    id: "1",
    name: "Adaeze Okafor",
    email: "adaeze@herbs.com",
    business: "Naija Herbal Solutions",
    category: "Wellness",
    nin: "12345678901",
    submittedAt: "2024-01-15T10:30:00",
    status: "pending",
    hasVideoTour: true,
  },
  {
    id: "2",
    name: "Chukwuemeka Eze",
    email: "chukwu@fashion.ng",
    business: "Ankara Palace",
    category: "Fashion",
    nin: "98765432101",
    submittedAt: "2024-01-15T09:15:00",
    status: "pending",
    hasVideoTour: false,
  },
  {
    id: "3",
    name: "Fatima Abubakar",
    email: "fatima@export.com",
    business: "Diaspora Foods NG",
    category: "Export",
    nin: "45678912301",
    submittedAt: "2024-01-14T16:45:00",
    status: "under_review",
    hasVideoTour: true,
  },
];

// Mock disputes
const DISPUTES = [
  {
    id: "DSP-001",
    type: "Non-Delivery",
    buyer: "John Doe",
    vendor: "Lagos Fashion House",
    amount: 45000,
    status: "open",
    createdAt: "2024-01-14T14:00:00",
    escrowStatus: "holding",
  },
  {
    id: "DSP-002",
    type: "Quality Issue",
    buyer: "Jane Smith",
    vendor: "Pro Plumber NG",
    amount: 25000,
    status: "investigating",
    createdAt: "2024-01-13T11:30:00",
    escrowStatus: "holding",
  },
];

// Recent transactions
const RECENT_TRANSACTIONS = [
  { id: "TXN-001", type: "escrow_hold", amount: 85000, vendor: "Diaspora Foods", time: "2 min ago" },
  { id: "TXN-002", type: "commission", amount: 17000, vendor: "Platform Fee", time: "5 min ago" },
  { id: "TXN-003", type: "release", amount: 68000, vendor: "Lagos Fashion", time: "12 min ago" },
  { id: "TXN-004", type: "escrow_hold", amount: 125000, vendor: "Ankara Palace", time: "18 min ago" },
  { id: "TXN-005", type: "refund", amount: 25000, vendor: "Disputed Order", time: "25 min ago" },
];

// Revenue chart data
const REVENUE_DATA = [
  { month: "Jan", revenue: 4200000, commission: 840000 },
  { month: "Feb", revenue: 5100000, commission: 1020000 },
  { month: "Mar", revenue: 4800000, commission: 960000 },
  { month: "Apr", revenue: 6200000, commission: 1240000 },
  { month: "May", revenue: 7100000, commission: 1420000 },
  { month: "Jun", revenue: 8500000, commission: 1700000 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState<{ name: string; email: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.role === "ADMIN") {
          setIsAdmin(true);
          setAdminData({
            name: data.user.name || "Admin",
            email: data.user.email || "admin@zeefix.com",
          });
        } else {
          router.push("/");
        }
        setIsLoading(false);
      })
      .catch(() => {
        router.push("/");
        setIsLoading(false);
      });
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A192F]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8892B0]">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A192F]">
      {/* Admin Header */}
      <header className="bg-[#112240] border-b border-[#233554] sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl flex items-center justify-center shadow-lg shadow-[#FFD700]/20">
                <Crown className="w-5 h-5 text-[#0A192F]" />
              </div>
              <div>
                <span className="font-bold text-lg text-[#FFD700]">Command Centre</span>
                <p className="text-xs text-[#8892B0]">ZeeFix Hub Admin</p>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "vendors", label: "Vendors", icon: Store },
              { id: "users", label: "Users", icon: Users },
              { id: "disputes", label: "Disputes", icon: AlertTriangle },
              { id: "transactions", label: "Transactions", icon: CreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#FFD700] text-[#0A192F]"
                    : "text-[#8892B0] hover:text-[#E6E6E6] hover:bg-[#233554]"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#8892B0] hover:text-[#FFD700] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-[#FFD700]">
                <AvatarFallback className="bg-[#233554] text-[#FFD700]">
                  {adminData?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-[#E6E6E6]">{adminData?.name}</p>
                <p className="text-xs text-[#8892B0]">Super Admin</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-3 py-2 bg-[#233554] hover:bg-[#233554]/80 rounded-lg text-sm text-[#8892B0] hover:text-[#E6E6E6] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <Card className="bg-gradient-to-br from-[#112240] to-[#0A192F] border-[#233554] hover:border-[#FFD700]/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8892B0]">Total Revenue</p>
                      <p className="text-2xl font-bold text-[#FFD700] mt-1">
                        {formatCurrency(ANALYTICS_DATA.totalRevenue)}
                      </p>
                      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        +{ANALYTICS_DATA.monthlyGrowth}% this month
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#FFD700]/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-[#FFD700]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Commission */}
              <Card className="bg-gradient-to-br from-[#112240] to-[#0A192F] border-[#233554] hover:border-green-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8892B0]">Platform Earnings (20%)</p>
                      <p className="text-2xl font-bold text-green-400 mt-1">
                        {formatCurrency(ANALYTICS_DATA.platformCommission)}
                      </p>
                      <p className="text-xs text-[#8892B0] mt-1">Net profit</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Users */}
              <Card className="bg-gradient-to-br from-[#112240] to-[#0A192F] border-[#233554] hover:border-blue-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8892B0]">Active Users</p>
                      <p className="text-2xl font-bold text-blue-400 mt-1">
                        {(ANALYTICS_DATA.activeVendors + ANALYTICS_DATA.activeBuyers).toLocaleString()}
                      </p>
                      <p className="text-xs text-[#8892B0] mt-1">
                        {ANALYTICS_DATA.activeVendors} vendors • {ANALYTICS_DATA.activeBuyers} buyers
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Orders */}
              <Card className="bg-gradient-to-br from-[#112240] to-[#0A192F] border-[#233554] hover:border-purple-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8892B0]">Today&apos;s Orders</p>
                      <p className="text-2xl font-bold text-purple-400 mt-1">
                        {ANALYTICS_DATA.todayOrders}
                      </p>
                      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        +8% from yesterday
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-[#112240] border-[#233554] border-l-4 border-l-yellow-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8892B0]">Pending Vendors</p>
                    <p className="text-xl font-bold text-[#E6E6E6]">{ANALYTICS_DATA.pendingVendors}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </CardContent>
              </Card>

              <Card className="bg-[#112240] border-[#233554] border-l-4 border-l-red-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8892B0]">Open Disputes</p>
                    <p className="text-xl font-bold text-[#E6E6E6]">{ANALYTICS_DATA.openDisputes}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </CardContent>
              </Card>

              <Card className="bg-[#112240] border-[#233554] border-l-4 border-l-[#FFD700]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8892B0]">Active Exports</p>
                    <p className="text-xl font-bold text-[#E6E6E6]">{ANALYTICS_DATA.activeExports}</p>
                  </div>
                  <Plane className="w-8 h-8 text-[#FFD700]" />
                </CardContent>
              </Card>

              <Card className="bg-[#112240] border-[#233554] border-l-4 border-l-green-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8892B0]">Total Transactions</p>
                    <p className="text-xl font-bold text-[#E6E6E6]">{ANALYTICS_DATA.totalTransactions.toLocaleString()}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </CardContent>
              </Card>
            </div>

            {/* Charts & Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card className="bg-[#112240] border-[#233554]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg text-[#E6E6E6]">Revenue Overview</CardTitle>
                  <Button variant="ghost" size="sm" className="text-[#8892B0]">Last 6 months</Button>
                </CardHeader>
                <CardContent>
                  <div className="flex h-[200px] items-end justify-between gap-4 px-2">
                    {REVENUE_DATA.map((data, index) => {
                      const maxRevenue = Math.max(...REVENUE_DATA.map((d) => d.revenue));
                      const height = (data.revenue / maxRevenue) * 100;
                      return (
                        <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                          <div className="w-full flex flex-col items-center gap-1">
                            <div
                              className="w-full rounded-t-lg bg-gradient-to-t from-[#FFD700]/50 to-[#FFD700]"
                              style={{ height: `${height * 0.8}px` }}
                            />
                            <div
                              className="w-full rounded-b-lg bg-green-500/50"
                              style={{ height: `${height * 0.2}px` }}
                            />
                          </div>
                          <span className="text-xs text-[#8892B0]">{data.month}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-[#FFD700]" />
                      <span className="text-[#8892B0]">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-green-500/50" />
                      <span className="text-[#8892B0]">Commission</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="bg-[#112240] border-[#233554]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg text-[#E6E6E6]">Recent Transactions</CardTitle>
                  <Button variant="ghost" size="sm" className="text-[#FFD700] hover:text-[#FFD700]" onClick={() => setActiveTab("transactions")}>View All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {RECENT_TRANSACTIONS.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between py-2 border-b border-[#233554] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          txn.type === "escrow_hold" ? "bg-blue-500/10 text-blue-400" :
                          txn.type === "commission" ? "bg-green-500/10 text-green-400" :
                          txn.type === "release" ? "bg-purple-500/10 text-purple-400" :
                          "bg-red-500/10 text-red-400"
                        }`}>
                          {txn.type === "escrow_hold" ? <Shield className="w-5 h-5" /> :
                           txn.type === "commission" ? <TrendingUp className="w-5 h-5" /> :
                           txn.type === "release" ? <CheckCircle2 className="w-5 h-5" /> :
                           <XCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#E6E6E6]">{txn.vendor}</p>
                          <p className="text-xs text-[#8892B0]">{txn.time}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${
                        txn.type === "refund" ? "text-red-400" : "text-green-400"
                      }`}>
                        {txn.type === "refund" ? "-" : "+"}{formatCurrency(txn.amount)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="h-auto py-4 bg-[#112240] hover:bg-[#1a3355] border border-[#233554] justify-start"
                onClick={() => setActiveTab("vendors")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-[#FFD700]" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-[#E6E6E6]">Review Vendors</p>
                    <p className="text-xs text-[#8892B0]">{ANALYTICS_DATA.pendingVendors} pending</p>
                  </div>
                </div>
              </Button>

              <Button 
                className="h-auto py-4 bg-[#112240] hover:bg-[#1a3355] border border-[#233554] justify-start"
                onClick={() => setActiveTab("disputes")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-[#E6E6E6]">Handle Disputes</p>
                    <p className="text-xs text-[#8892B0]">{ANALYTICS_DATA.openDisputes} open</p>
                  </div>
                </div>
              </Button>

              <Button 
                className="h-auto py-4 bg-[#112240] hover:bg-[#1a3355] border border-[#233554] justify-start"
                onClick={() => setActiveTab("users")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-[#E6E6E6]">Manage Users</p>
                    <p className="text-xs text-[#8892B0]">View all users</p>
                  </div>
                </div>
              </Button>

              <Button 
                className="h-auto py-4 bg-[#112240] hover:bg-[#1a3355] border border-[#233554] justify-start"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-[#E6E6E6]">Export Report</p>
                    <p className="text-xs text-[#8892B0]">Financial data</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === "vendors" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#E6E6E6]">Vendor Vetting Queue</h2>
                <p className="text-sm text-[#8892B0]">Review and approve merchant applications</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892B0]" />
                  <Input
                    placeholder="Search vendors..."
                    className="pl-9 w-64 bg-[#112240] border-[#233554] text-[#E6E6E6] placeholder-[#8892B0] focus:border-[#FFD700]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {PENDING_VENDORS.map((vendor) => (
                <Card key={vendor.id} className="bg-[#112240] border-[#233554] hover:border-[#FFD700]/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/10 flex items-center justify-center">
                          <Store className="w-6 h-6 text-[#FFD700]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#E6E6E6]">{vendor.business}</p>
                            <Badge variant={vendor.status === "pending" ? "outline" : "secondary"} className={
                              vendor.status === "pending" 
                                ? "border-yellow-500 text-yellow-400" 
                                : "bg-blue-500/10 text-blue-400"
                            }>
                              {vendor.status === "pending" ? "New" : "Under Review"}
                            </Badge>
                          </div>
                          <p className="text-sm text-[#8892B0]">{vendor.name} • {vendor.email}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-[#8892B0]">
                            <span>Category: {vendor.category}</span>
                            <span>NIN: {vendor.nin}</span>
                            <span className={vendor.hasVideoTour ? "text-green-400" : "text-yellow-400"}>
                              {vendor.hasVideoTour ? "✓ Video Tour" : "⚠ No Video Tour"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-[#233554] text-[#8892B0] hover:text-[#E6E6E6] hover:bg-[#233554]">
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700">
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#E6E6E6]">User Management</h2>
                <p className="text-sm text-[#8892B0]">View and manage all platform users</p>
              </div>
            </div>

            <Card className="bg-[#112240] border-[#233554]">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0A192F] border-b border-[#233554]">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-[#8892B0]">User</th>
                        <th className="text-left p-4 text-sm font-medium text-[#8892B0]">Role</th>
                        <th className="text-left p-4 text-sm font-medium text-[#8892B0]">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-[#8892B0]">Joined</th>
                        <th className="text-left p-4 text-sm font-medium text-[#8892B0]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#233554] hover:bg-[#1a3355]">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-[#FFD700]/20 text-[#FFD700]">A</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-[#E6E6E6]">Admin User</p>
                              <p className="text-xs text-[#8892B0]">admin@zeefix.com</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-[#FFD700]/10 text-[#FFD700]">ADMIN</Badge>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-green-500/10 text-green-400">Active</Badge>
                        </td>
                        <td className="p-4 text-sm text-[#8892B0]">Jan 15, 2024</td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" className="text-[#8892B0] hover:text-[#E6E6E6]">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === "disputes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#E6E6E6]">Dispute Resolution</h2>
                <p className="text-sm text-[#8892B0]">Manage escrow holds and buyer-seller conflicts</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-[#8892B0]">Open: 2</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span className="text-[#8892B0]">Investigating: 1</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-[#8892B0]">Resolved: 1</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {DISPUTES.map((dispute) => (
                <Card key={dispute.id} className={`bg-[#112240] border-l-4 ${
                  dispute.status === "open" ? "border-l-red-500" :
                  dispute.status === "investigating" ? "border-l-yellow-500" :
                  "border-l-green-500"
                } border-[#233554]`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-[#233554] text-[#8892B0]">{dispute.id}</Badge>
                        <Badge className={
                          dispute.status === "open" ? "bg-red-500/10 text-red-400" :
                          dispute.status === "investigating" ? "bg-yellow-500/10 text-yellow-400" :
                          "bg-green-500/10 text-green-400"
                        }>
                          {dispute.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-[#8892B0]">
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-[#8892B0]">Type</p>
                        <p className="font-medium text-[#E6E6E6]">{dispute.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8892B0]">Buyer</p>
                        <p className="font-medium text-[#E6E6E6]">{dispute.buyer}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8892B0]">Vendor</p>
                        <p className="font-medium text-[#E6E6E6]">{dispute.vendor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8892B0]">Amount in Escrow</p>
                        <p className="font-medium text-lg text-[#FFD700]">{formatCurrency(dispute.amount)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#233554]">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#FFD700]" />
                        <span className="text-sm text-[#8892B0]">Escrow Status: </span>
                        <Badge className="bg-blue-500/10 text-blue-400">{dispute.escrowStatus}</Badge>
                      </div>
                      
                      {dispute.status !== "resolved" && (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-[#233554] text-green-400 hover:bg-green-500/10">
                            Release to Vendor
                          </Button>
                          <Button variant="outline" size="sm" className="border-[#233554] text-red-400 hover:bg-red-500/10">
                            Refund Buyer
                          </Button>
                          <Button size="sm" className="bg-[#FFD700] hover:bg-[#FFD700]/80 text-[#0A192F]">
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#E6E6E6]">All Transactions</h2>
                <p className="text-sm text-[#8892B0]">Complete financial history</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-[#233554] text-[#8892B0] hover:text-[#E6E6E6] hover:bg-[#233554]">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <Card className="bg-[#112240] border-[#233554]">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0A192F] border-b border-[#233554]">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-[#8892B0]">Transaction ID</th>
                        <th className="text-left p-4 text-sm font-medium text-[#8892B0]">Type</th>
                        <th className="text-left p-4 text-sm font-medium text-[#8892B0]">Amount</th>
                        <th className="text-left p-4 text-sm font-medium text-[#8892B0]">Party</th>
                        <th className="text-left p-4 text-sm font-medium text-[#8892B0]">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-[#8892B0]">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RECENT_TRANSACTIONS.map((txn) => (
                        <tr key={txn.id} className="border-b border-[#233554] hover:bg-[#1a3355]">
                          <td className="p-4 text-sm font-medium text-[#E6E6E6]">{txn.id}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="border-[#233554] text-[#8892B0] capitalize">
                              {txn.type.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm font-semibold text-green-400">{formatCurrency(txn.amount)}</td>
                          <td className="p-4 text-sm text-[#8892B0]">{txn.vendor}</td>
                          <td className="p-4">
                            <Badge className="bg-green-500/10 text-green-400">Completed</Badge>
                          </td>
                          <td className="p-4 text-sm text-[#8892B0]">{txn.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
