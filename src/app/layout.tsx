import type { Metadata, Viewport } from "next";
import { Cairo, Outfit } from "next/font/google";
import "./globals.css";
import FloatingActions from "@/components/FloatingActions";
import BottomNav from "@/components/BottomNav";
import { getServerSiteUrl } from "@/lib/seo";

// ─── Google Fonts via next/font (أسرع من @import — لا يوجد Render Blocking) ──
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700", "900"],
  display: "swap",
  variable: "--font-cairo",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  display: "swap",
  variable: "--font-outfit",
});

// ─── Metadata ──────────────────────────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getServerSiteUrl();

  return {
    title: {
      default: "The VitaHub | متجر المكملات الغذائية والفيتامينات الأصلي في مصر",
      template: "%s | The VitaHub"
    },
    description: "تسوق أفضل المكملات الغذائية، الفيتامينات، البروتينات، حوارق الدهون، ومنتجات الرشاقة الأصلية 100% في مصر مع The VitaHub. توصيل سريع ودعم طبي متخصص.",
    keywords: [
      "فيتامينات", "مكملات غذائية", "بروتينات مصر", "مكملات جيم", "Vitamins Egypt",
      "فيتامينات أصلية", "واي بروتين", "كرياتين", "The VitaHub", "متجر مكملات غذائية",
      "صحة ورشاقة", "مكملات مستوردة", "شراء فيتامينات مصر", "أوميجا 3", "فيتامين د"
    ],
    authors: [{ name: "The VitaHub Team", url: siteUrl }],
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: siteUrl,
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
      title: "The VitaHub | متجر المكملات الغذائية والفيتامينات الأصلي في مصر",
      description: "تسوق أفضل المكملات الغذائية، الفيتامينات، البروتينات، حوارق الدهون، ومنتجات الرشاقة الأصلية 100% في مصر مع The VitaHub. توصيل سريع ودعم طبي متخصص.",
      url: siteUrl,
      siteName: "The VitaHub",
      locale: "ar_EG",
      type: "website",
      images: [
        {
          url: "/logo-header.jpg",
          width: 800,
          height: 600,
          alt: "The VitaHub Premium Supplements"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "The VitaHub | متجر المكملات الغذائية والفيتامينات الأصلي في مصر",
      description: "تسوق أفضل المكملات الغذائية، الفيتامينات، البروتينات، حوارق الدهون، ومنتجات الرشاقة الأصلية 100% في مصر مع The VitaHub. توصيل سريع ودعم طبي متخصص.",
      images: ["/logo-header.jpg"],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/logo-header.jpg",
    },
    verification: {
      google: "HQafwMSqWBmmU1Y1QVxosnsDRkdLHXUdt1KEZrTRIIc",
    },
  };
}

// ─── Viewport ───────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2e7d5e',
};

// ─── JSON-LD Structured Data (Server-side — يُقرأ بواسطة محركات البحث) ──────
async function JsonLdSchema() {
  const siteUrl = await getServerSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": `${siteUrl}/`,
        "name": "The VitaHub",
        "description": "متجر المكملات الغذائية والفيتامينات الأصلي الأول في مصر",
        "publisher": { "@id": `${siteUrl}/#organization` },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${siteUrl}/products?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        ],
        "inLanguage": "ar"
      },
      {
        "@type": "Store",
        "@id": `${siteUrl}/#organization`,
        "name": "The VitaHub Egypt",
        "url": `${siteUrl}/`,
        "logo": `${siteUrl}/logo-header.jpg`,
        "image": `${siteUrl}/logo-header.jpg`,
        "description": "تسوق أفضل المكملات الغذائية، الفيتامينات، البروتينات، حوارق الدهون، ومنتجات الرشاقة الأصلية 100% في مصر مع The VitaHub.",
        "telephone": "+201001234567",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "شبرا، القاهرة",
          "addressLocality": "القاهرة",
          "addressRegion": "القاهرة",
          "postalCode": "11511",
          "addressCountry": "EG"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 30.0444,
          "longitude": 31.2357
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "00:00",
          "closes": "23:59"
        },
        "sameAs": [
          "https://www.facebook.com/vitaminshub",
          "https://www.instagram.com/vitaminshub",
          "https://twitter.com/vitaminshub"
        ]
      }
    ]
  };

  // تعقيم آمن لمنع XSS في JSON-LD
  const safeJson = JSON.stringify(jsonLd)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}

// ─── Imports for Client Providers ───────────────────────────────────────────
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { ModalProvider } from "@/context/ModalContext";
import { LanguageProvider } from "@/context/LanguageContext";
import ConsoleManager from "@/components/ConsoleManager";
import TrackingPixels from "@/components/TrackingPixels";

// ─── Root Layout ────────────────────────────────────────────────────────────
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <JsonLdSchema />
      </head>
      <body className="min-h-full flex flex-col font-cairo overflow-x-hidden">
        {/* Skip Navigation — إمكانية الوصول (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[9999] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:text-sm"
        >
          التخطي للمحتوى الرئيسي
        </a>

        <ConsoleManager />
        <TrackingPixels />
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
