import { useState } from 'react'
import { ArrowDown, BookOpen, Code2, Menu, X } from 'lucide-react'
import { ClassicalLab, ComputingLab, QuantumLab, ShorLab } from './components/Labs'
import { modules, sources } from './data/content'
import Benchmark from './components/Benchmark'

const labs = {
  classical: ClassicalLab,
  physics: QuantumLab,
  computing: ComputingLab,
  shor: ShorLab,
}

export default function App() {
  const [active, setActive] = useState('classical')
  const [menuOpen, setMenuOpen] = useState(false)
  const ActiveLab = labs[active]
  const activeIndex = modules.findIndex((module) => module.id === active)

  const selectModule = (id) => {
    setActive(id)
    setMenuOpen(false)
    window.requestAnimationFrame(() => {
      document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const next = () => {
    const nextModule = modules[(activeIndex + 1) % modules.length]
    selectModule(nextModule.id)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Qubit Trail home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>QUBIT TRAIL<small>Classical → Quantum</small></span>
        </a>
        <nav className={menuOpen ? 'topnav open' : 'topnav'}>
          <a href="#journey" onClick={() => setMenuOpen(false)}>Learning path</a>
          <a href="#lab" onClick={() => setMenuOpen(false)}>Lab</a>
          <a href="#sources" onClick={() => setMenuOpen(false)}>Sources</a>
          <a className="github-link" href="https://github.com/rifqironanda/computing_and_quantum" target="_blank" rel="noreferrer"><Code2 size={16} /> GitHub</a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Buka menu">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span /> An interactive learning journey</div>
            <h1>Dari sakelar transistor<br />menuju <em>quantum algorithm.</em></h1>
            <p>
              Pelajari hubungan antara fenomena fisika, representasi informasi, dan komputasi.
              Ubah parameter, lihat akibatnya, lalu bedah cara Shor mengubah factoring menjadi period finding.
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}>
                Mulai perjalanan <ArrowDown size={18} />
              </button>
              <span>4 modul · simulasi langsung · tanpa login</span>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one"><i /></div>
            <div className="orbit orbit-two"><i /></div>
            <div className="quantum-core"><span>ψ</span></div>
            <div className="floating-code code-one">|ψ⟩ = α|0⟩ + β|1⟩</div>
            <div className="floating-code code-two">P(i) = |αᵢ|²</div>
            <div className="grid-plane" />
          </div>
        </section>

        <section className="journey-section" id="journey">
          <div className="section-heading">
            <div><span className="section-kicker">Conceptual bridge</span><h2>Satu alur, empat lapisan pemahaman</h2></div>
            <p>Fisika menyediakan fenomena. Computer science menyusunnya menjadi representasi, operasi, dan algoritma.</p>
          </div>

          <div className="module-grid">
            {modules.map((module, index) => {
              const Icon = module.icon
              return (
                <button className={active === module.id ? `module-card ${module.color} selected` : `module-card ${module.color}`} key={module.id} onClick={() => selectModule(module.id)}>
                  <span className="module-number">0{index + 1}</span>
                  <span className="module-icon"><Icon /></span>
                  <span className="module-eyebrow">{module.eyebrow}</span>
                  <strong>{module.label}</strong>
                  <p>{module.summary}</p>
                  <span className="explore">Eksplorasi <ArrowDown size={15} /></span>
                </button>
              )
            })}
          </div>

          <div className="bridge-strip">
            <span>Physical state</span><i>→</i><span>Information</span><i>→</i><span>Logic & gates</span><i>→</i><span>Algorithm</span>
          </div>
        </section>

        <section className={`active-lab theme-${modules[activeIndex].color}`} id="lab">
          <div className="lab-header">
            <span>MODUL 0{activeIndex + 1} / 04</span>
            <div className="progress"><i style={{ width: `${((activeIndex + 1) / modules.length) * 100}%` }} /></div>
            <span>{modules[activeIndex].label}</span>
          </div>
          <ActiveLab />
          {active === 'shor' && <Benchmark />}
          <button className="next-module" onClick={next}>
            <span>{activeIndex === modules.length - 1 ? 'Kembali ke awal' : 'Modul berikutnya'}</span>
            <strong>{modules[(activeIndex + 1) % modules.length].label}</strong>
            <ArrowDown size={20} />
          </button>
        </section>

        <section className="principles">
          <div className="section-heading">
            <div><span className="section-kicker">Mental model</span><h2>Perbedaan yang perlu dijaga</h2></div>
          </div>
          <div className="comparison-table">
            <div className="table-head"><span>Konsep</span><span>Classical</span><span>Quantum</span></div>
            <div><b>State dasar</b><span>Bit: 0 atau 1</span><span>Qubit: vector amplitudo kompleks</span></div>
            <div><b>Operasi</b><span>Boolean logic gates</span><span>Unitary quantum gates</span></div>
            <div><b>Hasil</b><span>Dapat dibaca langsung</span><span>Measurement memberi sampel klasik</span></div>
            <div><b>Kekuatan</b><span>General-purpose, stabil</span><span>Speedup untuk struktur masalah tertentu</span></div>
          </div>
        </section>

        <section className="sources" id="sources">
          <div>
            <BookOpen />
            <span className="section-kicker">Read further</span>
            <h2>Sumber utama untuk memeriksa konsep</h2>
            <p>Visual membantu intuisi, tetapi definisi formal tetap perlu dibaca dari materi ilmiah dan dokumentasi resmi.</p>
          </div>
          <div className="source-list">
            {sources.map((source, index) => (
              <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                <span>0{index + 1}</span><b>{source.label}</b><ArrowDown size={17} />
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <span>Qubit Trail · Built for careful curiosity</span>
        <span>Simulasi edukatif — bukan quantum hardware emulator.</span>
      </footer>
    </div>
  )
}
