'use client';

import React, { useState } from 'react';

// Tipos de cartas/fichas del juego (54 cartas en total)
const TIPOS_CARTAS = [
  { id: 'venganza', numero: '', titulo: 'Venganza', cantidad: 4, explicacion: 'Guarda esta carta. Puedes usarla en cualquier momento para poner un reto, regla o castigo a una persona o al grupo.' },
  { id: 'tomas_vos', numero: '2', titulo: 'Tomas Vos', cantidad: 4, explicacion: 'Te toca tomar un trago inmediatamente.' },
  { id: 'yo_nunca', numero: '3', titulo: 'Yo Nunca He', cantidad: 4, explicacion: "Inicia una ronda de 'Yo nunca he...'. Quien lo haya hecho o pierda, toma." },
  { id: 'nueva_regla', numero: '4', titulo: 'Nueva Regla', cantidad: 4, explicacion: 'Escribe o impón una nueva regla que aplique para todos hasta el final del juego.' },
  { id: 'al_brinco', numero: '5', titulo: 'Al Brinco', cantidad: 4, explicacion: 'Obtienes el poder del brinco. En cualquier momento que saltes, todos deben saltar; el último toma.' },
  { id: 'al_que_veis', numero: '6', titulo: 'Al que Veis', cantidad: 4, explicacion: 'Mira fijamente a alguien de la mesa. La persona a la que mires tiene que tomar.' },
  { id: 'pum_pum', numero: '7', titulo: 'Pum Pum', cantidad: 4, explicacion: "Di un número del 1 al 9. Cuenten en orden omitiendo ese número y diciendo 'pum pum'. Quien se equivoque toma." },
  { id: 'al_morocho', numero: '8', titulo: 'Al Morocho', cantidad: 4, explicacion: 'Toma la persona más morena del grupo.' },
  { id: 'al_se_mueva', numero: '9', titulo: 'Al que se Mueva', cantidad: 4, explicacion: 'Todos se quedan estatuas excepto tú. El primero que se mueva toma.' },
  { id: 'el_juez', numero: '10', titulo: 'El Juez', cantidad: 4, explicacion: 'Debes tomar un trago y servir un trago en el vaso central del Juez.' },
  { id: 'pasa', numero: '', titulo: 'Pasa', cantidad: 2, explicacion: 'Te salvaste por este turno. No tienes que hacer nada.' },
  { id: 'barquito', numero: '', titulo: 'Barquito de Papel', cantidad: 4, explicacion: "Cultura chupística: empiecen diciendo 'En mi barquito de papel llevo...'. El que pierda o repita, toma." },
  { id: 'vaso_lleno', numero: '', titulo: 'Vaso Lleno', cantidad: 4, explicacion: '¡Te tocó la peor parte! Tienes que tomarte un vaso completo.' },
  { id: 'guerra_tragos', numero: '', titulo: 'Guerra de Tragos', cantidad: 4, explicacion: 'Elige a un rival para jugar un Piedra, Papel o Tijera rápido. El perdedor se toma un trago.' }
];

// Sugerencias divertidas para la carta "Nueva Regla"
const SUGERENCIAS_REGLAS = [
  "Prohibido decir 'Sí' o 'No'",
  "Tomar solo con la mano no dominante",
  "Hablar con acento extranjero obligado",
  "Prohibido decir nombres propios",
  "Nadie puede tocar el celular excepto para el juego",
  "Decir 'salud' antes de cada trago o castigo"
];

