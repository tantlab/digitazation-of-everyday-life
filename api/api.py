from flask import Flask
from flask import request
from elasticsearch import Elasticsearch, helpers
from config import ELASTICSEARCH_HOST, ELASTICSEARCH_PORT

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
    filters = {field:value for field, value in request.args.items() if field not in ["query", "size", "offset"]}

    es = Elasticsearch('%s:%s'%(ELASTICSEARCH_HOST, ELASTICSEARCH_PORT))
    search = {
        "from": offset,
        "size": size,
        "sort": ["date_i_o_me"],
        "track_total_hits": True,
        "query": {
            "bool": {
                "must": {
                    "query_string":  {
                        "query": query ,
                        "fields": ["text_answer","text_question"]
                    }
                },
                "filter": [{"term": {f: v}} for f,v in filters.items()]
            }
        }
    }
    results = es.search(search, index="text_segments")
    return {
        "total": results['hits']['total']['value'],
        "results":results['hits']['hits']
    }