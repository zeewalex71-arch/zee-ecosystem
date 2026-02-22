"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, User, Mail, Lock, Loader2, CheckCircle2 } from "lucide-react";

export default function AdminSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Check if setup is needed
    fetch("/api/admin/setup")
      .then((res) => res.json())
      .then((data) => {
        if (!data.needsSetup) {
          // Admin already exists, redirect to admin login
          router.push("/admin");
        } else {
          setNeedsSetup(true);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setNeedsSetup(true);
        setIsLoading(false);
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create admin account");
        return;
      }

      setSuccess(true);
      
      // Redirect to admin login after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A192F]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#FFD700]" />
          <p className="text-[#E6E6E6]">Checking admin setup...</p>
        </div>
      </div>
    );
  }

  if (!needsSetup) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A192F] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#FFD700] mb-4">
            <Shield className="w-8 h-8 text-[#0A192F]" />
          </div>
          <h1 className="text-2xl font-bold text-[#FFD700]">ZeeFix Hub</h1>
          <p className="text-[#8892B0] mt-1">Admin Setup</p>
        </div>

        <Card className="bg-[#112240] border-[#233554]">
          <CardHeader>
            <CardTitle className="text-[#E6E6E6]">Create Admin Account</CardTitle>
            <CardDescription className="text-[#8892B0]">
              Set up your administrator account to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#E6E6E6] mb-2">Admin Created!</h3>
                <p className="text-[#8892B0] mb-4">
                  Your admin account has been created successfully.
                </p>
                <p className="text-[#FFD700]">Redirecting to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#E6E6E6]">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892B0]" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Admin User"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 bg-[#0A192F] border-[#233554] text-[#E6E6E6] placeholder-[#8892B0] focus:border-[#FFD700]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#E6E6E6]">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892B0]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@zeefix.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-[#0A192F] border-[#233554] text-[#E6E6E6] placeholder-[#8892B0] focus:border-[#FFD700]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#E6E6E6]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892B0]" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 bg-[#0A192F] border-[#233554] text-[#E6E6E6] placeholder-[#8892B0] focus:border-[#FFD700]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#E6E6E6]">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8892B0]" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 bg-[#0A192F] border-[#233554] text-[#E6E6E6] placeholder-[#8892B0] focus:border-[#FFD700]"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0A192F] font-semibold py-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Admin...
                    </>
                  ) : (
                    "Create Admin Account"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
