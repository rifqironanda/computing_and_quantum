# Benchmark Qiskit dan classical integer factorization

## Jalankan dua server

Dari root repo, terminal pertama (Python 3.12, sebaiknya virtual environment):

```bash
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

Terminal kedua:

```bash
npm install
npm run dev
```

Buka URL Vite, pilih Shor's Algorithm lalu bagian **Benchmark Python & Qiskit**.
Preset tersedia dari 15 hingga 999.800.009; atau masukkan integer sendiri.
Vite meneruskan `/api` ke backend. Static hosting saja tidak cukup: production memerlukan
Python service dan reverse proxy `/api` dengan timeout lebih dari 120 detik.
Backend ini local-only, tanpa autentikasi; jangan membuka port API ke internet tanpa
autentikasi, pembatasan request, dan worker isolation. Satu worker benchmark pada satu waktu.

## Apa yang benar-benar berjalan?

Panel lama tetap demonstrasi klasik. Panel baru menjalankan quantum circuit Qiskit:

1. Work register disiapkan pada |1⟩, counting register pada |0…0⟩.
2. Hadamard menyiapkan superposition counting register.
3. Controlled modular multiplication untuk a^(2^j) mod N.
4. Inverse QFT pada counting register.
5. Sampling 256 measurement shots dari statevector, seed 42.
6. Pecahan dari measurement didekati dengan continued fractions; kandidat periode
   diverifikasi menggunakan modular exponentiation, lalu GCD mencari faktor.

Tidak ada panggilan `findPeriod()` klasik di backend Qiskit dan tidak ada periode
yang ditanam ke circuit. Implementasi ini menyederhanakan modular arithmetic menjadi
dense permutation unitary. Ini valid untuk demo kecil, **bukan implementasi arithmetic
yang scalable atau benchmark quantum hardware**. Kandidat yang tidak memadai memberi
`inconclusive`; tidak diganti diam-diam dengan faktorisasi klasik.

## Mengapa jutaan bukan bukti quantum speedup?

Yang difaktorkan adalah N komposit, bukan bilangan prima (prima tidak punya faktor
non-trivial). Input prima diberi status `prime` pada metode klasik.
Trial division hanya perlu memeriksa pembagi hingga √N, bukan hingga N.
Untuk N < satu miliar, paling banyak sekitar 31.623 kandidat sebelum optimisasi.
Tidak ada delay buatan. Baseline trial division bukan algoritma klasik tercepat.

Simulator memakai CPU klasik untuk menyimpan amplitudo kompleks. Model ini memakai
n = ceil(log2 N) work qubits dan 2n counting qubits, total 3n. Statevector complex128
membutuhkan minimal 16 × 2^(3n) bytes; actual memory lebih besar.
Model ini bukan klaim jumlah qubit minimum Shor di seluruh implementasi.
Untuk N > 35, API mengembalikan `resource_limit` sebelum mengalokasikan circuit.
Memori dihitung, tetapi **waktu simulasi yang tidak dilakukan tidak dapat dilaporkan**.

## Arti waktu dan status

| Field/status | Makna |
|---|---|
| elapsed_seconds | Waktu worker, termasuk import library dan seluruh metode |
| wall_seconds | End-to-end server, termasuk startup subprocess; bukan network browser |
| build_seconds | Pembuatan circuit setelah import Qiskit |
| simulation_seconds | Evolusi statevector dan sampling; bukan waktu QPU |
| timeout | Batas 120 detik tercapai, subprocess dihentikan; waktu selesai tidak diketahui |
| resource_limit | Tidak dijalankan karena batas sumber daya; bukan timeout |
| inconclusive | Circuit berjalan, sampel tidak memberi faktor yang valid |
| classical_shortcut | GCD menemukan faktor sebelum circuit; bukan hasil quantum |

Jangan menyatakan `timeout` sebagai waktu faktorisasi tepat 120 detik. UI menampilkan
“Ini membutuhkan waktu lebih dari 120 detik...” dan hanya waktu pengamatan yang tersedia.
Hasil satu run adalah pengukuran ilustratif, bukan kesimpulan performa statistik.
Ulangi untuk memperkirakan variasi; tidak ada hardware quantum maupun klaim speedup.

## Pengujian

```bash
python -m unittest backend.test_engine -v
npm test
npm run build
```

Backend menguji circuit N=15 dan histogram phase, prime input, preset besar, kondisi
retry/GCD shortcut, validasi API, resource guard, sukses subprocess, dan penghentian
deadline. Test deadline memakai waktu sangat singkat; tidak sengaja menunggu 2 menit.

## Referensi

## Contoh hasil pengukuran lokal (14 September 2026)

Satu run pada environment pengembangan, Python 3.12, Qiskit 2.5.2, BLAS satu thread.
Angka berikut hasil pengukuran, bukan prediksi atau jaminan performa mesin lain.

| N | Metode | Faktor | Waktu worker (s) | End-to-end server (s) |
|---:|---|---|---:|---:|
| 15 | Qiskit simulator, 12 qubits | 3 × 5 | 0.429233 | 0.510826 |
| 21 | Qiskit simulator, 15 qubits | 3 × 7 | 0.410440 | 0.495328 |
| 35 | Qiskit simulator, 18 qubits | 5 × 7 | 0.659521 | 0.733342 |
| 1.022.117 | Trial division | 1009 × 1013 | 0.000035 | 0.022678 |
| 100.160.063 | Trial division | 10007 × 10009 | 0.000332 | 0.020578 |
| 999.800.009 | Trial division | 13 × 43 × 1788551 | 0.000070 | 0.019782 |

Preset terakhir memiliki tiga faktor prima, bukan semiprime. Waktu tidak harus naik
monoton terhadap N; faktor kecil dapat membuat input besar lebih mudah.
Tidak satu pun run klasik ini mencapai 120 detik. Timeout tetap diuji secara terpisah.

## Sumber teknis

- [Qiskit Statevector](https://quantum.cloud.ibm.com/docs/en/api/qiskit/qiskit.quantum_info.Statevector)
- [Qiskit QFTGate](https://quantum.cloud.ibm.com/docs/en/api/qiskit/qiskit.circuit.library.QFTGate)
- [Shor, SIAM Journal on Computing (1997)](https://doi.org/10.1137/S0097539795293172)
