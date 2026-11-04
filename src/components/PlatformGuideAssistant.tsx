/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Compass,
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
} from "lucide-react";

interface PlatformGuideAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView?: (viewId: string) => void;
}

interface GuideStep {
  step: number;
  viewId?: string;
  title: string;
  kicker: string;
  icon: React.ReactNode;
  content: string;
  keyPoints: string[];
  tips: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    step: 1,
    viewId: "mapa",
    kicker: "Paso 1 · Exploración visual",
    title: "El Mapa Celular Interactivo y Flujos Metabólicos",
    icon: <Layers className="w-5 h-5 text-[var(--pw-glycolysis)]" />,
    content:
      "Metabolix representa una célula eucariota humana completa en un lienzo dinámico. Cada ruta metabólica tiene un código cromático estandarizado (colorante).",
    keyPoints: [
      "Grosor y luminosidad: Indican la tasa de flujo metabólico en tiempo real.",
      "Líneas discontinuas tenues: Rutas fisiológicamente inhibidas o apagadas.",
      "Partículas dinámicas: Muestran la dirección y sentido neto del flujo en cada sustrato.",
      "★ Estrella: Identifica las enzimas marcapasos o de regulación alostérica/covalente clave (ej. PFK-1, ACC1, CPT-1, Citrato sintasa).",
    ],
    tips: "Toca cualquier enzima o metabolito para desplegar su ficha molecular completa con coeficientes estequiométricos, deltaGº y notas de regulación.",
  },
  {
    step: 2,
    viewId: "mapa",
    kicker: "Paso 2 · Dinámica hormonal",
    title: "Estados Fisiológicos y Reprogramación Celular",
    icon: <Flame className="w-5 h-5 text-[var(--pw-gluconeogenesis)]" />,
    content:
      "En el raíl lateral izquierdo puedes alternar entre cuatro condiciones fisiológicas fundamentales. Observa cómo cambian los niveles de insulina, glucagón, AMP/ATP y el sentido de las reacciones.",
    keyPoints: [
      "Posprandial (Insulina ↑): Glucólisis activa, lipogénesis de novo, síntesis de glucógeno y bloqueo de la β-oxidación.",
      "Ayuno temprano (Glucagón ↑): Activación de la glucogenólisis y gluconeogénesis hepática para mantener la normoglucemia (70-100 mg/dL).",
      "Ayuno prolongado / Dieta Cetogénica: Máxima lipólisis, β-oxidación mitocondrial acelerada y exportación de cuerpos cetónicos (acetoacetato y β-hidroxibutirato).",
      "Ejercicio vigoroso: Activación anaerobia de glucólisis muscular y ciclo de Cori.",
    ],
    tips: "Fíjate en cómo los medidores hormonales y de carga energética se adaptan automáticamente al estado seleccionado.",
  },
  {
    step: 3,
    viewId: "tejidos",
    kicker: "Paso 3 · Compartimentación tisular",
    title: "Especialización Tisular y Rutas Universales",
    icon: <Activity className="w-5 h-5 text-[var(--pw-mito)]" />,
    content:
      "La pestaña 'Tejidos y rutas' te permite examinar qué vías metabólicas son ubicuas (universales a todas las células) frente a las especializaciones específicas de cada tejido.",
    keyPoints: [
      "Rutas Universales: Glucólisis, Ciclo de Krebs, Cadena Respiratoria y Vía de las Pentosas Fosfato.",
      "Hígado (Hepatocito): Expresa el repertorio enzimático completo, incluyendo gluconeogénesis (G6Pasa), cetogénesis y ciclo de la urea.",
      "Eritrocito: Carece de mitocondrias; depende al 100% de la glucólisis anaerobia (LDH) y de la vía de las pentosas (G6PD) para generar NADPH protector.",
      "Músculo Esquelético y Miocardio: Especializados en alta producción de ATP mediante fosforilación oxidativa y lanzaderas.",
    ],
    tips: "Usa el selector de tejidos para iluminar las enzimas expresadas y atenuar las ausentes en cada órgano.",
  },
  {
    step: 4,
    viewId: "balances",
    kicker: "Paso 4 · Rendimiento bioenergético",
    title: "Lanzaderas de NADH y Balance de ATP",
    icon: <Zap className="w-5 h-5 text-[var(--accent)]" />,
    content:
      "La membrana mitocondrial interna es impermeable al NADH citosólico. Compara cómo el tipo de lanzadera modifica el rendimiento neto de ATP por molécula de glucosa:",
    keyPoints: [
      "Lanzadera Malato-Aspartato (MAS): Predomina en hígado, corazón y riñón. Transfiere electrones al Complejo I (NADH de matriz) rindiendo ≈32 ATP netos por glucosa.",
      "Lanzadera Glicerol-3-Fosfato (G3P): Predomina en músculo rápido y cerebro. Entrega electrones directamente al CoQ vía FADH₂ de la GPD2, rindiendo ≈30 ATP netos (más veloz pero con 2 ATP menos).",
      "Fórmulas estequiométricas: Desglose completo de ATP consumido en fase de inversión y regenerado por fosforilación a nivel de sustrato y fosforilación oxidativa.",
    ],
    tips: "En la pestaña 'Balances de ATP' puedes alternar los botones MAS y G3P para observar la actualización en vivo del contador de ATP.",
  },
  {
    step: 5,
    viewId: "ciclos",
    kicker: "Paso 5 · Regulación recíproca",
    title: "Síntesis de Palmitato vs. β-Oxidación (No simultáneas)",
    icon: <Activity className="w-5 h-5 text-[var(--pw-lipid)]" />,
    content:
      "En la pestaña 'Ciclos y lanzaderas', el módulo de Lípidos demuestra el principio de no simultaneidad para evitar ciclos fútiles de despilfarro energético.",
    keyPoints: [
      "Síntesis de novo (Citosol): Estimulada por insulina; la ACC1 genera Malonil-CoA y la FASN ensambla palmitato (14 NADPH), esterificándose en triacilgliceroles (TAG).",
      "Sensor Alostérico Maestro: El Malonil-CoA citosólico bloquea con alta afinidad a la carnitina palmitoiltransferasa 1 (CPT-1), impidiendo que los ácidos grasos entren a la mitocondria mientras se sintetizan.",
      "β-Oxidación (Matriz): En ayuno, la ACC1 se apaga, desaparece el Malonil-CoA, y la CPT-1 se desinhibe para oxidar ácidos grasos de la lipólisis adiposa rindiendo 106 ATP netos.",
    ],
    tips: "Usa las 3 variantes del módulo ('Regulación recíproca', '1. Síntesis' y '2. β-Oxidación') para ver la inhibición alostérica en acción.",
  },
  {
    step: 6,
    viewId: "mapa",
    kicker: "Paso 6 · Genética y cataratas",
    title: "Patología Molecular: Galactosemias y Galactitol",
    icon: <HelpCircle className="w-5 h-5 text-[var(--pw-mono)]" />,
    content:
      "Toca los metabolitos de la galactosa o la enzima GALT para inspeccionar las implicaciones biomédicas de las deficiencias enzimáticas congénitas de la vía de Leloir.",
    keyPoints: [
      "Galactosemia Clásica (Déficit de GALT): Acumulación tóxica de Galactosa-1-P que inhibe la fosfoglucomutasa y lesiona hígado, cerebro y riñón.",
      "Vía Alternativa de la Aldosa Reductasa: En exceso de galactosa libre, se reduce irreversiblemente a galactitol con consumo de NADPH.",
      "Mecanismo de Cataratas: El galactitol no puede salir del cristalino (impermeable), atrayendo agua por ósmosis y desnaturalizando las cristalinas.",
      "Variante Duarte (D2): Forma frecuente con actividad reducida de GALT (≈25-50%) habitualmente benigna.",
    ],
    tips: "La suite clínica incluye las pautas dietéticas de exclusión estricta de lactosa y fórmulas de soja/elementales.",
  },
  {
    step: 7,
    viewId: "reto",
    kicker: "Paso 7 · Autoevaluación y Feedback",
    title: "Modo Reto de Bioquímica General y Encuesta",
    icon: <Award className="w-5 h-5 text-[var(--ok)]" />,
    content:
      "Pon a prueba tu razonamiento metabólico con preguntas diseñadas específicamente para estudiantes de Bioquímica General de Ciencias de la Salud.",
    keyPoints: [
      "Preguntas centradas en consecuencias: Qué metabolito se acumula ante un fallo enzimático y qué vía alternativa se activa.",
      "Registro de Alumno y Visitas: Identifícate con tu nombre y correo para guardar tu progreso académico en la base de datos.",
      "Encuesta de Satisfacción tipo Likert: Valora del 1 al 5 la utilidad de la plataforma para ayudarnos a seguir mejorándola.",
    ],
    tips: "Al finalizar el reto, puedes pulsar en '⭐ Encuesta' en la barra superior para registrar tu evaluación y comentarios.",
  },
];

