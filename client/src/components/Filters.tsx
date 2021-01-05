import React, { FC, useEffect, useState } from "react";
import {
  identity,
  isEmpty,
  isEqual,
  isUndefined,
  omit,
  omitBy,
  pickBy,
} from "lodash";

import {
  DatesFilterState,
  FilterDef,
  FiltersState,
  TermsFilterState,
} from "../core/types";
import config from "../config";
import {
  OptionType,
  stringToObjectValue,
  AsyncCreatableSelect,
  CreatableSelect,
  objectToStringValue,
} from "./CustomSelect";
import { autocomplete } from "../core/client";

function formatDate(date: Date): string {
  return [
    date.getFullYear(),
    ("00" + (date.getMonth() + 1)).substr(-2),
    ("00" + date.getDate()).substr(-2),
  ].join("-");
}

function getMinDate(...dates: string[]): string {
  return formatDate(
    new Date(Math.min(...dates.map((d) => new Date(d).valueOf())))
  );
}

function getMaxDate(...dates: string[]): string {
  return formatDate(
    new Date(Math.max(...dates.map((d) => new Date(d).valueOf())))
  );
}

const DatesFilter: FC<{
  filter: FilterDef;
  state: DatesFilterState;
  setState: (newState: DatesFilterState | null) => void;
}> = ({ filter, state, setState }) => {
  const boundaries = config.datesBoundaries;

  function setCleanValue({ min, max }: { min?: string; max?: string }): void {
    const cleanedMin = getMaxDate(
      boundaries.min,
      getMinDate(min || boundaries.min, boundaries.max)
    );
    const cleanedMax = getMaxDate(
      cleanedMin,
      getMinDate(max || boundaries.max, boundaries.max)
    );

    setState({
      type: "dates",
      value: omitBy(
        {
          min: cleanedMin === boundaries.min ? undefined : cleanedMin,
          max: cleanedMax === boundaries.max ? undefined : cleanedMax,
        },
        isUndefined
      ),
    });
  }

  const minID = `date-min-${filter.field}`;
  const maxID = `date-max-${filter.field}`;

  return (
    <div className="dates-filter">
      <div>
        <label htmlFor={minID}>From</label>
        <input
          type="date"
          id={minID}
          min={boundaries.min.valueOf()}
          max={state.value.max || boundaries.max}
          value={state.value.min || ""}
          placeholder={boundaries.min + ""}
          onChange={(e) =>
            setCleanValue(
              pickBy({ min: e.target.value, max: state.value.max }, identity)
            )
          }
        />
      </div>
      <div>
        <label htmlFor={maxID}>To</label>
        <input
          type="date"
          id={maxID}
          min={state.value.min || boundaries.min}
          max={boundaries.max}
          value={state.value.max || ""}
          placeholder={boundaries.max + ""}
          onChange={(e) =>
            setCleanValue(
              pickBy({ max: e.target.value, min: state.value.min }, identity)
            )
          }
        />
      </div>
    </div>
  );
};

const MAX_SUGGESTIONS_COUNT = 50;

const TermsFilter: FC<{
  filter: FilterDef;
  state: TermsFilterState;
  setState: (newState: TermsFilterState | null) => void;
}> = ({ filter, state, setState }) => {
  return filter.values ? (
    <CreatableSelect
      isMulti
      options={filter.values}
      value={stringToObjectValue(state.value)}
      onChange={(value) =>
        setState({
          type: "terms",
          value: objectToStringValue(value as OptionType | OptionType[]),
        })
      }
    />
  ) : (
    <AsyncCreatableSelect
      isMulti
      defaultOptions
      loadOptions={(inputValue: string) =>
        autocomplete(filter.field, inputValue, MAX_SUGGESTIONS_COUNT + 1).then(
          (values) => [
            ...values.map((value) => ({ value, label: value })),
            ...(values.length > MAX_SUGGESTIONS_COUNT
              ? [
                  {
                    value: "APP::DISABLED",
                    label:
                      "To display more suggestions, please refine your query",
                    isDisabled: true,
                  },
                ]
              : []),
          ]
        )
      }
      value={stringToObjectValue(state.value)}
      placeholder={filter.placeholder}
      noOptionsMessage={() => "No suggestion matches your current query"}
      onChange={(value) =>
        setState({
          type: "terms",
          value: objectToStringValue(value as OptionType | OptionType[]),
        })
      }
    />
  );
};

// Compute the suffix part for the label of the hide.shiw filter
function displayFilterButtonSuffix(
  init: FiltersState,
  current: FiltersState
): string {
  let suffix = "";
  if (Object.keys(current).length > 0) {
    const filtersCount = Object.keys(current).length;
    if (JSON.stringify(init) !== JSON.stringify(current)) {
      suffix = `(${filtersCount}*)`;
    } else {
      suffix = `(${filtersCount}*)`;
    }
  }
  return suffix;
}

const Filters: FC<{
  defs: FilterDef[];
  state: FiltersState;
  onSubmit: (state: FiltersState) => void;
}> = ({ state, onSubmit, defs }) => {
  const [showFilters, setShowFilters] = useState<boolean>(
    !!Object.keys(state).length
  );
  const [filtersState, setFiltersState] = useState<FiltersState>(state);

  useEffect(() => {
    setFiltersState(state);
    if (!Object.keys(state).length) setShowFilters(false);
  }, [state]);

  return (
    <div className="filters-panel">
      <button
        type="button"
        onClick={() => {
          setShowFilters(!showFilters);
        }}
      >
        <i className="fas fa-filter" />{" "}
        {showFilters
          ? "Hide filters"
          : `Show filters ${displayFilterButtonSuffix(state, filtersState)}`}
      </button>

      {showFilters && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(filtersState);
          }}
          onReset={(e) => {
            e.preventDefault();
            setFiltersState(state);
          }}
        >
          <div className="filters">
            {defs.map((filter) => (
              <div className="filter" key={filter.field}>
                <h3>{filter.label}</h3>
                {filter.type === "dates" ? (
                  <DatesFilter
                    filter={filter}
                    state={
                      (filtersState[filter.field] || {
                        type: "dates",
                        value: {},
                      }) as DatesFilterState
                    }
                    setState={(newState) =>
                      setFiltersState(
                        newState && !isEmpty(newState.value)
                          ? { ...filtersState, [filter.field]: newState }
                          : omit(filtersState, filter.field)
                      )
                    }
                  />
                ) : (
                  <TermsFilter
                    filter={filter}
                    state={
                      (filtersState[filter.field] || {
                        type: "terms",
                        value: [],
                      }) as TermsFilterState
                    }
                    setState={(newState) =>
                      setFiltersState(
                        newState && (newState.value as string[]).length
                          ? { ...filtersState, [filter.field]: newState }
                          : omit(filtersState, filter.field)
                      )
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <div className="buttons">
            <button
              type="button"
              disabled={isEqual(state, {})}
              onClick={() => onSubmit({})}
            >
              Reset
            </button>
            <button type="reset" disabled={isEqual(state, filtersState)}>
              Cancel
            </button>
            <button type="submit" disabled={isEqual(state, filtersState)}>
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Filters;
