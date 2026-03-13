import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Soft Museo Viajero",
  description: "Gestión interna para el Museo Viajero",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
