import SearchResults from "@/components/SearchResults";
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
    return <SearchResults items={items} query={query} />;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return <p className="text-red-600">Error: {message}</p>;
  }
}
