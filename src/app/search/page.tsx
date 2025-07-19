import DriveList from "@/components/DriveList";
import { searchItems } from "@/lib/onedrive";

export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();
  if (!query) {
    return <p className="p-4">请输入搜索关键字。</p>;
  }
  try {
    const { value: items } = await searchItems(query);
    items.sort(
      (a, b) =>
        new Date(b.lastModifiedDateTime).getTime() -
        new Date(a.lastModifiedDateTime).getTime()
    );
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">搜索结果：{query}</h1>
        <DriveList items={items} />
      </div>
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return <p className="text-red-600">Error: {message}</p>;
  }
}
