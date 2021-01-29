import React, { FC, useState } from "react";
import { LoaderOverlay } from "./Loaders";
import {
  AsyncCreatableSelect,
  objectToStringValue,
  OptionType,
  stringToObjectValue,
} from "./CustomSelect";
import { Link } from "react-router-dom";
import { getSearchURL } from "../core/helpers";

const MAX_SUGGESTIONS_COUNT = 20;

export const StaticTagsList: FC<{ tags: string[]; field?: string }> = ({
  tags,
  field,
}) =>
  tags && tags.length ? (
    <p>
      {tags
        .filter((e) => e !== "")
        .map((tag, i) =>
          field ? (
            <Link
              key={i}
              className="tag unstyled"
              to={getSearchURL("*", {
                [field]: { type: "terms", value: [tag] },
              })}
            >
              {tag} <i className="fas fa-link" />
            </Link>
          ) : (
            <span key={i} className="tag">
              {tag}
            </span>
          )
        )}
    </p>
  ) : (
    <p className="no-tag">No tag</p>
  );

const TagsList: FC<{
  tags: string[];
  field?: string;
  isLoading?: boolean;
  updateTags?: (tags: string[]) => void;
  autocomplete?: (query: string, size: number) => Promise<string[]>;
}> = ({ tags, field, isLoading, updateTags, autocomplete }) => {
  const [edit, setEdit] = useState<boolean>(false);

  return (
    <div className="tags">
      {updateTags && autocomplete && (
        <div className="tags-edit-form">
          <input
            type="checkbox"
            checked={edit}
            onChange={(e) => setEdit(e.target.checked)}
            id="segment-tags"
          />{" "}
          <label htmlFor="segment-tags">Edit tags</label>
        </div>
      )}

      {edit && updateTags && autocomplete ? (
        <p>
          <AsyncCreatableSelect
            isMulti
            defaultOptions
            isClearable={false}
            backspaceRemovesValue={false}
            loadOptions={(inputValue: string) =>
              autocomplete(inputValue, MAX_SUGGESTIONS_COUNT).then((values) =>
                [
                  ...values.map((value) => ({ value, label: value })),
                  values.length > MAX_SUGGESTIONS_COUNT && {
                    value: "APP::DISABLED",
                    label:
                      "To display more suggestions, please refine your query",
                    isDisabled: true,
                  },
                  !!inputValue && {
                    label: `Add new tag "${inputValue}"`,
                    value: inputValue,
                  },
                ].filter((o) => !!o)
              )
            }
            value={stringToObjectValue(tags)}
            noOptionsMessage={() => "No suggestion matches your current query"}
            onChange={(value) =>
              updateTags(
                objectToStringValue(value as OptionType | OptionType[])
              )
            }
          />
        </p>
      ) : (
        <StaticTagsList field={field} tags={tags} />
      )}

      {isLoading && <LoaderOverlay message="Updating tags" />}
    </div>
  );
};

export default TagsList;
