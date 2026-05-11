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

export const metadata: Metadata = {
  title: "shef — Your week, beautifully planned",
  description:
    "AI-powered meal planning that feels like a beautiful recipe journal. Plan your week, get a smart grocery list, and see your nutrition at a glance.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>",
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
                border: "1px solid #E8C4B8",
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
