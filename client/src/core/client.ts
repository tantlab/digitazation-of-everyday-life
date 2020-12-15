import { sampleSize } from "lodash";

import { Doc, Filter, FragmentLight } from "./types";
import createFakeDataset, { lightenFragment } from "./createFakeDataset";

/**
 * For now, the whole client is based on a fake dataset generated frontend-side.
 * Once the backend is available, you can simply recode the content of the three
 * exported functions properly.
 */
const DATASET = createFakeDataset();

function later<T = unknown>(data: T, delay = 1000): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

export function search({
  query,
  filters,
  size = 50,
  offset = 0,
}: {
  query: string;
  filters?: Record<string, Filter>;
  offset?: number;
  size?: number;
}): Promise<{ total: number; results: FragmentLight[] }> {
  const total = 150;
  return later({
    total,
    results: Object.values(DATASET.fragments)
      .slice(0, total)
      .slice(offset, size + offset)
      .map(lightenFragment),
  });
}

export function getDoc(docId: string): Promise<Doc> {
  return DATASET.docs[docId]
    ? later(DATASET.docs[docId])
    : Promise.reject(new Error("Doc not found"));
}

export function getSimilarFragments(
  fragmentId: string
): Promise<FragmentLight[]> {
  return DATASET.fragments[fragmentId]
    ? later(sampleSize(DATASET.fragments, 10).map(lightenFragment))
    : Promise.reject(new Error("Fragment not found"));
}
