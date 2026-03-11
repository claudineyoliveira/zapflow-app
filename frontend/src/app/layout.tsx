import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zap Flow — Disparador Inteligente",
  description: "Plataforma profissional de disparos em massa para WhatsApp com segurança anti-bloqueio integrada.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="pt-BR" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
