/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/** Si vale "true", el paseo no se abre solo al entrar. Se puede volver a abrir desde «Guía». */
export const TOUR_HIDDEN_KEY = "metabolix_tour_hidden";

interface TourStep {
  /** Elemento que se resalta. Sin selector, la tarjeta sale centrada. */
  sel?: string;
  /** Vista que tiene que estar abierta para ver el elemento. */
  view?: string;
  title: string;
  text: string;
}

const STEPS: TourStep[] = [
  {
    title: "Bienvenida a Metabolix",
    text: "Metabolix dibuja el metabolismo de una célula como un mapa de carreteras. En un minuto te enseño dónde está cada cosa.",
  },
  {
    sel: "#map", view: "mapa",
    title: "El mapa",
    text: "Cada ruta es una carretera de su color. El grosor indica cuánto flujo pasa y las partículas, hacia dónde. Arrastra para moverte y usa la rueda o pellizca para acercarte.",
  },
  {
    sel: '#map path.hit[data-rx="rx_pfk1"]', view: "mapa",
    title: "Toca una enzima o un metabolito",
    text: "Se abre su ficha: la reacción, su ΔG°′, quién la regula y por qué importa en clínica. Las enzimas con ★ son puntos de control.",
  },
  {
    sel: ".mc-states", view: "mapa",
    title: "Estado fisiológico",
    text: "Cambia entre postprandial, ayuno, ejercicio… y mira qué carreteras se abren y cuáles se cortan.",
  },
  {
    sel: "#predict-toggle", view: "mapa",
    title: "Predecir primero",
    text: "Actívalo para decidir tú qué rutas se encienden antes de verlo en el mapa. Con «Ver directamente», el mapa cambia al momento.",
  },
  {
    sel: ".mc-tissue", view: "mapa",
    title: "Tejido",
    text: "Elige hígado, músculo, cerebro, eritrocito… para ver qué rutas tiene cada uno.",
  },
  {
    sel: "#pw-chips", view: "mapa",
    title: "Aislar una ruta",
    text: "Toca una ruta para quedarte solo con ella en el mapa. Vuelve a tocarla para ver todo otra vez.",
  },
  {
    sel: ".search",
    title: "Buscador",
    text: "Escribe una enzima, un metabolito o una ruta y el mapa te lleva hasta ella.",
  },
  {
    sel: ".tabs",
    title: "Otras vistas",
    text: "Tejidos compara órganos, Ciclos muestra el ciclo de Cori, la urea y las lanzaderas, y Balances calcula el ATP paso a paso.",
  },
  {
    sel: 'button[data-view="misiones"]',
    title: "Misiones",
    text: "Lleva una molécula de un punto a otro del mapa eligiendo la carretera en cada cruce. Los fallos te dicen por qué no se puede pasar.",
  },
  {
    sel: 'button[data-view="reto"]',
    title: "Reto",
    text: "Ocho preguntas que se responden tocando el mapa. Cada acierto suma puntos, cada fallo resta, y hay un ranking de clase.",
  },
  {
    sel: "#btn-hdr-flashcard",
    title: "Flashcards",
    text: "Oculta los nombres del mapa para repasar de memoria.",
  },
  {
    sel: "#btn-student",
    title: "Acceso alumno",
    text: "Regístrate para guardar tu progreso y aparecer en el ranking.",
  },
  {
    sel: "#cite-box", view: "mapa",
    title: "Cómo citar Metabolix",
    text: "Si usas Metabolix en un trabajo o en clase, aquí tienes la referencia lista para copiar.",
  },
  {
    sel: "#btn-guide",
    title: "Vuelve cuando quieras",
    text: "Este botón abre otra vez el recorrido.",
  },
];

const PAD = 6;        // margen del resalte alrededor del elemento
const ARROW = 54;     // espacio que ocupa la flecha entre el elemento y la tarjeta
const EDGE = 12;      // distancia mínima a los bordes de la pantalla

type Side = "below" | "above" | "right" | "left" | "inside";
interface Layout {
  hole: { x: number; y: number; w: number; h: number } | null;
  card: { x: number; y: number };
  arrow: { x: number; y: number; rot: number } | null;
}

