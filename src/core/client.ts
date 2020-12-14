import { Doc, Filter, SearchResult } from "./types";

export function search(
  query: string,
  filters: Record<string, Filter>
): Promise<{ total: number; results: SearchResult[] }> {
  // TODO
  return Promise.resolve({ total: 0, results: [] });
}

export function getDoc(docId: string): Promise<Doc> {
  return Promise.reject(new Error("Doc not found"));
}
