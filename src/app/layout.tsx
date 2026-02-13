import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans } from 'next/font/google';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Compliance OS - Sistema de Cumplimiento para PYMEs",
  description: "Compliance is now automated. Grants are now visible.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${ibmPlexSans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
