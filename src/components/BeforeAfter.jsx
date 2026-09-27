import { useRef, useState } from 'react'
import { MoveHorizontal } from 'lucide-react'

const JOBS = [
  {
    id: 'seat',
    label: 'Leather seat',
    before: '/images/seat-before.webp',
    after: '/images/seat-after.webp',
    pos: '50% 55%',
    title: 'Mildewed leather, brought back',
    text: 'Surface growth lifted from the bolsters and perforations, then the leather cleaned and conditioned back to an even, factory-dark finish.'
  },
  {
    id: 'door',
    label: 'Door panel',
    before: '/images/door-before.webp',
    after: '/images/door-after.webp',
    pos: '72% 50%',
    title: 'Scuffed trim, factory-fresh again',
    text: 'Dust and scuffing cleared from the cloth insert, armrest and switch panel with a full interior surface wipe-down.'
  }
]

export default function BeforeAfter() {
  const [jobId, setJobId] = useState('seat')
  const [pos, setPos] = useState(50)
  const frame = useRef(null)
  const dragging = useRef(false)
  const job = JOBS.find((j) => j.id === jobId)

  const setFromX = (clientX) => {
    const r = frame.current.getBoundingClientRect()
    const pct = ((clientX - r.left) / r.width) * 100
    setPos(Math.min(100, Math.max(0, pct)))
  }

  const onDown = (e) => {
    dragging.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setFromX(e.clientX)
  }
  const onMove = (e) => { if (dragging.current) setFromX(e.clientX) }
  const onUp = () => { dragging.current = false }

  const onKey = (e) => {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5))
    if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5))
  }

  return (
    <section id="results" className="section results">
      <div className="container results-grid">
        <div className="results-copy reveal">
          <p className="eyebrow eyebrow--light">Before &amp; After</p>
          <h2 className="h2 h2--light">Drag the line. <span className="metal-text">See the difference.</span></h2>

          <div className="results-toggle" role="tablist" aria-label="Choose a job">
            {JOBS.map((j) => (
              <button
                key={j.id}
                role="tab"
                aria-selected={jobId === j.id}
                className={jobId === j.id ? 'is-active' : ''}
                onClick={() => { setJobId(j.id); setPos(50) }}
              >
                {j.label}
              </button>
            ))}
          </div>

          <div className="results-note" key={job.id}>
            <h3>{job.title}</h3>
            <p>{job.text}</p>
          </div>
        </div>

        <div className="results-stage reveal">
          <div
            ref={frame}
            className="ba"
            style={{ touchAction: 'pan-y' }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <img src={job.before} alt={`${job.label} before detailing`} style={{ objectPosition: job.pos }} draggable="false" />
            <img
              src={job.after}
              alt={`${job.label} after detailing`}
              className="ba-after"
              style={{ objectPosition: job.pos, clipPath: `inset(0 0 0 ${pos}%)` }}
              draggable="false"
            />
            <span className="ba-tag ba-tag--before">Before</span>
            <span className="ba-tag ba-tag--after">After</span>
            <div className="ba-line" style={{ left: `${pos}%` }}>
              <button
                className="ba-handle"
                aria-label="Drag to compare before and after"
                role="slider"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(pos)}
                onKeyDown={onKey}
              >
                <MoveHorizontal size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
