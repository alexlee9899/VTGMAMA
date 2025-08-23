import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryNav from "@/components/layout/CategoryNav";
import { AuthProvider } from "@/components/auth/AuthContext";
import { ShopProvider } from "./contexts/ShopContext";
import Script from "next/script";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VTGMAMA - 在线商店",
  description: "VTGMAMA 在线购物平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <head>
        <Script src="/config.js" strategy="beforeInteractive" />
      </head>
      <body>
        <AuthProvider>
          <ShopProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              {/* <CategoryNav /> */}
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </ShopProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
