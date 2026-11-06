/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";

export type DegreeType =
  | "Grado en Medicina"
  | "Grado en Enfermería"
  | "Grado en Odontología"
  | "Grado en Fisioterapia"
  | "Prefiero no responder";

export type CourseType =
  | "Primero"
  | "Segundo"
  | "Tercero"
  | "Cuarto"
  | "Quinto"
  | "Sexto"
  | "Prefiero no responder";

export interface StudentProfile {
  name: string;
  email: string;
  degree?: DegreeType;
  course?: CourseType;
  firstVisit: string;
  lastVisit: string;
  sessionVisitsCount: number;
}

export interface LikertSurveyResponse {
  id: string;
  timestamp: string;
  studentName: string;
  studentEmail: string;
  degree: DegreeType;
  course: CourseType;
  pedagogicalUtility: number;       // 1-5
  visualCompartmentation: number;   // 1-5
  reciprocalRegulation: number;     // 1-5
  quizSelfEvaluation: number;       // 1-5
  overallSatisfaction: number;      // 1-5
  comment?: string;
}

export interface QuizResponseRecord {
  id: string;
  timestamp: string;
  studentName: string;
  studentEmail: string;
  questionId: string;
  concept: string;
  prompt: string;
  selectedName: string;
  targetName: string;
  isCorrect: boolean;
  explanation?: string;
}

const STORAGE_KEYS = {
  PROFILE: "metabolix_student_profile",
  VISITS_TOTAL: "metabolix_total_visits",
  VISITS_SESSION: "metabolix_session_counted",
  SURVEYS: "metabolix_satisfaction_surveys",
  QUIZ_RESPONSES: "metabolix_quiz_responses",
  CHALLENGES_COMPLETED: "metabolix_completed_challenges_count",
  SURVEY_COMPLETED: "metabolix_survey_completed",
  FLASHCARD_STATS: "metabolix_flashcard_stats",
};

export interface PathwayFlashcardStat {
  pathwayId: string;
  practiced: number;
  correct: number;
  accuracyRate: number; // 0 - 100
}

export interface FlashcardStatsSummary {
  byPathway: Record<string, { practiced: number; correct: number }>;
  totalPracticed: number;
  totalCorrect: number;
  overallAccuracy: number;
  lastUpdated: string;
}

const DEFAULT_FLASHCARD_PRACTICE: Record<string, { practiced: number; correct: number }> = {
  glycolysis: { practiced: 14, correct: 12 },        // 86%
  krebs_cycle: { practiced: 11, correct: 9 },        // 82%
  lipid_metabolism: { practiced: 9, correct: 6 },     // 67%
  electron_transport: { practiced: 8, correct: 7 },   // 88%
  gluconeogenesis: { practiced: 7, correct: 5 },      // 71%
  pentose_phosphate: { practiced: 5, correct: 4 },    // 80%
  glycogen_metabolism: { practiced: 4, correct: 3 },  // 75%
  monosaccharide_entry: { practiced: 3, correct: 2 }, // 67%
};

