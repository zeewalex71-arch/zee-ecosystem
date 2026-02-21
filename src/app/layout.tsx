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
  title: "ZeeFix Hub - Nigeria's Premier Multi-Vendor Marketplace",
  description: "ZeeFix Hub by Zee's Digital Empire - Services, Fashion, Wellness & Global Exports. Trusted platform with Zee-Shield Escrow protection.",
  keywords: ["ZeeFix Hub", "Zee's Digital Empire", "Marketplace", "Nigeria", "Local Services", "Fashion", "Herbs", "Exports", "Escrow"],
  authors: [{ name: "Zee's Digital Empire Limited - CEO: Idowu Akinwale" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ZeeFix Hub - Nigeria's Premier Multi-Vendor Marketplace",
    description: "Services, Fashion, Wellness & Global Exports - All protected by Zee-Shield Escrow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeeFix Hub",
    description: "Nigeria's Premier Multi-Vendor Marketplace",
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
