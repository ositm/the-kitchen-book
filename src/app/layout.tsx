import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Header from "@/components/Header";
import AiAssistantButton from "@/components/AiAssistantButton";
import { AuthProvider } from "@/lib/authContext";

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const serifFont = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "The Kitchen Book — What can I cook with what I have?",
  description: "Discover authentic Nigerian and African recipes ranked by the ingredients in your kitchen pantry.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Kitchen Book",
  },
};

export const viewport: Viewport = {
  themeColor: "#18533A",
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
      className={`${sansFont.variable} ${serifFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col md:flex-row bg-[#FFF9ED] text-[#1F2937] pb-20 md:pb-0">
        <AuthProvider>
          <Navigation />
          <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
            <Header />
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 sm:px-6 md:py-6 lg:px-8">
              {children}
            </main>
          </div>
          <AiAssistantButton />
        </AuthProvider>
      </body>
    </html>
  );
}
