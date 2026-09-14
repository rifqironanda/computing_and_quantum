import { useMemo, useState } from 'react'
import { ArrowRight, Check, Cpu, Dices, Gauge, RotateCcw, Sparkles, Zap } from 'lucide-react'
import { buildResidues, gcd, shorOptions, shorResult } from '../utils/math'

export function ClassicalLab() {
  const [bits, setBits] = useState([1, 0, 1, 1])
  const value = bits.reduce((total, bit, index) => total + bit * 2 ** (bits.length - index - 1), 0)

  const flip = (index) => {
    setBits((current) => current.map((bit, bitIndex) => (bitIndex === index ? 1 - bit : bit)))
  }

  return (
    <section className="lab-grid" aria-labelledby="classical-title">
      <div>
        <div className="section-kicker">Interactive experiment 01</div>
        <h2 id="classical-title">Dari tegangan fisik menjadi angka</h2>
        <p className="lead">
          Klik sakelar. Setiap bit hanya mempunyai satu keadaan aktual pada satu waktu:
          <strong> 0</strong> atau <strong>1</strong>.
        </p>

        <div className="bit-bank" aria-label="Empat sakelar bit">
          {bits.map((bit, index) => (
            <button
              className={bit ? 'bit active' : 'bit'}
              key={index}
              onClick={() => flip(index)}
              aria-label={`Ubah bit ${index + 1}, sekarang ${bit}`}
            >
              <span className="bit-weight">2^{bits.length - index - 1}</span>
              <span className="bit-value">{bit}</span>
              <span className="bit-voltage">{bit ? 'HIGH' : 'LOW'}</span>
            </button>
          ))}
        </div>

        <div className="equation-card">
          <span>Binary</span>
          <strong>{bits.join('')}</strong>
          <ArrowRight size={18} />
          <span>Decimal</span>
          <strong>{value}</strong>
        </div>
      </div>

      <article className="concept-card cyan-card">
        <Cpu size={26} />
        <div>
          <span className="mini-label">Physical layer</span>
          <h3>Transistor sebagai sakelar</h3>
          <p>
            Komputer klasik memetakan rentang tegangan ke simbol 0 dan 1. Logic gate seperti
            AND, OR, dan NOT memanipulasi simbol tersebut secara deterministik.
          </p>
        </div>
        <div className="truth-row">
          <span>Input</span><b>{bits[2]} AND {bits[3]}</b>
          <ArrowRight size={16} />
          <span>Output</span><b>{bits[2] && bits[3] ? 1 : 0}</b>
        </div>
      </article>
    </section>
  )
}

function BlochSphere({ theta, phi }) {
  const thetaRad = (theta * Math.PI) / 180
  const phiRad = (phi * Math.PI) / 180
  const radius = 94
  const x = 130 + radius * Math.sin(thetaRad) * Math.cos(phiRad)
  const y = 130 - radius * Math.cos(thetaRad) - 24 * Math.sin(thetaRad) * Math.sin(phiRad)

  return (
    <svg className="bloch" viewBox="0 0 260 260" role="img" aria-label="Visualisasi Bloch sphere">
      <defs>
        <radialGradient id="sphere" cx="38%" cy="34%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity=".2" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity=".02" />
        </radialGradient>
        <linearGradient id="vector" x1="0" x2="1">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <circle cx="130" cy="130" r="94" fill="url(#sphere)" stroke="currentColor" strokeOpacity=".25" />
      <ellipse cx="130" cy="130" rx="94" ry="29" fill="none" stroke="currentColor" strokeOpacity=".22" strokeDasharray="5 5" />
      <path d="M130 36V224M36 130H224" stroke="currentColor" strokeOpacity=".16" />
      <text x="138" y="31">|0⟩</text>
      <text x="138" y="239">|1⟩</text>
      <line x1="130" y1="130" x2={x} y2={y} stroke="url(#vector)" strokeWidth="4" strokeLinecap="round" />
      <circle cx={x} cy={y} r="7" fill="#f8fafc" stroke="#f472b6" strokeWidth="3" />
      <circle cx="130" cy="130" r="4" fill="#22d3ee" />
    </svg>
  )
}

