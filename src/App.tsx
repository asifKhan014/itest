import React, { useMemo, useState } from 'react';
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
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setAnswers({ ...baseAnswers });
    setScore(null);
    setCopyStatus('');
  };

  const shareLink =
    typeof window !== 'undefined' ? window.location.href : 'https://example.com';
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
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-white/80 p-8 shadow-xl ring-1 ring-slate-200 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-600">
            iTest · Purity checklist
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
            How pure is your score today?
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
            Welcome to iTest. Click every item you have experienced. Your score
            starts at 100 and drops with each checked box. This recreation runs
            entirely in your browser—no accounts, no submissions.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/60 bg-amber-50/70 px-4 py-3 shadow-inner">
              <p className="text-xs uppercase tracking-wide text-amber-700">
                Live score
              </p>
              <p className="text-3xl font-semibold text-amber-900">
                {purityScore}/100
              </p>
              <p className="text-xs text-amber-800/80">
                Updates as you tick boxes
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-sky-50/70 px-4 py-3 shadow-inner">
              <p className="text-xs uppercase tracking-wide text-sky-700">
                Checked
              </p>
              <p className="text-3xl font-semibold text-sky-900">
                {checkedCount}/{enabledQuestions.length}
              </p>
              <p className="text-xs text-sky-800/80">
                Only the unlocked prompts count
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-rose-50/70 px-4 py-3 shadow-inner">
              <p className="text-xs uppercase tracking-wide text-rose-700">
                Last result
              </p>
              <p className="text-3xl font-semibold text-rose-900">
                {score !== null ? `${score}/100` : '—'}
              </p>
              <p className="text-xs text-rose-800/80">
                Locked in when you calculate
              </p>
            </div>
          </div>
        </header>

        {score !== null && (
          <section className="rounded-3xl bg-white/80 p-6 shadow-lg ring-1 ring-slate-200 backdrop-blur">
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
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyLink}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Copy link
                </button>
                <a
                  href={smsHref}
                  className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Share via text
                </a>
                <a
                  href={xHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Share on X
                </a>
              </div>
            </div>
            {copyStatus && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-amber-700">
                {copyStatus}
              </p>
            )}
          </section>
        )}

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
                The first prompt is locked in to mirror the original list; the rest
                count toward your score.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSubmit}
                className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Calculate my score
              </button>
              <button
                onClick={handleReset}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Clear checkboxes
              </button>
            </div>
          </div>

          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {QUESTIONS.map((question) => (
              <li
                key={question.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <label className="flex cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 cursor-pointer accent-amber-500"
                    checked={Boolean(answers[question.id])}
                    onChange={() => handleToggle(question)}
                    disabled={question.disabled}
                  />
                  <span className="text-sm leading-relaxed text-slate-800">
                    <span className="mr-1 font-semibold text-slate-900">
                      {question.id}.
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
        </section>

        <section className="rounded-3xl bg-white/70 p-6 text-sm text-slate-700 shadow-inner ring-1 ring-slate-200 backdrop-blur">
          <p className="font-semibold text-slate-900">Heads up</p>
          <p className="mt-2">
            iTest is a client-side recreation of the classic Rice Purity Test. No
            answers are sent anywhere; refreshing or clearing your browser will forget
            everything. Please be mindful of the mature content and share responsibly.
          </p>
        </section>
      </div>
    </main>
  );
};

export default App;
