import config from "../config";

import { Doc, FiltersState, Fragment, FragmentLight } from "./types";

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

export async function getDoc(docId: string): Promise<Doc> {
  const response = await fetch(`${config.api_url}/doc/${docId}`);
  const result = await response.json();
  return result;
}

export async function getSimilarFragments(
  fragmentId: string
): Promise<FragmentLight[]> {
  const response = await fetch(
    `${config.api_url}/similarSegments/${fragmentId}`
  );
  const result = await response.json();
  return result;
}

export async function setFragmentTags(
  fragmentId: string,
  tags: string[]
): Promise<Fragment> {
  const response = await fetch(`${config.api_url}/fragment/${fragmentId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tags }),
  });
  const result = await response.json();
  return result;
}

export async function autocomplete(
  field: string,
  query: string,
  count = 10
): Promise<string[]> {
  // construct query params
  const queryParams = [
    query ? `query=${encodeURIComponent(query)}` : null,
    field ? `field=${field}` : null,
    `count=${count}`,
  ].filter((e) => e !== null);
  const response = await fetch(
    `${config.api_url}/autocomplete?${queryParams.join("&")}`
  );
  const result = await response.json();
  return result;
}
