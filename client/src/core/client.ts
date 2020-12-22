import _, { cloneDeep, sampleSize } from "lodash";
import config from "../config";

import { Doc, FiltersState, Fragment, FragmentLight } from "./types";
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

export async function search({
  query,
  filters = {},
  size = 50,
  offset = 0,
}: {
  query: string;
  filters?: FiltersState;
  offset?: number;
  size?: number;
}): Promise<{ total: number; results: FragmentLight[] }> {
  console.log(filters);
  // construct query params
  const queryParams = [
    `query=${encodeURIComponent(query)}`,
    `size=${size}`,
    `offset=${offset}`,
  ];
  // add filters to query params
  for (const field of Object.keys(filters)) {
    const filter = filters[field];
    let queryParam = `${field}=`;
    if (filter.type === "dates") {
      queryParam += `${filter.value.min || ""}|${filter.value.max || ""}`;
    } else {
      queryParam += filter.value.map((e) => encodeURIComponent(e)).join("|");
    }
    queryParams.push(queryParam);
  }

  const response = await fetch(
    `${config.api_url}/search?${queryParams.join("&")}`
  );
  const result = await response.json();
  return result as { total: number; results: FragmentLight[] };
}

export function getDoc(docId: string): Promise<Doc> {
  return DATASET.docs[docId]
    ? later(cloneDeep(DATASET.docs[docId]))
    : Promise.reject(new Error("Doc not found"));
}

export function getSimilarFragments(
  fragmentId: string
): Promise<FragmentLight[]> {
  return DATASET.fragments[fragmentId]
    ? later(sampleSize(DATASET.fragments, 3).map(lightenFragment))
    : Promise.reject(new Error("Fragment not found"));
}

export function setFragmentTags(
  fragmentId: string,
  tags: string[]
): Promise<Fragment> {
  if (!DATASET.fragments[fragmentId])
    return Promise.reject(new Error("Fragment not found"));

  DATASET.fragments[fragmentId].userTags = tags;
  return later(cloneDeep(DATASET.fragments[fragmentId]));
}

export function autocomplete(
  field: string,
  query: string,
  count: number
): Promise<string[]> {
  const lQuery = query.toLowerCase();
  const values = _(DATASET.fragmentsArray)
    .flatMap(
      (fragment) =>
        (field === "docType" || field === "userTags" || field === "machineTags"
          ? fragment[field]
          : fragment.docMetadata[field]) || []
    )
    .filter((s) => s.toLowerCase().includes(lQuery))
    .intersection()
    .take(count)
    .value();

  return later(values);
}
