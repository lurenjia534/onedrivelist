// src/app/files/[...slug]/page.tsx
import { listChildren } from "@/lib/onedrive";
import DriveList from "@/components/DriveList";
import Breadcrumbs, { generateBreadcrumbs } from "@/components/Breadcrumbs";

interface PageProps {
    params: {
        slug: string[];
    };
}

export default async function Page({ params }: PageProps) {
    const { slug } = params;
    const itemId = slug[slug.length - 1]; // 最后一个 slug 是当前文件夹的 ID

    try {
        const [{ value: items }, breadcrumbPath] = await Promise.all([
            listChildren(itemId),
            generateBreadcrumbs(slug),
        ]);

        const currentFolder = breadcrumbPath[breadcrumbPath.length - 1];

        return (
            <div className="container mx-auto p-4">
                <Breadcrumbs path={breadcrumbPath} />
                <h1 className="text-2xl font-bold mb-4">{currentFolder?.name ?? "Files"}</h1>
                <DriveList items={items} basePathSegments={slug} />
            </div>
        );
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return <p>Error: {message}</p>;
    }
}