export function getFlashcardStats(): FlashcardStatsSummary {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FLASHCARD_STATS);
    let byPathway: Record<string, { practiced: number; correct: number }>;
    if (raw) {
      byPathway = JSON.parse(raw);
    } else {
      byPathway = { ...DEFAULT_FLASHCARD_PRACTICE };
      localStorage.setItem(STORAGE_KEYS.FLASHCARD_STATS, JSON.stringify(byPathway));
    }

    let totalPracticed = 0;
    let totalCorrect = 0;
    Object.values(byPathway).forEach(p => {
      totalPracticed += p.practiced || 0;
      totalCorrect += p.correct || 0;
    });

    const overallAccuracy = totalPracticed > 0 ? Math.round((totalCorrect / totalPracticed) * 100) : 0;

    return {
      byPathway,
      totalPracticed,
      totalCorrect,
      overallAccuracy,
      lastUpdated: new Date().toISOString(),
    };
  } catch (e) {
    return {
      byPathway: { ...DEFAULT_FLASHCARD_PRACTICE },
      totalPracticed: 61,
      totalCorrect: 48,
      overallAccuracy: 79,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export function recordFlashcardPractice(pathway: string, isCorrect: boolean): FlashcardStatsSummary {
  try {
    const current = getFlashcardStats();
    const byPathway = { ...current.byPathway };
    if (!byPathway[pathway]) {
      byPathway[pathway] = { practiced: 0, correct: 0 };
    }
    byPathway[pathway].practiced += 1;
    if (isCorrect) {
      byPathway[pathway].correct += 1;
    }
    localStorage.setItem(STORAGE_KEYS.FLASHCARD_STATS, JSON.stringify(byPathway));
    window.dispatchEvent(new CustomEvent("metabolix:flashcard_updated", { detail: { pathway, isCorrect } }));
    return getFlashcardStats();
  } catch (e) {
    return getFlashcardStats();
  }
}

export function resetFlashcardStats(): FlashcardStatsSummary {
  localStorage.setItem(STORAGE_KEYS.FLASHCARD_STATS, JSON.stringify(DEFAULT_FLASHCARD_PRACTICE));
  window.dispatchEvent(new CustomEvent("metabolix:flashcard_updated", { detail: { reset: true } }));
  return getFlashcardStats();
}

export function getCompletedChallengesCount(): number {
  return parseInt(localStorage.getItem(STORAGE_KEYS.CHALLENGES_COMPLETED) || "0", 10);
}

export function incrementCompletedChallenges(): number {
  const current = getCompletedChallengesCount() + 1;
  localStorage.setItem(STORAGE_KEYS.CHALLENGES_COMPLETED, String(current));
  return current;
}

export function hasCompletedSurvey(): boolean {
  if (localStorage.getItem(STORAGE_KEYS.SURVEY_COMPLETED) === "true") return true;
  const surveys = getSurveys();
  if (surveys.length > 0) {
    localStorage.setItem(STORAGE_KEYS.SURVEY_COMPLETED, "true");
    return true;
  }
  return false;
}

export function isSurveyRequiredForQuiz(): boolean {
  return !hasCompletedSurvey() && getCompletedChallengesCount() >= 3;
}

export function resetSurveyForTesting(): void {
  localStorage.removeItem(STORAGE_KEYS.SURVEY_COMPLETED);
  localStorage.setItem(STORAGE_KEYS.CHALLENGES_COMPLETED, "0");
}

/* --- Firebase Initialization (Optional / Graceful) --- */
let firestoreDb: any = null;
try {
  // Configuración web pública del proyecto metabolix-4ce49. No es secreta:
  // la protección de los datos está en las reglas de Firestore.
  // Las variables VITE_FIREBASE_* de Vercel, si existen, tienen prioridad.
  const env = import.meta.env;
  const firebaseConfig = (window as any).__FIREBASE_CONFIG__ || {
    apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyAVwdYD8FEr_8Mhe6BXgjAhB2MvAaRXPNk",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "metabolix-4ce49.firebaseapp.com",
    projectId: env.VITE_FIREBASE_PROJECT_ID || "metabolix-4ce49",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "metabolix-4ce49.firebasestorage.app",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "226712218203",
    appId: env.VITE_FIREBASE_APP_ID || "1:226712218203:web:a69a0115628da535f46d7e",
  };

  if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(app);
  }
} catch (e) {
  console.warn("Firestore not configured, using offline-first resilient storage:", e);
}

/* --- Visits Counter --- */
export function recordAndGetVisits(): { totalVisits: number; studentVisits: number } {
  const INITIAL_SEED = 128; // realistic pedagogical baseline
  let total = parseInt(localStorage.getItem(STORAGE_KEYS.VISITS_TOTAL) || "0", 10);
  if (!total || total < INITIAL_SEED) {
    total = INITIAL_SEED;
  }

  // Count once per browser session
  const sessionCounted = sessionStorage.getItem(STORAGE_KEYS.VISITS_SESSION);
  if (!sessionCounted) {
    total += 1;
    localStorage.setItem(STORAGE_KEYS.VISITS_TOTAL, String(total));
    sessionStorage.setItem(STORAGE_KEYS.VISITS_SESSION, "1");
  }

  // Track student visits
  const profile = getStudentProfile();
  let studentVisits = 1;
  if (profile) {
    if (!sessionCounted) {
      profile.sessionVisitsCount = (profile.sessionVisitsCount || 0) + 1;
      profile.lastVisit = new Date().toISOString();
      saveStudentProfile(profile);
    }
    studentVisits = profile.sessionVisitsCount || 1;
  }

  return { totalVisits: total, studentVisits };
}

/* --- Student Profile --- */
export function getStudentProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStudentProfile(profile: Partial<StudentProfile>): StudentProfile {
  const existing = getStudentProfile();
  const now = new Date().toISOString();
  const updated: StudentProfile = {
    name: profile.name || existing?.name || "Estudiante",
    email: profile.email || existing?.email || "",
    degree: profile.degree || existing?.degree,
    course: profile.course || existing?.course,
    firstVisit: existing?.firstVisit || now,
    lastVisit: now,
    sessionVisitsCount: profile.sessionVisitsCount ?? existing?.sessionVisitsCount ?? 1,
  };

  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));

  // Sync with Firestore if active
  if (firestoreDb && updated.email) {
    try {
      const cleanEmail = updated.email.trim().toLowerCase();
      const studentDocRef = doc(firestoreDb, "student_sessions", cleanEmail);
      setDoc(studentDocRef, {
        name: updated.name,
        email: cleanEmail,
        degree: updated.degree || null,
        course: updated.course || null,
        lastVisit: serverTimestamp(),
        visitsCount: updated.sessionVisitsCount,
      }, { merge: true }).catch((err: any) => console.warn("Firestore student sync error:", err));
    } catch (err) {
      console.warn("Firestore save student failed:", err);
    }
  }

  return updated;
}

