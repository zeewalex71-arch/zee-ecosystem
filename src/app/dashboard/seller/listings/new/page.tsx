"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ZEEGIG_CATEGORIES, ZEEFIX_CATEGORIES } from "@/types/index";

// Form Schema
const listingFormSchema = z.object({
  // Common fields
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.string().min(1, "Price is required"),
  type: z.enum(["DIGITAL", "PHYSICAL", "SERVICE"]),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).max(10),
  
  // Digital Service Fields
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  deliveryTime: z.string().optional(),
  revisions: z.string().optional(),
  requirements: z.string().optional(),
  
  // Physical Goods Fields
  weight: z.string().optional(),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  stockQuantity: z.string().optional(),
  sku: z.string().optional(),
  
  // Local Service Fields
  serviceArea: z.string().optional(),
  availability: z.string().optional(),
  duration: z.string().optional(),
  
  // Status
  status: z.enum(["DRAFT", "ACTIVE"]).default("DRAFT"),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

// Shipping Option type
interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
}

export default function CreateListingPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"common" | "type-specific">("common");

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      type: "DIGITAL",
      category: "",
      subcategory: "",
      tags: [],
      portfolioUrl: "",
      deliveryTime: "",
      revisions: "",
      requirements: "",
      weight: "",
      length: "",
      width: "",
      height: "",
      stockQuantity: "",
      sku: "",
      serviceArea: "",
      availability: "",
      duration: "",
      status: "DRAFT",
    },
  });

  const watchType = form.watch("type");
  const watchCategory = form.watch("category");

  // Get categories based on listing type
  const getCategories = () => {
    switch (watchType) {
      case "DIGITAL":
        return ZEEGIG_CATEGORIES;
      case "PHYSICAL":
        return ZEEFIX_CATEGORIES.physical;
      case "SERVICE":
        return ZEEFIX_CATEGORIES.service;
      default:
        return [];
    }
  };

  // Handle image upload simulation
  const handleImageUpload = () => {
    // Simulate image upload - in real app, this would upload to storage
    const colors = ["#2563EB", "#F97316", "#10B981", "#8B5CF6", "#EF4444"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newImage = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='${randomColor}' width='200' height='200'/><text x='50%' y='50%' fill='white' font-size='14' text-anchor='middle' dy='.3em'>Image ${images.length + 1}</text></svg>`;
    setImages((prev) => [...prev, newImage]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle tags
  const addTag = () => {
    if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
      form.setValue("tags", [...form.getValues("tags"), newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    form.setValue(
      "tags",
      form.getValues("tags").filter((t) => t !== tag)
    );
  };

  // Handle shipping options
  const addShippingOption = () => {
    setShippingOptions((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", price: 0, estimatedDays: 3 },
    ]);
  };

  const updateShippingOption = (
    id: string,
    field: keyof ShippingOption,
    value: string | number
  ) => {
    setShippingOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, [field]: value } : opt
      )
    );
  };

  const removeShippingOption = (id: string) => {
    setShippingOptions((prev) => prev.filter((opt) => opt.id !== id));
  };

  // Submit form
  const onSubmit = async (data: ListingFormValues) => {
    setIsSubmitting(true);
    try {
      const listingData: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        price: data.price,
        type: data.type,
        category: data.category,
        subcategory: data.subcategory,
        tags: data.tags,
        images,
        thumbnail: images[0] || null,
        status: data.status,
      };

      // Add type-specific fields
      if (data.type === "DIGITAL") {
        listingData.portfolioUrl = data.portfolioUrl;
        listingData.deliveryTime = data.deliveryTime;
        listingData.revisions = data.revisions;
        listingData.requirements = data.requirements;
      } else if (data.type === "PHYSICAL") {
        listingData.weight = data.weight;
        if (data.length || data.width || data.height) {
          listingData.dimensions = {
            length: parseFloat(data.length || "0"),
            width: parseFloat(data.width || "0"),
            height: parseFloat(data.height || "0"),
          };
        }
        listingData.shippingOptions = shippingOptions;
        listingData.stockQuantity = data.stockQuantity;
        listingData.sku = data.sku;
      } else if (data.type === "SERVICE") {
        listingData.serviceArea = data.serviceArea;
        listingData.availability = data.availability;
        listingData.duration = data.duration;
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingData),
      });

      if (!response.ok) {
        throw new Error("Failed to create listing");
      }

      const result = await response.json();
      router.push(`/dashboard/seller/listings`);
    } catch (error) {
      console.error("Failed to create listing:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
          <p className="text-sm text-gray-500">
            Add a new product or service to your store
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Listing Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Listing Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: "DIGITAL", label: "Digital Service", icon: "💻", description: "ZeeGig - Freelance services" },
                  { value: "PHYSICAL", label: "Physical Goods", icon: "📦", description: "ZeeFix Hub - Products" },
                  { value: "SERVICE", label: "Local Service", icon: "🔧", description: "ZeeFix Hub - Local services" },
                ].map((type) => (
                  <div
                    key={type.value}
                    className={cn(
                      "cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-[#2563EB]/50",
                      watchType === type.value
                        ? "border-[#2563EB] bg-[#2563EB]/5"
                        : "border-gray-200"
                    )}
                    onClick={() => form.setValue("type", type.value as "DIGITAL" | "PHYSICAL" | "SERVICE")}
                  >
                    <div className="text-2xl">{type.icon}</div>
                    <p className="mt-2 font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mobile Tabs */}
          <div className="flex gap-2 overflow-x-auto lg:hidden">
            <Button
              type="button"
              variant={activeTab === "common" ? "default" : "outline"}
              onClick={() => setActiveTab("common")}
              className={cn(
                "flex-shrink-0",
                activeTab === "common" && "bg-[#2563EB]"
              )}
            >
              Basic Info
            </Button>
            <Button
              type="button"
              variant={activeTab === "type-specific" ? "default" : "outline"}
              onClick={() => setActiveTab("type-specific")}
              className={cn(
                "flex-shrink-0",
                activeTab === "type-specific" && "bg-[#2563EB]"
              )}
            >
              {watchType === "DIGITAL"
                ? "Service Details"
                : watchType === "PHYSICAL"
                ? "Product Details"
                : "Service Details"}
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Common Fields */}
            <div className={cn("space-y-6", activeTab !== "common" && "hidden lg:block")}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter a compelling title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your offering in detail..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 20 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (NGN) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getCategories().map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Logo Design" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-50"
                      >
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 rounded bg-[#2563EB] px-2 py-0.5 text-xs text-white">
                            Cover
                          </div>
                        )}
                      </div>
                    ))}
                    {images.length < 6 && (
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-[#2563EB] hover:bg-gray-50"
                      >
                        <div className="text-center">
                          <Upload className="mx-auto h-6 w-6 text-gray-400" />
                          <span className="mt-1 text-xs text-gray-500">Upload</span>
                        </div>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload up to 6 images. First image will be the cover.
                  </p>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {form.watch("tags").map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 rounded-full p-0.5 hover:bg-gray-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Add up to 10 tags to help buyers find your listing
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Type-Specific Fields */}
            <div className={cn("space-y-6", activeTab !== "type-specific" && "hidden lg:block")}>
              {/* Digital Service Fields */}
              {watchType === "DIGITAL" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Digital Service Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="portfolioUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://your-portfolio.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Link to your portfolio or past work
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="deliveryTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Time (Days)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="3"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="revisions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Revisions</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="2"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="requirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Buyer Requirements</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What information do you need from the buyer to get started?"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Specify what you need from buyers to complete the service
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Physical Goods Fields */}
              {watchType === "PHYSICAL" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Product Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="0.5"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stockQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="10"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <Label>Dimensions (cm)</Label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <FormField
                          control={form.control}
                          name="length"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Length"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="width"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Width"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="height"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Height"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="SKU-001" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div>
                      <div className="flex items-center justify-between">
                        <Label>Shipping Options</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addShippingOption}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add Option
                        </Button>
                      </div>
                      <div className="mt-3 space-y-3">
                        {shippingOptions.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center gap-2 rounded-lg border p-3"
                          >
                            <Input
                              placeholder="Option name"
                              value={option.name}
                              onChange={(e) =>
                                updateShippingOption(option.id, "name", e.target.value)
                              }
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              placeholder="Price"
                              value={option.price}
                              onChange={(e) =>
                                updateShippingOption(option.id, "price", parseFloat(e.target.value) || 0)
                              }
                              className="w-24"
                            />
                            <Input
                              type="number"
                              placeholder="Days"
                              value={option.estimatedDays}
                              onChange={(e) =>
                                updateShippingOption(option.id, "estimatedDays", parseInt(e.target.value) || 0)
                              }
                              className="w-20"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeShippingOption(option.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        {shippingOptions.length === 0 && (
                          <p className="text-sm text-gray-500">
                            No shipping options added. Buyers will need to contact you for shipping details.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Local Service Fields */}
              {watchType === "SERVICE" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Service Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="serviceArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Area</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Lagos, Nigeria - Ikeja, Lekki, Victoria Island"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Areas where you provide your service
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Monday - Friday: 9AM - 6PM, Saturday: 10AM - 4PM"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your working hours and availability
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="60"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Typical duration of one service session
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Status Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Publish Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <div>
                            <FormLabel>Publish Immediately</FormLabel>
                            <FormDescription>
                              Toggle to publish your listing right away
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === "ACTIVE"}
                              onCheckedChange={(checked) =>
                                field.onChange(checked ? "ACTIVE" : "DRAFT")
                              }
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-gray-500">
                    Draft listings are not visible to buyers until published
                  </p>
                </CardContent>
              </Card>

              {/* Submit Actions */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#2563EB] hover:bg-[#2563EB]/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Listing"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
