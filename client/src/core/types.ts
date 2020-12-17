import config from "../config";

export type TermsFilterState = {
  type: "terms";
  value: string[];
};

export type DatesFilterState = {
  type: "dates";
  value: {
    min?: string;
    max?: string;
  };
};

export type FilterState = TermsFilterState | DatesFilterState;

export type FiltersState = Record<string, FilterState>;

export type FilterDef = {
  label: string;
  field: string;
  type: "terms" | "dates";
  placeholder?: string; // Only for terms filters (and still optional)
  values?: { value: string; label: string }[]; // Only for DataType filter
};

export type DataType = keyof typeof config.dataTypes;

export interface Doc {
  id: string;
  type: DataType;
  tags: string[];
  fragments: Fragment[];
  date: Date;
  metadata: { [field: string]: string };
  similarDocIDs: string[];
}

export interface Fragment {
  id: string;
  docId: string;
  type: DataType;
  text: string;
  tags: string[];
}

export interface FragmentLight {
  type: DataType;
  docId: string;
  fragmentId: string;
  tags: string[];
  text: string; // This can be just an abstract, or the full text
}
