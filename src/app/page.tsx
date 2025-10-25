// src/app/page.tsx
import { getDriveType, listChildren } from "@/lib/onedrive";
import { DriveList, Breadcrumbs } from "@/features/drive";
import { redirect } from "next/navigation";
import { getDict } from "@/i18n/server";
import { cookies } from "next/headers";
import ErrorState from "@/shared/ui/ErrorState";

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
        const cookieStore = await cookies();
        const isAdmin = cookieStore.get("pwd-role")?.value === "admin";
        return (
            <div className="container mx-auto p-4">
                <Breadcrumbs path={[]} />
                <DriveList items={items} isAdmin={isAdmin} />
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
        const isRefreshExpired = /AADSTS700082|refresh token has expired/i.test(message);
        if (isRefreshExpired) {
            return (
                <ErrorState
                    title={dict["error.expired.title"]}
                    description={dict["error.expired.desc"]}
                    details={(dict["error.onedrive"] ?? "Error: {message}").replace("{message}", message)}
                    actions={[
                        { href: "/", label: dict["error.action.home"], variant: "primary" },
                    ]}
                />
            );
        }
        return (
            <ErrorState
                title={dict["error.title"]}
                details={(dict["error.onedrive"] ?? "Error: {message}").replace("{message}", message)}
                actions={[{ href: "/", label: dict["error.action.home"], variant: "primary" }]}
            />
        );
    }
}
