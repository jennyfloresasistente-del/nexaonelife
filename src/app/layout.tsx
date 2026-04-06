import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexa One Life — Crea apps con IA",
  description: "Describe lo que quieres construir y Nexa One Life lo crea en segundos con inteligencia artificial. GPT-4o + Claude Opus.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nexa One Life",
    startupImage: "/logo.png",
  },
  icons: {
    icon: [
      { url: "/logo-sm.png", sizes: "192x192", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: "Nexa One Life — Crea apps con IA",
    description: "Crea aplicaciones web completas con inteligencia artificial en segundos.",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Nexa One Life" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexa One Life — Crea apps con IA",
    description: "Crea aplicaciones web con IA en segundos.",
    images: ["/logo.png"],
  },
  keywords: ["inteligencia artificial", "crear apps", "generador de código", "GPT-4", "Claude", "México"],
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
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
    <html lang="es" className="dark h-full">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nexa One Life" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-startup-image" href="/logo.png" />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-950 text-white antialiased`}>
        {children}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  console.log('SW registrado:', reg.scope);
                }).catch(function(err) {
                  console.log('SW error:', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
