import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Header from "@/components/Header";
import AiAssistantButton from "@/components/AiAssistantButton";
import { AuthProvider } from "@/lib/authContext";
import { ThemeProvider } from "@/lib/themeContext";

const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monoFont = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Kitchen Book — What's cooking?",
  description: "Discover authentic Nigerian and African recipes ranked by the ingredients in your kitchen pantry.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Kitchen Book",
  },
};

export const viewport: Viewport = {
  themeColor: "#141310",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col md:flex-row bg-[var(--ink)] text-[var(--cream)] pb-24 md:pb-0">
        <ThemeProvider>
          <AuthProvider>
            <Navigation />
            <div className="flex-1 flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 w-full max-w-5xl mx-auto">
                {children}
              </main>
            </div>
            <AiAssistantButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
