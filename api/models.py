

def _translate(o, translation):
    new_o = {}
    for f, of in translation.items():
        if isinstance(of, list):
            if len([off for off in of if off in o]) > 0:
                new_o[f] = [ssf for sf in of for ssf in o[sf]]
        elif of in o:
            new_o[f] = o[of]
    return new_o


def segment(es_segment):
    meta_alignement = {
        "id": 'text_segment_id',
        "question": 'text_question',
        "answer": 'text_answer',
        "images": 'images_me_o',
        'userTags': 'user_tags',
        'machineTags': 'machine_tags',
        'docId': 'document_id',
        'docType': 'protocol_type_i_o_me',
        "date": "date_i_o_me",
        "images": "images_me_o"
    }
    return _translate(es_segment, meta_alignement)


def segment_light(es_segment):
    meta_alignement = {
        "type": 'protocol_type_i_o_me',
        "docId": 'document_id',
        "fragmentId": 'text_segment_id',
        'machineTags': 'machine_tags',
        "question": 'text_question',
        "answer": 'text_answer',
        "date": "date_i_o_me"
    }
    return _translate(es_segment, meta_alignement)


def document(es_doc, es_segments=[]):
    meta_alignement = {
        "id": 'document_id',
        "type": 'protocol_type_i_o_me',
        "tags": 'document_tags_i',
        "similarDocIDs": 'related_files_i_o_me',
    }
    doc = _translate(es_doc, meta_alignement)
    if len(es_segments) > 0:
        doc['fragments'] = [segment(s) for s in es_segments]
    doc["metadata"] = {f: v for f, v in es_doc.items(
    ) if f not in meta_alignement.values()}
    return doc
