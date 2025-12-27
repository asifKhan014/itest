import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QUESTIONS, type Question } from './questions';

type AnswerState = Record<number, boolean>;

const App: React.FC = () => {
  const baseAnswers = useMemo(() => {
    const start: AnswerState = {};
    QUESTIONS.forEach((q) => {
      start[q.id] = Boolean(q.defaultChecked);
    });
    return start;
  }, []);

  const enabledQuestions = useMemo(
    () => QUESTIONS.filter((q) => !q.disabled),
    [],
  );

  const [answers, setAnswers] = useState<AnswerState>(() => ({ ...baseAnswers }));
  const [score, setScore] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [sharedView, setSharedView] = useState(false);
  const scoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlScore = params.get('score');
    const parsed = urlScore ? Number(urlScore) : NaN;
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      setScore(Math.round(parsed));
      setSharedView(true);
    }
  }, []);

  const checkedCount = useMemo(
    () => enabledQuestions.reduce((sum, q) => sum + (answers[q.id] ? 1 : 0), 0),
    [answers, enabledQuestions],
  );

  const purityScore = enabledQuestions.length - checkedCount;

  const handleToggle = (question: Question) => {
    if (question.disabled) return;
    setAnswers((prev) => ({ ...prev, [question.id]: !prev[question.id] }));
    setScore(null);
  };

  const handleSubmit = () => {
    setScore(purityScore);
    setSharedView(false);
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', baseUrl);
    }
  };

  const handleReset = () => {
    setAnswers({ ...baseAnswers });
    setScore(null);
    setCopyStatus('');
    setSharedView(false);
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', baseUrl);
    }
  };

  const handleRestart = () => {
    handleReset();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const baseLink =
    typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname
      : 'https://example.com';
  const shareLink = score !== null ? `${baseLink}?score=${score}` : baseLink;
  const shareText =
    score !== null
      ? `I scored ${score}/100 on this purity test.`
      : 'Check your score on this purity test.';
  const smsHref = `sms:?&body=${encodeURIComponent(
    `${shareText} ${shareLink}`.trim(),
  )}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText,
  )}&url=${encodeURIComponent(shareLink)}`;

  useEffect(() => {
    if (score !== null && !sharedView && scoreRef.current) {
      scoreRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [score, sharedView]);

  const copyLink = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setCopyStatus('Clipboard not available');
      return;
    }

    await navigator.clipboard.writeText(shareLink);
    setCopyStatus('Link copied!');
    setTimeout(() => setCopyStatus(''), 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-sky-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10">
        <header className="rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-slate-200 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            Rice Purity Test · Purity checklist
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
            How pure is your score today?
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
            Welcome to the Rice Purity Test. Tap every item you have experienced, then hit Calculate to reveal your score. Everything stays private in your browser.
          </p>
        </header>

        <section className="rounded-3xl bg-white/90 p-6 shadow-xl ring-1 ring-slate-200 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                The checklist
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                Tap every item you have done
              </h2>
              <p className="text-sm text-slate-600">
                The first prompt is locked in to mirror the original list; everything else is up to you.
              </p>
            </div>
          </div>

          <ol className="mt-6 grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
            {QUESTIONS.map((question) => (
              <li
                key={question.id}
                className="rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-amber-400"
              >
                <label className="flex cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 cursor-pointer accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    checked={Boolean(answers[question.id])}
                    onChange={() => handleToggle(question)}
                    disabled={question.disabled}
                  />
                  <span className="text-sm leading-relaxed text-slate-800">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                      {question.id}
                    </span>
                    {question.text}
                    {question.disabled && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                        Locked
                      </span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              onClick={handleSubmit}
              className="w-full rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
            >
              Calculate my score
            </button>
            <button
              onClick={handleReset}
              className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
            >
              Clear checkboxes
            </button>
          </div>
        </section>

        {score !== null && (
          <section
            ref={scoreRef}
            className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200 backdrop-blur"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">
                  Your purity score
                </p>
                <p className="text-4xl font-semibold text-slate-900">
                  {score}/100
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Share it or retake to try again.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  onClick={handleRestart}
                  className="w-full rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                >
                  Test again
                </button>
                <button
                  onClick={copyLink}
                  className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                >
                  Copy link
                </button>
                <a
                  href={smsHref}
                  className="w-full rounded-full bg-amber-500 px-4 py-3 text-sm font-medium text-white shadow-lg text-center shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                >
                  Share via text
                </a>
                <a
                  href={xHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-full bg-sky-600 px-4 py-3 text-sm font-medium text-center text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                >
                  Share on X
                </a>
              </div>
            </div>
            {sharedView && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                You’re viewing a shared score. Try the checklist above to create your own.
              </p>
            )}
            {copyStatus && (
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                {copyStatus}
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default App;
