"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  UserCheck,
  Shield,
  ShieldOff,
  Mail,
  Calendar,
  DollarSign,
  ShoppingBag,
  Store,
  Snowflake,
  AlertTriangle,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  createdAt: string;
  profile?: {
    id: string;
    fullName?: string | null;
    phone?: string | null;
    avatar?: string | null;
    role: string;
    isVerified: boolean;
    verificationStatus?: string | null;
    storeName?: string | null;
    totalSales: number;
    totalPurchases: number;
    rating: number;
    reviewCount: number;
    isActive: boolean;
    isBanned: boolean;
    bannedReason?: string | null;
    frozenUntil?: string | null;
  } | null;
  wallet?: {
    balance: number;
    pendingBalance: number;
    totalEarned: number;
    totalSpent: number;
  } | null;
}

interface UsersResponse {
  users: User[];
}

async function fetchUsers(role?: string, status?: string): Promise<UsersResponse> {
  const params = new URLSearchParams();
  if (role) params.append("role", role);
  if (status) params.append("status", status);
  const res = await fetch(`/api/admin/users?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

async function banUser(userId: string, ban: boolean, reason?: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${userId}/ban`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ban, reason }),
  });
  if (!res.ok) throw new Error("Failed to ban user");
}

export default function UsersManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banAction, setBanAction] = useState<"ban" | "unban">("ban");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", roleFilter, statusFilter],
    queryFn: () => fetchUsers(roleFilter, statusFilter),
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, ban, reason }: { userId: string; ban: boolean; reason?: string }) =>
      banUser(userId, ban, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setBanDialogOpen(false);
      setBanReason("");
      setSelectedUser(null);
      toast.success(`User ${banAction === "ban" ? "banned" : "unbanned"} successfully`);
    },
    onError: () => {
      toast.error(`Failed to ${banAction} user`);
    },
  });

  const filteredUsers = data?.users?.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.name?.toLowerCase().includes(searchLower) ||
      user.profile?.fullName?.toLowerCase().includes(searchLower) ||
      user.profile?.storeName?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
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

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      BUYER: "bg-blue-100 text-blue-800",
      SELLER: "bg-purple-100 text-purple-800",
      ADMIN: "bg-orange-100 text-orange-800",
    };
    return (
      <Badge className={colors[role] || "bg-gray-100 text-gray-800"}>
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (user: User) => {
    if (user.profile?.isBanned) {
      return <Badge className="bg-red-100 text-red-800">Banned</Badge>;
    }
    if (user.profile?.frozenUntil && new Date(user.profile.frozenUntil) > new Date()) {
      return <Badge className="bg-cyan-100 text-cyan-800">Frozen</Badge>;
    }
    if (user.profile?.verificationStatus === "pending") {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>;
    }
    if (user.profile?.isVerified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Active</Badge>;
  };

  const handleBanAction = (user: User, action: "ban" | "unban") => {
    setSelectedUser(user);
    setBanAction(action);
    if (action === "ban") {
      setBanDialogOpen(true);
    } else {
      banMutation.mutate({ userId: user.id, ban: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-muted-foreground">
          Manage all users, roles, and account statuses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Buyers</p>
                <p className="text-xl font-bold">
                  {data?.users?.filter((u) => u.profile?.role === "BUYER").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Store className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sellers</p>
                <p className="text-xl font-bold">
                  {data?.users?.filter((u) => u.profile?.role === "SELLER").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-xl font-bold">
                  {data?.users?.filter((u) => u.profile?.role === "ADMIN").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2">
                <Ban className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Banned</p>
                <p className="text-xl font-bold">
                  {data?.users?.filter((u) => u.profile?.isBanned).length || 0}
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
            placeholder="Search by name, email, or store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Roles</SelectItem>
            <SelectItem value="BUYER">Buyer</SelectItem>
            <SelectItem value="SELLER">Seller</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending_verification">Pending Verification</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : filteredUsers?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-muted-foreground text-sm">
                {searchTerm ? "Try adjusting your search" : "No users match the current filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Wallet Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.profile?.avatar || user.image || ""} />
                            <AvatarFallback className="bg-[#2563EB] text-white text-xs">
                              {user.profile?.fullName?.charAt(0) || user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.profile?.fullName || user.name || "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.profile?.role || "BUYER")}</TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(user.wallet?.balance || 0)}
                        </div>
                        {user.wallet?.pendingBalance ? (
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(user.wallet.pendingBalance)} pending
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.profile?.isBanned ? (
                              <DropdownMenuItem
                                className="text-green-600 focus:text-green-600"
                                onClick={() => handleBanAction(user, "unban")}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleBanAction(user, "ban")}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Ban User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Snowflake className="mr-2 h-4 w-4" />
                              Freeze Account
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

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser && !banDialogOpen} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Detailed information about this user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.profile?.avatar || selectedUser.image || ""} />
                  <AvatarFallback className="bg-[#2563EB] text-white text-xl">
                    {selectedUser.profile?.fullName?.charAt(0) || selectedUser.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {selectedUser.profile?.fullName || selectedUser.name || "Unknown"}
                    </h3>
                    {getRoleBadge(selectedUser.profile?.role || "BUYER")}
                  </div>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  {selectedUser.profile?.phone && (
                    <p className="text-sm text-muted-foreground">{selectedUser.profile.phone}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedUser)}
                {selectedUser.profile?.isBanned && selectedUser.profile.bannedReason && (
                  <span className="text-sm text-red-600">
                    Reason: {selectedUser.profile.bannedReason}
                  </span>
                )}
              </div>

              {/* Store Info for Sellers */}
              {selectedUser.profile?.role === "SELLER" && selectedUser.profile.storeName && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Store Information</Label>
                  <div className="rounded-lg border p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Store Name:</span>
                      <span className="font-medium">{selectedUser.profile.storeName}</span>
                    </div>
                    {selectedUser.profile.totalSales > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Sales:</span>
                        <span className="font-medium">{selectedUser.profile.totalSales}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="font-medium">
                        {selectedUser.profile.rating.toFixed(1)} ({selectedUser.profile.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Info */}
              {selectedUser.wallet && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Wallet</Label>
                  <div className="rounded-lg border p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-lg font-bold">{formatCurrency(selectedUser.wallet.balance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Balance</p>
                      <p className="text-lg font-bold">{formatCurrency(selectedUser.wallet.pendingBalance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earned</p>
                      <p className="font-medium">{formatCurrency(selectedUser.wallet.totalEarned)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="font-medium">{formatCurrency(selectedUser.wallet.totalSpent)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg border">
                  <p className="text-2xl font-bold">{selectedUser.profile?.totalPurchases || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Purchases</p>
                </div>
                <div className="text-center p-3 rounded-lg border">
                  <p className="text-2xl font-bold">{formatDate(selectedUser.createdAt)}</p>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                </div>
              </div>

              <DialogFooter className="gap-2">
                {selectedUser.profile?.isBanned ? (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleBanAction(selectedUser, "unban")}
                    disabled={banMutation.isPending}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Unban User
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => handleBanAction(selectedUser, "ban")}
                    disabled={banMutation.isPending}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Ban User
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Ban User
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for banning this user. They will not be able to access their account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter ban reason..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => banMutation.mutate({ userId: selectedUser?.id || "", ban: true, reason: banReason })}
              disabled={banMutation.isPending || !banReason.trim()}
            >
              {banMutation.isPending ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
