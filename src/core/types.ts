export type Filter = unknown; // TODO

export type DataType = "interview" | "observation" | "diary";

export interface Doc {
  id: string;
  type: DataType;
  fragments: Fragment[];
}

export interface Fragment {
  id: string;
  docId: string;
  type: DataType;
  text: string;
  similarFragments: SearchResult[];
  notes?: Note[];
}

export interface SearchResult {
  type: DataType;
  docId: string;
  fragmentId: string;
  text: string; // This can be just an abstract, or the full text
}

export interface Note {
  id: string;
  text: string;
  author: string; // or not, not sure yet
}
