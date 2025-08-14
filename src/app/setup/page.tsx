import { redirect } from "next/navigation";
import SetupUI from "./setup-ui";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import zh from "@/i18n/dictionaries/zh";
import en from "@/i18n/dictionaries/en";

export default function SetupPage() {
    if (process.env.ONEDRIVE_REFRESH_TOKEN) {
        redirect("/");
    }

    return <SetupUI />;
}

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const locale = cookieStore.get("lang")?.value === "en" ? "en" : "zh";
    const dict = locale === "zh" ? zh : en;
    return {
        title: dict["setup.head.title"],
        description: dict["setup.head.description"],
    };
}
