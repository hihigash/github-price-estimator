import { useEffect, useRef, useCallback } from 'react';
import { AnimatedSection } from '../ui/AnimatedSection';
import { QuestionCard } from './QuestionCard';
import { ProgressHint } from './ProgressHint';
import { InterimSummary } from '../summary/InterimSummary';
import { EstimateResultView } from '../estimate/EstimateResultView';
import { STAGE1_QUESTIONS, getBranchQuestions, BRANCH_LABELS } from '../../data/questions';
import { useQuestionFlow } from '../../hooks/useQuestionFlow';
import type { QuestionId } from '../../engine/types';

export function QuestionFlow() {
  const { state, answer, confirmInterim, reset, currentEstimate, setCustomSeatCount } = useQuestionFlow();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const setRef = useCallback((key: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[key] = el;
  }, []);

  const stage1Answered = STAGE1_QUESTIONS.filter((q) => state.answers[q.id] !== undefined).length;

  // Auto-scroll to next question or section
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.phase === 'stage1') {
        const targetIdx = state.visibleQuestionCount - 1;
        const el = sectionRefs.current[`s1-${targetIdx}`];
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (state.phase === 'interim') {
        sectionRefs.current['interim']?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (state.phase === 'stage3') {
        // Scroll to the first unanswered branch question
        for (const branchId of state.selectedBranches) {
          const branchQs = getBranchQuestions(branchId);
          for (let i = 0; i < branchQs.length; i++) {
            if (state.answers[branchQs[i].id] === undefined) {
              const el = sectionRefs.current[`br-${branchQs[i].id}`];
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              return;
            }
          }
        }
      } else if (state.phase === 'result') {
        sectionRefs.current['result']?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [state.visibleQuestionCount, state.phase, state.answers, state.selectedBranches]);

  const handleAnswer = useCallback((questionId: QuestionId, value: number) => {
    answer(questionId, value);
  }, [answer]);

  let questionCounter = 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Stage 1 intro */}
      <AnimatedSection show>
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-1">
            数問で開発の進め方を把握し、最適な GitHub の構成と費用を概算します。
          </p>
        </div>
      </AnimatedSection>

      {/* Stage 1 questions */}
      {STAGE1_QUESTIONS.map((q, i) => {
        const show = i < state.visibleQuestionCount || state.answers[q.id] !== undefined;
        if (show) questionCounter++;
        const num = questionCounter;
        return (
          <div key={q.id} ref={setRef(`s1-${i}`)}>
            <AnimatedSection show={show} delay={0.05}>
              <QuestionCard
                question={q}
                selectedValue={state.answers[q.id]}
                onAnswer={handleAnswer}
                onCustomInput={q.allowCustomInput ? (_qid, val) => setCustomSeatCount(val) : undefined}
                customInputValue={q.allowCustomInput ? state.customSeatCount : undefined}
                questionNumber={num}
              />
            </AnimatedSection>
          </div>
        );
      })}

      {/* Progress hint during stage 1 */}
      {state.phase === 'stage1' && (
        <ProgressHint
          phase="stage1"
          answeredCount={stage1Answered}
          totalStage1={STAGE1_QUESTIONS.length}
        />
      )}

      {/* Interim summary */}
      <div ref={setRef('interim')}>
        <AnimatedSection show={state.phase === 'interim'} delay={0.2}>
          <div className="my-6">
            <InterimSummary
              answers={state.answers}
              selectedBranches={state.selectedBranches}
              onContinue={confirmInterim}
              customSeatCount={state.customSeatCount}
            />
          </div>
        </AnimatedSection>
      </div>

      {/* Stage 3: Branch questions */}
      {(state.phase === 'stage3' || state.phase === 'result') && (
        <AnimatedSection show delay={0.1}>
          <div className="my-6">
            <ProgressHint
              phase={state.phase}
              answeredCount={stage1Answered}
              totalStage1={STAGE1_QUESTIONS.length}
            />
          </div>

          {state.selectedBranches.map((branchId) => {
            const branchQs = getBranchQuestions(branchId);
            const answeredInBranch = branchQs.filter(
              (q) => state.answers[q.id] !== undefined,
            ).length;

            return (
              <div key={branchId} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px grow bg-gray-200 dark:bg-neutral-700" />
                  <span className="text-sm font-medium text-gray-500 dark:text-neutral-400 px-3">
                    {BRANCH_LABELS[branchId]}
                  </span>
                  <div className="h-px grow bg-gray-200 dark:bg-neutral-700" />
                </div>

                {branchQs.map((q, i) => {
                  const showQ = i <= answeredInBranch || state.answers[q.id] !== undefined;
                  if (showQ) questionCounter++;
                  const num = questionCounter;
                  return (
                    <div key={q.id} ref={setRef(`br-${q.id}`)}>
                      <AnimatedSection show={showQ} delay={0.05}>
                        <QuestionCard
                          question={q}
                          selectedValue={state.answers[q.id]}
                          onAnswer={handleAnswer}
                          questionNumber={num}
                        />
                      </AnimatedSection>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </AnimatedSection>
      )}

      {/* Estimate result */}
      <div ref={setRef('result')}>
        {state.phase === 'result' && currentEstimate && (
          <AnimatedSection show delay={0.3}>
            <div className="mt-8">
              <EstimateResultView result={currentEstimate} onReset={reset} />
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
