"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { useRouter } from "next/navigation";
import React from "react";

export default function LanguageSwitcher() {
  const { locale } = useI18n();
  const router = useRouter();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    // Persist for 1 year
    document.cookie = `lang=${next}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={onChange}
      className="px-2 py-1 rounded-lg bg-transparent border border-black/10 dark:border-white/10 text-sm text-black dark:text-white"
    >
      <option value="zh">中文</option>
      <option value="en">English</option>
    </select>
  );
}

