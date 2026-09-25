import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchPlayer } from '../../api/brawlstars.js'
import {
  addPlayerToTournament,
  createTournament,
  fetchTournaments,
} from '../../api/tournaments.js'
import { modeById, TOURNAMENT_MODES } from '../../constants/tournamentModes.js'

function Creartorneo() {
  const [tournaments, setTournaments] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState(TOURNAMENT_MODES[0].id)
  const [matchCapacity, setMatchCapacity] = useState(
    TOURNAMENT_MODES[0].defaultMatchCapacity,
  )
  const [playerTag, setPlayerTag] = useState('')
  const [players, setPlayers] = useState([])
  const [addingToId, setAddingToId] = useState(null)
  const [extraTags, setExtraTags] = useState({})

  const selectedMode = useMemo(() => modeById(mode), [mode])

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

  function handleModeChange(nextModeId) {
    const nextMode = modeById(nextModeId)
    setMode(nextMode.id)
    setMatchCapacity(nextMode.defaultMatchCapacity)
  }

  async function handleAddPlayer(e) {
    e.preventDefault()
    const tag = playerTag.trim()
    if (!tag) return
    if (players.length >= Number(matchCapacity)) {
      setError(`El cupo de la partida es de ${matchCapacity} jugadores`)
      return
    }
    setLookingUp(true)
    setError('')
    try {
      const snapshot = await fetchPlayer(tag)
      const already = players.some(
        (player) => player.tag.toUpperCase() === snapshot.tag.toUpperCase(),
      )
      if (already) {
        setError(`El jugador ${snapshot.tag} ya está en la lista`)
        return
      }
      setPlayers((current) => [...current, snapshot])
      setPlayerTag('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLookingUp(false)
    }
  }

  function removeDraftPlayer(tag) {
    setPlayers((current) => current.filter((player) => player.tag !== tag))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await createTournament({
        name,
        mode,
        matchCapacity: Number(matchCapacity),
        playerTags: players.map((player) => player.tag),
      })
      setName('')
      setPlayerTag('')
      setPlayers([])
      setMode(TOURNAMENT_MODES[0].id)
      setMatchCapacity(TOURNAMENT_MODES[0].defaultMatchCapacity)
      await loadTournaments()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddExisting(tournamentId) {
    const tag = (extraTags[tournamentId] ?? '').trim()
    if (!tag) return
    setAddingToId(tournamentId)
    setError('')
    try {
      const updated = await addPlayerToTournament(tournamentId, tag)
      setTournaments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setExtraTags((current) => ({ ...current, [tournamentId]: '' }))
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingToId(null)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Crear torneo</h1>
        <p className="subtitle">
          Elige la modalidad, define el cupo de la partida y agrega jugadores
          de Brawl Stars por su tag.
        </p>
      </header>

      <section className="panel">
        <h2>Nuevo torneo</h2>
        <form className="tournament-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Copa Universidad"
              required
            />
          </label>

          <fieldset className="mode-fieldset">
            <legend>Modalidad</legend>
            <div className="mode-grid">
              {TOURNAMENT_MODES.map((item) => (
                <label
                  key={item.id}
                  className={`mode-option ${mode === item.id ? 'is-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={item.id}
                    checked={mode === item.id}
                    onChange={() => handleModeChange(item.id)}
                  />
                  <span className="mode-label">{item.label}</span>
                  <span className="mode-hint">{item.description}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            Cupo de la partida
            <input
              type="number"
              min={selectedMode.minMatchCapacity}
              max={selectedMode.maxMatchCapacity}
              value={matchCapacity}
              onChange={(e) => setMatchCapacity(e.target.value)}
              required
            />
            <span className="field-hint">
              {selectedMode.label}: una partida típica es de{' '}
              {selectedMode.typicalMatchSize} jugadores. Rango permitido:{' '}
              {selectedMode.minMatchCapacity}–{selectedMode.maxMatchCapacity}.
            </span>
          </label>

          <div className="player-adder">
            <label>
              Tag de Brawl Stars
              <input
                type="text"
                value={playerTag}
                onChange={(e) => setPlayerTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddPlayer(e)
                  }
                }}
                placeholder="#ABC123"
              />
            </label>
            <button
              type="button"
              onClick={handleAddPlayer}
              disabled={lookingUp || players.length >= Number(matchCapacity)}
            >
              {lookingUp ? 'Buscando…' : 'Agregar jugador'}
            </button>
          </div>

          {players.length > 0 ? (
            <ul className="draft-players">
              {players.map((player) => (
                <li key={player.tag} className="draft-player">
                  <div>
                    <strong>{player.name}</strong>
                    <span className="meta">
                      {' '}
                      {player.tag} · {player.trophies} trofeos
                    </span>
                  </div>
                  <button
                    type="button"
                    className="linkish"
                    onClick={() => removeDraftPlayer(player.tag)}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Aún no hay jugadores. Puedes crear el torneo y agregarlos después.</p>
          )}

          <p className="meta">
            Cupo: {players.length}/{matchCapacity}
          </p>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear torneo'}
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
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
                  <span className="badge">{t.status}</span>
                </div>
                <p className="meta">
                  {t.game} · {t.modeLabel ?? t.mode} · cupo {t.players?.length ?? 0}/
                  {t.matchCapacity}
                </p>
                {t.players?.length ? (
                  <ul className="player-list">
                    {t.players.map((player) => (
                      <li key={player.tag}>
                        <strong>{player.name}</strong> {player.tag}
                        <span className="meta"> · {player.trophies} trofeos</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="meta">Sin jugadores todavía.</p>
                )}
                {(t.players?.length ?? 0) < t.matchCapacity ? (
                  <div className="inline-add">
                    <input
                      type="text"
                      value={extraTags[t.id] ?? ''}
                      onChange={(e) =>
                        setExtraTags((current) => ({
                          ...current,
                          [t.id]: e.target.value,
                        }))
                      }
                      placeholder="#TAG"
                      aria-label={`Agregar jugador a ${t.name}`}
                    />
                    <button
                      type="button"
                      disabled={addingToId === t.id}
                      onClick={() => handleAddExisting(t.id)}
                    >
                      {addingToId === t.id ? 'Agregando…' : 'Agregar'}
                    </button>
                  </div>
                ) : (
                  <p className="meta">Cupo completo.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Creartorneo
