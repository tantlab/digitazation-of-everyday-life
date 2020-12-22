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
    <Link to={getURLFromFragmentLight(fragment)}>
      <p className="content question">
        <i className="fas fa-link" />
        {fragment.question}
      </p>
      <p className="content answer">{fragment.answer}</p>
    </Link>
    {showTags && <TagsList tags={fragment.machineTags} />}
    <h5>
      From <Link to={getFragmentURL(fragment.docId)}>Doc {fragment.docId}</Link>{" "}
      | <TypeLabel type={fragment.type} />
    </h5>
  </div>
);

export default Fragment;
