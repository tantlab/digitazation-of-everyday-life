import { Filter, Fragment, FragmentLight } from "./types";

export function getSearchURL(
  query?: string,
  filters?: Record<string, Filter>
): string {
  return query ? `/?q=${encodeURIComponent(query)}` : "/";
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
