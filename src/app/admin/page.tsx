"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  Users,
  Package,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import Link from "next/link";

// Mock revenue data for chart
const revenueData = [
  { month: "Jan", revenue: 45000, orders: 120 },
  { month: "Feb", revenue: 52000, orders: 145 },
  { month: "Mar", revenue: 48000, orders: 130 },
  { month: "Apr", revenue: 61000, orders: 175 },
  { month: "May", revenue: 55000, orders: 160 },
  { month: "Jun", revenue: 67000, orders: 195 },
  { month: "Jul", revenue: 72000, orders: 210 },
];

interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeDisputes: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    buyer: {
      name?: string | null;
      email: string;
      profile?: { fullName?: string | null } | null;
    } | null;
    listing: {
      title: string;
    } | null;
  }>;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch("/api/admin/dashboard");
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchDashboardStats,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-purple-100 text-purple-800",
      SHIPPED: "bg-indigo-100 text-indigo-800",
      DELIVERED: "bg-green-100 text-green-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      DISPUTED: "bg-orange-100 text-orange-800",
      REFUNDED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const metrics = [
    {
      title: "Total Revenue",
      value: stats ? formatCurrency(stats.totalRevenue) : "₦0",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Users",
      value: stats?.totalUsers.toLocaleString() || "0",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Listings",
      value: stats?.totalListings.toLocaleString() || "0",
      change: "+5.4%",
      trend: "up",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Verifications",
      value: stats?.pendingVerifications.toLocaleString() || "0",
      change: "-2.1%",
      trend: "down",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Active Disputes",
      value: stats?.activeDisputes.toLocaleString() || "0",
      change: "+1.8%",
      trend: "up",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your platform.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <Button className="bg-[#2563EB] hover:bg-[#2563EB]/90" asChild>
            <Link href="/admin/ads">
              <TrendingUp className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        metric.trend === "up" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {metric.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} tickFormatter={(value) => `₦${value / 1000}k`} />
                  <Tooltip
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, "Revenue"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Trend</CardTitle>
            <CardDescription>Monthly order volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => [value, "Orders"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#F97316"
                    strokeWidth={2}
                    dot={{ fill: "#F97316", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest transactions on the platform</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/disputes">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : stats?.recentOrders?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.recentOrders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.orderNumber.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.buyer?.profile?.fullName || order.buyer?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.buyer?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {order.listing?.title || "Unknown Product"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <Link href="/admin/verifications">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-orange-100 p-3 group-hover:bg-orange-200 transition-colors">
                  <UserCheck className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold">Review Verifications</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.pendingVerifications || 0} pending
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <Link href="/admin/disputes">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-red-100 p-3 group-hover:bg-red-200 transition-colors">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold">Resolve Disputes</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.activeDisputes || 0} active
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <Link href="/admin/users">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-100 p-3 group-hover:bg-blue-200 transition-colors">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Manage Users</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.totalUsers || 0} total users
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <Link href="/admin/ads">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-purple-100 p-3 group-hover:bg-purple-200 transition-colors">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">Marketing Campaigns</p>
                  <p className="text-sm text-muted-foreground">Manage ads</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
