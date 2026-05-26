import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EidCard | Share the Joy of Eid with the World",
  description: "Create beautiful, personalized Eid cards and share them with your loved ones. Choose from 10 stunning themes, add custom messages, and spread the joy of Eid.",
  keywords: ["Eid card", "Eid greeting", "Eid al-Fitr", "Eid al-Adha", "Islamic greeting", "Bangladesh"],
  authors: [{ name: "S.M. Mehedy Kawser", url: "https://github.com/mehedyk" }],
  openGraph: {
    title: "EidCard | Share the Joy of Eid",
    description: "Create beautiful, personalized Eid cards and share them with your loved ones.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <Toaster>
            {children}
          </Toaster>
        </AuthProvider>
      </body>
    </html>
  );
}
