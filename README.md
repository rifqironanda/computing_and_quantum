# Qubit Trail — Classical to Quantum

Aplikasi React interaktif berbahasa Indonesia untuk membangun pemahaman bertahap:

1. **Classical bits** — tegangan, bit, binary, dan logic gate.
2. **Quantum physics** — qubit, amplitude, phase, Bloch sphere, dan measurement.
3. **Quantum computing** — quantum gate dan interference sebagai mekanisme komputasi.
4. **Shor's algorithm** — hubungan factoring, modular function, period finding, dan classical post-processing.

> Demo Shor pada browser adalah simulasi edukatif. Pencarian periode dihitung secara klasik agar ringan; diagram menjelaskan lokasi quantum subroutine dalam algoritma sebenarnya.

## Menjalankan secara lokal

```bash
npm install
npm test
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

## Dokumentasi pembelajaran

- [Panduan pengujian Shor's Algorithm](docs/shor-testing-guide.md) — penjelasan alur matematika, lima unit test, contoh N = 15, dan batasan simulasi.

## Struktur

```text
src/
├── components/    # Eksperimen interaktif
├── data/          # Konten dan sumber pembelajaran
├── styles/        # Design system responsif
├── utils/         # Fungsi matematika murni
├── App.jsx
└── main.jsx
```

Arsitektur dipisahkan per domain agar modul baru seperti entanglement, Grover, QFT, error correction, atau backend Qiskit dapat ditambahkan tanpa mengubah keseluruhan aplikasi.

## Batasan penting

- Bloch sphere adalah representasi state satu qubit, bukan lintasan fisik partikel.
- Superposition tidak berarti semua jawaban dapat dibaca sekaligus.
- Measurement menghasilkan sampel klasik sesuai Born rule.
- Shor memberi keuntungan asimtotik untuk factoring, tetapi implementasi skala kriptografis memerlukan quantum computer fault-tolerant yang besar.

## Referensi utama

- [IBM Quantum Learning — Quantum information](https://quantum.cloud.ibm.com/learning/en/courses/basics-of-quantum-information/single-systems/quantum-information)
- [P. W. Shor (1997), SIAM Journal on Computing](https://doi.org/10.1137/S0097539795293172)
- [Qiskit Learning — Shor’s algorithm](https://qiskit.qotlabs.org/learning/courses/fundamentals-of-quantum-algorithms/phase-estimation-and-factoring/shor-algorithm)

## Lisensi

MIT