export function QuantumLab() {
  const [theta, setTheta] = useState(90)
  const [phi, setPhi] = useState(0)
  const [measurement, setMeasurement] = useState(null)
  const p0 = Math.cos((theta * Math.PI) / 360) ** 2
  const p1 = 1 - p0

  const measure = () => setMeasurement(Math.random() < p0 ? 0 : 1)
  const reset = () => {
    setTheta(90)
    setPhi(0)
    setMeasurement(null)
  }

  return (
    <section className="lab-grid quantum-grid" aria-labelledby="quantum-title">
      <div>
        <div className="section-kicker">Interactive experiment 02</div>
        <h2 id="quantum-title">Putar state, lalu ukur qubit</h2>
        <p className="lead">
          State ditulis sebagai <strong>|ψ⟩ = cos(θ/2)|0⟩ + e<sup>iφ</sup> sin(θ/2)|1⟩</strong>.
          Panah menyimpan amplitudo dan relative phase sebelum measurement.
        </p>

        <div className="sliders">
          <label>
            <span>Polar angle θ <b>{theta}°</b></span>
            <input type="range" min="0" max="180" value={theta} onChange={(event) => {
              setTheta(Number(event.target.value))
              setMeasurement(null)
            }} />
          </label>
          <label>
            <span>Phase φ <b>{phi}°</b></span>
            <input type="range" min="0" max="360" value={phi} onChange={(event) => {
              setPhi(Number(event.target.value))
              setMeasurement(null)
            }} />
          </label>
        </div>

        <div className="probability-panel">
          <ProbabilityBar label="P(0)" value={p0} color="cyan" />
          <ProbabilityBar label="P(1)" value={p1} color="pink" />
        </div>

        <div className="action-row">
          <button className="primary-button" onClick={measure}><Dices size={18} /> Measure</button>
          <button className="ghost-button" onClick={reset}><RotateCcw size={18} /> Reset</button>
        </div>

        {measurement !== null && (
          <div className="measurement-result" role="status">
            Hasil klasik: <strong>{measurement}</strong>
            <span>State sesudah pengukuran menjadi |{measurement}⟩.</span>
          </div>
        )}
      </div>

      <article className="sphere-card">
        <BlochSphere theta={theta} phi={phi} />
        <div className="state-readout">
          <span>Amplitude |0⟩</span><b>{Math.sqrt(p0).toFixed(3)}</b>
          <span>Amplitude |1⟩</span><b>{Math.sqrt(p1).toFixed(3)}</b>
          <span>Relative phase</span><b>{phi}°</b>
        </div>
      </article>
    </section>
  )
}

function ProbabilityBar({ label, value, color }) {
  return (
    <div className="probability">
      <div><span>{label}</span><strong>{(value * 100).toFixed(1)}%</strong></div>
      <div className="bar-track"><span className={color} style={{ width: `${value * 100}%` }} /></div>
    </div>
  )
}

export function ComputingLab() {
  const [phase, setPhase] = useState(0)
  const constructive = (1 + Math.cos((phase * Math.PI) / 180)) / 2

  return (
    <section className="lab-grid" aria-labelledby="computing-title">
      <div>
        <div className="section-kicker">Interactive experiment 03</div>
        <h2 id="computing-title">Interference adalah mesin seleksi</h2>
        <p className="lead">
          Quantum algorithm bukan mencoba semua jawaban lalu membacanya sekaligus. Gates
          menyusun interference agar amplitudo jawaban berguna menguat dan yang lain melemah.
        </p>

        <label className="phase-control">
          <span>Relative phase <b>{phase}°</b></span>
          <input type="range" min="0" max="360" value={phase} onChange={(event) => setPhase(Number(event.target.value))} />
        </label>

        <div className="wave-stage">
          <div className="wave wave-a" style={{ '--shift': `${phase}deg` }} />
          <div className="wave wave-b" />
          <div className="interference-meter">
            <span>Resulting intensity</span>
            <strong>{(constructive * 100).toFixed(0)}%</strong>
          </div>
        </div>
      </div>

      <article className="circuit-card">
        <span className="mini-label">Quantum circuit</span>
        <div className="circuit-line">
          <b>|0⟩</b><i /><span>H</span><i /><span>U<sub>φ</sub></span><i /><span>H</span><i /><em />
        </div>
        <ol>
          <li><b>Prepare</b><span>Mulai dari state yang diketahui.</span></li>
          <li><b>Transform</b><span>Hadamard membuat superposition.</span></li>
          <li><b>Interfere</b><span>Phase menentukan penguatan atau pembatalan.</span></li>
          <li><b>Measure</b><span>Keluarkan bit klasik.</span></li>
        </ol>
      </article>
    </section>
  )
}

