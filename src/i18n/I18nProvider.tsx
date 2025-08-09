"use client";

import React, { createContext, useContext, useMemo } from "react";

export type Locale = "en" | "zh";
export type Dictionary = Record<string, string>;

type I18nContext = {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nCtx = createContext<I18nContext>({
  locale: "en",
  t: (k: string) => k,
});

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nContext>(() => {
    const t = (key: string, vars?: Record<string, string | number>) => {
      let str = dict[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    };
    return { locale, t };
  }, [locale, dict]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}

