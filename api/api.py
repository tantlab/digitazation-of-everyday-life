from flask import Flask
from flask import request, abort
from elasticsearch import Elasticsearch, helpers, exceptions
from config import ELASTICSEARCH_HOST, ELASTICSEARCH_PORT
from models import segment, document
app = Flask(__name__)

@app.route('/ping')
def ping():
    return 'pong'

@app.route('/search')
def search(method='GET'):
    # params
    query = request.args.get('query', '*')
    size = request.args.get('size', 200)
    offset = request.args.get('offset', 0)
    # demultiplex filters
    filters = {field:value.split('|') for field, value in request.args.items() if field not in ["query", "size", "offset"]}

    es = Elasticsearch('%s:%s'%(ELASTICSEARCH_HOST, ELASTICSEARCH_PORT))
    search = {
        "from": offset,
        "size": size,
        "track_total_hits": True,
        "query": {
            "bool": {
                "must": {
                    "query_string":  {
                        "query": query ,
                        "fields": ["text_answer","text_question"]
                    }
                },
                "filter": [{"terms": {f: v}} for f,v in filters.items()]
            }
        },
        "highlight": {
            "fields": {
                "text_answer": {},
                "text_question": {}
            }
        }
    }
    results = es.search(search, index="text_segments")
    machine_tags = lambda h: \
        h['_source']['tfidf_tag'] if isinstance(h['_source']['tfidf_tag'],list) else [h['_source']['tfidf_tag']] +\
        h['_source']['ner_tag'] if isinstance(h['_source']['ner_tag'],list) else [h['_source']['ner_tag']]
    
    return {
        "total": results['hits']['total']['value'],
        "results": [{
            "type": h['_source']['protocol_type_i_o_me'],
            "docId": h['_source']['document_id'],
            "fragmentId": h['_source']['text_segment_id'],
            "machineTags": machine_tags(h),
            "question": h['_source']['text_question'],
            "answer": h['_source']['text_answer'],
            "highlights": {
                "question": h['highlight']['text_question'] if 'highlight' in h and 'text_question' in h['highlight'] else [],
                "answer": h['highlight']['text_answer'] if 'highlight' in h and 'text_answer' in h['highlight'] else []
            }
        } for h in results['hits']['hits']]
    }

@app.route('/doc/<string:id>', methods= ['GET'])
def doc(id):
    es = Elasticsearch('%s:%s'%(ELASTICSEARCH_HOST, ELASTICSEARCH_PORT))
    try: 
        doc = es.get('documents', id)['_source']
        # segments
        segment_search = {
            "size": 9999,
            "sort": {"order":"asc"},
            "track_total_hits": True,
            "query":{
                "bool":{                
                    "filter": {
                    "term": {"document_id": id}
                }}
            }
        }
        segments = es.search(segment_search, index= 'text_segments')
        return document(doc, [s['_source'] for s in segments['hits']['hits']])
    except exceptions.NotFoundError:
        abort(404)