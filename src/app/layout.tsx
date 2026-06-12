import type { Metadata, Viewport } from "next";
import "./globals.css";
import FloatingActions from "@/components/FloatingActions";
import BottomNav from "@/components/BottomNav";
import { getServerSiteUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getServerSiteUrl();

  return {
    title: {
      default: "Vitamins HUB | متجر المكملات الغذائية والفيتامينات الأصلي في مصر",
      template: "%s | Vitamins HUB"
    },
    description: "تسوق أفضل المكملات الغذائية، الفيتامينات، البروتينات، حوارق الدهون، ومنتجات الرشاقة الأصلية 100% في مصر مع Vitamins HUB. توصيل سريع ودعم طبي متخصص.",
    keywords: [
      "فيتامينات", "مكملات غذائية", "بروتينات مصر", "مكملات جيم", "Vitamins Egypt", 
      "فيتامينات أصلية", "واي بروتين", "كرياتين", "Vitamins HUB", "متجر مكملات غذائية",
      "صحة ورشاقة", "مكملات مستوردة", "شراء فيتامينات مصر", "أوميجا 3", "فيتامين د"
    ],
    authors: [{ name: "Vitamins HUB Team", url: siteUrl }],
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: "Vitamins HUB | متجر المكملات الغذائية والفيتامينات الأصلي في مصر",
      description: "تسوق أفضل المكملات الغذائية، الفيتامينات، البروتينات، حوارق الدهون، ومنتجات الرشاقة الأصلية 100% في مصر مع Vitamins HUB. توصيل سريع ودعم طبي متخصص.",
      url: siteUrl,
      siteName: "Vitamins HUB",
      locale: "ar_EG",
      type: "website",
      images: [
        {
          url: "/logo-v2.png?v=5",
          width: 800,
          height: 600,
          alt: "Vitamins HUB Premium Supplements"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "Vitamins HUB | متجر المكملات الغذائية والفيتامينات الأصلي في مصر",
      description: "تسوق أفضل المكملات الغذائية، الفيتامينات، البروتينات، حوارق الدهون، ومنتجات الرشاقة الأصلية 100% في مصر مع Vitamins HUB. توصيل سريع ودعم طبي متخصص.",
      images: ["/logo-v2.png?v=5"],
    },
    icons: {
      icon: "/logo-v2.png?v=5",
      shortcut: "/logo-v2.png?v=5",
      apple: "/logo-v2.png?v=5",
    },
  };
}

// ─── Viewport (MUST be separate export in Next.js 14 App Router) ───────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2e7d5e',
};

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { ModalProvider } from "@/context/ModalContext";
import { LanguageProvider } from "@/context/LanguageContext";
import ConsoleManager from "@/components/ConsoleManager";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-cairo overflow-x-hidden">
        <ConsoleManager />
        <LanguageProvider>
          <AuthProvider>
            <ModalProvider>
              <CartProvider>
                <WishlistProvider>
                  {children}
                  <FloatingActions />
                  <BottomNav />
                </WishlistProvider>
              </CartProvider>
            </ModalProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
