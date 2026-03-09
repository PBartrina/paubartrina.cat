import type { Metadata } from "next";
import { JetBrains_Mono, Raleway } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "</> Pau Bartrina | Senior Frontend Engineer",
    template: "%s | </> Pau Bartrina",
  },
  description:
    "Senior Frontend Engineer amb +15 anys d'experiència en Angular, TypeScript, NgRx i Nx. Especialitzat en arquitectura modular, testing i lideratge tècnic.",
  metadataBase: new URL("https://paubartrina.cat"),
  openGraph: {
    title: "</> Pau Bartrina | Senior Frontend Engineer",
    description:
      "Senior Frontend Engineer amb +15 anys d'experiència en Angular, TypeScript, NgRx i Nx. Especialitzat en arquitectura modular, testing i lideratge tècnic.",
    url: "https://paubartrina.cat",
    siteName: "Pau Bartrina",
    locale: "ca_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} ${raleway.variable} flex min-h-screen flex-col antialiased`}>
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ThemeToggle />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
