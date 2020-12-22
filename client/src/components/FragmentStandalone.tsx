import React, { FC } from "react";
import { Link } from "react-router-dom";

import TagsList from "./TagsList";
import TypeLabel from "./TypeLabel";
import { FragmentLight } from "../core/types";
import { getFragmentURL, getURLFromFragmentLight } from "../core/helpers";

/**
 * This component is used to display fragments both as search results and
 * similar fragments.
 */
const Fragment: FC<{ fragment: FragmentLight; showTags?: boolean }> = ({
  fragment,
  showTags,
}) => (
  <div className="fragment-standalone">
    <Link
      to={getURLFromFragmentLight(fragment)}
      title={`Link to fragment '${fragment.fragmentId}' on document '${fragment.docId}'`}
    >
      <div className="content">
        <i className="fas fa-link" />
        <span>
          <p className="question">{fragment.question}</p>
          <p className="answer">{fragment.answer}</p>
        </span>
      </div>
    </Link>
    {showTags && fragment.machineTags && (
      <TagsList tags={fragment.machineTags} />
    )}
    <h5>
      From{" "}
      <Link
        to={getFragmentURL(fragment.docId)}
        title={`Link to document '${fragment.docId}'`}
      >
        Doc {fragment.docId}
      </Link>{" "}
      | <TypeLabel type={fragment.type} />
    </h5>
  </div>
);

export default Fragment;
