import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import Navbar from "@/components/Navbar";
import { cookies } from "next/headers";
import { getAuthToken } from "@/lib/authToken";
import { I18nProvider, type Locale } from "@/i18n/I18nProvider";
import zh from "@/i18n/dictionaries/zh";
import en from "@/i18n/dictionaries/en";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneList - OneDrive File",
  description: "OneDrive files with ease",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getAuthToken();
  const cookieStore = await cookies();
  const authed = !token ||
    cookieStore.get("pwd-auth")?.value === token;
  const cookieLang = cookieStore.get("lang")?.value;
  const locale: Locale = cookieLang === "en" ? "en" : "zh";
  const dict = locale === "zh" ? zh : en;
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <I18nProvider locale={locale} dict={dict}>
        {authed && <Navbar />}
        <main>{children}</main>
      </I18nProvider>
      </body>
    </html>
  );
}
