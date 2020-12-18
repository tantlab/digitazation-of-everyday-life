from elasticsearch import Elasticsearch, helpers
import csv
import ast 
import json
from itertools import groupby

ELASTICSEARCH_HOST="localhost"
ELASTICSEARCH_PORT="9200"
DELETE_INDEX=True


if __name__ == '__main__':

    text_segment_mapping = None
    with open("./text_segment_mapping.json", "r", encoding="utf8") as mf:
        text_segment_mapping = json.load(mf)

    print("Starting data indexation")
    es = Elasticsearch('%s:%s'%(ELASTICSEARCH_HOST, ELASTICSEARCH_PORT))
    if es.indices.exists(index='text_segments' ) and DELETE_INDEX:
        print('index deleted')
        es.indices.delete(index='text_segments')
    if not es.indices.exists(index='text_segments'):
        es.indices.create(index='text_segments')
        es.indices.close(index='text_segments')
        
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
                        #"danish_keywords",
                        "danish_stemmer"
                    ]
                    }
                }
            }
        })

        if text_segment_mapping:
            es.indices.put_mapping(index='text_segments', body = text_segment_mapping )
        es.indices.open(index='text_segments')

    with open('data/text_segment.csv', 'r', encoding='utf8') as segments_f, open('data/text_segment_metadata.csv', 'r', encoding='utf8') as segments_meta_f:
        # hashmap of segments
        segments_content = {s["text_segment_id"]:s for s in csv.DictReader(segments_f)}
        
        segment_meta_CSV = csv.DictReader(segments_meta_f)
        all_segments = list(segment_meta_CSV)
        all_segments.sort(key=  lambda s : s['document_id'])
        
        for doc_id, segments in groupby(all_segments, key= lambda s : s['document_id']):
            # reset order count
            order = 0
            segments = list(segments)
            nb_segments = len(segments)
            last_segment_id = ""
            segments_in_order = []
            while len(segments_in_order)<nb_segments:
                next_segment = [s for s in segments if s["text_segment_id_preceding"] == last_segment_id]
                if len(next_segment) == 1:
                    next_segment = next_segment[0]
                    next_segment['order'] = order
                    # order variable will be easier
                    order += 1
                    # segment metadata management
                    del(next_segment[''])
                    # lists
                    if next_segment['tfidf_tag'] != '':
                        next_segment['tfidf_tag'] = ast.literal_eval(next_segment['tfidf_tag'])
                    if next_segment['ner_tag'] != '':
                        next_segment['ner_tag'] = ast.literal_eval(next_segment['ner_tag'])
                    next_segment['text_segment_similarity_id'] = ast.literal_eval(next_segment['text_segment_similarity_id'])
                    # content
                    if next_segment['text_segment_id'] in segments_content:
                        sc = segments_content[next_segment['text_segment_id']]
                        next_segment["text_question"] = sc['text_question']
                        next_segment["text_answer"] = sc['text_answer']
                    else:
                        raise Exception("segment ID %s not found in segment content CSV"%s['text_segment_id'])
                    segments_in_order.append(next_segment)
                    last_segment_id = next_segment["text_segment_id"]
                else:
                    raise Exception('segment sequence broken %s'%segments)

        # index batch to ES
        index_result, _ = helpers.bulk(es, ({
            "_op_type": "update",
            "doc_as_upsert": True,
            "_id": s['text_segment_id'],
            'doc':s}
                for s in all_segments),
            index='text_segments')
        if index_result > 0:
            print("%s text_segments inserted"%(index_result))