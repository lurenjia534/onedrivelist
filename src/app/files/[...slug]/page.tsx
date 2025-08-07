// src/app/files/[...slug]/page.tsx
import {getDriveType, listChildren} from "@/lib/onedrive";
import DriveList from "@/components/DriveList";
import Breadcrumbs, {generateBreadcrumbs} from "@/components/Breadcrumbs";

export const revalidate = 600;

// Next 15: params 是一个 thenable，必须写成 Promise
export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ slug?: string[] }>;
}) {
    const {slug = []} = await params;
    const itemId = slug.at(-1);

    try {
        const [driveType, {value: items}, breadcrumbPath] = await Promise.all([
            getDriveType(),
            listChildren(itemId),
            generateBreadcrumbs(slug),
        ]);

        const currentFolder = breadcrumbPath[breadcrumbPath.length - 1];

        return (
            <div className="container mx-auto p-4">
                <Breadcrumbs path={breadcrumbPath}/>
                <div className="text-center mb-4">
                    {driveType === "personal" ? "OneDrive 个人版" : "OneDrive for Business"}
                </div>
                <h1 className="text-2xl font-bold mb-4">{currentFolder?.name ?? "Files"}</h1>
                <DriveList items={items} basePathSegments={slug}/>
            </div>
        );
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return <p>Error: {message}</p>;
    }
}