function visibleTarget(sel?: string): HTMLElement | SVGElement | null {
  if (!sel) return null;
  const el = document.querySelector(sel) as HTMLElement | null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  const cs = getComputedStyle(el as Element);
  if (cs.display === "none" || cs.visibility === "hidden") return null;
  if ((el as HTMLElement).closest?.("[hidden]")) return null;
  return el;
}

function computeLayout(target: Element | null, cw: number, ch: number): Layout {
  const vw = window.innerWidth, vh = window.innerHeight;
  const clampX = (x: number) => Math.max(EDGE, Math.min(vw - cw - EDGE, x));
  const clampY = (y: number) => Math.max(EDGE, Math.min(vh - ch - EDGE, y));
  if (!target) return { hole: null, card: { x: clampX((vw - cw) / 2), y: clampY((vh - ch) / 2) }, arrow: null };

  const r = target.getBoundingClientRect();
  const hole = {
    x: Math.max(2, r.left - PAD), y: Math.max(2, r.top - PAD),
    w: Math.min(vw - 4, r.width + PAD * 2), h: Math.min(vh - 4, r.height + PAD * 2),
  };
  const hx = hole.x + hole.w / 2, hy = hole.y + hole.h / 2;
  const space = { below: vh - (hole.y + hole.h), above: hole.y, right: vw - (hole.x + hole.w), left: hole.x };
  const need = ARROW + EDGE;

  let side: Side;
  if (space.below >= ch + need) side = "below";
  else if (space.above >= ch + need) side = "above";
  else if (space.right >= cw + need) side = "right";
  else if (space.left >= cw + need) side = "left";
  else side = "inside";

  if (side === "below" || side === "above") {
    const cardY = side === "below" ? hole.y + hole.h + ARROW : hole.y - ARROW - ch;
    const ax = Math.max(EDGE + 20, Math.min(vw - EDGE - 20, hx));
    const ay = side === "below" ? hole.y + hole.h + ARROW / 2 : hole.y - ARROW / 2;
    return { hole, card: { x: clampX(hx - cw / 2), y: cardY }, arrow: { x: ax, y: ay, rot: side === "below" ? -90 : 90 } };
  }
  if (side === "right" || side === "left") {
    const cardX = side === "right" ? hole.x + hole.w + ARROW : hole.x - ARROW - cw;
    const ay = Math.max(EDGE + 20, Math.min(vh - EDGE - 20, hy));
    const ax = side === "right" ? hole.x + hole.w + ARROW / 2 : hole.x - ARROW / 2;
    return { hole, card: { x: cardX, y: clampY(hy - ch / 2) }, arrow: { x: ax, y: ay, rot: side === "right" ? 180 : 0 } };
  }
  // el elemento ocupa casi toda la pantalla (el mapa): tarjeta abajo y flecha hacia arriba
  const cardY = vh - ch - EDGE;
  return { hole, card: { x: clampX((vw - cw) / 2), y: cardY }, arrow: { x: vw / 2, y: cardY - ARROW / 2 + 6, rot: -90 } };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView?: (view: string) => void;
}

