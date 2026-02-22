"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Search,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  Calendar,
  MoreHorizontal,
  Eye,
  AlertCircle,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Profile {
  id: string;
  userId: string;
  fullName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  role: string;
  isVerified: boolean;
  verificationStatus?: string | null;
  ninNumber?: string | null;
  idDocument?: string | null;
  storeName?: string | null;
  storeSlug?: string | null;
  storeDescription?: string | null;
  totalSales: number;
  totalPurchases: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    createdAt: string;
  };
}

interface VerificationsResponse {
  profiles: Profile[];
}

async function fetchVerifications(status: string): Promise<VerificationsResponse> {
  const res = await fetch(`/api/admin/verifications?status=${status}`);
  if (!res.ok) throw new Error("Failed to fetch verifications");
  return res.json();
}

async function verifyUser(userId: string, approve: boolean): Promise<void> {
  const res = await fetch(`/api/admin/users/${userId}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approve }),
  });
  if (!res.ok) throw new Error("Failed to verify user");
}

export default function VerificationsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-verifications", statusFilter],
    queryFn: () => fetchVerifications(statusFilter),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ userId, approve }: { userId: string; approve: boolean }) =>
      verifyUser(userId, approve),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
      setSelectedProfile(null);
      setRejectDialogOpen(false);
      setRejectReason("");
      toast.success("Verification status updated");
    },
    onError: () => {
      toast.error("Failed to update verification status");
    },
  });

  const filteredProfiles = data?.profiles?.filter((profile) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.fullName?.toLowerCase().includes(searchLower) ||
      profile.storeName?.toLowerCase().includes(searchLower) ||
      profile.user.email.toLowerCase().includes(searchLower) ||
      profile.ninNumber?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status?: string | null) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleApprove = (profile: Profile) => {
    verifyMutation.mutate({ userId: profile.userId, approve: true });
  };

  const handleReject = () => {
    if (selectedProfile) {
      verifyMutation.mutate({ userId: selectedProfile.userId, approve: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
        <p className="text-muted-foreground">
          Review and approve seller verification requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">
                  {data?.profiles?.filter((p) => p.verificationStatus === "pending").length || 0}
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
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-xl font-bold">
                  {data?.profiles?.filter((p) => p.verificationStatus === "approved").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-xl font-bold">
                  {data?.profiles?.filter((p) => p.verificationStatus === "rejected").length || 0}
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
            placeholder="Search by name, store, or NIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Verifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProfiles?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No verifications found</p>
            <p className="text-muted-foreground text-sm">
              {searchTerm ? "Try adjusting your search" : `No ${statusFilter} verifications`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProfiles?.map((profile) => (
            <Card key={profile.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.avatar || ""} />
                      <AvatarFallback className="bg-[#2563EB] text-white">
                        {profile.fullName?.charAt(0) || profile.storeName?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">
                          {profile.fullName || profile.user.name || "Unknown"}
                        </h3>
                        {getStatusBadge(profile.verificationStatus)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {profile.storeName && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {profile.storeName}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{profile.user.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {profile.ninNumber && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        NIN: {profile.ninNumber}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(profile.updatedAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    {profile.verificationStatus === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(profile)}
                          disabled={verifyMutation.isPending}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedProfile(profile);
                            setRejectDialogOpen(true);
                          }}
                          disabled={verifyMutation.isPending}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!selectedProfile && !rejectDialogOpen} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>
              Review seller verification information
            </DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedProfile.avatar || ""} />
                  <AvatarFallback className="bg-[#2563EB] text-white text-xl">
                    {selectedProfile.fullName?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedProfile.fullName || selectedProfile.user.name}
                  </h3>
                  <p className="text-muted-foreground">{selectedProfile.user.email}</p>
                  {selectedProfile.phone && (
                    <p className="text-sm text-muted-foreground">{selectedProfile.phone}</p>
                  )}
                </div>
              </div>

              {/* Store Info */}
              {selectedProfile.storeName && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Store Information</Label>
                  <div className="rounded-lg border p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Store Name:</span>
                      <span className="font-medium">{selectedProfile.storeName}</span>
                    </div>
                    {selectedProfile.storeSlug && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Store Slug:</span>
                        <span className="font-medium">@{selectedProfile.storeSlug}</span>
                      </div>
                    )}
                    {selectedProfile.location && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{selectedProfile.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Verification Docs */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Verification Documents</Label>
                <div className="rounded-lg border p-4 space-y-3">
                  {selectedProfile.ninNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">NIN Number:</span>
                      <span className="font-medium font-mono">{selectedProfile.ninNumber}</span>
                    </div>
                  )}
                  {selectedProfile.idDocument ? (
                    <div className="space-y-2">
                      <span className="text-muted-foreground">ID Document:</span>
                      <div className="rounded-lg border bg-gray-50 h-48 flex items-center justify-center">
                        <img
                          src={selectedProfile.idDocument}
                          alt="ID Document"
                          className="max-h-full max-w-full object-contain rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.png";
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Document uploaded for verification
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">No ID document uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg border">
                  <p className="text-2xl font-bold">{selectedProfile.totalSales}</p>
                  <p className="text-xs text-muted-foreground">Total Sales</p>
                </div>
                <div className="text-center p-3 rounded-lg border">
                  <p className="text-2xl font-bold">{selectedProfile.rating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="text-center p-3 rounded-lg border">
                  <p className="text-2xl font-bold">{selectedProfile.reviewCount}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
              </div>

              {selectedProfile.verificationStatus === "pending" && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={verifyMutation.isPending}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedProfile)}
                    disabled={verifyMutation.isPending}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this verification request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? "Rejecting..." : "Reject Verification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
