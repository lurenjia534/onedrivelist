// src/app/page.tsx
import { getDriveType, listChildren } from "@/lib/onedrive";
import DriveList from "@/components/DriveList";
import Breadcrumbs from "@/components/Breadcrumbs";
import { redirect } from "next/navigation";
import { getDict } from "@/i18n/server";

export const revalidate = 600;

export default async function Page() {
    if (!process.env.ONEDRIVE_REFRESH_TOKEN) {
        redirect("/setup");
    }
    try {
        const { dict } = await getDict();
        const [driveType, { value: items }] = await Promise.all([
            getDriveType(),
            listChildren(),
        ]);
        return (
            <div className="container mx-auto p-4">
                <Breadcrumbs path={[]} />
                <DriveList items={items} />
                <div className="mb-4 flex justify-center">
                    <span
                        className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                    >
                        {driveType === "personal" ? dict["drive.personal"] : dict["drive.business"]}
                    </span>
                </div>
            </div>
        );
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        const { dict } = await getDict();
        const text = (dict["error.onedrive"] ?? "Error: {message}").replace("{message}", message);
        return <p className="text-red-600">{text}</p>;
    }
}
