import faker from "faker";
import { random, range, sample, sampleSize, shuffle, times } from "lodash";

import { DataType, Doc, Fragment, FragmentLight } from "./types";

export function lightenFragment(fragment: Fragment): FragmentLight {
  return {
    fragmentId: fragment.id,
    docId: fragment.docId,
    text: fragment.text,
    type: fragment.docType,
    machineTags: fragment.machineTags,
  };
}

export default function createFakeDataset(): {
  tags: string[];
  docsArray: Doc[];
  fragmentsArray: Fragment[];
  docs: Record<string, Doc>;
  fragments: Record<string, Fragment>;
} {
  const TAGS_COUNT = 15;
  const DOCS_COUNT = 100;
  const FRAGMENTS_COUNT = 2000;
  const DOC_IDS = range(DOCS_COUNT).map((i) => `d${i}`);

  const tags: string[] = range(TAGS_COUNT).map(() => faker.random.word());

  const docsArray: Doc[] = DOC_IDS.map((id) => ({
    id: id,
    type: sample(["interview", "observation", "diary"]) as DataType,
    fragments: [],
    tags: sampleSize(tags, random(6)),
    date: faker.date.recent(),
    similarDocIDs: sampleSize(DOC_IDS, random(6)),
    metadata: {
      participant_i_o_me: faker.name.findName(),
      age_i_me: random(15, 60) + "",
      job_i_me: faker.name.jobTitle(),
      residence_i_me: faker.address.city(),
      analytic_note_i_o: Math.random() > 0.5 ? faker.lorem.paragraph(1) : "",
    },
  }));

  const fragmentsArray: Fragment[] = range(FRAGMENTS_COUNT).map((i) => {
    const doc = sample(docsArray) as Doc;

    const fragment: Fragment = {
      id: `f${i}`,
      text: faker.lorem.paragraph(3),
      userTags: sampleSize(tags, random(6)),
      machineTags: sampleSize(tags, random(6)),
      images:
        Math.random() > 0.2
          ? times(random(6), () =>
              faker.image.imageUrl(random(100, 5000), random(100, 500))
            )
          : undefined,

      docId: sample(DOC_IDS) as string,
      docType: doc.type,
      docMetadata: doc.metadata,
    };

    doc.fragments.push(fragment);

    return fragment;
  });

  return {
    tags,
    docsArray: shuffle(docsArray),
    docs: docsArray.reduce((iter, doc) => ({ ...iter, [doc.id]: doc }), {}),
    fragmentsArray: shuffle(fragmentsArray),
    fragments: fragmentsArray.reduce(
      (iter, fragment) => ({ ...iter, [fragment.id]: fragment }),
      {}
    ),
  };
}
