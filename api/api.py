from flask import Flask
from flask import request, abort, jsonify
from elasticsearch import Elasticsearch, helpers, exceptions
from config import ELASTICSEARCH_HOST, ELASTICSEARCH_PORT
from models import segment, document, segment_light
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
    return {
        "total": results['hits']['total']['value'],
        "results": [ dict(segment_light(s['_source']), **{"highlights": {
                "question": s['highlight']['text_question'] if 'highlight' in s and 'text_question' in s['highlight'] else [],
                "answer": s['highlight']['text_answer'] if 'highlight' in s and 'text_answer' in s['highlight'] else []
            }})
            for s in results['hits']['hits']]
    } 
     



@app.route('/autocomplete')
def autocomplete(method='GET'):
    # params
    query = request.args.get('query', None)
    field = request.args.get('field', None)
    size = request.args.get('count', 10)
    if not field:
        abort(404)
    terms = {
                    "field":field, 
                    "size": size, 
                    "missing": "N/A"
                }
    if query:
        # make the query case sensitive
        terms["include"] = ".*%s.*"%("".join(["[%s%s]"%(c.lower(),c.upper()) for c in query]))
    es = Elasticsearch('%s:%s'%(ELASTICSEARCH_HOST, ELASTICSEARCH_PORT))
    search = {
        "size": 0,
        "track_total_hits": True,
        "aggs": {
            "suggestions": {
                "terms": terms 
            }
        }
    }
    results = es.search(search, index="text_segments")['aggregations']['suggestions']['buckets']
   
    return jsonify([r['key']  for r in results])

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

@app.route('/similarSegments/<string:id>', methods= ['GET'])
def similar_segments(id):
    es = Elasticsearch('%s:%s'%(ELASTICSEARCH_HOST, ELASTICSEARCH_PORT))
    try: 
        segment = es.get('text_segments', id)['_source']
        similar_ids = segment['text_segment_similarity_id']
        if similar_ids != "" and not isinstance(similar_ids,list):
            similar_ids = [similar_ids]
        if len(similar_ids)>0:
            similar_segments = es.mget(index = 'text_segments',
                    body = {'ids': similar_ids})
            return jsonify([segment_light(s['_source']) for s in similar_segments['docs']])
        else:
            return []
    except exceptions.NotFoundError:
        abort(404)