export const PlatformGuideAssistant: React.FC<PlatformGuideAssistantProps> = ({
  isOpen,
  onClose,
  onNavigateToView,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [mode, setMode] = useState<"tour" | "reference">("tour");

  if (!isOpen) return null;

  const currentStep = GUIDE_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < GUIDE_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (onNavigateToView && GUIDE_STEPS[nextIdx].viewId) {
        onNavigateToView(GUIDE_STEPS[nextIdx].viewId!);
      }
    } else {
      onClose();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--ink-1)] text-[var(--fg)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{ fontFamily: "var(--f-body)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] bg-[var(--ink-2)] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-semibold">
                  Asistente Virtual Metabolix
                </span>
                <span className="text-xs text-[var(--fg-faint)]">Guía metodológica</span>
              </div>
              <h2
                id="guide-modal-title"
                className="text-lg font-bold leading-tight font-[var(--f-display)] text-[var(--fg)] mt-0.5"
              >
                Guía de Uso de la Plataforma
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[var(--ink-3)] p-1 rounded-xl border border-[var(--line)] text-xs">
              <button
                type="button"
                onClick={() => setMode("tour")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  mode === "tour"
                    ? "bg-[var(--ink-1)] text-[var(--fg)] shadow-sm"
                    : "text-[var(--fg-dim)] hover:text-[var(--fg)]"
                }`}
              >
                Tour Guiado
              </button>
              <button
                type="button"
                onClick={() => setMode("reference")}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  mode === "reference"
                    ? "bg-[var(--ink-1)] text-[var(--fg)] shadow-sm"
                    : "text-[var(--fg-dim)] hover:text-[var(--fg)]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Índice Rápido
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--fg-faint)] hover:text-[var(--fg)] hover:bg-[var(--ink-3)] transition-colors ml-1"
              aria-label="Cerrar guía"
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
                <span className="font-mono text-[var(--accent)] font-bold">
                  Paso {currentStep.step} de {GUIDE_STEPS.length}
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
                      aria-label={`Ir al paso ${i + 1}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono text-[var(--fg-faint)]">
                  {Math.round(((currentStepIndex + 1) / GUIDE_STEPS.length) * 100)}%
                </span>
              </div>

              {/* Step Card */}
              <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--ink-2)]/60 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--ink-1)] border border-[var(--line)] flex items-center justify-center flex-shrink-0 shadow-sm">
                    {currentStep.icon}
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[var(--fg-faint)] font-semibold">
                      {currentStep.kicker}
                    </span>
                    <h3 className="text-base font-bold text-[var(--fg)] font-[var(--f-display)] mt-0.5">
                      {currentStep.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-[var(--fg-dim)] leading-relaxed">
                  {currentStep.content}
                </p>

                <div className="space-y-2 pt-1">
                  <span className="text-xs font-mono uppercase text-[var(--fg-faint)] tracking-wider">
                    Aspectos Clave a Observar:
                  </span>
                  <ul className="space-y-2 text-xs text-[var(--fg)]">
                    {currentStep.keyPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[var(--ok)] flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-[var(--ink-1)] border border-[var(--line)] text-xs text-[var(--fg-dim)] flex items-start gap-2">
                  <span className="text-base flex-shrink-0">💡</span>
                  <span className="leading-relaxed">
                    <b>Consejo práctico:</b> {currentStep.tips}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Reference Mode */
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-faint)]">
                Todos los Módulos de la Plataforma
              </h3>
              {GUIDE_STEPS.map((s, idx) => (
                <div
                  key={s.step}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setMode("tour");
                    if (onNavigateToView && s.viewId) onNavigateToView(s.viewId);
                  }}
                  className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--ink-2)]/60 hover:border-[var(--accent)] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--ink-1)] border border-[var(--line)] flex items-center justify-center flex-shrink-0">
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-[var(--fg-faint)]">{s.kicker}</div>
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
        <div className="px-6 py-3.5 border-t border-[var(--line)] bg-[var(--ink-2)] flex items-center justify-between flex-shrink-0">
          {mode === "tour" ? (
            <>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="px-3.5 py-2 rounded-xl text-xs font-medium border border-[var(--line)] text-[var(--fg-dim)] hover:bg-[var(--ink-1)] disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Anterior
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs text-[var(--fg-faint)] hover:text-[var(--fg)] transition-colors"
                >
                  Saltar tour
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--fg)] text-[var(--ink-0)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {currentStepIndex === GUIDE_STEPS.length - 1 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Finalizar y Explorar
                    </>
                  ) : (
                    <>
                      Siguiente paso
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--fg)] text-[var(--ink-0)] hover:opacity-90 transition-opacity"
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
