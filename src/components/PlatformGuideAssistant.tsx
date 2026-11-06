/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";

import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  BookOpen,
  Layers,
  Flame,
  Activity,
  Award,
  Zap,
  HelpCircle,
  Map as MapIcon,
  Play,
  RotateCcw,
} from "lucide-react";

/** Si vale "true", el paseo no se abre solo al entrar. Se puede volver a abrir desde «Guía». */
export const TOUR_HIDDEN_KEY = "metabolix_tour_hidden";

interface PlatformGuideAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView?: (viewId: string) => void;
  isAutoTriggered?: boolean;
}

interface GuideStep {
  step: number;
  viewId?: string;
  title: string;
  kicker: string;
  icon: React.ReactNode;
  content: string;
  tips: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    step: 0,
    viewId: "mapa",
    kicker: "Primeros pasos",
    title: "Cómo funciona Metabolix",
    icon: <MapIcon className="w-5 h-5 text-[var(--accent)]" />,
    content:
      "Metabolix dibuja el metabolismo de una célula como un mapa de carreteras: cada ruta es una carretera, su anchura es el flujo y las enzimas reguladoras son las señales. En este recorrido verás cómo cambiar el estado fisiológico, comparar tejidos, calcular el ATP y ponerte a prueba con los retos.",
    tips: "Puedes volver a esta guía cuando quieras con el botón «Guía» de la barra superior.",
  },
  {
    step: 1,
    viewId: "mapa",
    kicker: "Paso 1 · Exploración visual",
    title: "El mapa celular interactivo y flujos metabólicos",
    icon: <Layers className="w-5 h-5 text-[var(--pw-glycolysis)]" />,
    content:
      "Metabolix representa una célula eucariota humana en un lienzo interactivo en vivo. El grosor y la luminosidad de las líneas indican la tasa de flujo metabólico en tiempo real, y las partículas vectoriales muestran la dirección del sustrato. Las estrellas (★) identifican las enzimas marcapasos clave sometidas a control alostérico y covalente (como PFK-1, ACC1, CPT-1 o Citrato sintasa).",
    tips: "Toca cualquier enzima o metabolito para ver su ficha. Puedes activar el 'Modo Flashcard ()' en el panel para ocultar nombres y memorizarlos activamente antes de revelarlos.",
  },
  {
    step: 2,
    viewId: "mapa",
    kicker: "Paso 2 · Dinámica hormonal",
    title: "Estados fisiológicos y reprogramación celular",
    icon: <Flame className="w-5 h-5 text-[var(--pw-gluconeogenesis)]" />,
    content:
      "En el raíl lateral puedes alternar entre cuatro condiciones fisiológicas cardinales: estado posprandial (alta insulina y lipogénesis activa), ayuno temprano (glucagón elevado y gluconeogénesis hepática), ayuno prolongado o cetogénico (máxima lipólisis y exportación de cuerpos cetónicos) y ejercicio vigoroso (glucólisis anaerobia). Los medidores hormonales y de carga energética se adaptan instantáneamente a cada situación.",
    tips: "Fíjate en cómo los medidores hormonales y de carga energética se adaptan automáticamente al estado seleccionado.",
  },
  {
    step: 3,
    viewId: "tejidos",
    kicker: "Paso 3 · Compartimentación tisular",
    title: "Especialización tisular y rutas universales",
    icon: <Activity className="w-5 h-5 text-[var(--pw-mito)]" />,
    content:
      "La pestaña 'Tejidos y rutas' permite discriminar entre las rutas metabólicas universales (glucólisis, ciclo de Krebs, cadena respiratoria y vía de las pentosas) y las especializaciones de cada órgano: la dotación enzimática completa del hepatocito (gluconeogénesis por G6Pasa, cetogénesis y ciclo de la urea), el eritrocito (dependiente al 100% de la vía anaerobia y pentosas fosfato para NADPH), o el músculo esquelético y miocardio de alta tasa oxidativa.",
    tips: "Usa el selector de tejidos para iluminar las enzimas expresadas y atenuar las ausentes en cada órgano.",
  },
  {
    step: 4,
    viewId: "balances",
    kicker: "Paso 4 · Rendimiento bioenergético",
    title: "Lanzaderas de NADH y balance de ATP",
    icon: <Zap className="w-5 h-5 text-[var(--accent)]" />,
    content:
      "La membrana mitocondrial interna es impermeable al NADH citosólico. En la pestaña 'Balances de ATP' puedes comparar cómo la lanzadera Malato-Aspartato (predominante en hígado, corazón y riñón) transfiere electrones al Complejo I rindiendo ~32 ATP netos por glucosa, mientras que la lanzadera Glicerol-3-Fosfato (típica de músculo rápido y cerebro) los entrega al Complejo III rindiendo ~30 ATP netos.",
    tips: "En la pestaña 'Balances de ATP' puedes alternar los botones MAS y G3P para observar la actualización en vivo del contador de ATP.",
  },
  {
    step: 5,
    viewId: "ciclos",
    kicker: "Paso 5 · Regulación recíproca",
    title: "Síntesis de Palmitato vs. β-Oxidación (No simultáneas)",
    icon: <Activity className="w-5 h-5 text-[var(--pw-lipid)]" />,
    content:
      "En la pestaña 'Ciclos y lanzaderas', el módulo de Lípidos ilustra el principio de mutua exclusión para impedir ciclos fútiles: la síntesis citosólica de palmitato genera Malonil-CoA estimulada por insulina. Este metabolito actúa como sensor alostérico maestro e inhibe fuertemente a la CPT-1 mitocondrial, impidiendo que los ácidos grasos entren a la matriz a oxidarse mientras se están sintetizando.",
    tips: "Usa las 3 variantes del módulo ('Regulación recíproca', '1. Síntesis' y '2. β-Oxidación') para ver la inhibición alostérica en acción.",
  },
  {
    step: 6,
    viewId: "mapa",
    kicker: "Paso 6 · Genética y cataratas",
    title: "Patología molecular: Galactosemias y galactitol",
    icon: <HelpCircle className="w-5 h-5 text-[var(--pw-mono)]" />,
    content:
      "Al pulsar sobre la vía de la galactosa o la enzima GALT, se analizan las implicaciones del déficit enzimático congénito: la acumulación de galactosa-1-P lesiona órganos diana y desvía el sustrato hacia la aldosa reductasa, sintetizando galactitol. Al ser impermeable y quedar atrapado en el cristalino, el galactitol retiene agua por ósmosis y precipita cataratas precoces.",
    tips: "La suite clínica incluye las pautas dietéticas de exclusión estricta de lactosa y fórmulas de soja/elementales.",
  },
  {
    step: 7,
    viewId: "reto",
    kicker: "Paso 7 · autoevaluación y feedback",
    title: "Modo reto de bioquímica general y encuesta",
    icon: <Award className="w-5 h-5 text-[var(--ok)]" />,
    content:
      "Pon a prueba tu razonamiento metabólico resolviendo preguntas sobre consecuencias celulares ante fallos enzimáticos. Puedes realizar hasta 3 retos formativos iniciales; tras el 3.º, cumplimentarás una breve encuesta de satisfacción (escala Likert del 1 al 5) para continuar desbloqueando retos ilimitados y registrar tu progreso académico en Ciencias de la Salud.",
    tips: "Al finalizar el reto, puedes pulsar en 'Encuesta' en la barra superior para registrar tu evaluación y comentarios.",
  },
];

