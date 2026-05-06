import type { Metadata } from "next";
import "./globals.css";
import FloatingActions from "@/components/FloatingActions";

export const metadata: Metadata = {
  title: "متجر مثالي | وجهتك للمكملات الغذائية والرشاقة في مصر",
  description: "تسوق أفضل المكملات الغذائية ومنتجات الرشاقة في مصر",
  icons: {
    icon: "/logo-v2.png",
  },
};

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-cairo">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <FloatingActions />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
