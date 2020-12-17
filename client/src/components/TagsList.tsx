import React, { FC } from "react";
import { LoaderOverlay } from "./Loaders";
import {
  AsyncCreatableSelect,
  objectToStringValue,
  OptionType,
  stringToObjectValue,
} from "./CustomSelect";

const MAX_SUGGESTIONS_COUNT = 20;

const TagsList: FC<{
  tags: string[];
  isLoading?: boolean;
  updateTags?: (tags: string[]) => void;
  autocomplete?: (query: string, size: number) => Promise<string[]>;
}> = ({ tags, isLoading, updateTags, autocomplete }) => {
  return (
    <div className="tags">
      {updateTags && autocomplete ? (
        <AsyncCreatableSelect
          isMulti
          defaultOptions
          isClearable={false}
          backspaceRemovesValue={false}
          loadOptions={(inputValue: string) =>
            autocomplete(inputValue, MAX_SUGGESTIONS_COUNT).then((values) => [
              ...values.map((value) => ({ value, label: value })),
              values.length > MAX_SUGGESTIONS_COUNT
                ? {
                    value: "APP::DISABLED",
                    label:
                      "To display more suggestions, please refine your query",
                    isDisabled: true,
                  }
                : { label: `Add new tag "${inputValue}"`, value: inputValue },
            ])
          }
          value={stringToObjectValue(tags)}
          noOptionsMessage={() => "No suggestion matches your current query"}
          onChange={(value) =>
            updateTags(objectToStringValue(value as OptionType | OptionType[]))
          }
        />
      ) : tags.length ? (
        <p>
          {tags.map((tag, i) => (
            <span key={i} className="tag">
              {tag}
              {updateTags && (
                <>
                  {" "}
                  <button
                    className="unstyled"
                    onClick={() => updateTags(tags.filter((s) => s !== tag))}
                  >
                    <i className="fas fa-times" />
                  </button>
                </>
              )}
            </span>
          ))}
        </p>
      ) : (
        <p className="no-tag">No tag</p>
      )}

      {isLoading && <LoaderOverlay message="Updating tags" />}
    </div>
  );
};

export default TagsList;
