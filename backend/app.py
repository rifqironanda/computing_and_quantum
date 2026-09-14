"""Local-only API. A subprocess makes the 120-second deadline enforceable."""
import json
import os
import subprocess
import sys
import threading
import time
from pathlib import Path
from typing import Literal
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from backend.engine import resources

app = FastAPI(title='Qubit Trail benchmark')
slot = threading.Lock()
ROOT = Path(__file__).resolve().parents[1]


class Request(BaseModel):
    n: int = Field(ge=4, le=999_999_999, strict=True)
    method: Literal['classical', 'qiskit']
    a: int = Field(default=2, ge=2, strict=True)
    shots: int = Field(default=256, ge=1, le=1024, strict=True)
    seed: int = Field(default=42, ge=0, le=2**32-1, strict=True)


def run_worker(payload, timeout=120):
    start = time.perf_counter()
    env = dict(os.environ, OPENBLAS_NUM_THREADS='1', OMP_NUM_THREADS='1')
    try:
        proc = subprocess.run([sys.executable, '-m', 'backend.worker', json.dumps(payload)],
                              cwd=ROOT, env=env, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return {'status': 'timeout', 'wall_seconds': time.perf_counter()-start,
                'elapsed_seconds': None,
                'message': f'Ini membutuhkan waktu lebih dari {timeout} detik. Proses dihentikan; waktu penyelesaian belum diketahui.'}
    if proc.returncode:
        return {'status': 'error', 'elapsed_seconds': None,
                'wall_seconds': time.perf_counter()-start,
                'message': 'Worker gagal. Periksa instalasi backend dan batas sumber daya.'}
    result = json.loads(proc.stdout)
    result['wall_seconds'] = time.perf_counter()-start
    return result


@app.post('/api/benchmark')
def benchmark(request: Request):
    if request.a >= request.n:
        raise HTTPException(422, 'a harus lebih kecil daripada N')
    if request.method == 'qiskit' and request.n > 35:
        return dict(resources(request.n), status='resource_limit', elapsed_seconds=None,
                    message='Tidak dijalankan: N > 35 melampaui batas simulator ini. Waktu penyelesaian tidak diketahui.')
    if not slot.acquire(blocking=False):
        raise HTTPException(429, 'Satu benchmark masih berjalan. Tunggu hingga selesai.')
    try:
        return run_worker(request.model_dump())
    finally:
        slot.release()
