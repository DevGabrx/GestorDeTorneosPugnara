import { useCallback, useEffect, useState } from 'react'
import { createTournament, fetchTournaments } from './api/tournaments.js'
import './App.css'

// index.css define .badge (forma) + un modificador de color: .badge-active,
// .badge-pending, .badge-cancelled, .badge-staff. Este helper elige el
// modificador según el texto de estado que venga del backend.
function statusBadgeClass(status) {
  const key = (status || '').toString().toLowerCase()
  if (key.includes('cancel')) return 'badge-cancelled'
  if (key.includes('open') || key.includes('activ') || key.includes('curso')) return 'badge-active'
  if (key.includes('final') || key.includes('cerrad') || key.includes('closed') || key.includes('complete')) {
    return 'badge-staff'
  }
  return 'badge-pending'
}

function App() {
  const [tournaments, setTournaments] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [maxTeams, setMaxTeams] = useState(8)
  const [captainTag, setCaptainTag] = useState('')

  const loadTournaments = useCallback(async () => {
    setLoadingList(true)
    setError('')
    try {
      const data = await fetchTournaments()
      setTournaments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    loadTournaments()
  }, [loadTournaments])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await createTournament({
        name,
        maxTeams: Number(maxTeams),
        captainTag: captainTag.trim() || undefined,
      })
      setName('')
      setCaptainTag('')
      setMaxTeams(8)
      await loadTournaments()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pugnara — Prototipo</h1>
        <p className="subtitle">
          Torneos en memoria + datos de jugador vía API de Brawl Stars
        </p>
      </header>

      <section className="panel">
        <h2>Crear torneo</h2>
        <form className="tournament-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              className="input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Copa Universidad"
              required
            />
          </label>
          <label>
            Cupo de equipos
            <input
              className="input"
              type="number"
              min={2}
              max={128}
              value={maxTeams}
              onChange={(e) => setMaxTeams(e.target.value)}
            />
          </label>
          <label>
            Tag del capitán (opcional)
            <input
              className="input"
              type="text"
              value={captainTag}
              onChange={(e) => setCaptainTag(e.target.value)}
              placeholder="#ABC123"
            />
          </label>
          <button className="btn btn-solid" type="submit" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear torneo'}
          </button>
        </form>
        {error ? <p className="alerta error">{error}</p> : null}
      </section>

      <section className="panel">
        <h2>Torneos</h2>
        {loadingList ? (
          <p className="muted">Cargando…</p>
        ) : tournaments.length === 0 ? (
          <p className="muted">Aún no hay torneos. Crea el primero arriba.</p>
        ) : (
          <ul className="tournament-list">
            {tournaments.map((t) => (
              <li key={t.id} className="tournament-card">
                <div className="card-head">
                  <strong>{t.name}</strong>
                  <span className={`badge ${statusBadgeClass(t.status)}`}>{t.status}</span>
                </div>
                <p className="meta">
                  {t.game} · hasta {t.maxTeams} equipos
                </p>
                {t.captainSnapshot ? (
                  <div className="captain">
                    <p>
                      Capitán:{' '}
                      <strong>{t.captainSnapshot.name}</strong> ({t.captainTag})
                    </p>
                    <p className="meta">
                      Trofeos: {t.captainSnapshot.trophies}
                      {t.captainSnapshot.favoriteBrawler?.name
                        ? ` · Favorito: ${t.captainSnapshot.favoriteBrawler.name}`
                        : ''}
                    </p>
                  </div>
                ) : t.captainTag ? (
                  <p className="meta">Tag: {t.captainTag}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App