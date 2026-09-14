"""Small, real Qiskit order-finding circuit; not a hardware speed benchmark."""
import math
import time
from fractions import Fraction


def classical(n):
    remaining, factors, divisor = n, [], 2
    while divisor * divisor <= remaining:
        while remaining % divisor == 0:
            factors.append(divisor)
            remaining //= divisor
        divisor = 3 if divisor == 2 else divisor + 2
    if remaining > 1:
        factors.append(remaining)
    return {'status': 'prime' if factors == [n] else 'success', 'factors': factors,
            'method': 'Classical trial division (bukan algoritma klasik tercepat)'}


def resources(n):
    width = (n - 1).bit_length()
    return {'qubits': 3 * width, 'statevector_bytes': str(16 * 2 ** (3 * width))}


def shor(n, a=2, shots=256, seed=42):
    info = resources(n)
    if n > 35:
        return dict(info, status='resource_limit', elapsed_seconds=None,
                    message='Tidak dijalankan: simulator dibatasi N ≤ 35. Waktu Shor tidak diketahui.')
    if not 1 < a < n:
        raise ValueError('Basis harus memenuhi 1 < a < N')
    common = math.gcd(a, n)
    if common > 1:
        return dict(status='classical_shortcut', factors=[common, n // common],
                    message='GCD menemukan faktor; tidak menjalankan quantum circuit.')
    import numpy as np
    from qiskit import QuantumCircuit
    from qiskit.circuit.library import QFTGate, UnitaryGate
    from qiskit.quantum_info import Statevector

    start = time.perf_counter()
    width = (n - 1).bit_length()
    precision = 2 * width
    work = list(range(precision, precision + width))
    circuit = QuantumCircuit(precision + width)
    circuit.x(work[0])  # work register |1>, little-endian
    circuit.h(range(precision))
    for j in range(precision):
        multiplier = pow(a, 2 ** j, n)
        # Generic modular permutation derived from a,N, never from a known period.
        # First qubit in this gate is the least-significant control bit.
        matrix = np.zeros((2 ** (width + 1),) * 2, dtype=complex)
        for y in range(2 ** width):
            target = multiplier * y % n if y < n else y
            matrix[2 * y, 2 * y] = 1
            matrix[2 * target + 1, 2 * y + 1] = 1
        circuit.append(UnitaryGate(matrix, label=f'cMul {multiplier} mod {n}'), [j, *work])
    circuit.append(QFTGate(precision).inverse(), range(precision))
    build_time = time.perf_counter() - start
    start = time.perf_counter()
    state = Statevector.from_instruction(circuit)
    state.seed(seed)
    counts = {k: int(v) for k, v in state.sample_counts(shots, qargs=list(range(precision))).items()}
    simulation_time = time.perf_counter() - start
    candidates = []
    factors = None
    for bits in counts:
        measured = int(bits, 2)
        if not measured:
            continue
        r = Fraction(measured, 2 ** precision).limit_denominator(n).denominator
        # Verify candidates derived from measurements, without classical order search.
        if r % 2 or pow(a, r, n) != 1:
            continue
        half = pow(a, r // 2, n)
        p, q = math.gcd(half - 1, n), math.gcd(half + 1, n)
        candidates.append(r)
        if 1 < p < n and 1 < q < n and p * q == n:
            factors = sorted([p, q])
            break
    return dict(info, status='success' if factors else 'inconclusive', factors=factors,
                counts=counts, shots=shots, seed=seed, period_candidates=candidates,
                build_seconds=build_time, simulation_seconds=simulation_time,
                circuit_depth=circuit.depth(),
                method='Qiskit ideal statevector, sampled measurement; bukan QPU',
                message='Ulangi dengan basis/seed lain bila sampel tidak memberi faktor.')
