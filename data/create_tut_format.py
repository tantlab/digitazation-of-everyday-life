#!python

from collections import OrderedDict
import csv
import ast
from itertools import groupby
import os


segment_columns = OrderedDict(
    {
        # mandatory fields
        "text_segment_id": "id",
        "text_question": "label",
        "text_answer": "content",
        "document_id": "document_id",
        "tags": "tags",
        "source_id": "source_id",
        "parent_id": "parent_id",
        "order": "indexInDocument",
        "images_me_o": "media_ids",
        # extra fields
        "machine_tags": "machine_tags:text[]",
        "text_segment_similarity_id": "text_segment_similarity_id:text[]",
        "date_i_o_me": "date_i_o_me:date",
        # to remove
        "tfidf_tag": None,
        "ner_tag": None,
        "text_segment_id_succeeding": None,
        "text_segment_id_preceding": None,
        "text_segment_similarity_weight": None,
    }
)

document_columns = OrderedDict(
    {
        # mandatory fields
        "document_id": "id",
        "protocol_type_i_o_me": "collection_id",
        # extra fields
        "participant_i_o_me": "participant_i_o_me:text",
        "job_i_me": "job_i_me:text",
        "job_category_i_me": "job_category_i_me:text",
        "age_i_me": "age_i_me:text",
        "residence_i_me": "residence_i_me:text",
        "residence_region_i_me": "residence_region_i_me:text",
        "housemates_i_me": "housemates_i_me:text",
        "document_tags_i": "tags:text[]",
        "researcher_i_o": "researcher_i_o:text",
        "analytic_note_i_o": "analytic_note_i_o:content",
        # should be time/duration
        "platform_o": "platforms:text[]",
        "duration_observed_o": "duration_observed_o:text",
        "people_o": "people_o:content",
        "notes_o": "notes_o:content",
        "quotations_o": "quotations_o:content",
        "media_o": "media_o:text[]",
        "extra_o": "extra_o:content",
        # ???
        "related_files_i_o_me": None,
    }
)

document_empty_mandatory_columns = ["label", "media_ids"]

# todo:
# - create collections
# - create medias

