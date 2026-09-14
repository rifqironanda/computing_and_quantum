import { useEffect, useState } from 'react'

const presets = [15, 21, 35, 1022117, 100160063, 999800009]

export default function Benchmark() {
  const [n, setN] = useState('15')
  const [busy, setBusy] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    if (!busy) return
    const start = performance.now()
    const timer = setInterval(() => setSeconds((performance.now() - start) / 1000), 100)
    return () => clearInterval(timer)
  }, [busy])

  async function run() {
    const value = Number(n)
    if (!Number.isSafeInteger(value) || value < 4 || value > 999999999) {
      setError('Masukkan integer 4–999.999.999.'); return
    }
    setBusy(true); setSeconds(0); setError(''); setRows([])
    try {
      // Sequential requests avoid resource contention between methods.
      for (const method of ['classical', 'qiskit']) {
        const response = await fetch('/api/benchmark', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ n: value, method, a: 2, shots: 256, seed: 42 }),
          signal: AbortSignal.timeout(135000),
        })
        if (!response.ok) throw new Error(`Backend HTTP ${response.status}`)
        const result = await response.json()
        setRows(previous => [...previous, { ...result, n: value, method }])
      }
    } catch (e) {
      setError(`Backend tidak tersedia atau respons gagal (${e.message}). Jalankan server Python; timeout koneksi bukan waktu faktorisasi.`)
    } finally { setBusy(false) }
  }
  const time = value => value == null ? 'Tidak diketahui / tidak dijalankan' : `${value.toFixed(6)} s`
  return <section className="shor-lab" aria-labelledby="benchmark-title">
    <h2 id="benchmark-title">Benchmark Python & Qiskit</h2>
    <p className="lead">Ini mengukur waktu nyata pada CPU server. Qiskit menjalankan qubits simulasi, bukan quantum hardware; grafik waktu tidak membuktikan quantum speedup. Bilangan jutaan pun dapat selesai sangat cepat secara klasik.</p>
    <div className="shor-controls">
      <label>Preset N<select disabled={busy} value={presets.includes(Number(n)) ? n : ''} onChange={e => setN(e.target.value)}>
        <option value="" disabled>Custom</option>
        {presets.map(v => <option key={v} value={v}>{v.toLocaleString('id-ID')}</option>)}
      </select></label>
      <label>Integer N<input disabled={busy} aria-label="Integer N" type="number" min="4" max="999999999" value={n} onChange={e => setN(e.target.value)} /></label>
      <button className="primary-button" disabled={busy} onClick={run}>{busy ? `Berjalan ${seconds.toFixed(1)} s` : 'Uji kedua metode'}</button>
    </div>
    <p>Basis a = 2 · 256 shots · seed 42. Batas 120 detik per metode. Simulator dibatasi N ≤ 35 untuk mencegah kehabisan memori.</p>
    {error && <p role="alert">{error}</p>}
    <div aria-live="polite">
      {rows.map(row => <article className="concept-card" key={row.method} style={{ marginTop: 16 }}>
        <h3>{row.method === 'classical' ? 'Classical trial division' : 'Qiskit Shor — statevector simulator'}</h3>
        <p>N = {row.n} · Status: <strong>{row.status}</strong></p>
        <p>Faktor: {row.factors?.join(' × ') || 'Belum tersedia'}</p>
        <p>Waktu worker (termasuk import Qiskit): {time(row.elapsed_seconds)}</p>
        {row.wall_seconds != null && <p>Waktu end-to-end server, termasuk startup proses: {time(row.wall_seconds)}</p>}
        {row.simulation_seconds != null && <p>Circuit construction: {time(row.build_seconds)} · Statevector + sampling: {time(row.simulation_seconds)}</p>}
        {row.qubits && <p>Register model ini: {row.qubits} qubits · Minimum statevector complex128: {row.statevector_bytes} bytes (belum termasuk overhead).</p>}
        {row.message && <p>{row.message}</p>}
        {row.counts && <details><summary>Measurement counts (bitstring → shots)</summary><pre style={{ overflowX: 'auto' }}>{JSON.stringify(row.counts, null, 2)}</pre></details>}
      </article>)}
    </div>
  </section>
}
