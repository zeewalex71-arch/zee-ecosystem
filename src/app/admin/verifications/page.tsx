"use client";

import { useState, useEffect } from "react";
import {
  Search,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  Calendar,
  Eye,
  AlertCircle,
  Shield,
  MapPin,
  Phone,
  Mail,
  Store,
  Camera,
  Video,
  Loader2,
  ExternalLink,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface VerificationProfile {
  id: string;
  userId: string;
  legalFullName: string | null;
  idType: string | null;
  idNumber: string | null;
  idDocument: string | null;
  businessName: string | null;
  businessCategory: string | null;
  businessBio: string | null;
  businessStreet: string | null;
  businessCity: string | null;
  businessState: string | null;
  businessPostalCode: string | null;
  shopFrontPhoto: string | null;
  videoTourUrl: string | null;
  verificationStatus: string;
  verificationSubmittedAt: string | null;
  verificationReviewedAt: string | null;
  rejectionReason: string | null;
  rejectionDetails: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    createdAt: string;
  };
}

const REJECTION_REASONS = [
  "Blurry ID - Please upload a clearer image",
  "Invalid Address - Address could not be verified",
  "Name Mismatch - ID name doesn't match profile",
  "Expired ID - Document has expired",
  "Invalid ID - Document appears fraudulent",
  "Incomplete Information - Missing required fields",
  "Other - See details below",
];

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<VerificationProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedProfile, setSelectedProfile] = useState<VerificationProfile | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDetails, setRejectDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, [statusFilter]);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/verification/review?status=${statusFilter}`);
      const data = await res.json();
      setVerifications(data.verifications || []);
    } catch (error) {
      console.error("Failed to fetch verifications:", error);
      toast.error("Failed to load verifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (profile: VerificationProfile) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/verification/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          action: "approve",
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Seller verified successfully!");
      fetchVerifications();
      setSelectedProfile(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to approve");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProfile) return;

    if (!rejectReason) {
      toast.error("Please select a rejection reason");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/verification/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: selectedProfile.id,
          action: "reject",
          rejectionReason: rejectReason,
          rejectionDetails: rejectDetails,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Verification rejected");
      fetchVerifications();
      setRejectDialogOpen(false);
      setSelectedProfile(null);
      setRejectReason("");
      setRejectDetails("");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVerifications = verifications.filter((profile) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.legalFullName?.toLowerCase().includes(searchLower) ||
      profile.businessName?.toLowerCase().includes(searchLower) ||
      profile.user.email.toLowerCase().includes(searchLower) ||
      profile.idNumber?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Pending Review</Badge>;
      case "verified":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Verified</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Stats calculation
  const pendingCount = verifications.filter((v) => v.verificationStatus === "pending").length;
  const verifiedCount = verifications.filter((v) => v.verificationStatus === "verified").length;
  const rejectedCount = verifications.filter((v) => v.verificationStatus === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#E6E6E6] flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#FFD700]" />
          Trust-Wall Verification Queue
        </h1>
        <p className="text-[#8892B0]">
          Review and approve seller verification requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-[#112240] border-[#233554] border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8892B0]">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#112240] border-[#233554] border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8892B0]">Verified</p>
                <p className="text-3xl font-bold text-green-400">{verifiedCount}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#112240] border-[#233554] border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8892B0]">Rejected</p>
                <p className="text-3xl font-bold text-red-400">{rejectedCount}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8892B0]" />
          <Input
            placeholder="Search by name, store, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#112240] border-[#233554] text-[#E6E6E6] placeholder-[#8892B0]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-[#112240] border-[#233554] text-[#E6E6E6]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#112240] border-[#233554]">
            <SelectItem value="pending" className="text-[#E6E6E6]">Pending</SelectItem>
            <SelectItem value="verified" className="text-[#E6E6E6]">Verified</SelectItem>
            <SelectItem value="rejected" className="text-[#E6E6E6]">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Verifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
        </div>
      ) : filteredVerifications.length === 0 ? (
        <Card className="bg-[#112240] border-[#233554]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCheck className="h-12 w-12 text-[#8892B0] mb-4" />
            <p className="text-lg font-medium text-[#E6E6E6]">No verifications found</p>
            <p className="text-[#8892B0] text-sm">
              {searchTerm ? "Try adjusting your search" : `No ${statusFilter} verifications`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredVerifications.map((profile) => (
            <Card key={profile.id} className="bg-[#112240] border-[#233554] hover:border-[#FFD700]/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-14 w-14 border-2 border-[#233554]">
                      <AvatarImage src={profile.user.image || ""} />
                      <AvatarFallback className="bg-[#233554] text-[#FFD700] text-lg">
                        {profile.legalFullName?.charAt(0) || profile.businessName?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[#E6E6E6]">
                          {profile.legalFullName || profile.user.name || "Unknown"}
                        </h3>
                        {getStatusBadge(profile.verificationStatus)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#8892B0] mt-1">
                        {profile.businessName && (
                          <>
                            <Store className="w-3 h-3" />
                            <span>{profile.businessName}</span>
                            <span className="text-[#233554]">•</span>
                          </>
                        )}
                        <Mail className="w-3 h-3" />
                        <span>{profile.user.email}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-[#8892B0]">
                        {profile.businessCategory && (
                          <span className="bg-[#233554] px-2 py-0.5 rounded">{profile.businessCategory}</span>
                        )}
                        {profile.idType && (
                          <span>{profile.idType}: {profile.idNumber}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#8892B0]">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(profile.verificationSubmittedAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProfile(profile)}
                      className="border-[#233554] text-[#8892B0] hover:text-[#E6E6E6] hover:bg-[#233554]"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {profile.verificationStatus === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(profile)}
                          disabled={isSubmitting}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            setSelectedProfile(profile);
                            setRejectDialogOpen(true);
                          }}
                          disabled={isSubmitting}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
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
        <DialogContent className="max-w-3xl max-h-[90vh] bg-[#112240] border-[#233554] text-[#E6E6E6]">
          <DialogHeader>
            <DialogTitle className="text-[#FFD700] flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Verification Details
            </DialogTitle>
            <DialogDescription className="text-[#8892B0]">
              Review seller verification information
            </DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-start gap-4 p-4 bg-[#0A192F] rounded-lg border border-[#233554]">
                  <Avatar className="h-16 w-16 border-2 border-[#FFD700]">
                    <AvatarImage src={selectedProfile.user.image || ""} />
                    <AvatarFallback className="bg-[#233554] text-[#FFD700] text-xl">
                      {selectedProfile.legalFullName?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-[#E6E6E6]">
                      {selectedProfile.legalFullName || selectedProfile.user.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[#8892B0] mt-1">
                      <Mail className="w-4 h-4" />
                      <span>{selectedProfile.user.email}</span>
                    </div>
                    <div className="mt-2">
                      {getStatusBadge(selectedProfile.verificationStatus)}
                    </div>
                  </div>
                </div>

                {/* Identity Section */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-[#FFD700] flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Identity Verification
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-[#0A192F] rounded-lg border border-[#233554]">
                    <div>
                      <Label className="text-[#8892B0] text-xs">Legal Name</Label>
                      <p className="text-[#E6E6E6]">{selectedProfile.legalFullName || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-[#8892B0] text-xs">ID Type</Label>
                      <p className="text-[#E6E6E6]">{selectedProfile.idType || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-[#8892B0] text-xs">ID Number</Label>
                      <p className="text-[#E6E6E6] font-mono">{selectedProfile.idNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-[#8892B0] text-xs">Submitted</Label>
                      <p className="text-[#E6E6E6]">{formatDate(selectedProfile.verificationSubmittedAt)}</p>
                    </div>
                  </div>

                  {/* ID Document */}
                  {selectedProfile.idDocument && (
                    <div className="p-4 bg-[#0A192F] rounded-lg border border-[#233554]">
                      <Label className="text-[#8892B0] text-xs mb-2 block">ID Document</Label>
                      <div className="relative rounded-lg overflow-hidden bg-[#233554] h-64">
                        <img
                          src={selectedProfile.idDocument}
                          alt="ID Document"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-[#8892B0] mt-2 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Document stored securely - Admin only access
                      </p>
                    </div>
                  )}
                </div>

                {/* Business Section */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-[#FFD700] flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Business Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-[#0A192F] rounded-lg border border-[#233554]">
                    <div>
                      <Label className="text-[#8892B0] text-xs">Business Name</Label>
                      <p className="text-[#E6E6E6]">{selectedProfile.businessName || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-[#8892B0] text-xs">Category</Label>
                      <p className="text-[#E6E6E6]">{selectedProfile.businessCategory || "Not provided"}</p>
                    </div>
                  </div>

                  {selectedProfile.businessBio && (
                    <div className="p-4 bg-[#0A192F] rounded-lg border border-[#233554]">
                      <Label className="text-[#8892B0] text-xs">Business Description</Label>
                      <p className="text-[#E6E6E6] mt-1">{selectedProfile.businessBio}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-4 gap-4 p-4 bg-[#0A192F] rounded-lg border border-[#233554]">
                    <div className="md:col-span-2">
                      <Label className="text-[#8892B0] text-xs">Street Address</Label>
                      <p className="text-[#E6E6E6]">{selectedProfile.businessStreet || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-[#8892B0] text-xs">City</Label>
                      <p className="text-[#E6E6E6]">{selectedProfile.businessCity || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-[#8892B0] text-xs">State</Label>
                      <p className="text-[#E6E6E6]">{selectedProfile.businessState || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                {/* Shop Proof Section */}
                {(selectedProfile.shopFrontPhoto || selectedProfile.videoTourUrl) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-[#FFD700] flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Shop Proof
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedProfile.shopFrontPhoto && (
                        <div className="p-4 bg-[#0A192F] rounded-lg border border-[#233554]">
                          <Label className="text-[#8892B0] text-xs mb-2 block">Shop Front Photo</Label>
                          <div className="relative rounded-lg overflow-hidden bg-[#233554] h-40">
                            <img
                              src={selectedProfile.shopFrontPhoto}
                              alt="Shop Front"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      {selectedProfile.videoTourUrl && (
                        <div className="p-4 bg-[#0A192F] rounded-lg border border-[#233554]">
                          <Label className="text-[#8892B0] text-xs mb-2 block">Video Tour</Label>
                          <a
                            href={selectedProfile.videoTourUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[#FFD700] hover:underline"
                          >
                            <Video className="w-5 h-5" />
                            Watch Video
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rejection Info */}
                {selectedProfile.verificationStatus === "rejected" && (
                  <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                    <Label className="text-red-400 text-xs">Rejection Reason</Label>
                    <p className="text-red-300 mt-1">{selectedProfile.rejectionReason}</p>
                    {selectedProfile.rejectionDetails && (
                      <>
                        <Label className="text-red-400 text-xs mt-2 block">Details</Label>
                        <p className="text-red-300 text-sm">{selectedProfile.rejectionDetails}</p>
                      </>
                    )}
                    <p className="text-xs text-[#8892B0] mt-2">
                      Rejected on: {formatDate(selectedProfile.verificationReviewedAt)}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedProfile.verificationStatus === "pending" && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#233554]">
                    <Button
                      variant="destructive"
                      onClick={() => setRejectDialogOpen(true)}
                      disabled={isSubmitting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedProfile)}
                      disabled={isSubmitting}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verify Seller
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-[#112240] border-[#233554] text-[#E6E6E6]">
          <DialogHeader>
            <DialogTitle className="text-red-400">Reject Verification</DialogTitle>
            <DialogDescription className="text-[#8892B0]">
              Please provide a reason for rejecting this verification request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#E6E6E6]">Rejection Reason</Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger className="bg-[#0A192F] border-[#233554] text-[#E6E6E6]">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="bg-[#112240] border-[#233554]">
                  {REJECTION_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason} className="text-[#E6E6E6]">
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#E6E6E6]">Additional Details (Optional)</Label>
              <Textarea
                placeholder="Provide more details about the rejection..."
                value={rejectDetails}
                onChange={(e) => setRejectDetails(e.target.value)}
                rows={3}
                className="bg-[#0A192F] border-[#233554] text-[#E6E6E6] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              className="border-[#233554] text-[#8892B0]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting || !rejectReason}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Reject Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
