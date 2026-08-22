import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { GoogleProvider } from "@/components/providers/GoogleProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GrowSuite — The CRM built for modern teams",
  description:
    "GrowSuite unifies your contacts, deals, and pipelines into one elegant workspace. Built for modern teams who demand both speed and clarity.",
  openGraph: {
    title: "GrowSuite — The CRM built for modern teams",
    description: "GrowSuite unifies your contacts, deals, and pipelines into one elegant workspace. Built for modern teams who demand both speed and clarity.",
    url: "https://growsuite.io",
    siteName: "GrowSuite",
    images: [
      {
        url: "/og-image.jpg", // Placeholder for actual OG image
        width: 1200,
        height: 630,
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GrowSuite — The CRM built for modern teams",
    description: "GrowSuite unifies your contacts, deals, and pipelines into one elegant workspace.",
    creator: "@growsuite",
    images: ["/og-image.jpg"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleProvider>
          {children}
        </GoogleProvider>
      </body>
    </html>
  );
}
