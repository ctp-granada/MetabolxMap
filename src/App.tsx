/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { METABOLIX_TEMPLATE } from './metabolixTemplate';
import { initMetabolix } from './metabolixEngine.js';
import {
  recordAndGetVisits,
  getStudentProfile,
  saveQuizResponse,
  incrementCompletedChallenges,
  isSurveyRequiredForQuiz,
  StudentProfile,
} from './services/storageService';
import { StudentAccessModal } from './components/StudentAccessModal';
import { SatisfactionSurveyModal } from './components/SatisfactionSurveyModal';
import { PlatformGuideAssistant } from './components/PlatformGuideAssistant';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isSurveyMandatory, setIsSurveyMandatory] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [, setVisitsData] = useState({ totalVisits: 0, studentVisits: 0 });

  const refreshProfileAndVisits = useCallback(() => {
    const p = getStudentProfile();
    setStudentProfile(p);
    const v = recordAndGetVisits();
    setVisitsData(v);

    // Update DOM badges in top bar
    const nameEl = document.getElementById('hdr-student-name');
    if (nameEl) {
      if (p && p.name) {
        const firstName = p.name.trim().split(' ')[0];
        nameEl.textContent = firstName;
        nameEl.title = `${p.name} (${p.degree || 'Estudiante'} - ${p.course || ''})`;
      } else {
        nameEl.textContent = 'Acceso alumno';
        nameEl.title = 'Identificación del estudiante';
      }
    }

    const visitsEl = document.getElementById('hdr-visits-badge');
    if (visitsEl) {
      visitsEl.textContent = `👁️ ${v.totalVisits}`;
      visitsEl.title = `Visitas totales registradas a la plataforma: ${v.totalVisits} (Sesión #${v.studentVisits})`;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = METABOLIX_TEMPLATE;
    initMetabolix();

    refreshProfileAndVisits();

    // Expose helpers for the engine
    (window as any).metabolixIsSurveyBlocked = () => isSurveyRequiredForQuiz();
    (window as any).metabolixOpenSurvey = (mandatory: boolean = false) => {
      setIsSurveyMandatory(mandatory);
      setIsSurveyOpen(true);
    };

    // Wire up header buttons
    const btnGuide = document.getElementById('btn-guide');
    const handleGuideClick = () => setIsGuideOpen(true);
    if (btnGuide) btnGuide.addEventListener('click', handleGuideClick);

    const btnSurvey = document.getElementById('btn-survey');
    const handleSurveyClick = () => {
      setIsSurveyMandatory(isSurveyRequiredForQuiz());
      setIsSurveyOpen(true);
    };
    if (btnSurvey) btnSurvey.addEventListener('click', handleSurveyClick);

    const btnStudent = document.getElementById('btn-student');
    const handleStudentClick = () => setIsStudentModalOpen(true);
    if (btnStudent) btnStudent.addEventListener('click', handleStudentClick);

    // Listen to quiz answers from the engine
    const handleQuizAnswered = (e: any) => {
      const d = e.detail;
      if (!d) return;
      const currentProfile = getStudentProfile();

      // Record completed challenge
      incrementCompletedChallenges();

      saveQuizResponse({
        studentName: currentProfile?.name || 'Estudiante no registrado',
        studentEmail: currentProfile?.email || 'anonimo@ugr.es',
        questionId: d.questionId,
        concept: d.concept,
        prompt: d.prompt,
        selectedName: d.selectedName,
        targetName: d.targetName,
        isCorrect: d.isCorrect,
        explanation: d.explanation,
      });

      // Check if student reached 3 challenges without completing the survey
      if (isSurveyRequiredForQuiz()) {
        // Refresh quiz view to show blocker if needed
        if ((window as any).metabolixRefreshQuiz) {
          (window as any).metabolixRefreshQuiz();
        }
        // Open mandatory survey
        setIsSurveyMandatory(true);
        setIsSurveyOpen(true);
      }
    };
    window.addEventListener('metabolix:quiz_answered', handleQuizAnswered);

    return () => {
      if (btnGuide) btnGuide.removeEventListener('click', handleGuideClick);
      if (btnSurvey) btnSurvey.removeEventListener('click', handleSurveyClick);
      if (btnStudent) btnStudent.removeEventListener('click', handleStudentClick);
      window.removeEventListener('metabolix:quiz_answered', handleQuizAnswered);
    };
  }, [refreshProfileAndVisits]);

  const handleSurveySubmitted = () => {
    setIsSurveyMandatory(false);
    refreshProfileAndVisits();
    if ((window as any).metabolixRefreshQuiz) {
      (window as any).metabolixRefreshQuiz();
    }
    if ((window as any).metabolixNewQuiz) {
      (window as any).metabolixNewQuiz();
    }
  };

  const handleNavigateView = (viewId: string) => {
    if ((window as any).metabolixGo) {
      (window as any).metabolixGo(viewId);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* React Modals */}
      <StudentAccessModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onProfileUpdated={refreshProfileAndVisits}
      />

      <SatisfactionSurveyModal
        isOpen={isSurveyOpen}
        isMandatory={isSurveyMandatory}
        onClose={() => setIsSurveyOpen(false)}
        onSubmitted={handleSurveySubmitted}
      />

      <PlatformGuideAssistant
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigateToView={handleNavigateView}
      />
    </div>
  );
}
