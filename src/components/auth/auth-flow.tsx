"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Store,
  ShoppingBasket,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface AuthFlowProps {
  onAuthSuccess: (user: any) => void;
}

type AuthStep = "signin" | "signup" | "otp" | "role";

export default function AuthFlow({ onAuthSuccess }: AuthFlowProps) {
  const [step, setStep] = useState<AuthStep>("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [selectedRole, setSelectedRole] = useState<"BUYER" | "SELLER" | null>(null);

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (sessionData?.user) {
          onAuthSuccess(sessionData.user);
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up - Send OTP
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      // Create account
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      // Send OTP
      const otpResponse = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const otpData = await otpResponse.json();

      if (otpResponse.ok) {
        setSentOtp(otpData.otp); // For demo
        setStep("otp");
      } else {
        // If OTP fails, still proceed (for demo purposes)
        setStep("otp");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid OTP.");
        setLoading(false);
        return;
      }

      // OTP verified, go to role selection
      setStep("role");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Role Selection
  const handleRoleSelect = async () => {
    if (!selectedRole) {
      setError("Please select a role to continue.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update role
      await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      // Sign in the user
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (sessionData?.user) {
          onAuthSuccess(sessionData.user);
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <AnimatePresence mode="wait">
          {/* Sign In Step */}
          {step === "signin" && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-xl font-bold text-offwhite mb-2">Welcome Back</h2>
              <p className="text-steel text-sm mb-6">Sign in to your account</p>

              {error && (
                <div className="bg-coral/10 border border-coral/30 text-coral px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
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
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-steel text-sm">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => {
                      setStep("signup");
                      setError(null);
                    }}
                    className="text-gold hover:underline font-medium"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* Sign Up Step */}
          {step === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button
                onClick={() => {
                  setStep("signin");
                  setError(null);
                }}
                className="flex items-center gap-2 text-steel hover:text-offwhite mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>

              <h2 className="text-xl font-bold text-offwhite mb-2">Create Account</h2>
              <p className="text-steel text-sm mb-6">Join ZeeFix Hub today</p>

              {error && (
                <div className="bg-coral/10 border border-coral/30 text-coral px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-4">
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
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          )}

          {/* OTP Verification Step */}
          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button
                onClick={() => {
                  setStep("signup");
                  setError(null);
                }}
                className="flex items-center gap-2 text-steel hover:text-offwhite mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-gold" />
                </div>
                <h2 className="text-xl font-bold text-offwhite mb-2">Verify Your Email</h2>
                <p className="text-steel text-sm">
                  We&apos;ve sent a 6-digit code to<br />
                  <span className="text-gold">{email}</span>
                </p>
                {sentOtp && (
                  <p className="text-xs text-gold mt-2">
                    Demo OTP: <span className="font-bold">{sentOtp}</span>
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-coral/10 border border-coral/30 text-coral px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-offwhite">Enter OTP Code</Label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="mt-1 h-12 text-center text-2xl tracking-widest bg-midnight border-midnight-border text-offwhite placeholder-steel focus:border-gold focus:ring-gold"
                    maxLength={6}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 btn-gold font-semibold"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-steel mt-4">
                Didn&apos;t receive the code?{" "}
                <button className="text-gold hover:underline">Resend OTP</button>
              </p>
            </motion.div>
          )}

          {/* Role Selection Step */}
          {step === "role" && (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-gold" />
                </div>
                <h2 className="text-xl font-bold text-offwhite mb-2">Email Verified!</h2>
                <p className="text-steel text-sm">How would you like to use ZeeFix Hub?</p>
              </div>

              {error && (
                <div className="bg-coral/10 border border-coral/30 text-coral px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setSelectedRole("BUYER")}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedRole === "BUYER"
                      ? "border-gold bg-gold/10"
                      : "border-midnight-border hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedRole === "BUYER" ? "bg-gold text-midnight" : "bg-midnight-border text-steel"
                    }`}>
                      <ShoppingBasket className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-offwhite">I want to Shop</p>
                      <p className="text-sm text-steel">Hire services & buy products</p>
                    </div>
                    {selectedRole === "BUYER" && (
                      <CheckCircle2 className="w-5 h-5 text-gold" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setSelectedRole("SELLER")}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedRole === "SELLER"
                      ? "border-gold bg-gold/10"
                      : "border-midnight-border hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedRole === "SELLER" ? "bg-gold text-midnight" : "bg-midnight-border text-steel"
                    }`}>
                      <Store className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-offwhite">I want to Sell</p>
                      <p className="text-sm text-steel">Offer services & sell products</p>
                    </div>
                    {selectedRole === "SELLER" && (
                      <CheckCircle2 className="w-5 h-5 text-gold" />
                    )}
                  </div>
                </button>
              </div>

              <Button
                onClick={handleRoleSelect}
                className="w-full h-11 btn-gold font-semibold"
                disabled={loading || !selectedRole}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-steel mt-6">
          By joining, you agree to ZeeFix Hub&apos;s{" "}
          <Link href="/terms" className="text-gold hover:underline">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
