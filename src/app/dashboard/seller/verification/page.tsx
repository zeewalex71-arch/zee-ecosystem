"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  User,
  FileText,
  Building2,
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

interface VerificationData {
  isVerified: boolean;
  verificationStatus: string;
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
  verificationSubmittedAt: string | null;
  verificationReviewedAt: string | null;
  rejectionReason: string | null;
  rejectionDetails: string | null;
}

const BUSINESS_CATEGORIES = [
  "Fashion & Apparel",
  "Health & Herbs",
  "Errand Runners",
  "Repairs & Services",
  "Food & Catering",
  "Barbers & Beauty",
  "Tech & Gadgets",
  "Home & Living",
  "Art & Crafts",
  "Education & Tutoring",
  "Other",
];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const ID_TYPES = [
  { value: "NIN", label: "National Identity Number (NIN)" },
  { value: "PASSPORT", label: "International Passport" },
  { value: "DRIVERS_LICENSE", label: "Driver's License" },
];

export default function SellerVerificationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    legalFullName: "",
    idType: "NIN",
    idNumber: "",
    idDocument: "",
    businessName: "",
    businessCategory: "",
    businessBio: "",
    businessStreet: "",
    businessCity: "",
    businessState: "",
    businessPostalCode: "",
    shopFrontPhoto: "",
    videoTourUrl: "",
  });

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const res = await fetch("/api/verification/status");
      const data = await res.json();
      
      if (res.ok) {
        setVerification(data.verification);
        
        // Pre-fill form if data exists
        if (data.verification) {
          setFormData({
            legalFullName: data.verification.legalFullName || "",
            idType: data.verification.idType || "NIN",
            idNumber: data.verification.idNumber || "",
            idDocument: data.verification.idDocument || "",
            businessName: data.verification.businessName || "",
            businessCategory: data.verification.businessCategory || "",
            businessBio: data.verification.businessBio || "",
            businessStreet: data.verification.businessStreet || "",
            businessCity: data.verification.businessCity || "",
            businessState: data.verification.businessState || "",
            businessPostalCode: data.verification.businessPostalCode || "",
            shopFrontPhoto: data.verification.shopFrontPhoto || "",
            videoTourUrl: data.verification.videoTourUrl || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch verification status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: "id_document" | "shop_photo") => {
    setIsUploading(true);
    setError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("documentType", documentType);

      const res = await fetch("/api/verification/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (documentType === "id_document") {
        setFormData((prev) => ({ ...prev, idDocument: data.url }));
      } else {
        setFormData((prev) => ({ ...prev, shopFrontPhoto: data.url }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/verification/submit", {
        method: verification?.verificationStatus === "rejected" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      router.push("/dashboard/seller?verification=submitted");
    } catch (err: any) {
      setError(err.message || "Failed to submit verification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.legalFullName || !formData.idType || !formData.idNumber || !formData.idDocument) {
        setError("Please complete all required identity fields");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.businessName || !formData.businessCategory || !formData.businessStreet || 
          !formData.businessCity || !formData.businessState) {
        setError("Please complete all required business fields");
        return;
      }
    }
    setError("");
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
      </div>
    );
  }

  // Show status banner if already verified or pending
  if (verification?.verificationStatus === "verified") {
    return (
      <div className="space-y-6">
        <Card className="bg-[#112240] border-green-500">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#E6E6E6] mb-2">You are a Zee-Vetted Seller!</h2>
            <p className="text-[#8892B0] mb-4">
              Congratulations! Your account has been verified. You can now list products and services.
            </p>
            <Button
              onClick={() => router.push("/dashboard/seller/listings/new")}
              className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0A192F]"
            >
              Start Listing
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verification?.verificationStatus === "pending") {
    return (
      <div className="space-y-6">
        <Card className="bg-[#112240] border-yellow-500">
          <CardContent className="p-6 text-center">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#E6E6E6] mb-2">Verification Under Review</h2>
            <p className="text-[#8892B0] mb-4">
              Your verification documents are being reviewed by our team. This usually takes 1-2 business days.
            </p>
            <p className="text-sm text-[#8892B0]">
              Submitted on: {verification.verificationSubmittedAt 
                ? new Date(verification.verificationSubmittedAt).toLocaleDateString() 
                : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rejection Notice */}
      {verification?.verificationStatus === "rejected" && (
        <Alert className="bg-red-900/20 border-red-500">
          <XCircle className="w-5 h-5 text-red-500" />
          <AlertDescription>
            <p className="font-semibold text-red-400">Verification Rejected</p>
            <p className="text-red-300 mt-1">
              Reason: {verification.rejectionReason}
            </p>
            {verification.rejectionDetails && (
              <p className="text-red-300 text-sm mt-1">
                Details: {verification.rejectionDetails}
              </p>
            )}
            <p className="text-[#8892B0] text-sm mt-2">
              Please correct the issues and resubmit your verification.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#E6E6E6]">Trust-Wall Verification</h1>
        <p className="text-[#8892B0]">
          Complete verification to start selling on ZeeFix Hub
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#8892B0]">Step {currentStep} of 3</span>
          <span className="text-[#FFD700]">{Math.round((currentStep / 3) * 100)}%</span>
        </div>
        <Progress value={(currentStep / 3) * 100} className="h-2 bg-[#233554]" />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {[
          { step: 1, icon: User, label: "Identity" },
          { step: 2, icon: Building2, label: "Business" },
          { step: 3, icon: Camera, label: "Shop Proof" },
        ].map(({ step, icon: Icon, label }) => (
          <div
            key={step}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              currentStep === step
                ? "bg-[#FFD700] text-[#0A192F]"
                : currentStep > step
                ? "bg-green-500/10 text-green-400"
                : "bg-[#112240] text-[#8892B0]"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">{label}</span>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <Alert className="bg-red-900/20 border-red-500">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Identity Verification */}
      {currentStep === 1 && (
        <Card className="bg-[#112240] border-[#233554]">
          <CardHeader>
            <CardTitle className="text-[#E6E6E6] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#FFD700]" />
              Legal Identity
            </CardTitle>
            <CardDescription className="text-[#8892B0]">
              Your legal name must match the name on your ID document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="legalFullName" className="text-[#E6E6E6]">
                Full Legal Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="legalFullName"
                value={formData.legalFullName}
                onChange={(e) => setFormData({ ...formData, legalFullName: e.target.value })}
                placeholder="As it appears on your ID"
                className="bg-[#0A192F] border-[#233554] text-[#E6E6E6]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#E6E6E6]">
                  ID Type <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.idType}
                  onValueChange={(value) => setFormData({ ...formData, idType: value })}
                >
                  <SelectTrigger className="bg-[#0A192F] border-[#233554] text-[#E6E6E6]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#112240] border-[#233554]">
                    {ID_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-[#E6E6E6]">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber" className="text-[#E6E6E6]">
                  ID Number <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  placeholder={formData.idType === "NIN" ? "11-digit NIN" : "Enter ID number"}
                  className="bg-[#0A192F] border-[#233554] text-[#E6E6E6]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#E6E6E6]">
                Upload ID Document <span className="text-red-400">*</span>
              </Label>
              <p className="text-xs text-[#8892B0] mb-2">
                Upload a clear photo or scan of your {formData.idType === "NIN" ? "NIN slip" : "ID document"}
              </p>
              
              {formData.idDocument ? (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 text-sm">Document uploaded successfully</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, idDocument: "" })}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#233554] rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="idDocument"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "id_document");
                    }}
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="idDocument"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-[#FFD700] animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 text-[#8892B0]" />
                    )}
                    <span className="text-[#8892B0]">
                      {isUploading ? "Uploading..." : "Click to upload"}
                    </span>
                    <span className="text-xs text-[#8892B0]">
                      JPEG, PNG, WebP, or PDF (max 5MB)
                    </span>
                  </label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Business Details */}
      {currentStep === 2 && (
        <Card className="bg-[#112240] border-[#233554]">
          <CardHeader>
            <CardTitle className="text-[#E6E6E6] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#FFD700]" />
              Business Details
            </CardTitle>
            <CardDescription className="text-[#8892B0]">
              Tell us about your business and where you operate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-[#E6E6E6]">
                  Business/Store Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g., Adaeze Fashion House"
                  className="bg-[#0A192F] border-[#233554] text-[#E6E6E6]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#E6E6E6]">
                  Business Category <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.businessCategory}
                  onValueChange={(value) => setFormData({ ...formData, businessCategory: value })}
                >
                  <SelectTrigger className="bg-[#0A192F] border-[#233554] text-[#E6E6E6]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#112240] border-[#233554]">
                    {BUSINESS_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category} className="text-[#E6E6E6]">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessBio" className="text-[#E6E6E6]">
                Business Description
              </Label>
              <Textarea
                id="businessBio"
                value={formData.businessBio}
                onChange={(e) => setFormData({ ...formData, businessBio: e.target.value })}
                placeholder="Tell customers about your business..."
                rows={3}
                className="bg-[#0A192F] border-[#233554] text-[#E6E6E6] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#E6E6E6]">
                Business Address <span className="text-red-400">*</span>
              </Label>
              <Input
                value={formData.businessStreet}
                onChange={(e) => setFormData({ ...formData, businessStreet: e.target.value })}
                placeholder="Street Address"
                className="bg-[#0A192F] border-[#233554] text-[#E6E6E6]"
              />
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  value={formData.businessCity}
                  onChange={(e) => setFormData({ ...formData, businessCity: e.target.value })}
                  placeholder="City"
                  className="bg-[#0A192F] border-[#233554] text-[#E6E6E6]"
                />
                <Select
                  value={formData.businessState}
                  onValueChange={(value) => setFormData({ ...formData, businessState: value })}
                >
                  <SelectTrigger className="bg-[#0A192F] border-[#233554] text-[#E6E6E6]">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#112240] border-[#233554]">
                    {NIGERIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state} className="text-[#E6E6E6]">
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={formData.businessPostalCode}
                  onChange={(e) => setFormData({ ...formData, businessPostalCode: e.target.value })}
                  placeholder="Postal Code"
                  className="bg-[#0A192F] border-[#233554] text-[#E6E6E6]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Shop Proof (Optional) */}
      {currentStep === 3 && (
        <Card className="bg-[#112240] border-[#233554]">
          <CardHeader>
            <CardTitle className="text-[#E6E6E6] flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#FFD700]" />
              Shop Proof
            </CardTitle>
            <CardDescription className="text-[#8892B0]">
              Optional: Add visual proof to boost buyer trust (increases approval chances)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[#E6E6E6]">Shop Front Photo</Label>
              <p className="text-xs text-[#8892B0] mb-2">
                A clear photo of your shop or workspace
              </p>
              
              {formData.shopFrontPhoto ? (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 text-sm">Photo uploaded</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, shopFrontPhoto: "" })}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#233554] rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="shopPhoto"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "shop_photo");
                    }}
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="shopPhoto"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-[#FFD700] animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 text-[#8892B0]" />
                    )}
                    <span className="text-[#8892B0]">
                      {isUploading ? "Uploading..." : "Click to upload shop photo"}
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoTourUrl" className="text-[#E6E6E6]">
                Video Tour Link
              </Label>
              <Input
                id="videoTourUrl"
                value={formData.videoTourUrl}
                onChange={(e) => setFormData({ ...formData, videoTourUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-[#0A192F] border-[#233554] text-[#E6E6E6]"
              />
              <p className="text-xs text-[#8892B0]">
                Link to a short video showing your shop/products (YouTube, TikTok, etc.)
              </p>
            </div>

            <Alert className="bg-[#FFD700]/10 border-[#FFD700]/30">
              <Shield className="w-4 h-4 text-[#FFD700]" />
              <AlertDescription className="text-[#FFD700]">
                <p className="font-semibold">Trust Tip:</p>
                Adding a shop photo or video tour significantly increases buyer trust and approval chances!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="border-[#233554] text-[#8892B0] hover:text-[#E6E6E6]"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Previous
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={nextStep}
            className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0A192F]"
          >
            Next
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 w-4 h-4" />
                Submit for Verification
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
