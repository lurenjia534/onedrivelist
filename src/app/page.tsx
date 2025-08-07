// src/app/page.tsx
import { getDriveType, listChildren } from "@/lib/onedrive";
import DriveList from "@/components/DriveList";
import Breadcrumbs from "@/components/Breadcrumbs";
import { redirect } from "next/navigation";

export const revalidate = 600;

export default async function Page() {
    if (!process.env.ONEDRIVE_REFRESH_TOKEN) {
        redirect("/setup");
    }
    try {
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
                        {driveType === "personal" ? "OneDrive Personal drive" : "OneDrive for Business drive"}
                    </span>
                </div>
            </div>
        );
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return <p className="text-red-600">无法读取 OneDrive 数据：{message}</p>;
    }
}
