import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Garage Fitness Club - Sistema Administrativo",
  description: "Sistema de gestión para gimnasio con control de usuarios, inventario y punto de venta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-inter antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
