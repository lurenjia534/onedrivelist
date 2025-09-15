"use client";

import { useI18n } from "@/i18n/I18nProvider";

export default function HomeLabel() {
  const { t } = useI18n();
  return <>{t("home")}</>;
}

