import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zee Ecosystem - Your Unified Marketplace",
  description: "Zee Ecosystem brings together ZeeGig (Digital Services) and ZeeFix Hub (Physical Goods & Local Services) into one powerful platform with built-in Escrow payments and real-time chat.",
  keywords: ["Zee Ecosystem", "ZeeGig", "ZeeFix Hub", "Marketplace", "Digital Services", "Local Services", "Escrow", "Nigeria"],
  authors: [{ name: "Zee Ecosystem Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Zee Ecosystem - Your Unified Marketplace",
    description: "Digital services, physical goods, and local services in one place",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zee Ecosystem",
    description: "Your Unified Marketplace for Digital & Physical Services",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
