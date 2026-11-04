/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  getStudentProfile,
  saveSurveyResponse,
  getSurveyStats,
  exportSurveysAsCSV,
  exportAllDataAsJSON,
  DegreeType,
  CourseType,
} from "../services/storageService";
import {
  Star,
  CheckCircle2,
  Download,
  BarChart3,
  X,
  FileSpreadsheet,
  GraduationCap,
  Calendar,
  Sparkles,
  MessageSquareHeart,
} from "lucide-react";

interface SatisfactionSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
  isMandatory?: boolean;
}

const DEGREES: DegreeType[] = [
  "Grado en Medicina",
  "Grado en Enfermería",
  "Grado en Odontología",
  "Grado en Fisioterapia",
  "Prefiero no responder",
];

const COURSES: CourseType[] = [
  "Primero",
  "Segundo",
  "Tercero",
  "Cuarto",
  "Quinto",
  "Sexto",
  "Prefiero no responder",
];

interface LikertQuestion {
  id: "pedagogicalUtility" | "visualCompartmentation" | "reciprocalRegulation" | "quizSelfEvaluation" | "overallSatisfaction";
  title: string;
  statement: string;
  shortDesc: string;
}

const QUESTIONS: LikertQuestion[] = [
  {
    id: "pedagogicalUtility",
    title: "1. Utilidad pedagógica e integración",
    statement: "La plataforma facilita el aprendizaje y la comprensión de la integración de las rutas metabólicas en Bioquímica General.",
    shortDesc: "Comprensión de encrucijadas y flujos",
  },
  {
    id: "visualCompartmentation",
    title: "2. Claridad visual y compartimentación celular",
    statement: "Los mapas celulares diferencian con claridad los compartimentos (citosol, mitocondria, sangre) y los flujos moleculares.",
    shortDesc: "Lanzaderas y barreras de membrana",
  },
  {
    id: "reciprocalRegulation",
    title: "3. Comprensión de la regulación recíproca",
    statement: "Ayuda a comprender por qué rutas opuestas (síntesis de palmitato vs. β-oxidación) son mutuamente excluyentes (Malonil-CoA ⊣ CPT-1).",
    shortDesc: "Evitación del ciclo fútil",
  },
  {
    id: "quizSelfEvaluation",
    title: "4. Efectividad del Reto de autoevaluación",
    statement: "Las preguntas orientadas a identificar qué metabolito se acumula y las consecuencias de fallos enzimáticos resultan útiles para el estudio.",
    shortDesc: "Razonamiento bioquímico aplicado",
  },
  {
    id: "overallSatisfaction",
    title: "5. Satisfacción global con Metabolix",
    statement: "Valoración general de la experiencia de usuario, diseño interactivo y utilidad académica de la plataforma.",
    shortDesc: "Experiencia global",
  },
];

const LIKERT_LEVELS = [
  { val: 1, label: "Totalmente en desacuerdo", short: "1 · Pésimo" },
  { val: 2, label: "En desacuerdo", short: "2 · Insuficiente" },
  { val: 3, label: "Neutral / Aceptable", short: "3 · Aceptable" },
  { val: 4, label: "De acuerdo", short: "4 · Notable" },
  { val: 5, label: "Totalmente de acuerdo", short: "5 · Excelente" },
];

