import { PAGE_SIZE } from "@/lib/meta";

export function parsePageParam(raw: string | string[] | undefined): number {
  const n = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

/** Slices a list to one page, clamping the requested page into range (so a stale/typed-in
 *  `?page=` beyond the end doesn't render an empty screen). */
export function paginate<T>(items: T[], requestedPage: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (page - 1) * pageSize;
  return { pageItems: items.slice(start, start + pageSize), page, totalPages };
}
