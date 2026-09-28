import React, { useState, useEffect } from 'react';

export default function Gestortorneo() {
  const [torneos, setTorneos] = useState([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);

  // Estado de las llaves del bracket
  const [bracket, setBracket] = useState({
    s1_1: null,
    s1_2: null,
    s2_1: null,
    s2_2: null,
    f_1: null,
    f_2: null,
    ganador: null,
  });

  // 1. Cargar los torneos guardados en Creartorneo.jsx desde LocalStorage (o API)
  useEffect(() => {
    const torneosGuardados = JSON.parse(localStorage.getItem('torneos')) || [];
    setTorneos(torneosGuardados);

    if (torneosGuardados.length > 0) {
      cargarTorneoEnBracket(torneosGuardados[0]);
    }
  }, []);

  // Cargar los participantes del torneo seleccionado en las casillas iniciales
  const cargarTorneoEnBracket = (torneo) => {
    setTorneoSeleccionado(torneo);
    const jugadores = torneo.players || [];

    setBracket({
      s1_1: jugadores[0] ? { id: '1', nombre: jugadores[0] } : null,
      s1_2: jugadores[1] ? { id: '2', nombre: jugadores[1] } : null,
      s2_1: jugadores[2] ? { id: '3', nombre: jugadores[2] } : null,
      s2_2: jugadores[3] ? { id: '4', nombre: jugadores[3] } : null,
      f_1: null,
      f_2: null,
      ganador: null,
    });
  };

  // 2. Definir ganador de cada enfrentamiento mediante Botón
  const avanzarGanador = (equipo, casillaDestino) => {
    if (!equipo) return;
    setBracket((prev) => ({
      ...prev,
      [casillaDestino]: equipo,
    }));
  };

  // Soporte para Drag & Drop manual si también quieren arrastrarlos
  const handleDragStart = (e, equipo) => {
    e.dataTransfer.setData('equipo', JSON.stringify(equipo));
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, casillaKey) => {
    e.preventDefault();
    const equipoData = e.dataTransfer.getData('equipo');
    if (!equipoData) return;
    setBracket((prev) => ({
      ...prev,
      [casillaKey]: JSON.parse(equipoData),
    }));
  };

  const limpiarCasilla = (casillaKey) => {
    setBracket((prev) => ({ ...prev, [casillaKey]: null }));
  };

  return (
    <div className="p-6 text-white bg-[#2F2F48] min-h-screen font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center text-[#DAF55B]">
        Gestor de Torneos y Brackets
      </h1>

      {/* SELECTOR DE TORNEOS REGISTRADOS */}
      <div className="mb-8 p-4 border border-[#F3F2F7]/20 rounded-xl bg-[#232336] max-w-xl mx-auto">
        <label className="block text-sm font-semibold mb-2 text-[#B99DFA]">
          Seleccionar Torneo Creado:
        </label>
        {torneos.length > 0 ? (
          <select
            onChange={(e) => {
              const t = torneos.find((item) => item.id.toString() === e.target.value);
              if (t) cargarTorneoEnBracket(t);
            }}
            className="w-full p-3 bg-[#2F2F48] border border-[#F3F2F7]/30 rounded-lg text-white focus:outline-none focus:border-[#8B5CF6]"
          >
            {torneos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name || t.nombre} ({t.mode || '4 Equipos'})
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-[#F57B5B]">
            No hay torneos registrados aún. Ve a <strong>Crear Torneo</strong> para agregar uno.
          </p>
        )}
      </div>

      {/* ARBOL DEL BRACKET */}
      <div className="flex items-center justify-center gap-10 overflow-x-auto py-6">
        
        {/* RONDA 1: SEMIFINALES */}
        <div className="flex flex-col justify-around h-[420px] gap-8">
          
          {/* Llave Semifinal 1 */}
          <div className="p-3 border border-[#F3F2F7]/10 rounded-xl bg-[#232336] flex flex-col gap-2">
            <span className="text-xs text-[#B99DFA] font-bold">Semifinal 1</span>
            <TarjetaEquipo
              equipo={bracket.s1_1}
              onDrop={(e) => handleDrop(e, 's1_1')}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onRemove={() => limpiarCasilla('s1_1')}
              onGano={() => avanzarGanador(bracket.s1_1, 'f_1')}
            />
            <TarjetaEquipo
              equipo={bracket.s1_2}
              onDrop={(e) => handleDrop(e, 's1_2')}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onRemove={() => limpiarCasilla('s1_2')}
              onGano={() => avanzarGanador(bracket.s1_2, 'f_1')}
            />
          </div>

          {/* Llave Semifinal 2 */}
          <div className="p-3 border border-[#F3F2F7]/10 rounded-xl bg-[#232336] flex flex-col gap-2">
            <span className="text-xs text-[#B99DFA] font-bold">Semifinal 2</span>
            <TarjetaEquipo
              equipo={bracket.s2_1}
              onDrop={(e) => handleDrop(e, 's2_1')}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onRemove={() => limpiarCasilla('s2_1')}
              onGano={() => avanzarGanador(bracket.s2_1, 'f_2')}
            />
            <TarjetaEquipo
              equipo={bracket.s2_2}
              onDrop={(e) => handleDrop(e, 's2_2')}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onRemove={() => limpiarCasilla('s2_2')}
              onGano={() => avanzarGanador(bracket.s2_2, 'f_2')}
            />
          </div>

        </div>

        {/* RONDA 2: FINAL */}
        <div className="flex flex-col justify-center h-[420px]">
          <div className="p-3 border border-[#8B5CF6]/30 rounded-xl bg-[#232336] flex flex-col gap-2">
            <span className="text-xs text-[#8B5CF6] font-bold">Gran Final</span>
            <TarjetaEquipo
              equipo={bracket.f_1}
              onDrop={(e) => handleDrop(e, 'f_1')}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onRemove={() => limpiarCasilla('f_1')}
              onGano={() => avanzarGanador(bracket.f_1, 'ganador')}
            />
            <TarjetaEquipo
              equipo={bracket.f_2}
              onDrop={(e) => handleDrop(e, 'f_2')}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onRemove={() => limpiarCasilla('f_2')}
              onGano={() => avanzarGanador(bracket.f_2, 'ganador')}
            />
          </div>
        </div>

        {/* CAMPEÓN */}
        <div className="flex flex-col justify-center items-center h-[420px]">
          <span className="text-sm font-bold text-[#DAF55B] uppercase mb-2">🏆 Campeón</span>
          <TarjetaEquipo
            equipo={bracket.ganador}
            onDrop={(e) => handleDrop(e, 'ganador')}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            onRemove={() => limpiarCasilla('ganador')}
            isGanador
          />
        </div>

      </div>
    </div>
  );
}

// Subcomponente de la Casilla con Botón de "Ganador"
function TarjetaEquipo({ equipo, onDrop, onDragOver, onDragStart, onRemove, onGano, isGanador }) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={`w-56 h-12 border rounded-lg flex items-center justify-between px-3 transition-all ${
        isGanador
          ? 'border-[#DAF55B] bg-[#DAF55B]/15 shadow-[0_0_15px_rgba(218,245,91,0.3)]'
          : 'border-[#F3F2F7]/30 bg-[#2F2F48]'
      }`}
    >
      {equipo ? (
        <>
          <span
            draggable
            onDragStart={(e) => onDragStart(e, equipo)}
            className={`font-semibold text-sm truncate cursor-grab active:cursor-grabbing ${
              isGanador ? 'text-[#DAF55B] text-base font-bold' : 'text-[#F3F2F7]'
            }`}
          >
            {equipo.nombre}
          </span>

          <div className="flex items-center gap-1">
            {!isGanador && onGano && (
              <button
                onClick={onGano}
                className="px-2 py-1 text-xs bg-[#5BF5C5] text-black font-bold rounded hover:bg-[#35d6b0] transition"
                title="Declarar ganador"
              >
                Gana ➔
              </button>
            )}
            <button
              onClick={onRemove}
              className="text-xs text-[#F57B5B] hover:text-red-400 font-bold px-1"
              title="Quitar"
            >
              ✕
            </button>
          </div>
        </>
      ) : (
        <span className="text-xs text-[#F3F2F7]/30 italic">Esperando equipo...</span>
      )}
    </div>
  );
}