if __name__ == "__main__":

    with open("./csv/text_segment.csv", "r", encoding="utf8") as segments_f, open(
        "./csv/text_segment_metadata.csv", "r", encoding="utf8"
    ) as segments_meta_f, open(
        "./csv/document_metadata.csv", "r", encoding="utf8"
    ) as docs_meta_f, open(
        "./csv/user_tags.csv", "r", encoding="utf8"
    ) as tags_f:

        # hashmap of segments
        segments_content = {s["text_segment_id"]: s for s in csv.DictReader(segments_f)}
        # hashmap of docs
        docs = {s["document_id"]: s for s in csv.DictReader(docs_meta_f)}
        # hashmap of user tags
        tags_csv = csv.DictReader(tags_f)
        user_tags_by_segment_id = {}
        for seg_tags in tags_csv:
            # if the same segment is listed twice we take the last one only
            user_tags_by_segment_id[seg_tags["text_segment_id"]] = ast.literal_eval(
                seg_tags["user_tags"]
            )

        segment_meta_CSV = csv.DictReader(segments_meta_f)
        all_segments = list(segment_meta_CSV)
        all_segments.sort(key=lambda s: s["document_id"])

        for doc_id, segments in groupby(all_segments, key=lambda s: s["document_id"]):
            # reset order count
            order = 0
            segments = list(segments)
            nb_segments = len(segments)
            last_segment_id = ""
            segments_in_order = []
            while len(segments_in_order) < nb_segments:
                next_segment = [
                    s
                    for s in segments
                    if s["text_segment_id_preceding"] == last_segment_id
                ]
                if len(next_segment) == 1:
                    next_segment = next_segment[0]
                    next_segment["order"] = order
                    # order variable will be easier
                    order += 1
                    # segment metadata management

                    # lists
                    machine_tags = []
                    if next_segment["tfidf_tag"] == "":
                        next_segment["tfidf_tag"] = []
                    else:
                        next_segment["tfidf_tag"] = ast.literal_eval(
                            next_segment["tfidf_tag"]
                        )
                        machine_tags += next_segment["tfidf_tag"]
                    if next_segment["ner_tag"] == "":
                        next_segment["ner_tag"] = []
                    else:
                        next_segment["ner_tag"] = ast.literal_eval(
                            next_segment["ner_tag"]
                        )
                        machine_tags += next_segment["ner_tag"]
                    next_segment["machine_tags"] = machine_tags
                    # force image into list

                    if (
                        next_segment["images_me_o"] != ""
                        and next_segment["images_me_o"][0] == "["
                    ):
                        next_segment["images_me_o"] = ast.literal_eval(
                            next_segment["images_me_o"]
                        )
                    else:
                        next_segment["images_me_o"] = (
                            [next_segment["images_me_o"]]
                            if next_segment["images_me_o"] != ""
                            else []
                        )
                    if next_segment["text_segment_similarity_id"] == "":
                        next_segment["text_segment_similarity_id"] = []
                    else:
                        next_segment["text_segment_similarity_id"] = ast.literal_eval(
                            next_segment["text_segment_similarity_id"]
                        )

                    # nan in date
                    next_segment["date_i_o_me"] = next_segment["date_i_o_me"].replace(
                        " nan", ""
                    )
                    # content
                    if next_segment["text_segment_id"] in segments_content:
                        sc = segments_content[next_segment["text_segment_id"]]
                        next_segment["text_question"] = sc["text_question"]
                        next_segment["text_answer"] = sc["text_answer"]
                    else:
                        raise Exception(
                            "segment ID %s not found in segment content CSV"
                            % next_segment["text_segment_id"]
                        )
                    # doc meta injected to ease search
                    if not next_segment["document_id"] in docs:
                        raise Exception(
                            "segment ID %s has an unknow doc id %s"
                            % (
                                next_segment["text_segment_id"],
                                next_segment["document_id"],
                            )
                        )

                    segments_in_order.append(next_segment)
                    last_segment_id = next_segment["text_segment_id"]
                else:
                    raise Exception("segment sequence broken %s" % segments)

        # TODO: write TextUnit table

        def format_to_csv(data, translation):
            row = {}
            for k, v in data.items():
                new_column = translation[k]
                if new_column != None:
                    row[new_column] = "|".join(v) if isinstance(v, list) else v
            return row

        def cast_doc(d):
            d["document_tags_i"] = d["document_tags_i"].split(", ")
            d["platform_o"] = d["platform_o"].split(", ")
            d["media_o"] = d["media_o"].split(", ")
            return d

        with open("./TextUnit.csv", "w") as segment_f:
            writer = csv.DictWriter(segment_f, segment_columns.values())
            writer.writeheader()
            writer.writerows(format_to_csv(s, segment_columns) for s in all_segments)

        with open("./Document.csv", "w") as document_f:
            writer = csv.DictWriter(document_f, document_columns.values())
            writer.writeheader()
            writer.writerows(
                format_to_csv(cast_doc(s), document_columns) for s in docs.values()
            )

        # collections
        collections = set(d["protocol_type_i_o_me"] for d in docs.values())
        with open("./Collection.csv", "w") as collection_f:
            writer = csv.DictWriter(collection_f, ["id", "label", "media_ids"])
            writer.writeheader()
            writer.writerows(
                {"id": collection, "label": collection} for collection in collections
            )

        # medias
        medias = set(i for s in all_segments for i in s["images_me_o"])
        with open("./Media.csv", "w") as media_f:
            writer = csv.DictWriter(media_f, ["id", "filepath", "label", "alt", "type"])
            writer.writeheader()
            writer.writerows(
                {
                    "id": filepath,
                    "label": filepath.split(".")[0],
                    "filepath": f"images/{filepath}",
                    "type": "image",
                }
                for filepath in medias
                if os.path.isfile(f"images/{filepath}")
            )
