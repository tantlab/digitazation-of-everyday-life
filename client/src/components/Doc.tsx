import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import { intersection } from "lodash";
import { Location } from "history";
import cx from "classnames";

import {
  Doc as DocType,
  Fragment as FragmentType,
  FragmentLight,
} from "../core/types";
import { getDoc, getSimilarFragments, setFragmentTags } from "../core/client";
import {
  getFragmentURL,
  getURLFromFragment,
  getURLFromFragmentLight,
} from "../core/helpers";
import Header from "./Header";

function getFragmentID(location: Location): string | null {
  return location.hash.replace(/^#+/, "") || null;
}

const Fragment: FC<{
  fragment: FragmentType;
  isActive: boolean;
  updateFragment: (fragment: FragmentType) => void;
}> = ({ fragment, isActive, updateFragment }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSidePanel, setShowSidePanel] = useState<boolean>(false);
  const [similarFragments, setSimilarFragments] = useState<
    FragmentLight[] | null
  >(null);
  const input = useRef<HTMLInputElement>(null);

  // Load similar fragments when needed:
  useEffect(() => {
    if (isActive && !similarFragments && !isLoading) {
      setIsLoading(true);

      getSimilarFragments(fragment.id).then((similarFragments) => {
        setSimilarFragments(similarFragments);
        setIsLoading(false);
      });
    }
  }, [similarFragments, isLoading, isActive]);

  // On small screen, prevent body scroll while the side panel is deployed:
  useEffect(() => {
    if (showSidePanel) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");

    return () => document.body.classList.remove("no-scroll");
  }, [showSidePanel]);

  // When fragment becomes inactive, hide its side panel:
  useEffect(() => {
    if (!isActive && showSidePanel) setShowSidePanel(false);
  }, [isActive, showSidePanel]);

  // Deal with tags:
  const [isSettingTags, setIsSettingTags] = useState<boolean>(false);
  const setTags = useCallback((tags) => {
    if (!isSettingTags) {
      setIsSettingTags(true);
      setFragmentTags(fragment.id, intersection(tags)).then(
        (updatedFragment) => {
          setIsSettingTags(false);
          updateFragment(updatedFragment);
        }
      );
    }
  }, []);

  return (
    <div className={cx("fragment", isActive && "active")} data-id={fragment.id}>
      <p className="content">{fragment.text}</p>

      <button
        className="unstyled"
        data-action="deploy"
        onClick={() => setShowSidePanel(true)}
      >
        <i className="fas fa-arrow-right" /> See similar fragments
      </button>

      {isActive && (
        <div className={cx("side-panel", showSidePanel && "deployed")}>
          <div className="wrapper-1">
            <button
              className="unstyled"
              data-action="collapse"
              onClick={() => setShowSidePanel(false)}
            >
              <i className="fas fa-times" />
            </button>
            <div className="wrapper-2">
              {fragment.tags && (
                <>
                  {fragment.tags.length ? (
                    <p>
                      {fragment.tags.map((tag, i) => (
                        <span key={i} className="tag">
                          {tag}{" "}
                          <button
                            className="unstyled"
                            onClick={() =>
                              setTags(fragment.tags.filter((s) => s !== tag))
                            }
                          >
                            <i className="fas fa-times" />
                          </button>
                        </span>
                      ))}
                    </p>
                  ) : (
                    <p>No tag</p>
                  )}
                  <p>
                    <input type="text" ref={input} />{" "}
                    <button
                      onClick={() => {
                        if (input.current && input.current.value)
                          setTags([...fragment.tags, input.current.value]);
                      }}
                    >
                      Add tag
                    </button>
                  </p>
                </>
              )}
              {similarFragments && (
                <ul className="unstyled">
                  {similarFragments.length ? (
                    similarFragments.map((neighbor) => (
                      <li
                        key={neighbor.fragmentId}
                        className="similar-fragment"
                      >
                        <Link to={getURLFromFragmentLight(neighbor)}>
                          {neighbor.text}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <p>No similar fragment has been found.</p>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Doc: FC = () => {
  const location = useLocation();
  const history = useHistory();
  const { docId } = useParams<{ docId: string }>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [doc, setDoc] = useState<DocType | null>(null);
  const highlightedFragmentId = getFragmentID(location);

  const fragmentsContainer = useRef<HTMLDivElement>(null);

  // Load doc when needed:
  useEffect(() => {
    let frameId: number | null;

    if (!isLoading && (doc || {}).id !== docId) {
      setIsLoading(true);
      setDoc(null);

      getDoc(docId).then((result) => {
        // If fragment is invalid, redirect:
        if (
          !highlightedFragmentId ||
          !result.fragments.some(({ id }) => id === highlightedFragmentId)
        ) {
          history.replace(getURLFromFragment(result.fragments[0]));
        }
        // Else, scroll to the fragment:
        else {
          frameId = requestAnimationFrame(() => {
            frameId = null;
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

        // Finally, update state:
        setDoc(result);
        setIsLoading(false);
      });
    }

    // Cleanup:
    return () => {
      if (typeof frameId === "number") cancelAnimationFrame(frameId);
    };
  }, [isLoading, doc, docId]);

  // Detect highlighted fragment:
  const checkScroll = useCallback(() => {
    if (!fragmentsContainer || !fragmentsContainer.current) return;

    const middleScreenScroll = window.innerHeight / 2;
    const bestFragment = Array.from(
      fragmentsContainer.current.querySelectorAll(".fragment")
    ).find((fragment: Element) => {
      const boundingClientRect = fragment.getBoundingClientRect();
      if (
        boundingClientRect.top <= middleScreenScroll &&
        boundingClientRect.bottom >= middleScreenScroll
      ) {
        return true;
      }
    }) as Element;

    const newHighlightedFragmentID =
      bestFragment && bestFragment.getAttribute("data-id");

    if (
      newHighlightedFragmentID &&
      newHighlightedFragmentID !== highlightedFragmentId
    ) {
      history.replace(getFragmentURL(docId, newHighlightedFragmentID));
    }
  }, [fragmentsContainer, highlightedFragmentId, docId, history]);
  useEffect(() => {
    window.addEventListener("scroll", checkScroll);
    return () => {
      window.removeEventListener("scroll", checkScroll);
    };
  }, [checkScroll]);

  return (
    <>
      <Header large />
      <main className="container-large doc-page">
        {doc && (
          <div className="doc-container">
            <h1>
              <span className="highlight">Doc n°{doc.id}</span>
            </h1>
            <div ref={fragmentsContainer}>
              {doc.fragments.map((fragment) => (
                <Fragment
                  key={getURLFromFragment(fragment)}
                  fragment={fragment}
                  isActive={fragment.id === highlightedFragmentId}
                  updateFragment={(updatedFragment) =>
                    setDoc({
                      ...doc,
                      fragments: doc.fragments.map((fragment) =>
                        fragment.id === updatedFragment.id
                          ? updatedFragment
                          : fragment
                      ),
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Doc;