export function ShorLab() {
  const [n, setN] = useState(15)
  const [a, setA] = useState(2)
  const [step, setStep] = useState(1)
  const result = useMemo(() => shorResult(a, n), [a, n])
  const residues = useMemo(() => buildResidues(a, n, Math.min(n, 16)), [a, n])

  const changeN = (value) => {
    const nextN = Number(value)
    setN(nextN)
    setA(shorOptions[nextN][0])
    setStep(1)
  }

  return (
    <section className="shor-lab" aria-labelledby="shor-title">
      <div className="shor-heading">
        <div>
          <div className="section-kicker">Interactive experiment 04</div>
          <h2 id="shor-title">Shor’s algorithm, langkah demi langkah</h2>
          <p className="lead">
            Pilih bilangan komposit kecil. Visualisasi ini menghitung bagian klasik secara nyata
            dan menyederhanakan quantum period finding agar konsepnya terlihat.
          </p>
        </div>
        <div className="demo-badge"><Sparkles size={16} /> Educational simulation</div>
      </div>

      <div className="shor-controls">
        <label>
          Bilangan N
          <select value={n} onChange={(event) => changeN(event.target.value)}>
            {Object.keys(shorOptions).map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          Basis acak a
          <select value={a} onChange={(event) => { setA(Number(event.target.value)); setStep(1) }}>
            {shorOptions[n].map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <button className="primary-button" onClick={() => setStep((current) => Math.min(4, current + 1))}>
          {step === 4 ? 'Selesai' : 'Lanjutkan'} <ArrowRight size={18} />
        </button>
        <button className="ghost-button" onClick={() => setStep(1)}><RotateCcw size={18} /> Ulang</button>
      </div>

      <div className="stepper">
        {['Pilih basis', 'Cek GCD', 'Cari periode', 'Ekstrak faktor'].map((label, index) => (
          <button key={label} className={step >= index + 1 ? 'step active' : 'step'} onClick={() => setStep(index + 1)}>
            <span>{step > index + 1 ? <Check size={15} /> : index + 1}</span>{label}
          </button>
        ))}
      </div>

      <div className="shor-workspace">
        <div className="process-panel">
          <ProcessStep visible={step >= 1} number="1" title="Pilih a">
            Kita mencoba <b>a = {a}</b> untuk memfaktorkan <b>N = {n}</b>.
          </ProcessStep>
          <ProcessStep visible={step >= 2} number="2" title="Classical pre-check">
            gcd({a}, {n}) = <b>{gcd(a, n)}</b>. {gcd(a, n) === 1 ? 'Lanjut ke period finding.' : 'Faktor sudah ditemukan tanpa quantum step.'}
          </ProcessStep>
          <ProcessStep visible={step >= 3} number="3" title="Quantum core: period finding">
            <Circuit />
            <p>Register quantum mencari pola berulang dari f(x) = {a}<sup>x</sup> mod {n}. Grafik di samping menampilkan polanya.</p>
          </ProcessStep>
          <ProcessStep visible={step >= 4} number="4" title="Classical post-processing">
            <Result result={result} a={a} n={n} />
          </ProcessStep>
        </div>

        <div className="period-card">
          <div className="period-title">
            <div><span className="mini-label">Modular function</span><h3>f(x) = {a}<sup>x</sup> mod {n}</h3></div>
            {result.period && <span className="period-pill">period r = {result.period}</span>}
          </div>
          <div className="residue-chart">
            {residues.map(({ x, value }) => (
              <div className="residue-column" key={x}>
                <div className="residue-bar" style={{ height: `${20 + (value / n) * 130}px` }}>
                  <span>{value}</span>
                </div>
                <small>{x}</small>
              </div>
            ))}
          </div>
          <div className="axis-label">exponent x →</div>
        </div>
      </div>

      <div className="reality-note">
        <Gauge size={22} />
        <div>
          <b>Apa yang disederhanakan?</b>
          <p>
            Browser ini mencari r secara klasik supaya ringan. Pada Shor yang sesungguhnya,
            modular exponentiation, superposition, dan inverse Quantum Fourier Transform
            digunakan untuk mengekstrak informasi periode secara probabilistik.
          </p>
        </div>
      </div>
    </section>
  )
}

function ProcessStep({ visible, number, title, children }) {
  return (
    <article className={visible ? 'process-step visible' : 'process-step'}>
      <span className="process-number">{number}</span>
      <div><h3>{title}</h3><div className="process-copy">{visible ? children : 'Jalankan langkah sebelumnya untuk membuka.'}</div></div>
    </article>
  )
}

function Circuit() {
  return (
    <div className="mini-circuit" aria-label="Diagram rangkaian konseptual Shor">
      <b>|0…0⟩</b><i /><span>H<sup>⊗n</sup></span><i /><span>U<sub>f</sub></span><i /><span>QFT<sup>−1</sup></span><i /><em />
    </div>
  )
}

function Result({ result, a, n }) {
  if (result.type === 'success') {
    return (
      <div className="factor-result success">
        <span>r = {result.period}; a<sup>r/2</sup> mod N = {result.halfPower}</span>
        <strong>{n} = {result.factors[0]} × {result.factors[1]}</strong>
        <small>gcd({a}<sup>{result.period / 2}</sup> − 1, {n}) dan gcd({a}<sup>{result.period / 2}</sup> + 1, {n})</small>
      </div>
    )
  }
  if (result.type === 'lucky') {
    return <div className="factor-result success"><span>{result.message}</span><strong>{n} = {result.factors[0]} × {result.factors[1]}</strong></div>
  }
  return <div className="factor-result retry"><Zap size={18} /><span>{result.message}</span></div>
}
