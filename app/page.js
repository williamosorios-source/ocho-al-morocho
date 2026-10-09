'use client';

import React, { useState } from 'react';

// Tipos de cartas/fichas del juego (4 de cada tipo = 52 cartas)
const TIPOS_CARTAS = [
  { id: 'venganza', titulo: 'Venganza', explicacion: 'Guarda esta carta. Puedes usarla en cualquier momento para poner un reto, regla o castigo a una persona o al grupo.' },
  { id: 'tomas_vos', titulo: 'Tomas Vos', explicacion: 'Te toca tomar un trago inmediatamente.' },
  { id: 'yo_nunca', titulo: 'Yo Nunca He', explicacion: "Inicia una ronda de 'Yo nunca he...'. Quien lo haya hecho o pierda, toma." },
  { id: 'nueva_regla', titulo: 'Nueva Regla', explicacion: 'Escribe o impón una nueva regla que aplique para todos hasta el final del juego.' },
  { id: 'al_brinco', titulo: 'Al Brinco', explicacion: 'Obtienes el poder del brinco. En cualquier momento que saltes, todos deben saltar; el último toma.' },
  { id: 'al_que_veis', titulo: 'Al que Veis', explicacion: 'Mira fijamente a alguien de la mesa. La persona a la que mires tiene que tomar.' },
  { id: 'pum_pum', titulo: 'Pum Pum', explicacion: "Di un número del 1 al 9. Cuenten en orden omitiendo ese número y sus múltiplos diciendo 'pum pum'. Quien se equivoque toma." },
  { id: 'al_morocho', titulo: 'Al Morocho', explicacion: 'Toma la persona con la tez más morena del grupo.' },
  { id: 'al_se_mueva', titulo: 'Al que se Mueva', explicacion: 'Todos se quedan estatuas excepto tú. El primero que se mueva toma.' },
  { id: 'el_juez', titulo: 'El Juez', explicacion: 'Debes tomar un trago y servir un trago en el vaso central del Juez.' },
  { id: 'pasa', titulo: 'Pasa', explicacion: 'Te salvaste por este turno. No tienes que hacer nada.' },
  { id: 'barquito', titulo: 'Barquito de Papel', explicacion: "Cultura chupística: empiecen diciendo 'En mi barquito de papel llevo...'. El que pierda o repita, toma." },
  { id: 'vaso_lleno', titulo: 'Vaso Lleno', explicacion: '¡Te tocó la peor parte! Tienes que tomarte un vaso completo.' }
];

function crearMazo() {
  let mazo = [];
  TIPOS_CARTAS.forEach((tipo) => {
    for (let i = 0; i < 4; i++) {
      mazo.push({ ...tipo, instanceId: `${tipo.id}-${i}-${Math.random()}` });
    }
  });
  for (let i = mazo.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
  }
  return mazo;
}

