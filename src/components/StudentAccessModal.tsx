/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  getStudentProfile,
  saveStudentProfile,
  recordAndGetVisits,
  DegreeType,
  CourseType,
} from "../services/storageService";
import { User, Mail, GraduationCap, Calendar, CheckCircle2, X } from "lucide-react";

interface StudentAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
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

export const StudentAccessModal: React.FC<StudentAccessModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [degree, setDegree] = useState<DegreeType>("Grado en Medicina");
  const [course, setCourse] = useState<CourseType>("Primero");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [stats, setStats] = useState({ totalVisits: 0, studentVisits: 0 });

  useEffect(() => {
    if (isOpen) {
      const p = getStudentProfile();
      if (p) {
        setName(p.name || "");
        setEmail(p.email || "");
        if (p.degree) setDegree(p.degree);
        if (p.course) setCourse(p.course);
      }
      setStats(recordAndGetVisits());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert("Por favor introduce tu nombre y correo electrónico.");
      return;
    }

    saveStudentProfile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      degree,
      course,
    });

    setSavedSuccess(true);
    onProfileUpdated();
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-modal-title"
    >
      <div
        className="w-full max-w-lg rounded-[4px] border border-[var(--line)] bg-[var(--ink-1)] text-[var(--fg)] shadow-[0_24px_60px_-12px_var(--shadow)] overflow-hidden flex flex-col max-h-[90vh]"
        style={{ fontFamily: "var(--f-body)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] bg-[var(--ink-2)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[4px] bg-[var(--accent)] text-white flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="student-modal-title"
                className="text-[22px] font-bold leading-tight font-[family-name:var(--f-display)] text-[var(--fg)]"
              >
                Acceso del alumno
              </h2>
              <p className="text-xs text-[var(--fg-dim)]">
                Tu nombre aparecerá en tus retos y en la encuesta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[4px] flex items-center justify-center text-[var(--fg-faint)] hover:text-[var(--fg)] hover:bg-[var(--ink-3)] transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Counter Banner */}
        <div className="px-6 py-3 bg-[var(--ink-3)]/60 border-b border-[var(--line)] flex items-center justify-between text-xs font-[family-name:var(--f-display)] text-[var(--fg-dim)]">
          <span>
            Sesión activa: <b className="text-[var(--accent)] font-semibold">#{stats.studentVisits}</b>
          </span>
          <span>
            Visitas totales a Metabolix: <b className="text-[var(--ok)] font-semibold">{stats.totalVisits}</b>
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {savedSuccess && (
            <div className="p-3.5 rounded-[4px] bg-[var(--ok)]/15 border border-[var(--ok)]/40 text-[var(--ok)] flex items-center gap-2.5 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>¡Perfil guardado correctamente! Vinculando datos de la sesión...</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-[family-name:var(--f-display)] text-[var(--fg-faint)] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[var(--accent)]" />
              Nombre y apellidos
            </label>
            <input
              type="text"
              required
              placeholder="Ej. María García Ruiz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[4px] border border-[var(--line)] bg-[var(--ink-2)] text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-[family-name:var(--f-display)] text-[var(--fg-faint)] mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--accent)]" />
              Correo Electrónico (Institucional o personal)
            </label>
            <input
              type="email"
              required
              placeholder="ejemplo@go.ugr.es"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[4px] border border-[var(--line)] bg-[var(--ink-2)] text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-[family-name:var(--f-display)] text-[var(--fg-faint)] mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[var(--accent)]" />
                Titulación
              </label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value as DegreeType)}
                className="w-full px-3 py-2.5 rounded-[4px] border border-[var(--line)] bg-[var(--ink-2)] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors cursor-pointer"
              >
                {DEGREES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-[family-name:var(--f-display)] text-[var(--fg-faint)] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                Curso
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value as CourseType)}
                className="w-full px-3 py-2.5 rounded-[4px] border border-[var(--line)] bg-[var(--ink-2)] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors cursor-pointer"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-[4px] bg-[var(--ink-2)] border border-[var(--line)] text-xs text-[var(--fg-dim)] leading-relaxed">
            <b>Nota de privacidad:</b> Tus respuestas a las autoevaluaciones del modo Reto y la encuesta de satisfacción se asociarán a este perfil para permitir la trazabilidad docente y la mejora continua de la asignatura.
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[4px] text-sm font-medium border border-[var(--line)] text-[var(--fg-dim)] hover:bg-[var(--ink-2)] hover:text-[var(--fg)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-[4px] text-sm font-semibold bg-[var(--fg)] text-[var(--ink-0)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-none"
            >
              <CheckCircle2 className="w-4 h-4" />
              Guardar e ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
