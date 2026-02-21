"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/app-store";
import AuthFlow from "@/components/auth/auth-flow";
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home,
  Search,
  User,
  ShoppingBag,
  Scissors,
  Shirt,
  Leaf,
  Truck,
  Wrench,
  Zap,
  Menu,
  Bell,
  ChevronRight,
  ChevronLeft,
  Star,
  Shield,
  MapPin,
  Clock,
  Award,
  Package,
  Plane,
  ChefHat,
  Sparkles,
  Heart,
  LogOut,
  Settings,
  LayoutDashboard,
  Wallet,
  CheckCircle2,
  MessageCircle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  Users,
  Globe,
  ArrowRight,
  Play,
  RefreshCw,
} from "lucide-react";

// Hero Slider Images - African Genius Theme
const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=1920&h=1080&fit=crop",
    title: "African Fashion",
    subtitle: "Ankara, Aso Oke & Bespoke Designs",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=1920&h=1080&fit=crop",
    title: "Wellness & Herbs",
    subtitle: "Vetted Traditional Medicine & Organic Products",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&h=1080&fit=crop",
    title: "Local Services",
    subtitle: "Barbers, Plumbers, Electricians & More",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&h=1080&fit=crop",
    title: "Fashion Exports",
    subtitle: "Ship African Fashion Worldwide",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1920&h=1080&fit=crop",
    title: "Diaspora Foods",
    subtitle: "Export Nigerian Food Items Globally",
  },
];

// Service Categories
const LOCAL_SERVICES = [
  { id: "barbers", label: "Barbers", icon: Scissors, color: "bg-gold-500", count: "2.5k+" },
  { id: "laundry", label: "Laundry", icon: Sparkles, color: "bg-teal", count: "1.2k+" },
  { id: "plumbers", label: "Plumbers", icon: Wrench, color: "bg-coral", count: "800+" },
  { id: "electricians", label: "Electricians", icon: Zap, color: "bg-gold-400", count: "950+" },
  { id: "ac-techs", label: "AC Technicians", icon: Home, color: "bg-teal", count: "400+" },
  { id: "errands", label: "Errand Runners", icon: Truck, color: "bg-gold-500", count: "600+" },
];

