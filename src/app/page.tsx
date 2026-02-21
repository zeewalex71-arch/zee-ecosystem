"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Zap,
  ShoppingBag,
  Scissors,
  Palette,
  Video,
  Truck,
  Leaf,
  UtensilsCrossed,
  Menu,
  Search,
  User,
  ShoppingCart,
  Bell,
  ChevronRight,
  Star,
  Shield,
  MessageCircle,
  Wallet,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  Store,
  Code,
  FileText,
  Music,
  Camera,
  Home,
  Smartphone,
  Wrench,
  GraduationCap,
  Shirt,
  SprayCan,
} from "lucide-react";

// Icon mapping for categories
const iconMap: Record<string, React.ElementType> = {
  Palette,
  Video,
  Image: Sparkles,
  FileText,
  Code,
  Music,
  TrendingUp,
  MessageCircle,
  Shirt,
  Leaf,
  UtensilsCrossed,
  Smartphone,
  Home,
  Sparkles,
  Scissors,
  Truck,
  Broom: SprayCan,
  Wrench,
  GraduationCap,
  Camera,
};

const ZEEGIG_CATEGORIES = [
  { id: "ai-art", label: "AI Art & Design", icon: "Palette" },
  { id: "video-editing", label: "Video Editing", icon: "Video" },
  { id: "graphics-design", label: "Graphics Design", icon: "Sparkles" },
  { id: "writing-translation", label: "Writing & Translation", icon: "FileText" },
  { id: "programming", label: "Programming & Tech", icon: "Code" },
  { id: "music-audio", label: "Music & Audio", icon: "Music" },
  { id: "digital-marketing", label: "Digital Marketing", icon: "TrendingUp" },
  { id: "consulting", label: "Consulting", icon: "MessageCircle" },
];

const ZEEFIX_CATEGORIES = {
  physical: [
    { id: "fashion", label: "Fashion & Apparel", icon: "Shirt" },
    { id: "herbs", label: "Herbs & Natural Products", icon: "Leaf" },
    { id: "food", label: "Food & Groceries", icon: "UtensilsCrossed" },
    { id: "electronics", label: "Electronics", icon: "Smartphone" },
    { id: "home-garden", label: "Home & Garden", icon: "Home" },
    { id: "beauty", label: "Beauty & Personal Care", icon: "Sparkles" },
  ],
  service: [
    { id: "barbers", label: "Barbers & Salons", icon: "Scissors" },
    { id: "errand-runners", label: "Errand Runners", icon: "Truck" },
    { id: "cleaning", label: "Cleaning Services", icon: "Broom" },
    { id: "repairs", label: "Repairs & Maintenance", icon: "Wrench" },
    { id: "tutoring", label: "Tutoring & Lessons", icon: "GraduationCap" },
    { id: "photography", label: "Photography", icon: "Camera" },
  ],
};

// Mock hero ads
const heroAds = [
  {
    id: "1",
    title: "MTN Nigeria - Unlimited Data",
    description: "Get unlimited data for your business starting at ₦10,000/month",
    imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=400&fit=crop",
    linkUrl: "#",
  },
  {
    id: "2",
    title: "ZeeGig Pro Services",
    description: "Professional digital services at your fingertips",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop",
    linkUrl: "#",
  },
  {
    id: "3",
    title: "ZeeFix Local Services",
    description: "Find trusted local service providers near you",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=400&fit=crop",
    linkUrl: "#",
  },
];