export default function OchoAlMorocho() {
  const [fase, setFase] = useState('REGISTRO');
  const [jugadores, setJugadores] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  
  const [mazo, setMazo] = useState([]);
  const [turnoIndex, setTurnoIndex] = useState(0);
  const [cartaActual, setCartaActual] = useState(null);
  const [venganzas, setVenganzas] = useState({});
  const [reglaActiva, setReglaActiva] = useState('');
  const [inputRegla, setInputRegla] = useState('');
  const [brincoActivo, setBrincoActivo] = useState('');

  const [juezNombre, setJuezNombre] = useState('');
  const [letrasJuezCount, setLetrasJuezCount] = useState(0);
  const [mostrarModalJuez, setMostrarModalJuez] = useState(false);

  const agregarJugador = (e) => {
    e.preventDefault();
    if (nuevoNombre.trim() && jugadores.length < 12) {
      if (!jugadores.includes(nuevoNombre.trim())) {
        setJugadores([...jugadores, nuevoNombre.trim()]);
        setNuevoNombre('');
      }
    }
  };

  const eliminarJugador = (nombre) => {
    setJugadores(jugadores.filter((j) => j !== nombre));
  };

  const iniciarJuego = () => {
    if (jugadores.length < 2) return;
    const nuevoMazo = crearMazo();
    const venganzasIniciales = {};
    jugadores.forEach((j) => (venganzasIniciales[j] = 0));

    setMazo(nuevoMazo);
    setVenganzas(venganzasIniciales);
    setTurnoIndex(0);
    setFase('INICIO_TURNO');
  };

  const jugadorActual = jugadores[turnoIndex] || '';

  const iniciarTurno = () => {
    setCartaActual(null);
    setInputRegla('');
    setFase('SACAR_CARTA');
  };

  const sacarCarta = () => {
    if (mazo.length === 0) return;

    const mazoCopia = [...mazo];
    const carta = mazoCopia.pop();
    setMazo(mazoCopia);
    setCartaActual(carta);

    if (carta.id === 'venganza') {
      setVenganzas((prev) => ({
        ...prev,
        [jugadorActual]: (prev[jugadorActual] || 0) + 1,
      }));
    } else if (carta.id === 'al_brinco') {
      setBrincoActivo(jugadorActual);
    } else if (carta.id === 'el_juez') {
      if (!juezNombre) {
        setJuezNombre(jugadorActual);
      }
      
      const nuevoConteo = letrasJuezCount + 1;
      setLetrasJuezCount(nuevoConteo);

      if (nuevoConteo === 4) {
        setMostrarModalJuez(true);
      }
    }
  };

  const usarVenganza = (nombre) => {
    if (venganzas[nombre] > 0) {
      setVenganzas((prev) => ({ ...prev, [nombre]: prev[nombre] - 1 }));
    }
  };

  const guardarRegla = () => {
    if (inputRegla.trim()) {
      setReglaActiva(`${inputRegla.trim()} (por ${jugadorActual})`);
      setInputRegla('');
    }
  };

  const finalizarTurno = () => {
    const siguienteIndex = (turnoIndex + 1) % jugadores.length;
    setTurnoIndex(siguienteIndex);
    setFase('TRANSICION');
  };

  const rebarajar = () => {
    setMazo(crearMazo());
  };

  const resetearJuez = () => {
    setLetrasJuezCount(0);
    setJuezNombre('');
    setMostrarModalJuez(false);
  };

  const letrasJUEZ = ['J', 'U', 'E', 'Z'];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between p-4 max-w-md mx-auto font-sans shadow-xl">
      <header className="text-center my-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          OCHO <span className="text-amber-500">AL MOROCHO</span>
        </h1>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">
          Juego de cartas para fiesta
        </p>
      </header>

      {(reglaActiva || brincoActivo) && (
        <div className="space-y-2 mb-3">
          {reglaActiva && (
            <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl text-xs text-amber-900 font-medium">
              📌 <strong>Regla Activa:</strong> {reglaActiva}
            </div>
          )}
          {brincoActivo && (
            <div className="bg-blue-50 border border-blue-300 p-2.5 rounded-xl text-xs text-blue-900 font-medium">
              ⚡ <strong>Poder del Brinco:</strong> {brincoActivo}
            </div>
          )}
        </div>
      )}

      {fase === 'REGISTRO' && (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 my-auto">
          <h2 className="text-lg font-bold text-center text-slate-800 mb-4">
            Registrar Jugadores (2 - 12)
          </h2>
          <form onSubmit={agregarJugador} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Nombre del jugador"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-sm active:scale-95 transition"
            >
              Añadir
            </button>
          </form>

          <ul className="space-y-2 mb-6 max-h-48 overflow-y-auto">
            {jugadores.map((j, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                <span>{j}</span>
                <button
                  onClick={() => eliminarJugador(j)}
                  className="text-red-500 font-bold px-2 text-xs"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={iniciarJuego}
            disabled={jugadores.length < 2}
            className={`w-full py-3.5 rounded-2xl font-black text-white text-center transition ${
              jugadores.length >= 2
                ? 'bg-amber-500 shadow-lg shadow-amber-200 active:scale-95'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            ¡COMENZAR JUEGO!
          </button>
        </div>
      )}

      {fase === 'INICIO_TURNO' && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 my-auto text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Turno de
          </p>
          <h2 className="text-3xl font-black text-slate-900 mb-6">{jugadorActual}</h2>
          <button
            onClick={iniciarTurno}
            className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-200 active:scale-95 transition text-lg"
          >
            INICIAR TURNO
          </button>
        </div>
      )}

      {fase === 'SACAR_CARTA' && (
        <div className="flex flex-col items-center my-auto w-full">
          {!cartaActual ? (
            <div
              onClick={sacarCarta}
              className="w-full aspect-[3/4] max-w-[260px] bg-slate-900 rounded-3xl shadow-2xl border-4 border-amber-400 flex flex-col justify-center items-center cursor-pointer active:scale-95 transition group p-4 text-center"
            >
              <div className="w-16 h-16 rounded-2xl border-2 border-amber-400 flex items-center justify-center mb-3">
                <span className="text-amber-400 font-black text-2xl">8</span>
              </div>
              <p className="text-white font-black text-lg">TOCA PARA SACAR CARTA</p>
              <p className="text-xs text-slate-400 mt-2">
                Cartas restantes: {mazo.length} / 52
              </p>
            </div>
          ) : (
            <div className="w-full bg-white rounded-3xl p-6 shadow-xl border-2 border-slate-200 text-center animate-fade-in">
              <span className="inline-block bg-amber-100 text-amber-800 font-black px-3 py-1 rounded-full text-xs uppercase mb-3">
                {cartaActual.titulo}
              </span>
              <h3 className="text-2xl font-black text-slate-900 mb-3">
                {cartaActual.titulo}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                {cartaActual.explicacion}
              </p>

              {cartaActual.id === 'nueva_regla' && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Escribe la regla aquí..."
                    value={inputRegla}
                    onChange={(e) => setInputRegla(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mb-2 focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={guardarRegla}
                    className="w-full bg-slate-900 text-white font-bold py-2 rounded-xl text-xs"
                  >
                    Guardar Regla
                  </button>
                </div>
              )}

              <button
                onClick={finalizarTurno}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl shadow-md active:scale-95 transition"
              >
                FINALIZAR TURNO
              </button>
            </div>
          )}
        </div>
      )}

      {fase === 'TRANSICION' && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 my-auto text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Pásale el teléfono a:
          </p>
          <h2 className="text-3xl font-black text-slate-900 mb-6">{jugadorActual}</h2>
          <button
            onClick={iniciarTurno}
            className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-200 active:scale-95 transition text-lg"
          >
            INICIAR TURNO
          </button>
        </div>
      )}

      {fase !== 'REGISTRO' && (
        <div className="mt-4 bg-white p-3 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 mb-2">Cartas de Venganza:</p>
          <div className="flex flex-wrap gap-2">
            {jugadores.map((j) => (
              <div
                key={j}
                className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl text-xs font-semibold"
              >
                <span>{j}:</span>
                <span className="font-bold text-amber-600">{venganzas[j] || 0}</span>
                {venganzas[j] > 0 && (
                  <button
                    onClick={() => usarVenganza(j)}
                    className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ml-1"
                  >
                    Usar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {fase !== 'REGISTRO' && (
        <footer className="mt-3 bg-slate-900 text-white p-4 rounded-2xl text-center shadow-lg">
          <div className="text-xs font-semibold text-slate-400 mb-1">
            {juezNombre ? `Juez de la partida: ${juezNombre}` : 'Aún no hay Juez asignado'}
          </div>
          <div className="flex justify-center gap-3 my-2">
            {letrasJUEZ.map((letra, index) => {
              const encendida = index < letrasJuezCount;
              return (
                <div
                  key={letra}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl transition-all duration-300 ${
                    encendida
                      ? 'bg-amber-500 text-slate-900 scale-110 shadow-lg shadow-amber-500/50'
                      : 'bg-slate-800 text-slate-600 border border-slate-700'
                  }`}
                >
                  {letra}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400">
            {mazo.length === 0 ? (
              <button onClick={rebarajar} className="text-amber-400 underline font-bold">
                ¡Mazo agotado! Toca aquí para rebarajar 52 fichas.
              </button>
            ) : (
              `Cartas restantes en mazo: ${mazo.length}`
            )}
          </p>
        </footer>
      )}

      {mostrarModalJuez && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full border-4 border-amber-500 shadow-2xl">
            <div className="text-4xl mb-2">👑🍷</div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              ¡PALABRA JUEZ COMPLETA!
            </h3>
            <p className="text-sm text-slate-700 font-medium leading-relaxed mb-6">
              El Juez <strong>{juezNombre}</strong> DEBE TOMARSE TODO EL VASO ACUMULADO.
            </p>
            <button
              onClick={resetearJuez}
              className="w-full bg-amber-500 text-white font-black py-3 rounded-xl shadow-md active:scale-95 transition"
            >
              ¡CUMPLIDO! REINICIAR JUEZ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