// Fashion Categories
const FASHION_CATEGORIES = [
  { id: "ankara", label: "Ankara Styles", image: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=400&fit=crop", count: 234, priceRange: "₦5,000 - ₦150,000" },
  { id: "aso-oke", label: "Aso Oke", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop", count: 89, priceRange: "₦15,000 - ₦500,000" },
  { id: "ready-to-wear", label: "Ready to Wear", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop", count: 456, priceRange: "₦3,000 - ₦80,000" },
  { id: "bespoke", label: "Bespoke Tailoring", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", count: 128, priceRange: "₦20,000 - ₦300,000" },
];

// Wellness Categories
const WELLNESS_CATEGORIES = [
  { id: "herbs", label: "Herbal Medicine", image: "https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=400&fit=crop", verified: true },
  { id: "creams", label: "Handmade Creams", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop", verified: true },
  { id: "cosmetics", label: "Organic Cosmetics", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop", verified: true },
  { id: "agbo", label: "Traditional Agbo", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop", verified: true },
];

// Featured Gigs with Pricing Tiers
const FEATURED_GIGS = [
  {
    id: "1",
    title: "Premium Ankara Dress Design",
    vendor: "Lagos Fashion House",
    vendorImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop",
    image: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 189,
    verified: true,
    pricing: {
      basic: { price: "₦15,000", delivery: "7 days", revisions: 1 },
      standard: { price: "₦35,000", delivery: "5 days", revisions: 3 },
      premium: { price: "₦75,000", delivery: "3 days", revisions: "Unlimited" },
    },
  },
  {
    id: "2",
    title: "Professional Plumbing Services",
    vendor: "Pro Plumber NG",
    vendorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 156,
    verified: true,
    pricing: {
      basic: { price: "₦5,000", delivery: "Same day", revisions: 0 },
      standard: { price: "₦15,000", delivery: "Same day", revisions: 1 },
      premium: { price: "₦35,000", delivery: "Same day", revisions: 3 },
    },
  },
  {
    id: "3",
    title: "Herbal Wellness Package",
    vendor: "Mama Nkechi Herbs",
    vendorImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop",
    image: "https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 234,
    verified: true,
    pricing: {
      basic: { price: "₦3,500", delivery: "2 days", revisions: 0 },
      standard: { price: "₦8,000", delivery: "2 days", revisions: 0 },
      premium: { price: "₦20,000", delivery: "1 day", revisions: 0 },
    },
  },
];

// User type
interface UserData {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: string;
  isVerified: boolean;
}

// Hero Slider Component
function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % HERO_SLIDES.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Slider Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={HERO_SLIDES[currentSlide].image}
            alt={HERO_SLIDES[currentSlide].title}
            className="w-full h-full object-cover"
            loading={currentSlide === 0 ? "eager" : "lazy"}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Additional Radial Gradient for Text Focus */}
      <div className="absolute inset-0 hero-gradient-radial" />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-10">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-offwhite mb-4 text-center">
            <span className="text-gold">The Pulse</span> of African Genius
          </h1>
          <p className="text-lg md:text-xl text-steel max-w-2xl mx-auto text-center">
            Services, Fashion, Wellness & Global Exports — All protected by Zee-Shield Escrow
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-3xl"
        >
          <div className="search-bar-gold flex rounded-xl overflow-hidden">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
              <input
                type="text"
                placeholder="What service are you looking for?"
                className="w-full pl-12 pr-4 py-4 bg-transparent text-offwhite placeholder-steel outline-none text-lg"
              />
            </div>
            <button className="btn-gold px-8 py-4 text-lg font-semibold">
              Search
            </button>
          </div>
          
          {/* Quick Search Tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Barbers near me", "Ankara styles", "Herbal medicine", "Export to UK"].map((term) => (
              <button
                key={term}
                className="px-4 py-2 bg-midnight-light/60 backdrop-blur-sm border border-midnight-border rounded-full text-sm text-steel hover:text-gold hover:border-gold transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-midnight-light/80 backdrop-blur-sm rounded-full flex items-center justify-center text-offwhite hover:text-gold hover:bg-midnight-lighter transition-all z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-midnight-light/80 backdrop-blur-sm rounded-full flex items-center justify-center text-offwhite hover:text-gold hover:bg-midnight-lighter transition-all z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? "bg-gold w-8"
                : "bg-midnight-lighter hover:bg-steel"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Info */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gold font-semibold text-lg">{HERO_SLIDES[currentSlide].title}</p>
            <p className="text-steel text-sm">{HERO_SLIDES[currentSlide].subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Pricing Tier Card Component
function PricingTierCard({ gig }: { gig: typeof FEATURED_GIGS[0] }) {
  const [selectedTier, setSelectedTier] = useState<"basic" | "standard" | "premium">("standard");

  const tierStyles = {
    basic: "pricing-basic",
    standard: "pricing-standard",
    premium: "pricing-premium",
  };

  const tierLabels = {
    basic: "Basic",
    standard: "Standard",
    premium: "Premium",
  };

  return (
    <div className="bg-midnight-light rounded-xl border border-midnight-border overflow-hidden card-hover">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={gig.image}
          alt={gig.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {gig.verified && (
          <div className="absolute top-3 right-3 zee-vetted">
            <CheckCircle2 className="w-3 h-3" />
            Zee-Vetted
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Vendor Info */}
        <div className="flex items-center gap-2 mb-2">
          <img
            src={gig.vendorImage}
            alt={gig.vendor}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm text-steel">{gig.vendor}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-offwhite mb-2 line-clamp-2">{gig.title}</h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-gold fill-gold" />
            <span className="text-gold font-medium">{gig.rating}</span>
          </div>
          <span className="text-steel text-sm">({gig.reviews})</span>
        </div>

        {/* Pricing Tiers */}
        <div className="flex gap-1 mb-4">
          {(Object.keys(gig.pricing) as Array<keyof typeof gig.pricing>).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`flex-1 py-2 text-xs font-medium rounded-t transition-colors ${
                selectedTier === tier
                  ? "bg-midnight-lighter text-gold border-b-2 border-gold"
                  : "bg-midnight text-steel hover:text-offwhite"
              }`}
            >
              {tierLabels[tier]}
            </button>
          ))}
        </div>

        {/* Selected Tier Details */}
        <div className={`bg-midnight rounded-lg p-3 mb-4 ${tierStyles[selectedTier]}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gold font-bold text-lg">{gig.pricing[selectedTier].price}</span>
          </div>
          <div className="flex gap-4 text-xs text-steel">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {gig.pricing[selectedTier].delivery}
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {gig.pricing[selectedTier].revisions} revisions
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button className="w-full btn-gold py-3 rounded-lg font-semibold">
          Continue
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const { setUser: setAuthUser, logout: authLogout } = useAuthStore();

  // Auth form state
  const [authTab, setAuthTab] = useState<"signin" | "join">("signin");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const isLoggedIn = !!user;

  // Check if user is logged in
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          // Sync with auth store for dashboard
          setAuthUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            isVerified: data.user.isVerified,
          });
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [setAuthUser]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError("Invalid email or password. Please try again.");
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (sessionData?.user) {
          setUser(sessionData.user);
          // Sync with auth store for dashboard
          setAuthUser({
            id: sessionData.user.id,
            email: sessionData.user.email,
            name: sessionData.user.name,
            role: sessionData.user.role,
            isVerified: sessionData.user.isVerified,
          });
        }
      }
    } catch (err) {
      setAuthError("An error occurred. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    if (password.length < 8) {
      setAuthError("Password must be at least 8 characters long.");
      setAuthLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || "Failed to create account.");
      } else {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          const sessionRes = await fetch("/api/auth/session");
          const sessionData = await sessionRes.json();
          if (sessionData?.user) {
            setUser(sessionData.user);
            // Sync with auth store for dashboard
            setAuthUser({
              id: sessionData.user.id,
              email: sessionData.user.email,
              name: sessionData.user.name,
              role: sessionData.user.role,
              isVerified: sessionData.user.isVerified,
            });
          }
        }
      }
    } catch (err) {
      setAuthError("An error occurred. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false });
    setUser(null);
    authLogout(); // Clear auth store
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-steel">Loading ZeeFix Hub...</p>
        </div>
      </div>
    );
  }

  // AUTH VIEW - Midnight Blue & Gold Theme
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex bg-midnight">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-midnight-light relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-midnight-lighter/50 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 flex flex-col justify-between p-12 text-offwhite">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image 
                src="/zee-logo.png" 
                alt="ZeeFix Hub Logo" 
                width={64} 
                height={64}
                className="rounded-xl gold-glow-sm"
              />
              <div>
                <span className="font-bold text-2xl text-gold">ZeeFix Hub</span>
                <p className="text-xs text-steel">by Zee&apos;s Digital Empire</p>
              </div>
            </div>

            {/* Hero Text */}
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight">
                <span className="text-gold">The Pulse</span> of<br />African Genius
              </h1>
              <p className="text-lg text-steel max-w-md">
                Nigeria&apos;s Premier Multi-Vendor Marketplace — Services, Fashion, Wellness & Global Exports
              </p>
              
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { icon: Shield, label: "Zee-Shield Escrow", color: "text-gold" },
                  { icon: Truck, label: "Fast Delivery", color: "text-teal" },
                  { icon: Award, label: "Verified Vendors", color: "text-gold" },
                  { icon: Globe, label: "Global Exports", color: "text-teal" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-midnight-lighter border-2 border-midnight" />
                ))}
              </div>
              <p className="text-sm text-steel">
                Join <span className="font-semibold text-gold">50,000+</span> trusted vendors
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-6 bg-midnight">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <Image 
                src="/zee-logo.png" 
                alt="ZeeFix Hub Logo" 
                width={52} 
                height={52}
                className="rounded-xl"
              />
              <div>
                <span className="font-bold text-xl text-gold">ZeeFix Hub</span>
                <p className="text-xs text-steel">by Zee&apos;s Digital Empire</p>
              </div>
            </div>

            <div className="bg-midnight-light p-8 rounded-2xl border border-midnight-border">
              {/* Tabs */}
              <div className="flex border-b border-midnight-border mb-6">
                <button
                  onClick={() => setAuthTab("signin")}
                  className={`flex-1 pb-3 font-semibold transition-colors ${
                    authTab === "signin"
                      ? "text-gold border-b-2 border-gold"
                      : "text-steel"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthTab("join")}
                  className={`flex-1 pb-3 font-semibold transition-colors ${
                    authTab === "join"
                      ? "text-gold border-b-2 border-gold"
                      : "text-steel"
                  }`}
                >
                  Become a Vendor
                </button>
              </div>

              {/* Error */}
              {authError && (
                <div className="bg-coral/10 border border-coral/30 text-coral px-4 py-3 rounded-lg text-sm mb-4">
                  {authError}
                </div>
              )}

              {/* Sign In Form */}
              {authTab === "signin" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-offwhite">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 bg-midnight border-midnight-border text-offwhite placeholder-steel focus:border-gold focus:ring-gold"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-offwhite">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 bg-midnight border-midnight-border text-offwhite placeholder-steel focus:border-gold focus:ring-gold"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-gold"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 btn-gold font-semibold"
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>
              )}

              {/* Join Form */}
              {authTab === "join" && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-offwhite">Full Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel" />
                      <Input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11 bg-midnight border-midnight-border text-offwhite placeholder-steel focus:border-gold focus:ring-gold"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-offwhite">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 bg-midnight border-midnight-border text-offwhite placeholder-steel focus:border-gold focus:ring-gold"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-offwhite">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Choose a password (min 8 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 bg-midnight border-midnight-border text-offwhite placeholder-steel focus:border-gold focus:ring-gold"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-gold"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 btn-gold font-semibold"
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Start Selling"
                    )}
                  </Button>
                </form>
              )}

              <p className="text-center text-xs text-steel mt-6">
                By joining, you agree to ZeeFix Hub&apos;s{" "}
                <Link href="/terms" className="text-gold hover:underline">Terms of Service</Link> and{" "}
                <Link href="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // APP VIEW - Main Application with Midnight Blue & Gold Theme
  return (
    <div className="min-h-screen flex flex-col bg-midnight pb-20 lg:pb-0">
      {/* Top Header - Desktop */}
      <header className="hidden lg:flex sticky top-0 z-50 w-full border-b border-midnight-border bg-midnight/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image 
              src="/zee-logo.png" 
              alt="ZeeFix Hub Logo" 
              width={48} 
              height={48}
              className="rounded-lg gold-glow-sm"
            />
            <div>
              <span className="font-bold text-lg text-gold">ZeeFix Hub</span>
              <p className="text-[10px] text-steel -mt-1">by Zee&apos;s Digital Empire</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-steel" />
              <Input
                placeholder="Search services, products, vendors..."
                className="pl-11 pr-4 h-10 rounded-full bg-midnight-light border-midnight-border text-offwhite placeholder-steel focus:border-gold focus:ring-gold"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gold">Home</Link>
            <Link href="/explore" className="text-sm font-medium text-steel hover:text-gold">Explore Hub</Link>
            <Link href="/dashboard/seller" className="text-sm font-medium text-steel hover:text-gold">My Activity</Link>
            
            {/* Notifications */}
            <button className="p-2 text-steel hover:text-gold relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full"></span>
            </button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-midnight-light transition-colors">
                  {user?.image ? (
                    <img src={user.image} alt={user.name || "User"} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gold text-midnight flex items-center justify-center font-medium text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 bg-midnight-light border-midnight-border">
                <div className="px-2 py-3 border-b border-midnight-border mb-2">
                  <p className="font-medium text-offwhite text-sm">{user?.name || "User"}</p>
                  <p className="text-xs text-steel">{user?.email}</p>
                  {user?.isVerified && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gold">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>
                <DropdownMenuItem asChild className="cursor-pointer py-2 text-offwhite hover:text-gold focus:text-gold">
                  <Link href="/dashboard/seller" className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4 text-steel" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2 text-offwhite hover:text-gold focus:text-gold">
                  <Link href="/dashboard/seller/wallet" className="flex items-center gap-3">
                    <Wallet className="w-4 h-4 text-steel" />
                    <span>Wallet</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2 text-offwhite hover:text-gold focus:text-gold">
                  <Link href="/dashboard/settings" className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-steel" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-midnight-border" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2 text-coral focus:text-coral">
                  <LogOut className="w-4 h-4 mr-3" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Slider */}
        <HeroSlider />

        {/* Category Navigation */}
        <section className="py-6 px-4 border-b border-midnight-border bg-midnight-light/50">
          <div className="container mx-auto">
            <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
              {[
                { id: "services", label: "Local Services", icon: Wrench, color: "text-gold" },
                { id: "fashion", label: "Fashion & Fabrics", icon: Shirt, color: "text-teal" },
                { id: "wellness", label: "Wellness & Herbs", icon: Leaf, color: "text-gold" },
                { id: "exports", label: "Global Exports", icon: Plane, color: "text-teal" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    activeTab === cat.id
                      ? "bg-gold text-midnight font-semibold"
                      : "bg-midnight-light border border-midnight-border text-steel hover:text-gold hover:border-gold"
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  <span className="text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Local Services Section */}
        <section className="py-12 px-4 bg-midnight">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-offwhite mb-1">Local Services</h2>
                <p className="text-steel">Book trusted professionals near you</p>
              </div>
              <Link href="/services" className="text-sm font-medium text-gold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {LOCAL_SERVICES.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group"
                >
                  <div className="bg-midnight-light rounded-xl border border-midnight-border p-4 text-center card-hover">
                    <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <service.icon className="w-6 h-6 text-midnight" />
                    </div>
                    <p className="text-sm font-medium text-offwhite mb-1">{service.label}</p>
                    <p className="text-xs text-gold">{service.count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Gigs with Pricing Tiers */}
        <section className="py-12 px-4 bg-midnight-light/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-offwhite mb-1">Featured Services</h2>
                <p className="text-steel">Hand-picked vendors with 3-tier pricing</p>
              </div>
              <Link href="/gigs" className="text-sm font-medium text-gold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED_GIGS.map((gig) => (
                <PricingTierCard key={gig.id} gig={gig} />
              ))}
            </div>
          </div>
        </section>

        {/* Fashion & Fabrics Section */}
        <section className="py-12 px-4 bg-midnight">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-offwhite mb-1">Fashion & Fabrics</h2>
                <p className="text-steel">Ankara, Aso Oke, Ready-to-Wear & Bespoke</p>
              </div>
              <Link href="/fashion" className="text-sm font-medium text-gold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FASHION_CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  href={`/fashion/${category.id}`}
                  className="group relative overflow-hidden rounded-xl aspect-square"
                >
                  <img
                    src={category.image}
                    alt={category.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-offwhite font-semibold">{category.label}</p>
                    <p className="text-gold text-xs">{category.count} items</p>
                    <p className="text-steel text-xs mt-1">{category.priceRange}</p>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Home Measurement CTA */}
            <div className="mt-6 bg-midnight-light border border-midnight-border rounded-xl p-4 flex items-center justify-between card-hover">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center gold-glow-sm">
                  <Users className="w-5 h-5 text-midnight" />
                </div>
                <div>
                  <p className="font-semibold text-offwhite">Request Home Measurement</p>
                  <p className="text-sm text-steel">For bespoke tailoring at your location</p>
                </div>
              </div>
              <Button className="btn-gold">
                Book Now
              </Button>
            </div>
          </div>
        </section>

        {/* Wellness & Herbs Section */}
        <section className="py-12 px-4 bg-midnight-light/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-offwhite mb-1">Wellness & Cosmetics</h2>
                <p className="text-steel">Vetted herbs, creams & organic products</p>
              </div>
              <Link href="/wellness" className="text-sm font-medium text-gold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {WELLNESS_CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  href={`/wellness/${category.id}`}
                  className="group relative overflow-hidden rounded-xl aspect-square"
                >
                  <img
                    src={category.image}
                    alt={category.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent" />
                  <div className="absolute top-2 right-2">
                    {category.verified && (
                      <div className="zee-vetted">
                        <CheckCircle2 className="w-3 h-3" />
                        Vetted
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <p className="text-offwhite font-semibold">{category.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Global Exports Section */}
        <section className="py-12 px-4 bg-midnight">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-offwhite mb-1">Global Food & Export</h2>
                <p className="text-steel">Ship to diaspora worldwide</p>
              </div>
              <Link href="/exports" className="text-sm font-medium text-gold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-midnight-light rounded-xl border border-midnight-border p-6 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-offwhite">Raw Food Stuffs</h3>
                    <p className="text-sm text-steel mb-3">Export Nigerian food items worldwide</p>
                    <div className="flex flex-wrap gap-2">
                      {["Garri", "Palm Oil", "Ogbono", "Crayfish"].map((item) => (
                        <span key={item} className="text-xs bg-midnight border border-midnight-border px-2 py-1 rounded-full text-steel">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-midnight-light rounded-xl border border-midnight-border p-6 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal/20 rounded-xl flex items-center justify-center">
                    <ChefHat className="w-6 h-6 text-teal" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-offwhite">Catering Services</h3>
                    <p className="text-sm text-steel mb-3">Professional catering for events</p>
                    <div className="flex flex-wrap gap-2">
                      {["Weddings", "Parties", "Corporate", "Private"].map((item) => (
                        <span key={item} className="text-xs bg-midnight border border-midnight-border px-2 py-1 rounded-full text-steel">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Export to Diaspora CTA */}
            <div className="mt-6 bg-gradient-to-r from-gold/20 to-teal/20 border border-gold/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-offwhite">Export to Diaspora</h3>
                  <p className="text-steel text-sm">Get automated international shipping quotes via DHL/GIGL</p>
                </div>
                <Button className="btn-gold">
                  <Plane className="w-4 h-4 mr-2" />
                  Get Quote
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Zee-Shield Trust Section */}
        <section className="py-16 px-4 bg-midnight-light/50">
          <div className="container mx-auto text-center">
            <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-4 gold-glow animate-glow-pulse">
              <Shield className="w-8 h-8 text-midnight" />
            </div>
            <h2 className="text-2xl font-bold text-offwhite mb-2">Protected by Zee-Shield</h2>
            <p className="text-steel mb-8 max-w-2xl mx-auto">
              Your payments are held in secure escrow until you confirm delivery. Shop with confidence.
            </p>
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: "Secure Escrow", desc: "Funds released on confirmation", color: "text-gold" },
                { icon: Clock, title: "24/7 Support", desc: "Always here to help", color: "text-teal" },
                { icon: Award, title: "Verified Vendors", desc: "Background-checked sellers", color: "text-gold" },
                { icon: MessageCircle, title: "Dispute Resolution", desc: "Fair conflict handling", color: "text-teal" },
              ].map((item, i) => (
                <div key={i} className="bg-midnight rounded-xl border border-midnight-border p-6 card-hover">
                  <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-3`} />
                  <h3 className="font-semibold text-offwhite mb-1">{item.title}</h3>
                  <p className="text-sm text-steel">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="hidden lg:block border-t border-midnight-border bg-midnight py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/zee-logo.png" 
                alt="ZeeFix Hub Logo" 
                width={44} 
                height={44}
                className="rounded-lg"
              />
              <span className="font-bold text-gold">ZeeFix Hub</span>
            </div>
            <p className="text-sm text-steel">
              © 2024 Zee&apos;s Digital Empire. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-midnight-light border-t border-midnight-border z-50">
        <div className="flex justify-around py-2">
          {[
            { icon: Home, label: "Home", active: true },
            { icon: Search, label: "Explore", active: false },
            { icon: ShoppingBag, label: "Activity", active: false },
            { icon: User, label: "Profile", active: false },
          ].map((item, i) => (
            <button
              key={i}
              className={`flex flex-col items-center py-2 px-4 ${
                item.active ? "text-gold" : "text-steel"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
