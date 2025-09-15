import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { Navbar } from "@/shared/ui";
import { cookies } from "next/headers";
import { getAuthTokens } from "@/lib/authToken";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getDict } from "@/i18n/server";

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
  const { user, admin } = await getAuthTokens();
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("pwd-auth")?.value;
  const authed = (!user && !admin) || tokenCookie === user || tokenCookie === admin;
  const roleCookie = cookieStore.get("pwd-role")?.value;
  const role = roleCookie === "admin" ? "admin" : roleCookie === "user" ? "user" : null;
  const { locale, dict } = await getDict();
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <I18nProvider locale={locale} dict={dict}>
        {authed && <Navbar role={role} />}
        <main>{children}</main>
      </I18nProvider>
      </body>
    </html>
  );
}
