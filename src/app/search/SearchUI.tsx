"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { SearchResults } from "@/features/search";
import type { DriveListItem } from "@/features/drive";
import {
  getExtension,
  isAudioExtension,
  isImageExtension,
  isMarkdownExtension,
  isTextExtension,
} from "@/lib/fileTypes";
import { useI18n } from "@/i18n/I18nProvider";

type SortKey = "relevance" | "date_desc" | "date_asc" | "name_asc" | "size_desc" | "size_asc";
type FilterKey = "all" | "folders" | "files" | "images" | "audio" | "text" | "markdown" | "video" | "archives" | "code" | "docs" | "sheets";

function filterItem(item: DriveListItem, filter: FilterKey): boolean {
  const isFolder = !!item.folder && !item.file;
  const ext = getExtension(item.name);
  switch (filter) {
    case "all":
      return true;
    case "folders":
      return isFolder;
    case "files":
      return !!item.file;
    case "images":
      return !!item.file && (item.file.mimeType?.startsWith("image/") || isImageExtension(ext));
    case "audio":
      return !!item.file && (item.file.mimeType?.startsWith("audio/") || isAudioExtension(ext));
    case "text":
      return !!item.file && (item.file.mimeType?.startsWith("text/") || isTextExtension(ext));
    case "markdown":
      return !!item.file && isMarkdownExtension(ext);
    case "video":
      return !!item.file && ["mp4", "mkv", "mov", "avi", "wmv", "webm", "flv", "mpeg", "mpg"].includes(ext);
    case "archives":
      return !!item.file && ["zip", "rar", "7z", "tar", "gz", "tgz", "bz2", "iso"].includes(ext);
    case "code":
      return !!item.file && ["js", "jsx", "ts", "tsx", "json", "yml", "yaml", "py", "rb", "go", "rs", "php", "java", "c", "cpp", "h", "hpp", "css", "scss", "html", "sh", "mdx"].includes(ext);
    case "docs":
      return !!item.file && ["doc", "docx", "pdf"].includes(ext);
    case "sheets":
      return !!item.file && ["xls", "xlsx", "xlsb", "xlsm", "csv", "tsv"].includes(ext);
  }
}

function sortItems(items: DriveListItem[], sort: SortKey): DriveListItem[] {
  const list = [...items];
  switch (sort) {
    case "date_desc":
      return list.sort((a, b) => new Date(b.lastModifiedDateTime).getTime() - new Date(a.lastModifiedDateTime).getTime());
    case "date_asc":
      return list.sort((a, b) => new Date(a.lastModifiedDateTime).getTime() - new Date(b.lastModifiedDateTime).getTime());
    case "name_asc":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "size_desc":
      return list.sort((a, b) => b.size - a.size);
    case "size_asc":
      return list.sort((a, b) => a.size - b.size);
    case "relevance":
    default:
      return items; // Graph already applies relevance; keep original order.
  }
}

export default function SearchUI({ isAdmin = false }: { isAdmin?: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();

  const [query, setQuery] = useState<string>(sp.get("q") ?? "");
  const [items, setItems] = useState<DriveListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [filter, setFilter] = useState<FilterKey>("all");

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Keep state in sync when URL changes externally
  useEffect(() => {
    setQuery(sp.get("q") ?? "");
  }, [sp]);

  const fetchSearch = (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(null);
    fetch(`/api/onedrive/search?q=${encodeURIComponent(q)}`, { signal: ac.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((data: { value: DriveListItem[] }) => {
        setItems(data.value ?? []);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
        setItems([]);
      })
      .finally(() => setLoading(false));
  };

  // Initial fetch for initial query in URL
  useEffect(() => {
    const initial = (sp.get("q") ?? "").trim();
    if (initial) fetchSearch(initial);
    // Intentionally run only once to seed from URL on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const next = val.trim();
      const url = next ? `/search?q=${encodeURIComponent(next)}` : "/search";
      router.replace(url);
      if (next) fetchSearch(next); else { setItems(null); setError(null); }
    }, 300);
  };

  const displayed = useMemo(() => {
    const list = (items ?? []).filter((it) => filterItem(it, filter));
    return sortItems(list, sort);
  }, [items, filter, sort]);

  const handleDeleteSuccess = (id: string) => {
    setItems((prev) => (prev ? prev.filter((item) => item.id !== id) : prev));
  };

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10">
      <div className="bg-white/50 dark:bg-black/50 backdrop-blur-sm p-5 sm:p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/50" />
            <input
              value={query}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t("search.input.placeholder")}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          {loading && (
            <span className="inline-flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("search.loading")}
            </span>
          )}
        </div>

        {/* Filters & sort */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {([
            ["all", t("filter.all")],
            ["folders", t("filter.folders")],
            ["files", t("filter.files")],
            ["images", t("filter.images")],
            ["audio", t("filter.audio")],
            ["text", t("filter.text")],
            ["markdown", t("filter.markdown")],
          ] as [FilterKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                filter === key
                  ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                  : "bg-transparent text-black/70 dark:text-white/70 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}

          <div className="ml-auto inline-flex items-center gap-2 text-sm">
            <label className="text-black/60 dark:text-white/60">{t("sort.label")}</label>
            <select
              className="px-2 py-1 rounded-lg bg-transparent border border-black/10 dark:border-white/10"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="date_desc">{t("sort.date_desc")}</option>
              <option value="date_asc">{t("sort.date_asc")}</option>
              <option value="name_asc">{t("sort.name_asc")}</option>
              <option value="size_desc">{t("sort.size_desc")}</option>
              <option value="size_asc">{t("sort.size_asc")}</option>
              <option value="relevance">{t("sort.relevance")}</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6">
          {error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : query.trim() === "" ? (
            <p className="text-black/60 dark:text-white/60">{t("search.tip.enter")}</p>
          ) : items && items.length === 0 ? (
            <p className="text-black/60 dark:text-white/60">{t("search.tip.none")}</p>
          ) : items ? (
            <SearchResults
              items={displayed}
              query={query.trim()}
              isAdmin={isAdmin}
              onDelete={handleDeleteSuccess}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
