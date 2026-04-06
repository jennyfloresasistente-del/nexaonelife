import type { Metadata, Viewport } from "next";
import "./globals.css";

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
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(reg) {
                // Detectar actualizaciones del SW y recargar automáticamente
                reg.addEventListener('updatefound', function() {
                  var newWorker = reg.installing;
                  if (!newWorker) return;
                  newWorker.addEventListener('statechange', function() {
                    if (newWorker.state === 'activated') {
                      // Nuevo SW activado: recargar para obtener la versión más reciente
                      window.location.reload();
                    }
                  });
                });
              });
              // Escuchar mensajes del SW (SW_UPDATED)
              navigator.serviceWorker.addEventListener('message', function(event) {
                if (event.data && event.data.type === 'SW_UPDATED') {
                  window.location.reload();
                }
              });
            });
          }
        ` }} />
      </head>
      <body className="min-h-full flex flex-col text-white antialiased" style={{fontFamily: 'system-ui, -apple-system, sans-serif', background:'#000000'}}>
        {children}
      </body>
    </html>
  );
}
