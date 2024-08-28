from yolo import yolo
from multiprocessing import Lock

MAX_MODEL = 1
models = {
    'basic': {
        'net': None,
        'meta': None,
        'activated': False
    },
    'dog_breed': {
        'net': None,
        'meta': None,
        'activated': False
    },
}
loaded_model = []

def get_model(key):
    global models, loaded_model

    if not models[key]['activated']:
        if len(loaded_model) + 1 > MAX_MODEL:
            free_model(loaded_model[0])
        model = load_model(key)
        models[key]['net'] = model['net']
        models[key]['meta'] = model['meta']
        models[key]['activated'] = True
        loaded_model.append(key)
    return {'name': key, 'net': models[key]['net'], 'meta': models[key]['meta']}

def load_model(key):
    cfg_dir = './yolo/models/%s/%s.cfg' % (key, key)
    weights_dir = './yolo/models/%s/%s.weights' % (key, key)
    meta_dir = './yolo/models/%s/%s.data' % (key, key)

    net = yolo.load_net(cfg_dir.encode(), weights_dir.encode(), 0)
    meta = yolo.load_meta(meta_dir.encode())

    return {'net': net, 'meta': meta}

def free_model(key):
    global models, loaded_model
    yolo.free_network(models[key]['net'])
    models[key]['activated'] = False
    models[key]['net'] = models[key]['meta'] = None
    loaded_model.remove(key)

def detect(model, img_dir, out_dir):
    return yolo.detect(model['net'], model['meta'], img_dir.encode(), out_dir=out_dir.encode())