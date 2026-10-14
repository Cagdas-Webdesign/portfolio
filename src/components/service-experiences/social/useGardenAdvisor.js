import { useCallback, useEffect, useRef, useState } from 'react';
import { ADVISOR_QUESTIONS } from './campaignData.js';

/*
 * Zustand des lokalen Gartenberaters. Liegt ausserhalb der Komponente,
 * damit das Kapitel neben dem Phone (Lead-Profil, grosse Antwort-Buttons
 * auf dem Handy) denselben Verlauf zeigt wie der Dialog im Phone.
 */
const TYPING_MS = 750;

export default function useGardenAdvisor(reducedMotion) {
  const [answers, setAnswers] = useState({});
  const [typing, setTyping] = useState(false);
  const [sent, setSent] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const stepIndex = ADVISOR_QUESTIONS.findIndex((question) => !answers[question.id]);
  const done = stepIndex === -1;
  // Waehrend der Bot "tippt", ist die naechste Frage noch nicht sichtbar.
  const current = !done && !typing ? ADVISOR_QUESTIONS[stepIndex] : null;

  const choose = useCallback((questionId, option) => {
    setAnswers((previous) => ({ ...previous, [questionId]: option }));
    if (reducedMotion) return;
    setTyping(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setTyping(false), TYPING_MS);
  }, [reducedMotion]);

  const reset = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setAnswers({});
    setTyping(false);
    setSent(false);
  }, []);

  const request = useCallback(() => setSent(true), []);

  let status = 'visitor';
  if (answers.project) status = 'interested';
  if (done) status = 'qualified';
  if (sent) status = 'ready';

  return { answers, current, done, request, reset, sent, status, typing, choose };
}
