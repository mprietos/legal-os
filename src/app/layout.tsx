import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legal OS - Sistema de Cumplimiento para PYMEs",
  description: "Reduce riesgos legales y accede a subvenciones en 60 segundos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
