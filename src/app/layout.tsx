import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, Amiri, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/auth-provider";

/* ── Fonts ───────────────────────────────────────────────────────────────── */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

/* ── Metadata ─────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "EidCard — Share the Joy of Eid",
    template: "%s | EidCard",
  },
  description:
    "Create beautiful, personalised Eid greeting cards and share them with your loved ones. Choose from 10 stunning themes, add custom messages, and spread the joy of Eid.",
  keywords: [
    "Eid card", "Eid greeting", "Eid Mubarak", "Eid al-Fitr", "Eid al-Adha",
    "Islamic greeting", "Bangladesh", "digital Eid card", "free Eid card",
  ],
  authors: [{ name: "EidCard" }],
  creator: "EidCard",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://eidcard.vercel.app"
  ),
  openGraph: {
    title: "EidCard — Share the Joy of Eid",
    description: "Create beautiful, personalised Eid cards and share them with your loved ones.",
    type: "website",
    locale: "en_US",
    siteName: "EidCard",
  },
  twitter: {
    card: "summary_large_image",
    title: "EidCard — Share the Joy of Eid",
    description: "Create beautiful, personalised Eid cards and share them with your loved ones.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fef3c7" },
    { media: "(prefers-color-scheme: dark)",  color: "#0d0b2e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* ── Root Layout ──────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${dmSans.variable} ${amiri.variable} ${jetbrains.variable}`}
    >
      <body className="font-body antialiased">
        <AuthProvider>
          <Toaster>
            {children}
          </Toaster>
        </AuthProvider>
      </body>
    </html>
  );
}
