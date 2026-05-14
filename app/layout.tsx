import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { MobileInstallBanner } from "../components/layout/MobileInstallBanner";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://yourshef.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "shef — Your week, beautifully planned",
    template: "%s | shef",
  },
  description:
    "AI-powered meal planning that feels like a beautiful recipe journal. Plan your week, get a smart grocery list, and see your nutrition at a glance.",
  keywords: [
    "meal planning",
    "meal planner",
    "grocery list",
    "AI meal plan",
    "weekly meal prep",
    "recipe planner",
    "nutrition tracker",
    "healthy eating",
  ],
  authors: [{ name: "MoveClub Inc., LLC" }],
  creator: "MoveClub Inc., LLC",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "shef",
    title: "shef — Your week, beautifully planned",
    description:
      "AI-powered meal planning that feels like a beautiful recipe journal. Plan your week, get a smart grocery list, and see your nutrition at a glance.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "shef — AI meal planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "shef — Your week, beautifully planned",
    description:
      "AI-powered meal planning that feels like a beautiful recipe journal. Plan your week, get a smart grocery list, and see your nutrition at a glance.",
    images: ["/og-image.png"],
    creator: "@joinmoveclub",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${playfair.variable} ${dmSans.variable} h-full`}
      >
        <body className="min-h-full flex flex-col font-sans text-espresso bg-cream antialiased">
          {children}
          <MobileInstallBanner />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#FAF7F2",
                color: "#2C1A0E",
                border: "1px solid #DBBF9E",
                borderRadius: "12px",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
