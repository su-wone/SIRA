import type { IndexEntry } from "../types/index.types.js";

export interface QueryFilter {
  status?: string;
  assignee?: string;
  priority?: string;
  area?: string;
  epic_id?: string;
  tag?: string;
}

export interface QueryOptions {
  filters?: QueryFilter;
  sort?: string;
  sortOrder?: "asc" | "desc";
  group?: string;
}

export function parseFilterString(filterStr: string): QueryFilter {
  const filters: QueryFilter = {};
  const parts = filterStr.match(/(\w+):(\S+)/g);
  if (!parts) return filters;

  for (const part of parts) {
    const [key, value] = part.split(":");
    if (key && value) {
      (filters as Record<string, string>)[key] = value;
    }
  }
  return filters;
}

export function filterEntries(entries: IndexEntry[], filters: QueryFilter): IndexEntry[] {
  return entries.filter((entry) => {
    if (filters.status && entry.status !== filters.status) return false;
    if (filters.assignee && entry.assignee !== filters.assignee) return false;
    if (filters.priority && entry.priority !== filters.priority) return false;
    if (filters.area && entry.area !== filters.area) return false;
    if (filters.epic_id && entry.epic_id !== filters.epic_id) return false;
    if (filters.tag && !entry.tags.includes(filters.tag)) return false;
    return true;
  });
}

function getField(entry: IndexEntry, field: string): unknown {
  return (entry as unknown as Record<string, unknown>)[field];
}

export function sortEntries(entries: IndexEntry[], field: string, order: "asc" | "desc" = "asc"): IndexEntry[] {
  const sorted = [...entries].sort((a, b) => {
    const aVal = getField(a, field);
    const bVal = getField(b, field);
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  });
  return order === "desc" ? sorted.reverse() : sorted;
}

export function groupEntries(entries: IndexEntry[], field: string): Map<string, IndexEntry[]> {
  const groups = new Map<string, IndexEntry[]>();
  for (const entry of entries) {
    const key = String(getField(entry, field) ?? "unset");
    const group = groups.get(key) ?? [];
    group.push(entry);
    groups.set(key, group);
  }
  return groups;
}

export function queryIndex(entries: IndexEntry[], options: QueryOptions): IndexEntry[] {
  let result = entries;

  if (options.filters) {
    result = filterEntries(result, options.filters);
  }

  if (options.sort) {
    result = sortEntries(result, options.sort, options.sortOrder ?? "asc");
  }

  return result;
}

export function findById(entries: IndexEntry[], id: string): IndexEntry | undefined {
  return entries.find((e) => e.id === id);
}

export function findSimilarIds(entries: IndexEntry[], id: string): string[] {
  const lower = id.toLowerCase();
  return entries
    .filter((e) => e.id.toLowerCase().includes(lower) || lower.includes(e.id.toLowerCase()))
    .map((e) => e.id)
    .slice(0, 5);
}
