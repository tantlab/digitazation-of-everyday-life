import React, { FC, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";

import { getFragmentURL, getSearchURL } from "../core/helpers";
import { FragmentLight } from "../core/types";
import { search } from "../core/client";

const SEARCH_QUERY_KEY = "q";
const RESULTS_BATCH_SIZE = 50;

const SearchForm: FC<{ initialQuery?: string }> = (props) => {
  const history = useHistory();
  const [query, setQuery] = useState<string>(props.initialQuery || "");

  return (
    <form
      action="/"
      id="search-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (query) {
          history.push(getSearchURL(query));
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
        placeholder="Type here your query"
      />
      <button type="reset" title="Cancel">
        Cancel
      </button>
      <button type="submit" title="Search" disabled={!query}>
        Search
      </button>
    </form>
  );
};

const ResultsList: FC<{ results: FragmentLight[] }> = ({ results }) => (
  <ul>
    {results.map((result) => (
      <li key={result.fragmentId}>
        <h3>
          <Link to={getFragmentURL(result)}>
            Fragment n°{result.fragmentId}
          </Link>
        </h3>
        <p>(from doc n°{result.docId})</p>
        <p>Content: {result.text}</p>
      </li>
    ))}
  </ul>
);

const Search: FC = () => {
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get(SEARCH_QUERY_KEY) as string;

  // This flag is trivial now, but will take filters into account later:
  const shouldSearch = !!query;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<FragmentLight[] | null>(null);

  useEffect(() => {
    if (shouldSearch && !isLoading) {
      setIsLoading(true);
      setResults(null);

      search({ query, size: RESULTS_BATCH_SIZE }).then((value) =>
        setResults(value.results)
      );
    }
  });

  return (
    <div className="search-page">
      <SearchForm initialQuery={query} />

      {shouldSearch && (
        <>
          {results && <ResultsList results={results} />}
          {isLoading && <div>Loading...</div>}
        </>
      )}
    </div>
  );
};

export default Search;
