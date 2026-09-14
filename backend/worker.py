import json
import sys
import time
from backend.engine import classical, shor

if __name__ == '__main__':
    payload = json.loads(sys.argv[1])
    start = time.perf_counter()
    result = classical(payload['n']) if payload['method'] == 'classical' else shor(
        payload['n'], payload['a'], payload['shots'], payload['seed'])
    result['elapsed_seconds'] = time.perf_counter() - start
    print(json.dumps(result))
