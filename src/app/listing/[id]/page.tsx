"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Star,
  Shield,
  Clock,
  MessageCircle,
  Heart,
  Share2,
  MapPin,
  Truck,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Zap,
  ShoppingBag,
  Globe,
  FileText,
  Users,
} from "lucide-react";

// Mock listing data
const mockListing = {
  id: "listing-1",
  title: "Professional Logo Design",
  description: `I will create a professional, modern logo for your brand that captures your company's essence and stands out in the market.

**What you'll get:**
- 3 unique logo concepts
- Unlimited revisions until you're satisfied
- All source files (AI, EPS, PDF, SVG, PNG, JPG)
- Vector files for scalability
- Print-ready formats
- Quick turnaround time

**My process:**
1. Initial consultation to understand your brand
2. Research and concept development
3. First draft presentation
4. Revisions based on your feedback
5. Final delivery of all files

**Why choose me?**
- 5+ years of professional design experience
- 500+ successful logo projects
- Quick response time
- 100% satisfaction guarantee`,
  price: 15000,
  type: "DIGITAL",
  category: "Graphics Design",
  images: [
    "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop",
  ],
  thumbnail: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=300&fit=crop",
  deliveryTime: 3,
  revisions: 3,
  seller: {
    id: "seller-1",
    name: "Creative Studio",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop",
    isVerified: true,
    rating: 4.9,
    reviewCount: 128,
    totalSales: 256,
    location: "Lagos, Nigeria",
    memberSince: "Jan 2023",
    responseTime: "Within 1 hour",
  },
  tags: ["logo design", "branding", "graphic design", "minimalist", "modern"],
  requirements: "Please provide your brand name, tagline (if any), color preferences, and any specific design elements you want.",
  rating: 4.9,
  reviewCount: 128,
  orderCount: 256,
};

// Mock reviews
const mockReviews = [
  {
    id: "review-1",
    rating: 5,
    title: "Excellent work!",
    content: "Creative Studio delivered exactly what I was looking for. The logo perfectly captures our brand identity. Highly recommended!",
    reviewer: { name: "Adebayo O.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop" },
    createdAt: "2024-01-15",
    response: "Thank you so much for the kind words! It was a pleasure working with you.",
    respondedAt: "2024-01-16",
  },
  {
    id: "review-2",
    rating: 5,
    title: "Professional and fast",
    content: "Great communication and very fast turnaround. The revisions were handled promptly.",
    reviewer: { name: "Chioma N.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop" },
    createdAt: "2024-01-10",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;
  
  const [quantity, setQuantity] = useState(1);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [requirements, setRequirements] = useState("");

  const listing = mockListing;

  const handleOrder = () => {
    // Mock order creation
    alert(`Order placed for ${listing.title}!`);
    setShowOrderDialog(false);
    router.push("/dashboard/orders");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/?marketplace=zeegig" className="text-muted-foreground hover:text-primary">
              ZeeGig
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/?category=graphics-design" className="text-muted-foreground hover:text-primary">
              Graphics Design
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium truncate">{listing.title}</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            <Card className="overflow-hidden">
              <Carousel className="w-full">
                <CarouselContent>
                  {listing.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video relative">
                        <img
                          src={image}
                          alt={`${listing.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </Card>

            {/* Title & Basic Info */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{listing.title}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary">{listing.category}</Badge>
                    <Badge className="bg-primary/10 text-primary">
                      {listing.type === "DIGITAL" ? "Digital Service" : listing.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium text-foreground">{listing.rating}</span>
                      <span className="text-muted-foreground">({listing.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={listing.seller.avatar} />
                    <AvatarFallback>{listing.seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{listing.seller.name}</span>
                      {listing.seller.isVerified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {listing.seller.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Response: {listing.seller.responseTime}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Description, Reviews, etc. */}
            <Tabs defaultValue="description">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({listing.reviewCount})</TabsTrigger>
                <TabsTrigger value="about">About Seller</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="prose prose-sm max-w-none">
                      {listing.description.split('\n').map((line, i) => (
                        <p key={i} className="whitespace-pre-wrap">{line}</p>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {listing.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4 space-y-4">
                {mockReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={review.reviewer.avatar} />
                          <AvatarFallback>{review.reviewer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{review.reviewer.name}</span>
                            <span className="text-sm text-muted-foreground">{review.createdAt}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <h4 className="font-medium mt-2">{review.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{review.content}</p>
                          {review.response && (
                            <div className="mt-4 p-3 bg-muted rounded-lg">
                              <div className="font-medium text-sm">Seller Response:</div>
                              <p className="text-sm text-muted-foreground mt-1">{review.response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="about" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={listing.seller.avatar} />
                        <AvatarFallback>{listing.seller.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{listing.seller.name}</h3>
                        <p className="text-muted-foreground">Member since {listing.seller.memberSince}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">{listing.seller.totalSales}</p>
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">{listing.seller.rating}</p>
                        <p className="text-sm text-muted-foreground">Rating</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">{listing.seller.reviewCount}</p>
                        <p className="text-sm text-muted-foreground">Reviews</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Order Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card>
                <CardContent className="p-6">
                  {/* Price */}
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-3xl font-bold">{formatCurrency(listing.price)}</span>
                    <Badge variant="outline">Starting price</Badge>
                  </div>

                  {/* Delivery & Revisions */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Delivery Time
                      </span>
                      <span className="font-medium">{listing.deliveryTime} days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        Revisions
                      </span>
                      <span className="font-medium">{listing.revisions}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Quantity for Physical Goods */}
                  {listing.type === "PHYSICAL" && (
                    <div className="mb-4">
                      <Label>Quantity</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Order Button */}
                  <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                        Continue to Order
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Complete Your Order</DialogTitle>
                        <DialogDescription>
                          Review your order details and provide requirements
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={listing.thumbnail}
                            alt={listing.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(listing.price)} x {quantity}
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(listing.price * quantity)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Service fee (5%)</span>
                            <span>{formatCurrency(listing.price * quantity * 0.05)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(listing.price * quantity * 1.05)}</span>
                          </div>
                        </div>
                        <div>
                          <Label>Requirements</Label>
                          <Textarea
                            placeholder={listing.requirements}
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            className="mt-2"
                            rows={4}
                          />
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          <div className="text-sm">
                            <p className="font-medium text-green-800">Zee-Shield Protection</p>
                            <p className="text-green-600">Payment held in escrow until delivery</p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleOrder}>
                          Place Order
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Escrow Info */}
                  <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-start gap-2">
                    <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-800">Zee-Shield Escrow</p>
                      <p className="text-green-600">Your payment is protected. Funds are only released when you confirm delivery.</p>
                    </div>
                  </div>

                  {/* Contact Seller */}
                  <Button variant="outline" className="w-full mt-3">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Seller
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