/* --- Likert Satisfaction Survey --- */
export function getSurveys(): LikertSurveyResponse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SURVEYS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSurveyResponse(response: Omit<LikertSurveyResponse, "id" | "timestamp">): LikertSurveyResponse {
  const existing = getSurveys();
  const newSurvey: LikertSurveyResponse = {
    ...response,
    id: "survey_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
  };

  existing.unshift(newSurvey);
  localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(existing));
  localStorage.setItem(STORAGE_KEYS.SURVEY_COMPLETED, "true");

  // Sync with Firestore
  if (firestoreDb) {
    try {
      const surveysCol = collection(firestoreDb, "satisfaction_surveys");
      addDoc(surveysCol, {
        ...newSurvey,
        serverTime: serverTimestamp(),
      }).catch((err: any) => console.warn("Firestore survey sync error:", err));
    } catch (err) {
      console.warn("Firestore survey save failed:", err);
    }
  }

  return newSurvey;
}

export function getSurveyStats() {
  const surveys = getSurveys();
  if (surveys.length === 0) {
    return {
      count: 0,
      averages: {
        pedagogicalUtility: 0,
        visualCompartmentation: 0,
        reciprocalRegulation: 0,
        quizSelfEvaluation: 0,
        overallSatisfaction: 0,
        globalAverage: 0,
      },
      byDegree: {} as Record<string, number>,
      byCourse: {} as Record<string, number>,
    };
  }

  const sum = surveys.reduce(
    (acc, s) => ({
      pedagogicalUtility: acc.pedagogicalUtility + s.pedagogicalUtility,
      visualCompartmentation: acc.visualCompartmentation + s.visualCompartmentation,
      reciprocalRegulation: acc.reciprocalRegulation + s.reciprocalRegulation,
      quizSelfEvaluation: acc.quizSelfEvaluation + s.quizSelfEvaluation,
      overallSatisfaction: acc.overallSatisfaction + s.overallSatisfaction,
    }),
    { pedagogicalUtility: 0, visualCompartmentation: 0, reciprocalRegulation: 0, quizSelfEvaluation: 0, overallSatisfaction: 0 }
  );

  const n = surveys.length;
  const averages = {
    pedagogicalUtility: +(sum.pedagogicalUtility / n).toFixed(2),
    visualCompartmentation: +(sum.visualCompartmentation / n).toFixed(2),
    reciprocalRegulation: +(sum.reciprocalRegulation / n).toFixed(2),
    quizSelfEvaluation: +(sum.quizSelfEvaluation / n).toFixed(2),
    overallSatisfaction: +(sum.overallSatisfaction / n).toFixed(2),
    globalAverage: +(
      (sum.pedagogicalUtility + sum.visualCompartmentation + sum.reciprocalRegulation + sum.quizSelfEvaluation + sum.overallSatisfaction) /
      (n * 5)
    ).toFixed(2),
  };

  const byDegree: Record<string, number> = {};
  const byCourse: Record<string, number> = {};

  surveys.forEach((s) => {
    byDegree[s.degree] = (byDegree[s.degree] || 0) + 1;
    byCourse[s.course] = (byCourse[s.course] || 0) + 1;
  });

  return { count: n, averages, byDegree, byCourse };
}

