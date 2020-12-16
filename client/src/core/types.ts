import config from "../config";

export type Filter = unknown; // TODO

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
