"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  ChevronRight,
  Package,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
  Eye,
  Loader2,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/index";

interface OrderWithDetails extends Order {
  listing?: {
    id: string;
    title: string;
    thumbnail?: string | null;
    type: string;
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

const orderStatuses: { value: OrderStatus; label: string; icon: React.ElementType }[] = [
  { value: "PENDING", label: "Pending", icon: Clock },
  { value: "PAID", label: "Paid", icon: CheckCircle },
  { value: "IN_PROGRESS", label: "In Progress", icon: Package },
  { value: "SHIPPED", label: "Shipped", icon: Truck },
  { value: "DELIVERED", label: "Delivered", icon: CheckCircle },
  { value: "COMPLETED", label: "Completed", icon: CheckCircle },
  { value: "CANCELLED", label: "Cancelled", icon: XCircle },
  { value: "DISPUTED", label: "Disputed", icon: AlertCircle },
];

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/orders/seller");
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on tab and search
  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "all" || order.status === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.listing?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer?.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Get counts for tabs
  const getOrderCounts = () => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  };

  const orderCounts = getOrderCounts();

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig: Record<
      OrderStatus,
      { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
    > = {
      PENDING: { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      PAID: { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200" },
      IN_PROGRESS: { variant: "outline", className: "bg-purple-50 text-purple-700 border-purple-200" },
      SHIPPED: { variant: "outline", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      DELIVERED: { variant: "outline", className: "bg-teal-50 text-teal-700 border-teal-200" },
      COMPLETED: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
      CANCELLED: { variant: "outline", className: "bg-red-50 text-red-700 border-red-200" },
      DISPUTED: { variant: "destructive", className: "" },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={cn("font-medium", config.className)}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const openOrderDetails = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const openUpdateDialog = () => {
    setTrackingNumber(selectedOrder?.trackingNumber || "");
    setDeliveryNotes("");
    setUpdateDialogOpen(true);
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: newStatus === "SHIPPED" ? trackingNumber : undefined,
          deliveryNotes: newStatus === "IN_PROGRESS" ? deliveryNotes : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to update order");

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: newStatus } : o
        )
      );
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );

      setUpdateDialogOpen(false);
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Get available actions based on current status
  const getAvailableActions = (status: OrderStatus): { label: string; action: OrderStatus; variant: "default" | "outline" | "secondary" }[] => {
    switch (status) {
      case "PENDING":
        return [{ label: "Confirm Payment", action: "PAID", variant: "default" }];
      case "PAID":
        return [
          { label: "Start Working", action: "IN_PROGRESS", variant: "default" },
          { label: "Ship Order", action: "SHIPPED", variant: "outline" },
        ];
      case "IN_PROGRESS":
        return [{ label: "Mark Delivered", action: "DELIVERED", variant: "default" }];
      case "SHIPPED":
        return [{ label: "Mark Delivered", action: "DELIVERED", variant: "default" }];
      case "DELIVERED":
        return [{ label: "Complete Order", action: "COMPLETED", variant: "default" }];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-500">
            {isLoading ? "Loading..." : `${orders.length} total orders`}
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by order number, product, or buyer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="w-full justify-start bg-white p-1">
            <TabsTrigger value="all" className="gap-1">
              All
              <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                {orderCounts.all || 0}
              </span>
            </TabsTrigger>
            {orderStatuses.slice(0, 5).map((status) => (
              <TabsTrigger key={status.value} value={status.value} className="gap-1">
                <status.icon className="h-3 w-3" />
                {status.label}
                <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                  {orderCounts[status.value] || 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No orders found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Orders will appear here when customers make purchases"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className="cursor-pointer transition-all hover:border-[#2563EB]/50 hover:shadow-md"
                  onClick={() => openOrderDetails(order)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="hidden h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:block">
                        {order.listing?.thumbnail ? (
                          <img
                            src={order.listing.thumbnail}
                            alt={order.listing.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Order Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.listing?.title || "Unknown Product"}
                            </p>
                            <p className="text-sm text-gray-500">
                              #{order.orderNumber} • {order.quantity} item(s)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(order.totalAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {getStatusBadge(order.status)}
                          <span className="text-xs text-gray-400">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Details Drawer (Mobile) */}
      <Drawer open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Order Details</DrawerTitle>
            <DrawerDescription>
              {selectedOrder?.orderNumber}
            </DrawerDescription>
          </DrawerHeader>
          {selectedOrder && (
            <div className="space-y-4 overflow-y-auto p-4">
              <OrderDetailsContent
                order={selectedOrder}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                formatDateTime={formatDateTime}
                getStatusBadge={getStatusBadge}
              />
            </div>
          )}
          <DrawerFooter>
            {selectedOrder && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDetailsOpen(false)}
                >
                  Close
                </Button>
                {getAvailableActions(selectedOrder.status).length > 0 && (
                  <Button
                    className="flex-1 bg-[#2563EB]"
                    onClick={openUpdateDialog}
                  >
                    Update Status
                  </Button>
                )}
              </div>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Order Details Dialog (Desktop) */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <OrderDetailsContent
                order={selectedOrder}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                formatDateTime={formatDateTime}
                getStatusBadge={getStatusBadge}
              />
            </div>
          )}
          <DialogFooter>
            {selectedOrder && getAvailableActions(selectedOrder.status).length > 0 && (
              <Button
                className="bg-[#2563EB]"
                onClick={openUpdateDialog}
              >
                Update Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Current status: {selectedOrder?.status.replace("_", " ")}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder?.status === "PAID" && selectedOrder.listing?.type === "PHYSICAL" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
            </div>
          )}

          {selectedOrder?.status === "PAID" && selectedOrder.listing?.type === "DIGITAL" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Delivery Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about the delivery..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {selectedOrder &&
              getAvailableActions(selectedOrder.status).map((action) => (
                <Button
                  key={action.action}
                  variant={action.variant}
                  onClick={() => handleStatusUpdate(action.action)}
                  disabled={isUpdating}
                  className={cn(
                    action.variant === "default" && "bg-[#2563EB] hover:bg-[#2563EB]/90"
                  )}
                >
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {action.label}
                </Button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Order Details Content Component
function OrderDetailsContent({
  order,
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusBadge,
}: {
  order: OrderWithDetails;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  formatDateTime: (date: Date | string) => string;
  getStatusBadge: (status: OrderStatus) => React.ReactNode;
}) {
  return (
    <>
      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Status</span>
        {getStatusBadge(order.status)}
      </div>

      <Separator />

      {/* Product Info */}
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
          {order.listing?.thumbnail ? (
            <img
              src={order.listing.thumbnail}
              alt={order.listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-6 w-6 text-gray-300" />
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {order.listing?.title || "Unknown Product"}
          </p>
          <p className="text-sm text-gray-500">
            {order.listing?.type} • {order.category}
          </p>
        </div>
      </div>

      <Separator />

      {/* Buyer Info */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-900">Buyer</h4>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={order.buyer?.profile?.avatar || ""}
              alt={order.buyer?.profile?.fullName || order.buyer?.name || ""}
            />
            <AvatarFallback>
              {(
                order.buyer?.profile?.fullName ||
                order.buyer?.name ||
                order.buyer?.email
              )?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">
              {order.buyer?.profile?.fullName || order.buyer?.name || "Unknown"}
            </p>
            <p className="text-sm text-gray-500">{order.buyer?.email}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Order Details */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Order Details</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Order Date</span>
            <p className="font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <span className="text-gray-500">Quantity</span>
            <p className="font-medium">{order.quantity}</p>
          </div>
          <div>
            <span className="text-gray-500">Unit Price</span>
            <p className="font-medium">{formatCurrency(order.unitPrice)}</p>
          </div>
          <div>
            <span className="text-gray-500">Service Fee</span>
            <p className="font-medium">{formatCurrency(order.serviceFee)}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">Total Amount</span>
        <span className="text-lg font-bold text-gray-900">
          {formatCurrency(order.totalAmount)}
        </span>
      </div>

      {/* Shipping Address (for physical goods) */}
      {order.shippingAddress && (
        <>
          <Separator />
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              Shipping Address
            </h4>
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <p className="font-medium">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-gray-600">{order.shippingAddress.address}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress.country} {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600">{order.shippingAddress.phone}</p>
            </div>
          </div>
        </>
      )}

      {/* Tracking Info */}
      {order.trackingNumber && (
        <>
          <Separator />
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              Tracking Information
            </h4>
            <p className="text-sm">
              <span className="text-gray-500">Tracking Number: </span>
              <span className="font-medium">{order.trackingNumber}</span>
            </p>
            {order.shippedAt && (
              <p className="text-sm text-gray-500">
                Shipped on {formatDateTime(order.shippedAt)}
              </p>
            )}
          </div>
        </>
      )}

      {/* Delivery Info (Digital) */}
      {order.deliveryNotes && (
        <>
          <Separator />
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              Delivery Notes
            </h4>
            <p className="text-sm text-gray-600">{order.deliveryNotes}</p>
          </div>
        </>
      )}

      {/* Escrow Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Escrow Status</span>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {order.escrowStatus}
        </Badge>
      </div>
    </>
  );
}
