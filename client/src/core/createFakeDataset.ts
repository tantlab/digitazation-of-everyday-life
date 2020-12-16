import faker from "faker";
import { random, range, sample, sampleSize, shuffle } from "lodash";

import { DataType, Doc, Fragment, FragmentLight } from "./types";

export function lightenFragment(fragment: Fragment): FragmentLight {
  return {
    fragmentId: fragment.id,
    docId: fragment.docId,
    text: fragment.text,
    type: fragment.type,
    tags: fragment.tags,
  };
}

export default function createFakeDataset(): {
  tags: string[];
  docs: Record<string, Doc>;
  fragments: Record<string, Fragment>;
  fragmentsArray: Fragment[];
} {
  const TAGS_COUNT = 15;
  const DOCS_COUNT = 100;
  const FRAGMENTS_COUNT = 2000;

  const tags: string[] = range(TAGS_COUNT).map(() => faker.random.word());

  const fragments: Fragment[] = range(FRAGMENTS_COUNT).map((i) => ({
    id: `f${i}`,
    docId: `d${Math.floor(Math.random() * DOCS_COUNT)}`,
    type: sample(["interview", "observation", "diary"]) as DataType,
    text: faker.lorem.paragraph(3),
    tags: sampleSize(tags, random(6)),
  }));

  const docs: Record<string, Doc> = fragments.reduce<Record<string, Doc>>(
    (iter, fragment) => ({
      ...iter,
      [fragment.docId]: iter[fragment.docId]
        ? {
            ...iter[fragment.docId],
            fragments: [...iter[fragment.docId].fragments, fragment],
          }
        : {
            id: fragment.docId,
            type: fragment.type,
            fragments: [fragment],
          },
    }),
    {}
  );

  return {
    tags,
    docs,
    fragmentsArray: shuffle(fragments),
    fragments: fragments.reduce(
      (iter, fragment) => ({ ...iter, [fragment.id]: fragment }),
      {}
    ),
  };
}
