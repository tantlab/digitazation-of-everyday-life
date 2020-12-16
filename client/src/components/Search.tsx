import React, { FC, useCallback, useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";

import { getURLFromFragmentLight, getSearchURL } from "../core/helpers";
import { FragmentLight } from "../core/types";
import { search } from "../core/client";
import Header from "./Header";
import TypeLabel from "./TypeLabel";

const SEARCH_QUERY_KEY = "q";
const RESULTS_BATCH_SIZE = 50;

const SearchForm: FC<{ initialQuery?: string; onSubmit: () => void }> = (
  props
) => {
  const history = useHistory();
  const [query, setQuery] = useState<string>(props.initialQuery || "");

  return (
    <>
      <form
        action="/"
        id="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          props.onSubmit();
          if (query) history.push(getSearchURL(query));
        }}
        onReset={() => {
          setQuery("");
          history.push(getSearchURL());
        }}
      >
        <input
          name="q"
          type="text"
          value={query || ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type here your query"
        />
        <button type="reset" title="Cancel">
          Cancel
        </button>
        <button type="submit" title="Search" disabled={!query}>
          Search
        </button>
      </form>
    </>
  );
};

const ResultsList: FC<{
  total: number;
  results: FragmentLight[];
  onReachBottom: () => void;
}> = ({ results, total, onReachBottom }) => {
  // Check scroll on window scroll:
  const checkScroll = useCallback(() => {
    if (window.scrollY + window.innerHeight > document.body.offsetHeight - 500)
      onReachBottom();
  }, [onReachBottom]);
  useEffect(() => {
    window.addEventListener("scroll", checkScroll);
    return function cleanup() {
      window.removeEventListener("scroll", checkScroll);
    };
  }, [checkScroll]);

  return (
    <>
      <p>
        {total} result{total > 1 ? "s" : ""}
      </p>
      <ul className="unstyled results-list">
        {results.map((result) => (
          <li key={result.fragmentId}>
            <h3>
              <Link to={getURLFromFragmentLight(result)}>
                <i className="fas fa-link" /> Fragment n°{result.fragmentId}
              </Link>
            </h3>
            <p>
              <TypeLabel type={result.type} /> | Doc {result.docId}
            </p>
            {result.tags.length ? (
              <p>
                {result.tags.map((tag, i) => (
                  <span className="tag" key={i}>
                    {tag}
                  </span>
                ))}
              </p>
            ) : (
              <p>No tag</p>
            )}
            <p className="content">{result.text}</p>
          </li>
        ))}
      </ul>
    </>
  );
};

const Search: FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get(SEARCH_QUERY_KEY) as string;

  // This flag is trivial now, but will take filters into account later:
  const shouldSearch = !!query;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<{
    total: number;
    results: FragmentLight[];
  } | null>(null);

  useEffect(() => {
    if (shouldSearch && !isLoading && !searchResult) {
      setIsLoading(true);
      setSearchResult(null);

      search({ query, size: RESULTS_BATCH_SIZE }).then((value) => {
        setIsLoading(false);
        setSearchResult(value);
      });
    }
  }, [query, shouldSearch]);

  const loadMoreResults = useCallback(
    (
      result: {
        total: number;
        results: FragmentLight[];
      } | null
    ) => {
      if (!isLoading && result && result.results.length < result.total) {
        setIsLoading(true);
        search({
          query,
          size: RESULTS_BATCH_SIZE,
          offset: result.results.length,
        }).then((value) => {
          setIsLoading(false);
          setSearchResult({
            total: result.total,
            results: result.results.concat(value.results),
          });
        });
      }
    },
    [shouldSearch, searchResult, isLoading]
  );

  return (
    <>
      <Header />
      <main className="container search-page">
        <h1>Everyday Life</h1>

        <SearchForm
          initialQuery={query}
          onSubmit={() => setSearchResult(null)}
        />

        {shouldSearch && (
          <>
            <hr />

            {searchResult && (
              <ResultsList
                total={searchResult.total}
                results={searchResult.results}
                onReachBottom={() => loadMoreResults(searchResult)}
              />
            )}
            {isLoading && <div>Loading...</div>}
          </>
        )}
      </main>
    </>
  );
};

export default Search;
