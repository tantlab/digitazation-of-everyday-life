import React, { FC } from "react";

export const Loader: FC<{ message?: string }> = ({ message }) => (
  <>
    <i className="fas fa-spinner fa-pulse mr-1" />
    {message ? " " + message : ""}
  </>
);

export const LoaderOverlay: FC<{ message?: string }> = ({ message }) => (
  <div className="loader-overlay">
    <span>
      <Loader message={message} />
    </span>
  </div>
);
