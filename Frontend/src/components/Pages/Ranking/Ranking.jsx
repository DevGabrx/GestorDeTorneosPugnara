import { useEffect, useState } from 'react'
import { fetchTournaments, recordMatch } from '../../../api/tournaments.js'
import './Ranking.css'

function Ranking() {
	const [tournaments, setTournaments] = useState([])
	const [selectedId, setSelectedId] = useState('')
	const [points, setPoints] = useState({})
	const [participants, setParticipants] = useState([])
	const [winnerTag, setWinnerTag] = useState('')
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	const [notice, setNotice] = useState('')

	const survivalTournaments = tournaments.filter(
		(tournament) => tournament.mode === 'supervivencia',
	)
	const selectedTournament = survivalTournaments.find(
		(tournament) => tournament.id === selectedId,
	)
	const players = selectedTournament?.players ?? []
	const matches = selectedTournament?.matches ?? []

	useEffect(() => {
		async function loadTournaments() {
			setLoading(true)
			setError('')
			try {
				const data = await fetchTournaments()
				const survival = data.filter((tournament) => tournament.mode === 'supervivencia')
				setTournaments(data)
				const firstTournament = survival[0]
				if (firstTournament) {
					setSelectedId(firstTournament.id)
					setPoints(Object.fromEntries((firstTournament.players ?? []).map((player) => [player.tag, '0'])))
					setParticipants((firstTournament.players ?? []).map((player) => player.tag))
				}
			} catch (err) {
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}

		loadTournaments()
	}, [])

	function handleTournamentChange(event) {
		const nextId = event.target.value
		const nextTournament = survivalTournaments.find((tournament) => tournament.id === nextId)
		const nextPlayers = nextTournament?.players ?? []
		setSelectedId(nextId)
		setPoints(Object.fromEntries(nextPlayers.map((player) => [player.tag, '0'])))
		setParticipants(nextPlayers.map((player) => player.tag))
		setWinnerTag('')
		setNotice('')
	}

	const totals = new Map()
	for (const player of players) {
		totals.set(player.tag, {
			...player,
			points: 0,
			wins: 0,
			games: 0,
		})
	}
	for (const match of matches) {
		for (const result of match.results) {
			const total = totals.get(result.tag)
			if (!total) continue
			total.points += result.points
			total.games += 1
			if (result.isWinner) total.wins += 1
		}
	}
	const ranking = [...totals.values()].sort(
		(a, b) => b.points - a.points || b.wins - a.wins || a.name.localeCompare(b.name),
	)

	function toggleParticipant(tag) {
		const next = participants.includes(tag)
			? participants.filter((playerTag) => playerTag !== tag)
			: [...participants, tag]
		setParticipants(next)
		if (!next.includes(winnerTag)) setWinnerTag('')
	}

	async function handleSubmit(event) {
		event.preventDefault()
		if (!selectedTournament || !winnerTag || participants.length === 0) return

		setSaving(true)
		setError('')
		setNotice('')
		try {
			const updated = await recordMatch(
				selectedTournament.id,
				participants.map((tag) => ({
					tag,
					points: Number(points[tag] ?? 0),
					isWinner: tag === winnerTag,
				})),
			)
			setTournaments((current) =>
				current.map((tournament) => tournament.id === updated.id ? updated : tournament),
			)
			setNotice('Partida guardada. El ranking ya está actualizado.')
			setPoints(Object.fromEntries(players.map((player) => [player.tag, '0'])))
			setParticipants(players.map((player) => player.tag))
			setWinnerTag('')
		} catch (err) {
			setError(err.message)
		} finally {
			setSaving(false)
		}
	}

	return (
		<main className="ranking-page">
			<header className="ranking-heading">
				<p className="ranking-kicker">BRAWL STARS / SUPERVIVENCIA</p>
				<h1>Control de partidas</h1>
				<p>Registra el resultado de cada partida y consulta la clasificación acumulada.</p>
			</header>

			{loading ? <p className="ranking-state">Cargando torneos…</p> : null}
			{error ? <p className="ranking-alert" role="alert">{error}</p> : null}

			{!loading && survivalTournaments.length === 0 ? (
				<section className="ranking-empty">
					<span className="ranking-empty-mark" aria-hidden="true">0</span>
					<h2>No hay torneos de Supervivencia</h2>
					<p>Crea primero un torneo en modalidad Supervivencia para empezar a registrar partidas.</p>
				</section>
			) : null}

			{selectedTournament ? (
				<>
					<section className="ranking-toolbar" aria-label="Seleccionar torneo">
						<label htmlFor="ranking-tournament">Torneo activo</label>
						<select
							id="ranking-tournament"
							value={selectedId}
							  onChange={handleTournamentChange}
						>
							{survivalTournaments.map((tournament) => (
								<option key={tournament.id} value={tournament.id}>{tournament.name}</option>
							))}
						</select>
						<span className="ranking-match-count">{matches.length} {matches.length === 1 ? 'partida' : 'partidas'}</span>
					</section>

					<div className="ranking-columns">
						<section className="ranking-section ranking-entry">
							<div className="ranking-section-heading">
								<div>
									<p className="ranking-kicker">NUEVO RESULTADO</p>
									<h2>Registrar partida</h2>
								</div>
								<span className="ranking-step">{String(matches.length + 1).padStart(2, '0')}</span>
							</div>

							{players.length === 0 ? (
								<p className="ranking-state">Agrega jugadores al torneo antes de registrar resultados.</p>
							) : (
								<form onSubmit={handleSubmit}>
									<div className="result-table-wrap">
										<table className="result-table">
											<thead>
												<tr>
													<th>Jugador</th>
													<th>Juega</th>
													<th>Puntos</th>
													<th>Ganador</th>
												</tr>
											</thead>
											<tbody>
												{players.map((player) => {
													const isParticipating = participants.includes(player.tag)
													return (
														<tr key={player.tag}>
															<td>
																<strong>{player.name}</strong>
																<span>{player.tag}</span>
															</td>
															<td>
																<input
																	type="checkbox"
																	checked={isParticipating}
																	onChange={() => toggleParticipant(player.tag)}
																	aria-label={`Incluir a ${player.name} en la partida`}
																/>
															</td>
															<td>
																<input
																	className="points-input"
																	type="number"
																	min="0"
																	step="1"
																	value={points[player.tag] ?? '0'}
																	onChange={(event) => setPoints((current) => ({
																		...current,
																		[player.tag]: event.target.value,
																	}))}
																	disabled={!isParticipating}
																	aria-label={`Puntos de ${player.name}`}
																/>
															</td>
															<td>
																<input
																	type="radio"
																	name={`winner-${selectedId}`}
																	checked={winnerTag === player.tag}
																	onChange={() => setWinnerTag(player.tag)}
																	disabled={!isParticipating}
																	aria-label={`Marcar a ${player.name} como ganador`}
																/>
															</td>
														</tr>
													)
												})}
											</tbody>
										</table>
									</div>
									<div className="ranking-form-footer">
										<p>Selecciona los participantes, sus puntos y un único ganador.</p>
										<button className="btn-solid" type="submit" disabled={saving || !winnerTag || participants.length === 0}>
											{saving ? 'Guardando…' : 'Guardar partida'}
										</button>
									</div>
								</form>
							)}
							{notice ? <p className="ranking-notice" role="status">{notice}</p> : null}
						</section>

						<section className="ranking-section ranking-standings">
							<div className="ranking-section-heading">
								<div>
									<p className="ranking-kicker">CLASIFICACIÓN</p>
									<h2>Ranking general</h2>
								</div>
								<span className="ranking-player-count">{players.length} jugadores</span>
							</div>
							{ranking.length ? (
								<ol className="standings-list">
									{ranking.map((player, index) => (
										<li key={player.tag} className={index === 0 && player.points > 0 ? 'is-leader' : ''}>
											<span className="standing-position">{String(index + 1).padStart(2, '0')}</span>
											<div className="standing-player">
												<strong>{player.name}</strong>
												<span>{player.wins} victorias · {player.games} partidas</span>
											</div>
											<strong className="standing-points">{player.points}<span> pts</span></strong>
										</li>
									))}
								</ol>
							) : (
								<p className="ranking-state">No hay jugadores inscritos.</p>
							)}
						</section>
					</div>

					<section className="ranking-section ranking-history">
						<div className="ranking-section-heading">
							<div>
								<p className="ranking-kicker">REGISTRO</p>
								<h2>Partidas recientes</h2>
							</div>
						</div>
						{matches.length === 0 ? (
							<p className="ranking-state">Todavía no se han registrado partidas.</p>
						) : (
							<ol className="match-history">
								{[...matches].reverse().map((match, index) => {
									const winner = match.results.find((result) => result.isWinner)
									return (
										<li key={match.id}>
											<span className="history-number">#{String(matches.length - index).padStart(2, '0')}</span>
											<div>
												<strong>{winner?.name ?? 'Sin ganador'}</strong>
												<span>Ganador · {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(match.playedAt))}</span>
											</div>
											<span className="history-results">
												{match.results.map((result) => `${result.name}: ${result.points} pts`).join(' · ')}
											</span>
										</li>
									)
								})}
							</ol>
						)}
					</section>
				</>
			) : null}
		</main>
	)
}

export default Ranking
