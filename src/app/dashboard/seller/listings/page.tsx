"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Pause,
  Play,
  Copy,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Listing, ListingStatus, ListingType } from "@/types/index";

interface ListingWithParsed extends Listing {
  images: string[];
  tags: string[];
}

export default function ManageListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingWithParsed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        // Note: In production, we'd need a seller-specific endpoint
        // For now, we'll use the existing listings endpoint
        const response = await fetch("/api/listings?limit=100");
        const data = await response.json();
        setListings(data.listings || []);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Filter listings
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || listing.status === statusFilter;
    const matchesType = typeFilter === "all" || listing.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: ListingStatus) => {
    const statusConfig: Record<
      ListingStatus,
      { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
    > = {
      ACTIVE: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
      DRAFT: { variant: "outline", className: "bg-gray-50 text-gray-700 border-gray-200" },
      PAUSED: { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      SOLD_OUT: { variant: "outline", className: "bg-red-50 text-red-700 border-red-200" },
      ARCHIVED: { variant: "outline", className: "bg-gray-50 text-gray-500 border-gray-200" },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getTypeBadge = (type: ListingType) => {
    const typeConfig: Record<ListingType, { color: string; label: string }> = {
      DIGITAL: { color: "bg-blue-100 text-blue-700", label: "Digital" },
      PHYSICAL: { color: "bg-purple-100 text-purple-700", label: "Physical" },
      SERVICE: { color: "bg-orange-100 text-orange-700", label: "Service" },
    };

    const config = typeConfig[type];
    return (
      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", config.color)}>
        {config.label}
      </span>
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

  const handleStatusChange = async (listingId: string, newStatus: ListingStatus) => {
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: newStatus } : l))
      );
    } catch (error) {
      console.error("Failed to update listing status:", error);
    }
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/listings/${listingToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete listing");

      setListings((prev) => prev.filter((l) => l.id !== listingToDelete));
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    } catch (error) {
      console.error("Failed to delete listing:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (listingId: string) => {
    setListingToDelete(listingId);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Listings</h1>
          <p className="text-sm text-gray-500">
            {isLoading
              ? "Loading..."
              : `${filteredListings.length} listings found`}
          </p>
        </div>
        <Link href="/dashboard/seller/listings/new">
          <Button className="bg-[#2563EB] hover:bg-[#2563EB]/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Listing
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="SOLD_OUT">Sold Out</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <Package className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="DIGITAL">Digital</SelectItem>
                  <SelectItem value="PHYSICAL">Physical</SelectItem>
                  <SelectItem value="SERVICE">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : paginatedListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No listings found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first listing"}
              </p>
              {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
                <Link href="/dashboard/seller/listings/new">
                  <Button className="mt-4 bg-[#2563EB]">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Listing
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Listing</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedListings.map((listing) => (
                      <TableRow key={listing.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                              {listing.thumbnail ? (
                                <img
                                  src={listing.thumbnail}
                                  alt={listing.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="max-w-[200px]">
                              <p className="truncate font-medium text-gray-900">
                                {listing.title}
                              </p>
                              <p className="truncate text-xs text-gray-500">
                                {listing.category}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(listing.type)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(listing.price)}
                        </TableCell>
                        <TableCell>{getStatusBadge(listing.status)}</TableCell>
                        <TableCell>
                          <span className="text-gray-600">
                            {listing.orderCount || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {formatDate(listing.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/seller/listings/${listing.id}/edit`
                                  )
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {listing.status === "ACTIVE" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(listing.id, "PAUSED")
                                  }
                                >
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause
                                </DropdownMenuItem>
                              ) : listing.status === "PAUSED" ||
                                listing.status === "DRAFT" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(listing.id, "ACTIVE")
                                  }
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Activate
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => openDeleteDialog(listing.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y md:hidden">
                {paginatedListings.map((listing) => (
                  <div key={listing.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {listing.thumbnail ? (
                          <img
                            src={listing.thumbnail}
                            alt={listing.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {listing.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          {getTypeBadge(listing.type)}
                          {getStatusBadge(listing.status)}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {formatCurrency(listing.price)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {listing.orderCount || 0} orders
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          {listing.status === "ACTIVE" ? (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(listing.id, "PAUSED")
                              }
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(listing.id, "ACTIVE")
                              }
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => openDeleteDialog(listing.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredListings.length)} of{" "}
            {filteredListings.length} listings
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this listing? This action cannot be
              undone. All associated data including orders and reviews will be
              affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
