import { Binary, Atom, Orbit, KeyRound } from 'lucide-react'

export const modules = [
  {
    id: 'classical',
    label: 'Classical Bits',
    eyebrow: '01 · Fondasi',
    icon: Binary,
    title: 'Informasi dimulai dari dua keadaan yang tegas.',
    summary: 'Bit klasik selalu dibaca sebagai 0 atau 1. Transistor fisik membuat perbedaan itu dapat disimpan dan diproses.',
    color: 'cyan',
  },
  {
    id: 'physics',
    label: 'Quantum Physics',
    eyebrow: '02 · Fenomena',
    icon: Atom,
    title: 'Keadaan fisik dapat memiliki amplitudo dan phase.',
    summary: 'Superposition bukan berarti kita membaca 0 dan 1 sekaligus. Ia adalah keadaan matematis yang menghasilkan probabilitas ketika diukur.',
    color: 'violet',
  },
  {
    id: 'computing',
    label: 'Quantum Computing',
    eyebrow: '03 · Rekayasa',
    icon: Orbit,
    title: 'Kita mengendalikan amplitudo agar jawaban tertentu menguat.',
    summary: 'Quantum gates mengubah state secara unitary. Interference dan measurement mengubah proses fisika menjadi hasil komputasi klasik.',
    color: 'amber',
  },
  {
    id: 'shor',
    label: "Shor's Algorithm",
    eyebrow: '04 · Aplikasi',
    icon: KeyRound,
    title: 'Factoring diubah menjadi masalah mencari periode.',
    summary: 'Bagian quantum membantu menemukan periode fungsi modular; bagian klasik mengubah periode tersebut menjadi faktor kandidat.',
    color: 'rose',
  },
]

export const sources = [
  {
    label: 'IBM Quantum Learning — Quantum information',
    url: 'https://quantum.cloud.ibm.com/learning/en/courses/basics-of-quantum-information/single-systems/quantum-information',
  },
  {
    label: "P. W. Shor (1997) — Polynomial-Time Algorithms",
    url: 'https://doi.org/10.1137/S0097539795293172',
  },
  {
    label: 'Qiskit Textbook — Shor’s algorithm',
    url: 'https://qiskit.qotlabs.org/learning/courses/fundamentals-of-quantum-algorithms/phase-estimation-and-factoring/shor-algorithm',
  },
]