export function GuidedTour({ isOpen, onClose, onNavigateToView }: Props) {
  const [idx, setIdx] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>(STEPS);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [dontShow, setDontShow] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Element | null>(null);

  // al abrir: empieza desde el principio y recuerda la casilla
  useEffect(() => {
    if (!isOpen) return;
    setIdx(0);
    setSteps(STEPS);
    try { setDontShow(localStorage.getItem(TOUR_HIDDEN_KEY) === "true"); } catch { /* sin almacenamiento */ }
    onNavigateToView?.("mapa");
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = useCallback(() => {
    try {
      if (dontShow) localStorage.setItem(TOUR_HIDDEN_KEY, "true");
      else localStorage.removeItem(TOUR_HIDDEN_KEY);
    } catch { /* sin almacenamiento */ }
    setLayout(null);
    // al salir, el mapa directamente: entero, a la vista y con las pestañas al principio
    try {
      const tabs = document.querySelector(".tabs"); if (tabs) tabs.scrollLeft = 0;
      const show = (window as any).metabolixShowMap;
      if (typeof show === "function") show(); else onNavigateToView?.("mapa");
    } catch { onNavigateToView?.("mapa"); }
    onClose();
  }, [dontShow, onClose, onNavigateToView]);

  const place = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    const t = targetRef.current;
    setLayout(computeLayout(t && document.contains(t) ? t : null, card.offsetWidth, card.offsetHeight));
  }, []);

  // cambia de paso: abre la vista, busca el elemento y lo trae a la pantalla
  useLayoutEffect(() => {
    if (!isOpen) return;
    const step = steps[idx];
    if (!step) return;
    let cancelled = false;
    if (step.view) onNavigateToView?.(step.view);
    const settle = () => {
      if (cancelled) return;
      const t = visibleTarget(step.sel);
      if (step.sel && !t) {
        // el elemento no está en esta pantalla (por ejemplo, en móvil): se salta el paso
        setSteps(prev => prev.filter(s => s !== step));
        return;
      }
      targetRef.current = t;
      if (t) {
        const r = t.getBoundingClientRect();
        const off = r.top < 70 || r.bottom > window.innerHeight - 70 || r.left < 0 || r.right > window.innerWidth;
        if (off) (t as HTMLElement).scrollIntoView?.({ block: "center", inline: "center", behavior: "instant" as ScrollBehavior });
      }
      requestAnimationFrame(place);
    };
    const tm = window.setTimeout(settle, step.view ? 280 : 30);
    return () => { cancelled = true; window.clearTimeout(tm); };
  }, [isOpen, idx, steps, onNavigateToView, place]);

  // si se pasa del final al quitar pasos invisibles
  useEffect(() => { if (idx > steps.length - 1) setIdx(Math.max(0, steps.length - 1)); }, [steps, idx]);

  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => place();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") setIdx(i => Math.min(steps.length - 1, i + 1));
      else if (e.key === "ArrowLeft") setIdx(i => Math.max(0, i - 1));
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, place, close, steps.length]);

  useEffect(() => { if (isOpen) cardRef.current?.focus(); }, [isOpen, idx]);

  if (!isOpen) return null;
  const step = steps[Math.min(idx, steps.length - 1)];
  const last = idx >= steps.length - 1;
  const hole = layout?.hole;

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {/* velo oscuro con un hueco sobre el elemento explicado */}
      {hole
        ? <div className="tour-hole" style={{ left: hole.x, top: hole.y, width: hole.w, height: hole.h }} />
        : <div className="tour-veil" />}
      {layout?.arrow && (
        <svg className="tour-arrow" width="46" height="46" viewBox="0 0 46 46" aria-hidden="true"
          style={{ left: layout.arrow.x - 23, top: layout.arrow.y - 23, transform: `rotate(${layout.arrow.rot}deg)` }}>
          <g className="tour-arrow-g">
            <path d="M40 23H10" />
            <path d="M20 11 8 23l12 12" />
          </g>
        </svg>
      )}
      <div
        ref={cardRef}
        className="tour-card"
        tabIndex={-1}
        style={layout ? { left: layout.card.x, top: layout.card.y } : { left: -9999, top: 0 }}
      >
        <div className="tour-top">
          <span className="tour-count">{idx + 1} de {steps.length}</span>
          <button type="button" className="tour-x" onClick={close} aria-label="Cerrar el recorrido">✕</button>
        </div>
        <h2 id="tour-title" className="tour-title">{step.title}</h2>
        <p className="tour-text">{step.text}</p>
        <div className="tour-dots" aria-hidden="true">
          {steps.map((_, i) => <i key={i} className={i === idx ? "on" : i < idx ? "done" : ""} />)}
        </div>
        <div className="tour-foot">
          <label className="tour-check">
            <input type="checkbox" checked={dontShow} onChange={e => setDontShow(e.target.checked)} />
            <span>No volver a mostrar al entrar</span>
          </label>
          <div className="tour-btns">
            {idx > 0
              ? <button type="button" className="tour-btn" onClick={() => setIdx(i => i - 1)}>Anterior</button>
              : <button type="button" className="tour-btn ghost" onClick={close}>Saltar</button>}
            <button type="button" className="tour-btn pri" onClick={() => (last ? close() : setIdx(i => i + 1))}>
              {idx === 0 ? "Empezar" : last ? "Terminar" : "Siguiente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
