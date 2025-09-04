import { redirect } from "next/navigation";
import SetupUI from "./SetupView";
import type { Metadata } from "next";
import { getDict } from "@/i18n/server";

export default function SetupPage() {
    if (process.env.ONEDRIVE_REFRESH_TOKEN) {
        redirect("/");
    }

    return <SetupUI />;
}

export async function generateMetadata(): Promise<Metadata> {
    const { dict } = await getDict();
    return {
        title: dict["setup.head.title"],
        description: dict["setup.head.description"],
    };
}
