import React, { FC, useEffect, useRef, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Location } from "history";
import cx from "classnames";

import { Doc as DocType } from "../core/types";
import { getDoc } from "../core/client";
import { getFragmentURL, getURLFromFragment } from "../core/helpers";

function getFragmentID(location: Location): string | null {
  return location.hash.replace(/^#+/, "") || null;
}

const Doc: FC = () => {
  const location = useLocation();
  const history = useHistory();
  const { docId } = useParams<{ docId: string }>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [doc, setDoc] = useState<DocType | null>(null);
  const [highlightedFragmentId, setHighlightedFragmentId] = useState<
    string | null
  >(getFragmentID(location));

  const fragmentsContainer = useRef<HTMLDivElement>(null);

  // Load doc when needed
  useEffect(() => {
    if (!isLoading && (doc || {}).id !== docId) {
      setIsLoading(true);
      setDoc(null);

      getDoc(docId).then((doc) => {
        setIsLoading(false);
        setDoc(doc);

        const docFragmentIDs: Record<string, true> = doc.fragments.reduce(
          (iter, fragment) => ({ ...iter, [fragment.id]: true }),
          {}
        );

        // If fragment is invalid, redirect:
        if (!highlightedFragmentId || !docFragmentIDs[highlightedFragmentId]) {
          history.replace(getURLFromFragment(doc.fragments[0]));
        }
        // Else, scroll to the fragment:
        else {
          requestAnimationFrame(() => {
            if (!fragmentsContainer || !fragmentsContainer.current) return;

            const fragment = fragmentsContainer.current.querySelector(
              `.fragment[data-id="${highlightedFragmentId}"]`
            );

            if (fragment) {
              const boundingClientRect = fragment.getBoundingClientRect();
              window.scroll({
                top:
                  boundingClientRect.top +
                  fragment.clientHeight / 2 -
                  window.innerHeight / 2,
              });
            }
          });
        }
      });
    }
  }, [doc, docId]);

  // Read highlighted fragment from hash
  useEffect(() => {
    setHighlightedFragmentId(getFragmentID(location));
  }, [location]);

  // Detect highlighted fragment:
  useEffect(() => {
    const checkScroll = () => {
      if (!fragmentsContainer || !fragmentsContainer.current) return;

      const middleScreenScroll = window.innerHeight / 2;
      const bestFragment = Array.from(
        fragmentsContainer.current.querySelectorAll("p.fragment")
      ).find((fragment: Element) => {
        const boundingClientRect = fragment.getBoundingClientRect();
        if (
          boundingClientRect.top <= middleScreenScroll &&
          boundingClientRect.bottom >= middleScreenScroll
        ) {
          return true;
        }
      }) as HTMLParagraphElement;

      const newHighlightedFragmentID =
        bestFragment && bestFragment.getAttribute("data-id");

      if (
        newHighlightedFragmentID &&
        newHighlightedFragmentID !== highlightedFragmentId
      ) {
        history.replace(getFragmentURL(docId, newHighlightedFragmentID));
      }
    };

    window.addEventListener("scroll", checkScroll);
    return function cleanup() {
      window.removeEventListener("scroll", checkScroll);
    };
  });

  return (
    <div className="doc-page">
      {doc && (
        <>
          <h1>Doc n°{doc.id}</h1>
          <div ref={fragmentsContainer}>
            {doc.fragments.map((fragment) => (
              <p
                key={fragment.id}
                className={cx(
                  "fragment",
                  fragment.id === highlightedFragmentId && "active"
                )}
                data-id={fragment.id}
              >
                {fragment.text}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Doc;