// Mock featured listings
const featuredListings = [
  {
    id: "1",
    title: "Professional Logo Design",
    price: 15000,
    rating: 4.9,
    reviewCount: 128,
    category: "Graphics Design",
    type: "DIGITAL",
    seller: { name: "Creative Studio", isVerified: true },
    thumbnail: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    title: "Video Editing & Production",
    price: 25000,
    rating: 4.8,
    reviewCount: 89,
    category: "Video Editing",
    type: "DIGITAL",
    seller: { name: "Pixel Perfect", isVerified: true },
    thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    title: "African Fashion Collection",
    price: 8500,
    rating: 4.7,
    reviewCount: 56,
    category: "Fashion",
    type: "PHYSICAL",
    seller: { name: "AfroWear NG", isVerified: true },
    thumbnail: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    title: "AI Art Generation",
    price: 5000,
    rating: 4.9,
    reviewCount: 234,
    category: "AI Art",
    type: "DIGITAL",
    seller: { name: "AI Studio", isVerified: false },
    thumbnail: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400&h=300&fit=crop",
  },
];

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Zee</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/?marketplace=zeegig" className="text-sm font-medium hover:text-primary transition-colors">
              ZeeGig
            </Link>
            <Link href="/?marketplace=zeefix" className="text-sm font-medium hover:text-primary transition-colors">
              ZeeFix Hub
            </Link>
            <Link href="/dashboard/seller" className="text-sm font-medium hover:text-primary transition-colors">
              Sell
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search services, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Bell className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <ShoppingCart className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/wallet">Wallet</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/seller">Seller Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/api/auth/signout">Sign Out</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" onClick={() => { setAuthMode("login"); setShowAuthDialog(true); }}>
                  Sign In
                </Button>
                <Button onClick={() => { setAuthMode("signup"); setShowAuthDialog(true); }}>
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-4">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <nav className="flex flex-col gap-2">
                    <Link
                      href="/?marketplace=zeegig"
                      className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="font-medium">ZeeGig - Digital Services</span>
                    </Link>
                    <Link
                      href="/?marketplace=zeefix"
                      className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingBag className="w-5 h-5 text-accent" />
                      <span className="font-medium">ZeeFix Hub - Goods & Services</span>
                    </Link>
                    <Link
                      href="/dashboard/seller"
                      className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Store className="w-5 h-5" />
                      <span className="font-medium">Start Selling</span>
                    </Link>
                  </nav>

                  {!isLoggedIn && (
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAuthMode("login");
                          setShowAuthDialog(true);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => {
                          setAuthMode("signup");
                          setShowAuthDialog(true);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Carousel */}
        <section className="w-full py-6 px-4">
          <div className="container mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {heroAds.map((ad) => (
                  <CarouselItem key={ad.id}>
                    <div className="relative h-48 md:h-72 lg:h-80 rounded-2xl overflow-hidden">
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-10">
                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                          {ad.title}
                        </h2>
                        <p className="text-white/90 text-sm md:text-lg mb-4 max-w-md">
                          {ad.description}
                        </p>
                        <Button className="w-fit bg-primary hover:bg-primary/90">
                          Learn More <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        </section>

        {/* Marketplace Navigation */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* ZeeGig Card */}
              <Link href="/?marketplace=zeegig" className="group">
                <Card className="h-full border-2 border-primary/20 hover:border-primary hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-40 bg-gradient-to-br from-primary/10 to-primary/5">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="w-20 h-20 text-primary opacity-20" />
                      </div>
                      <div className="absolute bottom-4 left-6">
                        <Badge className="bg-primary text-primary-foreground">Digital Services</Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                        ZeeGig
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Find professional digital services - AI Art, Video Editing, Graphics Design, Programming, and more.
                      </p>
                      <div className="flex items-center text-primary font-medium">
                        Explore Services <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* ZeeFix Hub Card */}
              <Link href="/?marketplace=zeefix" className="group">
                <Card className="h-full border-2 border-accent/20 hover:border-accent hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-40 bg-gradient-to-br from-accent/10 to-accent/5">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag className="w-20 h-20 text-accent opacity-20" />
                      </div>
                      <div className="absolute bottom-4 left-6">
                        <Badge className="bg-accent text-accent-foreground">Goods & Services</Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">
                        ZeeFix Hub
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Shop physical goods and find local services - Fashion, Herbs, Food, Barbers, Errand Runners, and more.
                      </p>
                      <div className="flex items-center text-accent font-medium">
                        Shop Now <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Services */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Services</h2>
              <Link href="/?marketplace=zeegig" className="text-primary hover:underline text-sm font-medium">
                View All <ArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                      <img
                        src={listing.thumbnail}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge
                        variant={listing.type === "DIGITAL" ? "default" : "secondary"}
                        className="absolute top-2 left-2"
                      >
                        {listing.type === "DIGITAL" ? "Digital" : "Physical"}
                      </Badge>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm line-clamp-1">{listing.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{listing.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary">{formatCurrency(listing.price)}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{listing.rating}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ZeeGig Categories */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              <Zap className="inline w-6 h-6 mr-2 text-primary" />
              ZeeGig Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ZEEGIG_CATEGORIES.map((category) => {
                const Icon = iconMap[category.icon] || Sparkles;
                return (
                  <Link
                    key={category.id}
                    href={`/?marketplace=zeegig&category=${category.id}`}
                    className="group"
                  >
                    <Card className="hover:border-primary hover:shadow-md transition-all">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{category.label}</span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ZeeFix Hub Categories */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              <ShoppingBag className="inline w-6 h-6 mr-2 text-accent" />
              ZeeFix Hub Categories
            </h2>
            
            <Tabs defaultValue="physical" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="physical">Physical Goods</TabsTrigger>
                <TabsTrigger value="service">Local Services</TabsTrigger>
              </TabsList>
              
              <TabsContent value="physical">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ZEEFIX_CATEGORIES.physical.map((category) => {
                    const Icon = iconMap[category.icon] || ShoppingBag;
                    return (
                      <Link
                        key={category.id}
                        href={`/?marketplace=zeefix&type=physical&category=${category.id}`}
                        className="group"
                      >
                        <Card className="hover:border-accent hover:shadow-md transition-all">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                              <Icon className="w-5 h-5 text-accent" />
                            </div>
                            <span className="font-medium text-sm">{category.label}</span>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="service">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ZEEFIX_CATEGORIES.service.map((category) => {
                    const Icon = iconMap[category.icon] || Scissors;
                    return (
                      <Link
                        key={category.id}
                        href={`/?marketplace=zeefix&type=service&category=${category.id}`}
                        className="group"
                      >
                        <Card className="hover:border-accent hover:shadow-md transition-all">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                              <Icon className="w-5 h-5 text-accent" />
                            </div>
                            <span className="font-medium text-sm">{category.label}</span>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Why Choose Zee Ecosystem */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Why Choose Zee Ecosystem?</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Zee-Shield Escrow</h3>
                  <p className="text-sm text-muted-foreground">
                    Secure payments with our escrow system. Funds are only released when you confirm delivery.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Real-Time Chat</h3>
                  <p className="text-sm text-muted-foreground">
                    Communicate directly with sellers and buyers. Get instant updates on your orders.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Unified Wallet</h3>
                  <p className="text-sm text-muted-foreground">
                    One wallet for both marketplaces. Deposit, withdraw, and manage your funds easily.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Verified Sellers</h3>
                  <p className="text-sm text-muted-foreground">
                    All sellers go through a verification process. Look for the verified badge.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Join thousands of sellers on Zee Ecosystem. Create your store, list your services or products, and start earning today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/dashboard/seller">
                  <Store className="w-5 h-5 mr-2" />
                  Create Your Store
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">Zee Ecosystem</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your unified marketplace for digital services, physical goods, and local services.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Marketplaces</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/?marketplace=zeegig" className="hover:text-primary">ZeeGig - Digital Services</Link></li>
                <li><Link href="/?marketplace=zeefix" className="hover:text-primary">ZeeFix Hub - Goods & Services</Link></li>
                <li><Link href="/dashboard/seller" className="hover:text-primary">Become a Seller</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-primary">Report an Issue</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary">Escrow Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Zee Ecosystem. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authMode === "login" ? "Welcome Back" : "Create Account"}
            </DialogTitle>
            <DialogDescription>
              {authMode === "login"
                ? "Sign in to access your dashboard and orders."
                : "Join Zee Ecosystem and start buying or selling today."}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue={authMode} onValueChange={(v) => setAuthMode(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-4">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" />
                </div>
                <Button type="submit" className="w-full">Sign In</Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-4">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" type="text" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label>I want to</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="role" value="BUYER" defaultChecked className="text-primary" />
                      <span className="text-sm">Buy Services</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="role" value="SELLER" className="text-primary" />
                      <span className="text-sm">Sell Services</span>
                    </label>
                  </div>
                </div>
                <Button type="submit" className="w-full">Create Account</Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
