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
  tags?: string[];
  similarFragments?: FragmentLight[]; // It is optional, since they must be loaded when the user reaches them
}

export interface FragmentLight {
  type: DataType;
  docId: string;
  fragmentId: string;
  text: string; // This can be just an abstract, or the full text
}
