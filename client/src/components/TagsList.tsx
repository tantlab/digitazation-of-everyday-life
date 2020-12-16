import React, { FC, useRef, useState } from "react";
import { LoaderOverlay } from "./Loaders";

const TagsList: FC<{
  tags: string[];
  isLoading?: boolean;
  updateTags?: (tags: string[]) => void;
}> = ({ tags, isLoading, updateTags }) => {
  const [value, setValue] = useState<string>("");

  return (
    <div className="tags">
      {tags.length ? (
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
      {updateTags && (
        <form
          onSubmit={() => {
            updateTags([...tags, ...value.split(",").map((s) => s.trim())]);
          }}
        >
          <input
            type="text"
            value={value}
            placeholder='Add tags separated with comas (example: "foo, bar")'
            onChange={(e) => setValue(e.target.value)}
          />{" "}
          <button type="submit">
            <i className="fas fa-plus" />
          </button>
        </form>
      )}

      {isLoading && <LoaderOverlay message="Updating tags" />}
    </div>
  );
};

export default TagsList;
