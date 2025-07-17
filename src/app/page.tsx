// src/app/page.tsx
import { listChildren } from "@/lib/onedrive";
import DriveList from "@/components/DriveList";
import Breadcrumbs from "@/components/Breadcrumbs";

export default async function Page() {
    try {
        const { value: items } = await listChildren();
        return (
            <div className="container mx-auto p-4">
                <Breadcrumbs path={[]} />
                <DriveList items={items} />
            </div>
        );
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return <p>Error: {message}</p>;
    }
}