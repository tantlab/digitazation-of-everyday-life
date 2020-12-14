import React, { FC } from "react";
import { useParams } from "react-router-dom";

const Doc: FC = () => {
  const { docId } = useParams<{ docId: string }>();

  return <div className="doc-page">DOC {docId}</div>;
};

export default Doc;