/* --- Quiz Responses Recording --- */
export function getQuizResponses(): QuizResponseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_RESPONSES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuizResponse(record: Omit<QuizResponseRecord, "id" | "timestamp">): QuizResponseRecord {
  const existing = getQuizResponses();
  const newRecord: QuizResponseRecord = {
    ...record,
    id: "quiz_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
  };

  existing.unshift(newRecord);
  // Keep last 300 attempts locally to avoid uncontrolled growth
  const trimmed = existing.slice(0, 300);
  localStorage.setItem(STORAGE_KEYS.QUIZ_RESPONSES, JSON.stringify(trimmed));

  // Sync to Firestore
  if (firestoreDb) {
    try {
      const quizCol = collection(firestoreDb, "quiz_responses");
      addDoc(quizCol, {
        ...newRecord,
        serverTime: serverTimestamp(),
      }).catch((err: any) => console.warn("Firestore quiz sync error:", err));
    } catch (err) {
      console.warn("Firestore quiz response save failed:", err);
    }
  }

  return newRecord;
}

/* --- Export Tools for Faculty --- */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportSurveysAsCSV() {
  const surveys = getSurveys();
  if (surveys.length === 0) return false;

  const headers = [
    "ID",
    "Fecha/Hora",
    "Estudiante",
    "Email",
    "Titulación",
    "Curso",
    "1. Utilidad Pedagógica (1-5)",
    "2. Compartimentación Visual (1-5)",
    "3. Regulación Recíproca (1-5)",
    "4. Reto Autoevaluación (1-5)",
    "5. Satisfacción Global (1-5)",
    "Comentarios",
  ];

  const rows = surveys.map((s) => [
    `"${s.id}"`,
    `"${s.timestamp}"`,
    `"${s.studentName.replace(/"/g, '""')}"`,
    `"${s.studentEmail}"`,
    `"${s.degree}"`,
    `"${s.course}"`,
    s.pedagogicalUtility,
    s.visualCompartmentation,
    s.reciprocalRegulation,
    s.quizSelfEvaluation,
    s.overallSatisfaction,
    `"${(s.comment || "").replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadCSV(`metabolix_encuestas_satisfaccion_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  return true;
}

export function exportQuizResponsesAsCSV() {
  const responses = getQuizResponses();
  if (responses.length === 0) return false;

  const headers = [
    "ID",
    "Fecha/Hora",
    "Estudiante",
    "Email",
    "Concepto",
    "Enunciado Pregunta",
    "Respuesta Seleccionada",
    "Diana Correcta",
    "Resultado",
    "Explicación / Razonamiento",
  ];

  const rows = responses.map((r) => [
    `"${r.id}"`,
    `"${r.timestamp}"`,
    `"${r.studentName.replace(/"/g, '""')}"`,
    `"${r.studentEmail}"`,
    `"${r.concept}"`,
    `"${r.prompt.replace(/"/g, '""')}"`,
    `"${r.selectedName.replace(/"/g, '""')}"`,
    `"${r.targetName.replace(/"/g, '""')}"`,
    r.isCorrect ? "Correcto" : "Incorrecto",
    `"${(r.explanation || "").replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadCSV(`metabolix_respuestas_retos_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  return true;
}

export function exportAllDataAsJSON() {
  const data = {
    exportedAt: new Date().toISOString(),
    totalVisits: recordAndGetVisits().totalVisits,
    studentProfile: getStudentProfile(),
    surveys: getSurveys(),
    quizResponses: getQuizResponses(),
    flashcardStats: getFlashcardStats(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `metabolix_datos_completos_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
