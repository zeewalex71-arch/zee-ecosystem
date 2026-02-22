"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/app-store";

export default function DashboardRootPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        // Check session
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();

        if (!sessionData?.user) {
          router.push("/");
          return;
        }

        // Get role
        const roleRes = await fetch("/api/auth/role");
        const roleData = await roleRes.json();

        // Redirect based on role
        if (roleData.role === "SELLER") {
          router.push("/dashboard/seller");
        } else {
          router.push("/dashboard/buyer");
        }
      } catch (error) {
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAndRedirect();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
}
