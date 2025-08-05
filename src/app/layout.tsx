import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import Navbar from "@/components/Navbar";
import { cookies } from "next/headers";

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
  const password = process.env.password;
  const cookieStore = await cookies();
  const authed = !password ||
    cookieStore.get("pwd-auth")?.value === password;
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      {authed && <Navbar />}                           {/* 替换原 header */}
      <main>{children}</main>
      </body>
    </html>
  );
}
