import React, { FC, useCallback, useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import cx from "classnames";

import {
  getSearchURL,
  getQueryFromURL,
  getFiltersStateFromURL,
} from "../core/helpers";
import { FiltersState, FragmentLight } from "../core/types";
import { search } from "../core/client";
import Header from "./Header";
import { Loader } from "./Loaders";
import config from "../config";
import Filters from "./Filters";
import FragmentStandalone from "./FragmentStandalone";
import Modal from "./Modal";

const RESULTS_BATCH_SIZE = 50;

const EXAMPLES = [
  {
    query: "*",
    description: "all segments",
  },
  {
    query: '"alene hjemme"',
    description: 'all segments containing exactly "alene hjemme"',
  },
  {
    query: "covid coronavirus",
    description: 'all segments containing either "covid" or "coronavirus"',
  },
  {
    query: "chef + arbejde",
    description: 'all segments containing both "chef" and "arbejde"',
  },
];

const SearchForm: FC<{
  initialQuery?: string;
  onSubmit: (query: string) => void;
}> = (props) => {
  const history = useHistory();
  const [query, setQuery] = useState<string>(props.initialQuery || "");
  const [showHelp, setShowHelp] = useState<boolean>(false);

  return (
    <>
      <form
        action="/"
        id="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!query) {
            setQuery("*");
            props.onSubmit("*");
          } else {
            props.onSubmit(query);
          }
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
          placeholder={`Type here your query (Examples: ${EXAMPLES.map(
            ({ query }) => query
          ).join(", ")})`}
        />
        <button type="reset">Cancel</button>
        <button type="submit">Search</button>
        <button
          type="button"
          title="Get queries examples"
          onClick={() => setShowHelp(true)}
        >
          <i className="fas fa-question-circle" />
        </button>
      </form>
      {showHelp && (
        <Modal onClose={() => setShowHelp(false)}>
          <h2>Exemples:</h2>
          {EXAMPLES.map(({ query, description }) => (
            <p key={query}>
              <strong>
                <Link
                  to={getSearchURL(query)}
                  onClick={() => {
                    setQuery(query);
                    setShowHelp(false);
                  }}
                >
                  {query}
                </Link>
              </strong>{" "}
              searches for {description}
            </p>
          ))}
        </Modal>
      )}
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
            <FragmentStandalone fragment={result} showTags />
          </li>
        ))}
      </ul>
    </>
  );
};

const Search: FC = () => {
  const location = useLocation();
  const history = useHistory();

  const queryParams = new URLSearchParams(location.search);
  const query = getQueryFromURL(queryParams) || "";
  const filtersState = getFiltersStateFromURL(queryParams, config.filters);

  const shouldSearch = !!query;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<{
    total: number;
    results: FragmentLight[];
  } | null>(null);

  useEffect(() => {
    if (shouldSearch && !isLoading) {
      setIsLoading(true);
      setSearchResult(null);

      search({ query, filters: filtersState, size: RESULTS_BATCH_SIZE }).then(
        (value) => {
          setIsLoading(false);
          setSearchResult(value);
        }
      );
    }
  }, [location.search]);

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
      <main
        className={cx("container", "search-page", !shouldSearch && "no-result")}
      >
        <h1>The Digitization of Everyday Life During the Corona Crisis</h1>

        <SearchForm
          initialQuery={query}
          onSubmit={(newQuery: string) =>
            history.push(getSearchURL(newQuery, filtersState))
          }
        />

        {shouldSearch && (
          <Filters
            state={filtersState}
            defs={config.filters}
            onSubmit={(newFiltersState: FiltersState) =>
              history.push(getSearchURL(query, newFiltersState))
            }
          />
        )}

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
            {isLoading && (
              <div className="center-flex">
                <span>
                  <br />
                  <Loader
                    message={
                      searchResult
                        ? "Searching for matching text segments"
                        : "Searching for more matching text segments"
                    }
                  />
                </span>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default Search;
