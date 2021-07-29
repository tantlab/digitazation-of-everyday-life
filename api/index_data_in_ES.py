#!python
from elasticsearch import Elasticsearch, helpers
import csv
import ast
import json
from itertools import groupby
import os

from config import ELASTICSEARCH_HOST, ELASTICSEARCH_PORT
DELETE_INDEX = True

DOC_FIELDS_INTO_SEGMENTS = ['protocol_type_i_o_me', 'job_i_me', 'job_category_i_me',
                            'age_i_me', 'residence_i_me', 'residence_region_i_me', 'housemates_i_me', 'platform_o', ]


if __name__ == '__main__':

    text_segment_mapping = None
    with open("./text_segment_mapping.json", "r", encoding="utf8") as mf:
        text_segment_mapping = json.load(mf)

    print("Starting data indexation")
    es = Elasticsearch('%s:%s' % (ELASTICSEARCH_HOST, ELASTICSEARCH_PORT))
    for index in ["text_segments", "documents"]:
        if es.indices.exists(index=index) and DELETE_INDEX:
            print('index %s deleted' % index)
            es.indices.delete(index=index)
        if not es.indices.exists(index=index):
            es.indices.create(index=index)
            es.indices.close(index=index)

    # in cas we need specific keyword, add this filter
    # "danish_keywords": {
    #             "type":       "keyword_marker",
    #             "keywords":   ["eksempel"]
    #             },
    es.indices.put_settings(index='text_segments', body={
        "analysis": {
            "filter": {
                "danish_stop": {
                    "type":       "stop",
                    "stopwords":  "_danish_"
                },
                "danish_stemmer": {
                    "type":       "stemmer",
                    "language":   "danish"
                }
            },
            "analyzer": {
                "rebuilt_danish": {
                    "tokenizer":  "standard",
                    "filter": [
                        "lowercase",
                        "danish_stop",
                        # "danish_keywords",
                        "danish_stemmer"
                    ]
                }
            }
        }
    })

    if text_segment_mapping:
        es.indices.put_mapping(index='text_segments',
                               body=text_segment_mapping)
    for index in ["text_segments", "documents"]:
        es.indices.open(index=index)

    with open('./data/csv/text_segment.csv', 'r', encoding='utf8') as segments_f, open('./data/csv/text_segment_metadata.csv', 'r', encoding='utf8') as segments_meta_f, open('./data/csv/document_metadata.csv', 'r', encoding='utf8') as docs_meta_f:
        # hashmap of segments
        segments_content = {s["text_segment_id"]: s for s in csv.DictReader(segments_f)}
        # hashmap of docs
        docs = {s["document_id"]: s for s in csv.DictReader(docs_meta_f)}

        def blur_text(t):
            import string
            import re
            import random
            letters = string.ascii_lowercase
            return re.sub("\w", lambda _: letters[random.randrange(26)], t)

        blur_result_cache = {}

        def blur_and_cache_text(t):
            if t not in blur_result_cache:
                blur_result_cache[t] = blur_text(t)
            return blur_result_cache[t]

        def cast_doc(d):
            fields_to_blur = ['text_answer', "quotations_o",
                              "job_i_me", 'analytic_note_i_o', 'people_o', 'notes_o']
            for f in fields_to_blur:
                if f in d:
                    d[f] = blur_text(d[f])
            fields_to_blur_consistently = [
                'participant_i_o_me', 'researcher_i_o', 'document_id', 'text_segment_id', 'text_segment_similarity_id']
            for f in fields_to_blur_consistently:
                if f in d:
                    if isinstance(d[f], list):
                        d[f] = [blur_and_cache_text(e) for e in d[f]]
                    else:
                        d[f] = blur_and_cache_text(d[f])
            if 'document_tags_i' in d:
                d['document_tags_i'] = d['document_tags_i'].split(', ')
            return d

        segment_meta_CSV = csv.DictReader(segments_meta_f)
        all_segments = list(segment_meta_CSV)
        all_segments.sort(key=lambda s: s['document_id'])

        for doc_id, segments in groupby(all_segments, key=lambda s: s['document_id']):
            # reset order count
            order = 0
            segments = list(segments)
            nb_segments = len(segments)
            last_segment_id = ""
            segments_in_order = []
            while len(segments_in_order) < nb_segments:
                next_segment = [
                    s for s in segments if s["text_segment_id_preceding"] == last_segment_id]
                if len(next_segment) == 1:
                    next_segment = next_segment[0]
                    next_segment['order'] = order
                    # order variable will be easier
                    order += 1
                    # segment metadata management

                    # lists
                    machine_tags = []
                    if next_segment['tfidf_tag'] == '':
                        next_segment['tfidf_tag'] = []
                    else:
                        next_segment['tfidf_tag'] = ast.literal_eval(
                            next_segment['tfidf_tag'])
                        machine_tags += next_segment['tfidf_tag']
                    if next_segment['ner_tag'] == '':
                        next_segment['ner_tag'] = []
                    else:
                        next_segment['ner_tag'] = ast.literal_eval(
                            next_segment['ner_tag'])
                        machine_tags += next_segment['ner_tag']
                    next_segment['machine_tags'] = machine_tags
                    # force image into list

                    if next_segment['images_me_o'] != "" and next_segment['images_me_o'][0] == '[':
                        next_segment['images_me_o'] = ast.literal_eval(
                            next_segment['images_me_o'])
                    else:
                        next_segment['images_me_o'] = [
                            next_segment['images_me_o']] if next_segment['images_me_o'] != "" else []
                    if next_segment['text_segment_similarity_id'] == '':
                        next_segment['text_segment_similarity_id'] = []
                    else:
                        next_segment['text_segment_similarity_id'] = ast.literal_eval(
                            next_segment['text_segment_similarity_id'])

                    # nan in date
                    next_segment['date_i_o_me'] = next_segment['date_i_o_me'].replace(
                        " nan", "")
                    # content
                    if next_segment['text_segment_id'] in segments_content:
                        sc = segments_content[next_segment['text_segment_id']]
                        next_segment["text_question"] = sc['text_question']
                        next_segment["text_answer"] = sc['text_answer']
                    else:
                        raise Exception(
                            "segment ID %s not found in segment content CSV" % s['text_segment_id'])
                    # doc meta injected to ease search
                    if next_segment['document_id'] in docs:
                        doc = docs[next_segment['document_id']]
                        for f in DOC_FIELDS_INTO_SEGMENTS:
                            next_segment[f] = doc[f]
                    else:
                        raise Exception("segment ID %s has an unknow doc id %s" % (
                            next_segment['text_segment_id'], next_segment['document_id']))

                    segments_in_order.append(next_segment)
                    last_segment_id = next_segment["text_segment_id"]
                else:
                    raise Exception('segment sequence broken %s' % segments)

        # index batch to ES
        index_result, _ = helpers.bulk(es, ({
            "_op_type": "update",
            "doc_as_upsert": True,
            "_id": blur_and_cache_text(s['text_segment_id']),
            'doc': cast_doc(s)}
            for s in all_segments),
            index='text_segments')
        if index_result > 0:
            print("%s text_segments inserted" % (index_result))

        # documents

        index_result, _ = helpers.bulk(es, ({
            "_op_type": "update",
            "doc_as_upsert": True,
            "_id": blur_and_cache_text(doc_id),
            'doc': cast_doc(d)}
            for doc_id, d in docs.items()),
            index='documents')
        if index_result > 0:
            print("%s documents inserted" % (index_result))

        # user tags
        if os.path.exists("./data/csv/user_tags.csv"):
            with open("./data/csv/user_tags.csv", "r", encoding="utf8") as tags_f:
                tags_csv = csv.DictReader(tags_f)
                tags_updates = {}
                for seg_tags in tags_csv:
                    # if the same segment is listed twice we take the last one only
                    tags_updates[seg_tags['text_segment_id']] = {
                        "user_tags": ast.literal_eval(seg_tags["user_tags"])}
                index_result, _ = helpers.bulk(es, ({
                    "_op_type": "update",
                    "_id": seg_id,
                    'doc': d}
                    for seg_id, d in tags_updates.items()),
                    index='text_segments')
                if index_result > 0:
                    print("tags inserted in %s segments" % (index_result))
