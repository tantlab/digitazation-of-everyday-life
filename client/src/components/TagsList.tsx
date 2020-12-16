import React, { FC, useRef } from "react";
import { LoaderOverlay } from "./Loaders";

const TagsList: FC<{
  tags: string[];
  isLoading?: boolean;
  updateTags?: (tags: string[]) => void;
}> = ({ tags, isLoading, updateTags }) => {
  const input = useRef<HTMLInputElement>(null);

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
        <p>
          <input type="text" ref={input} />{" "}
          <button
            onClick={() => {
              if (input.current && input.current.value)
                updateTags([...tags, input.current.value]);
            }}
          >
            Add tag
          </button>
        </p>
      )}

      {isLoading && <LoaderOverlay message="Updating tags" />}
    </div>
  );
};

export default TagsList;
