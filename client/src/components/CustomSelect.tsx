import React from "react";
import { compact } from "lodash";
import ReactCreatableSelect, {
  Props as ReactCreatableSelectProps,
} from "react-select/creatable";
import ReactAsyncCreatableSelect, {
  Props as ReactAsyncCreatableSelectProps,
} from "react-select/async-creatable";

const CLASS_NAME = "react-select";
const CLASS_NAME_PREFIX = "react-select";
const COMMON_PROPS = {
  className: CLASS_NAME,
  classNamePrefix: CLASS_NAME_PREFIX,
  formatCreateLabel: (value: string) => `Rechercher "${value}"`,
};

export type OptionType = {
  value: string;
  label: string;
  isDisabled?: boolean;
};

/**
 * Utils functions to transform "React-Select" like values (ie `{value: string, label: string}`) to simpler (and URI
 * compliant) strings, and vice versa:
 */
export function stringToObjectValue(
  value?: string | string[],
  options?: OptionType[]
): OptionType[] {
  if (Array.isArray(value))
    return compact(value.flatMap((v) => stringToObjectValue(v, options)));

  if (typeof value === "string") {
    if (options) {
      const option = options.find((option) => option.value === value);
      return option ? [option] : [];
    } else {
      return [{ label: value, value: value }];
    }
  }

  return [];
}
export function objectToStringValue(
  value?: OptionType | OptionType[]
): string[] {
  if (Array.isArray(value)) return value.flatMap((v) => objectToStringValue(v));
  if (!value) return [];

  return [value.value];
}

export const CreatableSelect = (
  props: ReactCreatableSelectProps<OptionType, true>
): JSX.Element => <ReactCreatableSelect {...{ ...COMMON_PROPS, ...props }} />;
export const AsyncCreatableSelect = (
  props: ReactAsyncCreatableSelectProps<OptionType, true>
): JSX.Element => (
  <ReactAsyncCreatableSelect {...{ ...COMMON_PROPS, ...props }} />
);
