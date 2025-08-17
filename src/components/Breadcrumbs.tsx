// src/components/Breadcrumbs.tsx
import Link from "next/link";
import {ChevronRight, Home} from "lucide-react";
import { getItem } from "@/lib/onedrive";
import HomeLabel from "@/components/i18n/HomeLabel";

type PathSegment = {
    id: string;
    name: string;
};

interface BreadcrumbsProps {
    path: PathSegment[];
}

export default function Breadcrumbs({ path }: BreadcrumbsProps) {
    return (
        <nav className="flex items-center text-sm mb-10 overflow-x-auto">
            <Link href="/" className="text-black dark:text-white opacity-70 hover:opacity-100 transition-opacity font-medium px-2 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1 leading-none">
                <Home size={16} className="shrink-0 relative -top-[1px]"/>
                <HomeLabel />
            </Link>
            {path.map((segment, index) => {
                const href = `/files/${path.slice(0, index + 1).map(s => s.id).join('/')}`;
                return (
                    <div key={segment.id} className="flex items-center">
                        <ChevronRight size={16} className="mx-1 text-black/30 dark:text-white/30" />
                        <Link href={href} className="text-black dark:text-white opacity-70 hover:opacity-100 transition-opacity font-medium px-2 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 whitespace-nowrap">{segment.name}</Link>
                    </div>
                );
            })}
        </nav>
    );
}

/**
 * 根据 slug (ID 数组) 生成面包屑导航所需的路径数据。
 * @param slug ID 数组，来自 URL。
 * @param unknownLabel
 */
export async function generateBreadcrumbs(slug: string[], unknownLabel?: string): Promise<PathSegment[]> {
    const fetches = slug.map(id =>
        getItem(id)
            .then(item => ({ id: item.id, name: item.name }))
            .catch(error => {
                console.error(`Failed to fetch item ${id} for breadcrumbs:`, error);
                return { id, name: unknownLabel ?? "[Unknown folder]" };
            })
    );

    return Promise.all(fetches);
}