export const SatisfactionSurveyModal: React.FC<SatisfactionSurveyModalProps> = ({
  isOpen,
  onClose,
  onSubmitted,
  isMandatory = false,
}) => {
  const [activeTab, setActiveTab] = useState<"survey" | "stats">("survey");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [degree, setDegree] = useState<DegreeType>("Grado en Medicina");
  const [course, setCourse] = useState<CourseType>("Primero");
  const [ratings, setRatings] = useState<Record<string, number>>({
    pedagogicalUtility: 5,
    visualCompartmentation: 5,
    reciprocalRegulation: 5,
    quizSelfEvaluation: 5,
    overallSatisfaction: 5,
  });
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [stats, setStats] = useState(getSurveyStats());

  useEffect(() => {
    if (isOpen) {
      const p = getStudentProfile();
      if (p) {
        setStudentName(p.name || "");
        setStudentEmail(p.email || "");
        if (p.degree) setDegree(p.degree);
        if (p.course) setCourse(p.course);
      }
      setStats(getSurveyStats());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRatingChange = (qId: string, val: number) => {
    setRatings((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim()) {
      alert("Por favor completa tu nombre y correo electrónico.");
      return;
    }

    setIsSubmitting(true);

    saveSurveyResponse({
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim().toLowerCase(),
      degree,
      course,
      pedagogicalUtility: ratings.pedagogicalUtility,
      visualCompartmentation: ratings.visualCompartmentation,
      reciprocalRegulation: ratings.reciprocalRegulation,
      quizSelfEvaluation: ratings.quizSelfEvaluation,
      overallSatisfaction: ratings.overallSatisfaction,
      comment: comment.trim() || undefined,
    });

    setIsSubmitting(false);
    setHasSubmitted(true);
    setStats(getSurveyStats());
    if (onSubmitted) onSubmitted();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="survey-modal-title"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--ink-1)] text-[var(--fg)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{ fontFamily: "var(--f-body)" }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] bg-[var(--ink-2)] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--pw-lipid)]/15 text-[var(--pw-lipid)] flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--pw-lipid)]/15 text-[var(--pw-lipid)] font-semibold">
                  Escala Likert (1 - 5)
                </span>
                <span className="text-xs text-[var(--fg-faint)]">Bioquímica General</span>
              </div>
              <h2
                id="survey-modal-title"
                className="text-lg font-bold leading-tight font-[var(--f-display)] text-[var(--fg)] mt-0.5"
              >
                Encuesta de Satisfacción del Estudiante
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[var(--ink-3)] p-1 rounded-xl border border-[var(--line)] text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("survey")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === "survey"
                    ? "bg-[var(--ink-1)] text-[var(--fg)] shadow-sm"
                    : "text-[var(--fg-dim)] hover:text-[var(--fg)]"
                }`}
              >
                Cuestionario
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("stats")}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  activeTab === "stats"
                    ? "bg-[var(--ink-1)] text-[var(--fg)] shadow-sm"
                    : "text-[var(--fg-dim)] hover:text-[var(--fg)]"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Estadísticas ({stats.count})
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--fg-faint)] hover:text-[var(--fg)] hover:bg-[var(--ink-3)] transition-colors ml-1"
              aria-label="Cerrar encuesta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isMandatory && !hasSubmitted && (
          <div className="px-6 py-2.5 bg-[var(--warn)]/15 border-b border-[var(--warn)]/30 text-xs text-[var(--warn)] flex items-center justify-between font-medium">
            <span className="flex items-center gap-2">
              <span className="text-sm">🔒</span>
              <span><b>Requisito de Desbloqueo:</b> Has completado 3 retos. Por favor, cumplimenta esta breve encuesta tipo Likert para poder continuar realizando retos.</span>
            </span>
          </div>
        )}

        {/* Content Area */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {activeTab === "stats" ? (
            /* Stats & Results View */
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--ink-2)] flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-xs font-mono uppercase text-[var(--fg-faint)]">
                    Valoración Media Global
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-[var(--f-display)] text-[var(--accent)]">
                      {stats.averages.globalAverage || "0.00"}
                    </span>
                    <span className="text-sm text-[var(--fg-dim)] font-mono">/ 5.00</span>
                    <div className="flex ml-2 text-[var(--warn)]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= Math.round(stats.averages.globalAverage) ? "fill-current" : "opacity-30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono uppercase text-[var(--fg-faint)]">
                    Total respuestas
                  </div>
                  <div className="text-2xl font-bold font-mono text-[var(--fg)] mt-1">
                    {stats.count}
                  </div>
                </div>
              </div>

              {/* Breakdown by item */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-faint)]">
                  Promedio por Dimensión Pedagógica
                </h3>
                {QUESTIONS.map((q) => {
                  const score = (stats.averages as any)[q.id] || 0;
                  const pct = (score / 5) * 100;
                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--ink-2)]/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--fg)]">{q.title}</span>
                        <span className="font-mono font-bold text-[var(--accent)]">
                          {score.toFixed(2)} / 5.0
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--ink-3)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-[var(--fg-dim)]">{q.statement}</div>
                    </div>
                  );
                })}
              </div>

              {/* Degree distribution */}
              <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--ink-2)]/60">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-faint)] mb-3">
                  Participación por Grado
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(stats.byDegree).map(([deg, count]) => (
                    <div
                      key={deg}
                      className="p-2 rounded-lg bg-[var(--ink-1)] border border-[var(--line)] flex justify-between"
                    >
                      <span className="text-[var(--fg)] truncate">{deg}</span>
                      <b className="font-mono text-[var(--accent)]">{count}</b>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => exportSurveysAsCSV()}
                  className="px-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--ink-2)] text-xs font-semibold text-[var(--fg)] hover:border-[var(--accent)] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[var(--ok)]" />
                  Descargar CSV de Encuestas
                </button>
                <button
                  type="button"
                  onClick={() => exportAllDataAsJSON()}
                  className="px-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--ink-2)] text-xs font-semibold text-[var(--fg)] hover:border-[var(--accent)] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[var(--accent)]" />
                  Exportar Todo (JSON con Retos y Visitas)
                </button>
              </div>
            </div>
          ) : hasSubmitted ? (
            /* Success confirmation */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--ok)]/15 text-[var(--ok)] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-[var(--f-display)] text-[var(--fg)]">
                ¡Gracias por tu valoración, {studentName}!
              </h3>
              <p className="text-sm text-[var(--fg-dim)] max-w-md mx-auto leading-relaxed">
                Tus respuestas se han registrado con éxito y contribuirán a la optimización docente de
                Metabolix en el Departamento de Bioquímica y Biología Molecular.
              </p>
              <div className="flex justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("stats")}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--line)] bg-[var(--ink-2)] hover:border-[var(--accent)] transition-colors"
                >
                  Ver Estadísticas de Respuestas
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-[var(--fg)] text-[var(--ink-0)] hover:opacity-90 transition-opacity"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            /* Main Survey Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Student Data Section */}
              <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--ink-2)]/70 space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[var(--fg)]">
                    Datos Generales del Alumno
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs text-[var(--fg-dim)] mb-1 font-medium">
                      Nombre y Apellidos
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--ink-1)] text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--fg-dim)] mb-1 font-medium">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alumno@go.ugr.es"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--ink-1)] text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs text-[var(--fg-dim)] mb-1 font-medium flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-[var(--accent)]" />
                      Pregunta 1. Titulación
                    </label>
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value as DegreeType)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--ink-1)] text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                    >
                      {DEGREES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--fg-dim)] mb-1 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                      Pregunta 2. Curso
                    </label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value as CourseType)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--ink-1)] text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                    >
                      {COURSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Likert Scale Legend */}
              <div className="px-3.5 py-2.5 rounded-lg bg-[var(--ink-3)]/50 border border-[var(--line)] text-xs flex items-center justify-between text-[var(--fg-dim)]">
                <span className="font-mono text-[11px]">Escala:</span>
                <span className="text-[11px]">1 = Totalmente en desacuerdo</span>
                <span className="text-[11px] font-mono text-[var(--fg-faint)]">→</span>
                <span className="text-[11px]">5 = Totalmente de acuerdo</span>
              </div>

              {/* Likert Questions */}
              <div className="space-y-5">
                {QUESTIONS.map((q, idx) => {
                  const currentVal = ratings[q.id] || 3;
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-[var(--line)] bg-[var(--ink-2)]/50 space-y-3 transition-colors hover:border-[var(--line)]/80"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-[var(--fg)] font-[var(--f-display)]">
                            {q.title}
                          </h4>
                          <p className="text-xs text-[var(--fg-dim)] mt-0.5 leading-relaxed">
                            {q.statement}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-[var(--accent)]/15 text-[var(--accent)] flex-shrink-0">
                          {currentVal} / 5
                        </span>
                      </div>

                      {/* 1-5 Buttons */}
                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                        {LIKERT_LEVELS.map((lvl) => {
                          const isSelected = currentVal === lvl.val;
                          return (
                            <button
                              key={lvl.val}
                              type="button"
                              onClick={() => handleRatingChange(q.id, lvl.val)}
                              className={`py-2 px-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                isSelected
                                  ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm"
                                  : "border-[var(--line)] bg-[var(--ink-1)] text-[var(--fg-dim)] hover:border-[var(--accent)]/60 hover:text-[var(--fg)]"
                              }`}
                            >
                              <span className="text-sm font-bold font-mono">{lvl.val}</span>
                              <span
                                className={`text-[10px] leading-tight line-clamp-1 ${
                                  isSelected ? "text-white/90" : "text-[var(--fg-faint)]"
                                }`}
                              >
                                {lvl.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comments Section */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--fg-faint)] mb-1.5 flex items-center gap-1.5">
                  <MessageSquareHeart className="w-3.5 h-3.5 text-[var(--accent)]" />
                  Sugerencias, comentarios o aspectos a mejorar (opcional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comparte cualquier aspecto que te haya resultado especialmente útil o sugerencias para nuevas rutas o patologías moleculares..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--ink-2)] text-xs text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:outline-none focus:border-[var(--accent)] resize-y"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-[var(--line)]">
                <span className="text-xs text-[var(--fg-faint)] font-mono">
                  5 ítems Likert obligatorios
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium border border-[var(--line)] text-[var(--fg-dim)] hover:bg-[var(--ink-2)] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--fg)] text-[var(--ink-0)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--warn)]" />
                    Enviar Encuesta de Satisfacción
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
