import React, { FC } from "react";

import { DataType } from "../core/types";
import config from "../config";

const TypeLabel: FC<{ type: DataType }> = ({ type }) => {
  const { color, icon, label } = config.dataTypes[type];
  return (
    <span className="type-label" style={{ color }}>
      <i className={icon} /> {label}
    </span>
  );
};

export default TypeLabel;
