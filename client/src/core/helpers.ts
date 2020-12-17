import { compact, keyBy, toPairs } from "lodash";
import {
  DatesFilterState,
  FilterDef,
  FiltersState,
  FilterState,
  Fragment,
  FragmentLight,
} from "./types";

export const SEARCH_QUERY_KEY = "q";
export const SEPARATOR = "|";

export function getQueryFromURL(queryParams: URLSearchParams): string | null {
  return queryParams.get(SEARCH_QUERY_KEY);
}

export function getFiltersStateFromURL(
  queryParams: URLSearchParams,
  filterDefs: FilterDef[]
): FiltersState {
  const state: FiltersState = {};
  const filtersSpecs = keyBy(filterDefs, "field");

  for (const [key, value] of queryParams.entries()) {
    if (key === SEARCH_QUERY_KEY) continue;

    // Extract field id from key (to deal with `dateEdition.min=XXX` for instance):
    const match = key.match(/(\w*)\.?(\w*)?/);
    if (!match) continue;

    const [, field, param] = match;
    const filter = match && (filtersSpecs[field] || filtersSpecs[param]);
    if (!filter) continue;

    if (filter.type === "terms") {
      if (state[key]) {
        state[key] = {
          type: "terms",
          value: (state[key].value as string[]).concat(value.split(SEPARATOR)),
        };
      } else {
        state[key] = { type: "terms", value: value.split(SEPARATOR) };
      }
    }

    if (filter.type === "dates" && (param === "min" || param === "max")) {
      state[field] = {
        type: "dates",
        value: { ...(state[field]?.value || {}), [param]: value },
      } as DatesFilterState;
    }
  }

  return state;
}

export function getSearchURL(query?: string, filters?: FiltersState): string {
  if (!query) return "/";

  const filterPairs: string[][] = toPairs(filters || {}).flatMap(
    ([k, v]: [string, FilterState]) => {
      if (v.type === "terms") {
        return [[k, v.value.join(SEPARATOR)]];
      }
      if (v.type === "dates") {
        const min = v.value.min;
        const max = v.value.max;
        return compact([
          min ? [`${k}.min`, min + ""] : null,
          max ? [`${k}.max`, max + ""] : null,
        ]);
      }

      return [];
    }
  );

  return (
    "/?" +
    [[SEARCH_QUERY_KEY, query], ...filterPairs]
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(
            Array.isArray(v) ? v.join(SEPARATOR) : v
          )}`
      )
      .join("&")
  );
}

export function getFragmentURL(docID: string, fragmentID?: string): string {
  return fragmentID
    ? `/doc/${encodeURIComponent(docID)}#${encodeURIComponent(fragmentID)}`
    : `/doc/${encodeURIComponent(docID)}`;
}

export function getURLFromFragment(fragment: Fragment): string {
  return getFragmentURL(fragment.docId, fragment.id);
}

export function getURLFromFragmentLight(fragment: FragmentLight): string {
  return getFragmentURL(fragment.docId, fragment.fragmentId);
}
