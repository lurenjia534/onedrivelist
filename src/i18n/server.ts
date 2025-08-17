import { cookies } from "next/headers";
import en from "@/i18n/dictionaries/en";
import zh from "@/i18n/dictionaries/zh";

export type Locale = "en" | "zh";
export type Dictionary = Record<string, string>;

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("lang")?.value;
  return cookieLang === "en" ? "en" : "zh";
}

export async function getDict(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getLocale();
  const dict = locale === "zh" ? zh : en;
  return { locale, dict };
}

