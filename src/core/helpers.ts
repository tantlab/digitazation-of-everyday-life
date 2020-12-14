import { Filter, FragmentLight } from "./types";

export function getSearchURL(
  query?: string,
  filters?: Record<string, Filter>
): string {
  return query ? `/?q=${encodeURIComponent(query)}` : "/";
}

export function getFragmentURL(fragment: FragmentLight): string {
  return `/doc/${encodeURIComponent(fragment.docId)}#${encodeURIComponent(
    fragment.fragmentId
  )}`;
}