function crearMazo() {
  let mazo = [];
  TIPOS_CARTAS.forEach((tipo) => {
    for (let i = 0; i < tipo.cantidad; i++) {
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
  const [fase, setFase] = useState('REGISTRO'); // 'REGISTRO' | 'BIENVENIDA' | 'INICIO_TURNO' | 'SACAR_CARTA' | 'TRANSICION'
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
  
  // Modales de UI
  const [mostrarReglasGenerales, setMostrarReglasGenerales] = useState(false);

  // --- REGISTRO DE JUGADORES ---
  const agregarJugador = (e) => {
    e.preventDefault();
    if (nuevoNombre.trim()) {
      if (!jugadores.includes(nuevoNombre.trim())) {
        setJugadores([...jugadores, nuevoNombre.trim()]);
        setNuevoNombre('');
      }
    }
  };

  const eliminarJugador = (nombre) => {
    setJugadores(jugadores.filter((j) => j !== nombre));
  };

  const irABienvenida = () => {
    if (jugadores.length < 2) return;
    const nuevoMazo = crearMazo();
    const venganzasIniciales = {};
    jugadores.forEach((j) => (venganzasIniciales[j] = 0));

    setMazo(nuevoMazo);
    setVenganzas(venganzasIniciales);
    setTurnoIndex(0);
    setFase('BIENVENIDA');
  };

  const comenzarPartidaOficial = () => {
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

  const guardarRegla = (texto) => {
    const reglaAInsertar = texto || inputRegla;
    if (reglaAInsertar.trim()) {
      setReglaActiva(`${reglaAInsertar.trim()} (por ${jugadorActual})`);
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
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between p-4 max-w-md mx-auto font-sans shadow-xl relative">
      
      {/* HEADER / LOGO CON BOTÓN DE REGLAS */}
      <header className="flex items-center justify-between my-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">
            OCHO <span className="text-amber-500">AL MOROCHO</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
            Juego social para fiesta
          </p>
        </div>
        <button
          onClick={() => setMostrarReglasGenerales(true)}
          className="bg-slate-900 text-amber-400 text-xs font-black px-3 py-2 rounded-xl shadow active:scale-95 transition flex items-center gap-1"
        >
          📖 Reglas
        </button>
      </header>

      {/* REGLA ACTIVA Y PODER DEL BRINCO */}
      {(reglaActiva || brincoActivo) && (
        <div className="space-y-2 mb-2">
          {reglaActiva && (
            <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl text-xs text-amber-900 font-medium flex justify-between items-center">
              <span>📌 <strong>Regla Activa:</strong> {reglaActiva}</span>
            </div>
          )}
          {brincoActivo && (
            <div className="bg-blue-50 border border-blue-300 p-2.5 rounded-xl text-xs text-blue-900 font-medium">
              ⚡ <strong>Poder del Brinco:</strong> {brincoActivo}
            </div>
          )}
        </div>
      )}

      {/* FASE 1: REGISTRO DE JUGADORES */}
      {fase === 'REGISTRO' && (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 my-auto">
          <h2 className="text-lg font-bold text-center text-slate-800 mb-1">
            Registrar Jugadores
          </h2>
          <p className="text-xs text-slate-400 text-center mb-4">
            Mínimo 2 participantes
          </p>
          
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
            onClick={irABienvenida}
            disabled={jugadores.length < 2}
            className={`w-full py-3.5 rounded-2xl font-black text-white text-center transition ${
              jugadores.length >= 2
                ? 'bg-amber-500 shadow-lg shadow-amber-200 active:scale-95'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            ¡COMENZAR JUEGO ({jugadores.length})!
          </button>
        </div>
      )}

      {/* FASE INTERMEDIA: BIENVENIDA Y REGLAS RÁPIDAS */}
      {fase === 'BIENVENIDA' && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-amber-400 my-auto text-center animate-fade-in">
          <div className="text-4xl mb-3">🍻🔥</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            ¡ESTÁS A PUNTO DE EMPEZAR OCHO AL MOROCHO!
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-4 font-medium">
            El objetivo es simple: <strong>divertirse, cumplir los retos y beber con responsabilidad.</strong>
          </p>
          <div className="bg-amber-50 p-3 rounded-2xl text-left text-xs text-slate-700 space-y-2 mb-6 border border-amber-200">
            <p>⚡ <strong>Turnos pasados:</strong> Al terminar tu carta, pásale el teléfono a quien corresponda.</p>
            <p>👑 <strong>El Juez:</strong> Quien saque la 1ª carta de Juez servirá un vaso central. ¡Al completarse la palabra <strong>J-U-E-Z</strong>, se lo toma todo!</p>
            <p>🎯 <strong>Venganza:</strong> Si te sale una Venganza, guárdala para usarla en cualquier momento.</p>
          </div>
          <button
            onClick={comenzarPartidaOficial}
            className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-200 active:scale-95 transition text-lg"
          >
            ¡ENTENDIDO, A JUGAR!
          </button>
        </div>
      )}

      {/* FASE 2: INICIO DE TURNO */}
      {fase === 'INICIO_TURNO' && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 my-auto text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Es el turno de
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

      {/* FASE 3: SACAR CARTA */}
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
                Fichas restantes: {mazo.length} / 54
              </p>
            </div>
          ) : (
            <div className="w-full bg-white rounded-3xl p-5 shadow-xl border-2 border-slate-200 text-center animate-fade-in">
              <span className="inline-block bg-amber-100 text-amber-800 font-black px-3 py-1 rounded-full text-xs uppercase mb-1">
                {cartaActual.numero ? `CARTA ${cartaActual.numero}` : 'ESPECIAL'}
              </span>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                {cartaActual.numero ? `${cartaActual.numero} - ${cartaActual.titulo}` : cartaActual.titulo}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 font-medium">
                {cartaActual.explicacion}
              </p>

              {/* OPCIONES / SUGERENCIAS PARA "NUEVA REGLA" */}
              {cartaActual.id === 'nueva_regla' && (
                <div className="mb-4 text-left bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-500 mb-2">
                    Escribe una regla o elige una idea rápida:
                  </p>
                  <div className="flex gap-1.5 mb-2">
                    <input
                      type="text"
                      placeholder="Tu regla personalizada..."
                      value={inputRegla}
                      onChange={(e) => setInputRegla(e.target.value)}
                      className="flex-1 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={() => guardarRegla()}
                      className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                    >
                      Guardar
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase">Sugerencias rápidas:</p>
                  <div className="flex flex-wrap gap-1">
                    {SUGERENCIAS_REGLAS.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => guardarRegla(sug)}
                        className="bg-white border border-slate-200 text-[10px] text-slate-700 font-semibold px-2 py-1 rounded-lg hover:bg-amber-50 active:scale-95 transition"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
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

      {/* FASE 4: TRANSICION */}
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

      {/* CONTROL DE CARTAS DE VENGANZA */}
      {fase !== 'REGISTRO' && fase !== 'BIENVENIDA' && (
        <div className="mt-3 bg-white p-3 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 mb-1.5">Cartas de Venganza acumuladas:</p>
          <div className="flex flex-wrap gap-1.5">
            {jugadores.map((j) => (
              <div
                key={j}
                className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl text-xs font-semibold"
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

      {/* MÓDULO DEL JUEZ (PALABRA J-U-E-Z) */}
      {fase !== 'REGISTRO' && fase !== 'BIENVENIDA' && (
        <footer className="mt-3 bg-slate-900 text-white p-3.5 rounded-2xl text-center shadow-lg">
          <div className="text-xs font-semibold text-slate-400 mb-1">
            {juezNombre ? `Juez actual: ${juezNombre}` : 'Aún no hay Juez asignado'}
          </div>
          <div className="flex justify-center gap-2.5 my-1.5">
            {letrasJUEZ.map((letra, index) => {
              const encendida = index < letrasJuezCount;
              return (
                <div
                  key={letra}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg transition-all duration-300 ${
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
                ¡Mazo agotado! Toca aquí para rebarajar las 54 fichas.
              </button>
            ) : (
              `Fichas en mazo: ${mazo.length} / 54`
            )}
          </p>
        </footer>
      )}

      {/* MODAL: GUÍA COMPLETA DE REGLAS DEL JUEGO */}
      {mostrarReglasGenerales && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full border-2 border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-black text-slate-900">📖 Reglas del Juego</h3>
              <button
                onClick={() => setMostrarReglasGenerales(false)}
                className="text-slate-400 font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-xs text-slate-700 font-medium">
              <p><strong>Total de cartas:</strong> 54 fichas con retos dinámicos.</p>
              
              <div className="border-t border-slate-100 pt-2">
                <p className="font-bold text-slate-900 mb-1">Mecánica del Juez:</p>
                <p>La 1ª persona que saque la carta "El Juez" se convierte en el Juez. Cada carta de Juez enciende una letra de la palabra <strong>J-U-E-Z</strong> y le agrega un trago al vaso central. ¡Quien complete la "Z" hace que el Juez se tome todo!</p>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <p className="font-bold text-slate-900 mb-1">Resumen de Cartas:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {TIPOS_CARTAS.map((c) => (
                    <li key={c.id}>
                      <strong>{c.numero ? `${c.numero} - ` : ''}{c.titulo} ({c.cantidad}):</strong> {c.explicacion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setMostrarReglasGenerales(false)}
              className="w-full mt-4 bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Cerrar y Volver al Juego
            </button>
          </div>
        </div>
      )}

      {/* MODAL ALERTA: PALABRA JUEZ COMPLETA */}
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