export const PlatformGuideAssistant: React.FC<PlatformGuideAssistantProps> = ({
  isOpen,
  onClose,
  onNavigateToView,
  isAutoTriggered = false,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [mode, setMode] = useState<"tour" | "reference">("tour");
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // la casilla refleja lo que el alumno eligió la última vez
      try { setDontShowAgain(localStorage.getItem(TOUR_HIDDEN_KEY) === "true"); } catch {}
      // If auto-triggered on entry, start at step 0 (welcome card)
      if (isAutoTriggered) {
        setCurrentStepIndex(0);
      }
    }
  }, [isOpen, isAutoTriggered]);

  if (!isOpen) return null;

  const currentStep = GUIDE_STEPS[currentStepIndex];

  const handleClose = () => {
    try {
      if (dontShowAgain) localStorage.setItem(TOUR_HIDDEN_KEY, "true");
      else localStorage.removeItem(TOUR_HIDDEN_KEY);
    } catch {}
    onClose();
  };

  const handleNext = () => {
    if (currentStepIndex < GUIDE_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (onNavigateToView && GUIDE_STEPS[nextIdx].viewId) {
        onNavigateToView(GUIDE_STEPS[nextIdx].viewId!);
      }
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      if (onNavigateToView && GUIDE_STEPS[prevIdx].viewId) {
        onNavigateToView(GUIDE_STEPS[prevIdx].viewId!);
      }
    }
  };

  const handleGoToStep = (idx: number) => {
    setCurrentStepIndex(idx);
    if (onNavigateToView && GUIDE_STEPS[idx].viewId) {
      onNavigateToView(GUIDE_STEPS[idx].viewId!);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div
        className="w-full max-w-2xl rounded-[4px] border border-[var(--line)] bg-[var(--ink-1)] text-[var(--fg)] shadow-[0_24px_60px_-12px_var(--shadow)] overflow-hidden flex flex-col max-h-[92vh]"
        style={{ fontFamily: "var(--f-body)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] bg-[var(--ink-2)] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[3px] bg-[var(--accent)] text-white flex items-center justify-center">
              <MapIcon className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="guide-modal-title"
                className="text-[22px] font-bold leading-tight font-[family-name:var(--f-display)] text-[var(--fg)]"
              >
                {currentStepIndex === 0 ? "Bienvenida a Metabolix" : "Guía de Metabolix"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[var(--ink-3)] p-1 rounded-[4px] border border-[var(--line)] text-xs">
              <button
                type="button"
                onClick={() => setMode("tour")}
                className={`px-3 py-1 rounded-[4px] font-medium transition-all ${
                  mode === "tour"
                    ? "bg-[var(--ink-1)] text-[var(--fg)] shadow-none"
                    : "text-[var(--fg-dim)] hover:text-[var(--fg)]"
                }`}
              >
                Recorrido
              </button>
              <button
                type="button"
                onClick={() => setMode("reference")}
                className={`px-3 py-1 rounded-[4px] font-medium transition-all flex items-center gap-1 ${
                  mode === "reference"
                    ? "bg-[var(--ink-1)] text-[var(--fg)] shadow-none"
                    : "text-[var(--fg-dim)] hover:text-[var(--fg)]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Índice
              </button>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-[4px] flex items-center justify-center text-[var(--fg-faint)] hover:text-[var(--fg)] hover:bg-[var(--ink-3)] transition-colors ml-1"
              aria-label="Cerrar tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1 space-y-5">
          {mode === "tour" ? (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-between gap-1 text-xs">
                <span className="font-[family-name:var(--f-display)] text-[var(--accent)] font-bold">
                  {currentStep.step === 0 ? "Introducción" : `Paso ${currentStep.step} de ${GUIDE_STEPS.length - 1}`}
                </span>
                <div className="flex gap-1.5 flex-1 max-w-xs mx-4">
                  {GUIDE_STEPS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleGoToStep(i)}
                      className={`h-1.5 rounded-full flex-1 transition-all ${
                        i === currentStepIndex
                          ? "bg-[var(--accent)]"
                          : i < currentStepIndex
                          ? "bg-[var(--ok)]"
                          : "bg-[var(--ink-3)]"
                      }`}
                      aria-label={`Ir al paso ${i}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-[family-name:var(--f-display)] text-[var(--fg-faint)]">
                  {Math.round(((currentStepIndex) / (GUIDE_STEPS.length - 1)) * 100)}%
                </span>
              </div>

              {/* Step Card */}
              <div className="p-5 rounded-[4px] border border-[var(--line)] bg-[var(--ink-2)]/60 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-[4px] bg-[var(--ink-1)] border border-[var(--line)] flex items-center justify-center flex-shrink-0 shadow-none">
                    {currentStep.icon}
                  </div>
                  <div>
                    <span className="text-xs font-[family-name:var(--f-display)] text-[var(--fg-faint)] font-semibold">
                      {currentStep.kicker}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--fg)] font-[var(--f-display)] mt-0.5">
                      {currentStep.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-[var(--fg-dim)] leading-relaxed">
                  {currentStep.content}
                </p>

                <div className="p-3.5 rounded-[4px] bg-[var(--ink-1)] border border-[var(--line)] text-xs text-[var(--fg-dim)] flex items-start gap-2.5">
                  <span className="text-base flex-shrink-0"></span>
                  <span className="leading-relaxed">
                    {currentStep.tips}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Reference Mode */
            <div className="space-y-3">
              <h3 className="text-xs font-[family-name:var(--f-display)] text-[var(--fg-faint)]">
                Todos los módulos de la plataforma
              </h3>
              {GUIDE_STEPS.map((s, idx) => (
                <div
                  key={s.step}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setMode("tour");
                    if (onNavigateToView && s.viewId) onNavigateToView(s.viewId);
                  }}
                  className="p-3.5 rounded-[4px] border border-[var(--line)] bg-[var(--ink-2)]/60 hover:border-[var(--accent)] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[4px] bg-[var(--ink-1)] border border-[var(--line)] flex items-center justify-center flex-shrink-0">
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-[11px] font-[family-name:var(--f-display)] text-[var(--fg-faint)]">{s.kicker}</div>
                      <div className="text-sm font-semibold text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                        {s.title}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--fg-faint)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--line)] bg-[var(--ink-2)] flex items-center justify-between flex-shrink-0 flex-wrap gap-3">
          <label className="flex items-center gap-2 text-xs text-[var(--fg-dim)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-[var(--line)] text-[var(--accent)] focus:ring-0 cursor-pointer"
            />
            <span>No volver a mostrar al entrar</span>
          </label>

          {mode === "tour" ? (
            <div className="flex items-center gap-2 ml-auto">
              {currentStepIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-[4px] text-xs font-medium border border-[var(--line)] text-[var(--fg-dim)] hover:bg-[var(--ink-1)] transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Anterior
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-2 text-xs text-[var(--fg-faint)] hover:text-[var(--fg)] transition-colors"
                >
                  Saltar guía
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-[4px] text-xs font-semibold bg-[var(--fg)] text-[var(--ink-0)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-none cursor-pointer"
              >
                {currentStepIndex === 0 ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Empezar recorrido
                  </>
                ) : currentStepIndex === GUIDE_STEPS.length - 1 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Finalizar y explorar
                  </>
                ) : (
                  <>
                    Siguiente paso
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => {
                  setCurrentStepIndex(0);
                  setMode("tour");
                  if (onNavigateToView) onNavigateToView("mapa");
                }}
                className="px-3.5 py-2 rounded-[4px] text-xs font-medium border border-[var(--line)] text-[var(--fg-dim)] hover:bg-[var(--ink-1)] flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar paseo
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 rounded-[4px] text-xs font-semibold bg-[var(--fg)] text-[var(--ink-0)] hover:opacity-90 transition-opacity"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
