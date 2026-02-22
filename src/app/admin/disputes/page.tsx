"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  DollarSign,
  Package,
  User,
  Calendar,
  FileText,
  Send,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name?: string | null;
    profile?: {
      fullName?: string | null;
      avatar?: string | null;
    } | null;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  serviceFee: number;
  createdAt: string;
  disputeReason?: string | null;
  disputeStatus?: string | null;
  disputeResolution?: string | null;
  disputeResolvedBy?: string | null;
  listing: {
    id: string;
    title: string;
    price: number;
    thumbnail?: string | null;
  };
  buyer: {
    id: string;
    name?: string | null;
    email: string;
    profile?: {
      fullName?: string | null;
      avatar?: string | null;
    } | null;
  };
  seller: {
    id: string;
    name?: string | null;
    email: string;
    profile?: {
      fullName?: string | null;
      avatar?: string | null;
      storeName?: string | null;
    } | null;
  };
  messages?: Message[];
}

interface DisputesResponse {
  orders: Order[];
}

async function fetchDisputes(status: string): Promise<DisputesResponse> {
  const res = await fetch(`/api/admin/disputes?status=${status}`);
  if (!res.ok) throw new Error("Failed to fetch disputes");
  return res.json();
}

async function resolveDispute(orderId: string, resolution: string, notes: string): Promise<void> {
  const res = await fetch(`/api/admin/disputes/${orderId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resolution, notes }),
  });
  if (!res.ok) throw new Error("Failed to resolve dispute");
}

export default function DisputesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolutionType, setResolutionType] = useState<"release_to_seller" | "refund_buyer">("release_to_seller");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-disputes", statusFilter],
    queryFn: () => fetchDisputes(statusFilter),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ orderId, resolution, notes }: { orderId: string; resolution: string; notes: string }) =>
      resolveDispute(orderId, resolution, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });
      setResolveDialogOpen(false);
      setResolutionNotes("");
      setSelectedOrder(null);
      toast.success("Dispute resolved successfully");
    },
    onError: () => {
      toast.error("Failed to resolve dispute");
    },
  });

  const filteredOrders = data?.orders?.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.listing.title.toLowerCase().includes(searchLower) ||
      order.buyer.email.toLowerCase().includes(searchLower) ||
      order.seller.email.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-purple-100 text-purple-800",
      DISPUTED: "bg-red-100 text-red-800",
      COMPLETED: "bg-green-100 text-green-800",
      REFUNDED: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getDisputeStatusBadge = (status?: string | null) => {
    if (status === "open") {
      return <Badge className="bg-red-100 text-red-800">Open Dispute</Badge>;
    }
    if (status === "resolved") {
      return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const handleResolve = () => {
    if (selectedOrder) {
      resolveMutation.mutate({
        orderId: selectedOrder.id,
        resolution: resolutionType,
        notes: resolutionNotes,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Disputes Management</h1>
        <p className="text-muted-foreground">
          Review and resolve order disputes between buyers and sellers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Disputes</p>
                <p className="text-xl font-bold">
                  {data?.orders?.filter((o) => o.disputeStatus === "open").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-xl font-bold">
                  {data?.orders?.filter((o) => o.disputeStatus === "resolved").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total in Dispute</p>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    data?.orders?.reduce((sum, o) => sum + o.totalAmount, 0) || 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order, product, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Disputes List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOrders?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium">No disputes found</p>
            <p className="text-muted-foreground text-sm">
              {searchTerm ? "Try adjusting your search" : `No ${statusFilter} disputes`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders?.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">#{order.orderNumber.slice(0, 8)}</span>
                    {getStatusBadge(order.status)}
                    {getDisputeStatusBadge(order.disputeStatus)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                    <Button size="sm" onClick={() => setSelectedOrder(order)}>
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Product */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                        {order.listing.thumbnail ? (
                          <img
                            src={order.listing.thumbnail}
                            alt={order.listing.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{order.listing.title}</p>
                        <p className="text-lg font-bold text-[#2563EB]">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Buyer/Seller */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={order.buyer.profile?.avatar || ""} />
                          <AvatarFallback className="bg-blue-500 text-white text-xs">B</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-muted-foreground">Buyer</p>
                          <p className="text-sm font-medium">
                            {order.buyer.profile?.fullName || order.buyer.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={order.seller.profile?.avatar || ""} />
                          <AvatarFallback className="bg-purple-500 text-white text-xs">S</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-muted-foreground">Seller</p>
                          <p className="text-sm font-medium">
                            {order.seller.profile?.storeName || order.seller.profile?.fullName || order.seller.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dispute Reason */}
                  {order.disputeReason && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Dispute Reason:</p>
                          <p className="text-sm text-red-700">{order.disputeReason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resolution */}
                  {order.disputeStatus === "resolved" && order.disputeResolution && (
                    <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-100">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Resolution:</p>
                          <p className="text-sm text-green-700">{order.disputeResolution}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dispute Details Dialog */}
      <Dialog open={!!selectedOrder && !resolveDialogOpen} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Dispute Details - #{selectedOrder?.orderNumber.slice(0, 8)}
            </DialogTitle>
            <DialogDescription>
              Review the dispute and take action
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Product</Label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                      {selectedOrder.listing.thumbnail ? (
                        <img
                          src={selectedOrder.listing.thumbnail}
                          alt={selectedOrder.listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedOrder.listing.title}</p>
                      <p className="text-[#2563EB] font-bold">{formatCurrency(selectedOrder.totalAmount)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(selectedOrder.status)}
                    {getDisputeStatusBadge(selectedOrder.disputeStatus)}
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Buyer</Label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedOrder.buyer.profile?.avatar || ""} />
                      <AvatarFallback className="bg-blue-500 text-white">B</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedOrder.buyer.profile?.fullName || selectedOrder.buyer.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedOrder.buyer.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Seller</Label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedOrder.seller.profile?.avatar || ""} />
                      <AvatarFallback className="bg-purple-500 text-white">S</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedOrder.seller.profile?.storeName || selectedOrder.seller.profile?.fullName || selectedOrder.seller.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedOrder.seller.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dispute Reason */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Dispute Reason</Label>
                <div className="p-3 rounded-lg border bg-red-50 border-red-100">
                  <p className="text-sm">{selectedOrder.disputeReason || "No reason provided"}</p>
                </div>
              </div>

              {/* Chat History */}
              {selectedOrder.messages && selectedOrder.messages.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat History
                  </Label>
                  <ScrollArea className="h-64 rounded-lg border p-4">
                    <div className="space-y-4">
                      {selectedOrder.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.sender.id === selectedOrder.buyer.id ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`flex gap-2 max-w-[80%] ${
                              message.sender.id === selectedOrder.buyer.id ? "flex-row" : "flex-row-reverse"
                            }`}
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={message.sender.profile?.avatar || ""} />
                              <AvatarFallback className="text-xs">
                                {message.sender.profile?.fullName?.charAt(0) || message.sender.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`p-3 rounded-lg ${
                                message.sender.id === selectedOrder.buyer.id
                                  ? "bg-gray-100"
                                  : "bg-[#2563EB] text-white"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-60 mt-1">{formatDate(message.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Previous Resolution */}
              {selectedOrder.disputeStatus === "resolved" && selectedOrder.disputeResolution && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Resolution</Label>
                  <div className="p-3 rounded-lg border bg-green-50 border-green-100">
                    <p className="text-sm">{selectedOrder.disputeResolution}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedOrder?.disputeStatus === "open" && (
            <DialogFooter className="gap-2 border-t pt-4">
              <Button
                variant="outline"
                className="border-purple-500 text-purple-600 hover:bg-purple-50"
                onClick={() => {
                  setResolutionType("release_to_seller");
                  setResolveDialogOpen(true);
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Release to Seller
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => {
                  setResolutionType("refund_buyer");
                  setResolveDialogOpen(true);
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refund Buyer
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resolutionType === "release_to_seller" ? "Release Payment to Seller" : "Refund to Buyer"}
            </DialogTitle>
            <DialogDescription>
              {resolutionType === "release_to_seller"
                ? "This will release the escrow payment to the seller. This action cannot be undone."
                : "This will refund the payment back to the buyer's wallet. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg border bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-lg">{formatCurrency(selectedOrder?.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-muted-foreground">Service Fee:</span>
                <span className="font-medium">{formatCurrency(selectedOrder?.serviceFee || 0)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {resolutionType === "release_to_seller" ? "Seller receives:" : "Buyer receives:"}
                </span>
                <span className="font-bold text-[#2563EB]">
                  {formatCurrency(
                    resolutionType === "release_to_seller"
                      ? (selectedOrder?.totalAmount || 0) - (selectedOrder?.serviceFee || 0)
                      : selectedOrder?.totalAmount || 0
                  )}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                placeholder="Add notes about this resolution..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className={
                resolutionType === "release_to_seller"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-orange-500 hover:bg-orange-600"
              }
              onClick={handleResolve}
              disabled={resolveMutation.isPending}
            >
              {resolveMutation.isPending
                ? "Processing..."
                : resolutionType === "release_to_seller"
                ? "Release to Seller"
                : "Refund Buyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
