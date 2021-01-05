import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import { intersection, toPairs, isArray } from "lodash";
import { Location } from "history";
import cx from "classnames";

import {
  Doc as DocType,
  Fragment as FragmentType,
  FragmentLight,
} from "../core/types";
import {
  autocomplete,
  getDoc,
  getSimilarFragments,
  setFragmentTags,
} from "../core/client";
import { getFragmentURL, getURLFromFragment } from "../core/helpers";
import Header from "./Header";
import config from "../config";
import TypeLabel from "./TypeLabel";
import TagsList from "./TagsList";
import { Loader, LoaderOverlay } from "./Loaders";
import FragmentStandalone from "./FragmentStandalone";

function getFragmentID(location: Location): string | null {
  return location.hash.replace(/^#+/, "") || null;
}

const Fragment: FC<{
  fragment: FragmentType;
  isActive: boolean;
  updateFragment: (fragment: FragmentType) => void;
  focusFragment: () => void;
}> = ({ fragment, isActive, updateFragment, focusFragment }) => {
  const [isLoadingSimilars, setIsLoadingSimilars] = useState<boolean>(false);
  const [showSidePanel, setShowSidePanel] = useState<boolean>(false);
  const [similarFragments, setSimilarFragments] = useState<
    FragmentLight[] | null
  >(null);

  // Load similar fragments when needed:
  useEffect(() => {
    if (isActive && !similarFragments && !isLoadingSimilars) {
      setIsLoadingSimilars(true);

      getSimilarFragments(fragment.id).then((similarFragments) => {
        setSimilarFragments(similarFragments);
        setIsLoadingSimilars(false);
      });
    }
  }, [similarFragments, isLoadingSimilars, isActive]);

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
      <p className="content question" onClick={focusFragment}>
        {fragment.question}
      </p>
      <p className="content answer" onClick={focusFragment}>
        {fragment.answer}
      </p>

      <span className="fingerprint">
        <i className="fas fa-arrow-right" /> document {fragment.docId} / segment{" "}
        {fragment.id}
        <div>
          <button
            className="unstyled"
            data-action="deploy"
            onClick={() => setShowSidePanel(true)}
          >
            <i className="fas fa-arrow-right" /> See tags and similar segments
          </button>
        </div>
      </span>

      {isActive && (
        <div
          className={cx("side-panel", showSidePanel && "deployed")}
          // Prevent body scrolling while mouse hovers the side panel on large screen
          onMouseEnter={() => document.body.classList.add("no-scroll")}
          onMouseLeave={() => document.body.classList.remove("no-scroll")}
        >
          <div className="wrapper-1">
            <button
              className="unstyled"
              data-action="collapse"
              onClick={() => setShowSidePanel(false)}
            >
              <i className="fas fa-times" />
            </button>
            <div className="wrapper-2">
              {fragment.images &&
                isArray(fragment.images) &&
                !!fragment.images.filter((url) => url !== "Y" && url !== "N")
                  .length && (
                  <>
                    <h4>Images</h4>
                    <div className="images">
                      {fragment.images
                        .filter((url) => url !== "Y" && url !== "N")
                        .map((url) => (
                          <div className="image" key={url}>
                            <img src={`${config.assets_url}/${url}`} alt="" />
                            <div className="caption">
                              <a
                                href={`${config.assets_url}/${url}`}
                                title={`Open ${url.match(
                                  /[^/]*$/
                                )} in a new tab`}
                                target="_blank"
                              >
                                <i className="fas fa-3x fa-external-link-alt" />
                              </a>
                            </div>
                          </div>
                        ))}
                    </div>
                    <br />
                    <hr />
                    <br />
                  </>
                )}
              <h4>user generated Tags</h4>
              <TagsList
                updateTags={setTags}
                tags={fragment.userTags}
                isLoading={isSettingTags}
                autocomplete={(query, size) =>
                  autocomplete("user_tags", query, size)
                }
              />
              <br />
              <hr />
              <br />
              <h4>Machine generated Tags</h4>
              <TagsList tags={fragment.machineTags} />
              <br />
              <hr />
              <br />
              <h4>Similar segments</h4>
              {similarFragments &&
                (similarFragments.length ? (
                  <ul className="unstyled">
                    {similarFragments.map((neighbor) => (
                      <li
                        key={neighbor.fragmentId}
                        className="similar-fragment"
                      >
                        <FragmentStandalone fragment={neighbor} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No similar fragment has been found.</p>
                ))}
              {isLoadingSimilars && (
                <>
                  <div className="center-flex">
                    <span>
                      <Loader message="Loading similar fragments" />
                    </span>
                  </div>
                  <br />
                </>
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
  const params = useParams<{ docId: string }>();
  const docId = decodeURIComponent(params.docId);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [doc, setDoc] = useState<DocType | null>(null);
  const highlightedFragmentId =
    decodeURIComponent(getFragmentID(location) || "") || null;

  const fragmentsContainer = useRef<HTMLDivElement>(null);

  const focusFragment = useCallback((fragmentId, smooth = false) => {
    if (!fragmentsContainer || !fragmentsContainer.current) return;

    const fragmentDOM = fragmentsContainer.current.querySelector(
      `.fragment[data-id="${fragmentId}"]`
    );

    if (fragmentDOM) {
      const boundingClientRect = fragmentDOM.getBoundingClientRect();
      window.scroll({
        top:
          boundingClientRect.top +
          fragmentDOM.clientHeight / 2 -
          window.innerHeight / 2 +
          window.scrollY,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Load doc when needed:
  useEffect(() => {
    let frameId: number | null;

    if (!isLoading && (doc || {}).id !== docId) {
      setIsLoading(true);
      setDoc(null);

      getDoc(docId).then((result) => {
        const hasFoundFragment =
          !!highlightedFragmentId &&
          result.fragments.some(({ id }) => id === highlightedFragmentId);

        // If fragment is valid, scroll to it:
        if (highlightedFragmentId && hasFoundFragment) {
          frameId = requestAnimationFrame(() => {
            frameId = null;
            focusFragment(highlightedFragmentId);
          });
        }

        // If fragment is not valid, remove it from the URL:
        if (highlightedFragmentId && !hasFoundFragment) {
          history.push(getFragmentURL(result.id));
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
    } else if (!newHighlightedFragmentID) {
      history.replace(getFragmentURL(docId));
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
              <span className="highlight">
                <TypeLabel type={doc.type} /> | Doc {doc.id}
              </span>
            </h1>

            <div className="metadata-wrapper">
              <div className="metadata">
                {doc.date && (
                  <div>
                    <h4 className="inline">Date</h4>{" "}
                    <span>
                      {doc.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}

                {toPairs(doc.metadata)
                  .filter(([, value]) => value)
                  .map(([key, value]: [string, string]) => (
                    <div key={key}>
                      <h4 className="inline">
                        {config.docMetadataLabels[key] || key}
                      </h4>{" "}
                      <span>{value}</span>
                    </div>
                  ))}

                <h4>Tags</h4>
                <TagsList tags={doc.tags} />
              </div>
            </div>

            {!!doc.similarDocIDs.length && (
              <>
                <h4>Docs from the same informant</h4>
                <ul className="unstyled">
                  {doc.similarDocIDs.map((docID) => (
                    <li key={docID}>
                      <h5>
                        <Link
                          to={getFragmentURL(docID)}
                          title={`Link to similar document '${docID}'`}
                        >
                          <i className="fas fa-link" /> Doc {docID}
                        </Link>
                      </h5>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <br />
            <br />
            <br />

            <h2>Fragments</h2>

            <div ref={fragmentsContainer}>
              {doc.fragments.map((fragment) => (
                <Fragment
                  key={getURLFromFragment(fragment)}
                  fragment={fragment}
                  isActive={fragment.id === highlightedFragmentId}
                  focusFragment={() => focusFragment(fragment.id, true)}
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
        {!highlightedFragmentId && (
          <div className="side-panel-placeholder">
            <span>(scroll down or click on a text fragment)</span>
          </div>
        )}
        {isLoading && <LoaderOverlay message="Loading document" />}
      </main>
    </>
  );
};

export default Doc;
