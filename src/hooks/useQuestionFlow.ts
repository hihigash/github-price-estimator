import { useReducer, useCallback, useMemo } from 'react';
import type { Answers, BranchId, FlowState, QuestionId, EstimateResult } from '../engine/types';
import { calculateBranchScores, selectBranches } from '../engine/scoring';
import { STAGE1_QUESTIONS } from '../data/questions';
import { getBranchQuestions } from '../data/questions';
import { estimate } from '../engine/estimator';

type FlowAction =
  | { type: 'ANSWER'; questionId: QuestionId; value: number }
  | { type: 'SET_CUSTOM_SEATS'; count: number }
  | { type: 'CONFIRM_INTERIM' }
  | { type: 'RESET' };

const initialState: FlowState = {
  phase: 'stage1',
  answers: {},
  visibleQuestionCount: 1,
  selectedBranches: [],
  branchQuestionIndex: { automation: 0, productivity: 0, security: 0 },
  estimate: null,
};

function getStage1AnsweredCount(answers: Answers): number {
  return STAGE1_QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
}

function allBranchQuestionsAnswered(
  branches: BranchId[],
  answers: Answers,
): boolean {
  return branches.every((b) => {
    const qs = getBranchQuestions(b);
    return qs.every((q) => answers[q.id] !== undefined);
  });
}

function getBranchAnsweredCount(branchId: BranchId, answers: Answers): number {
  const qs = getBranchQuestions(branchId);
  return qs.filter((q) => answers[q.id] !== undefined).length;
}

function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'SET_CUSTOM_SEATS': {
      return { ...state, customSeatCount: action.count };
    }

    case 'ANSWER': {
      const newAnswers: Answers = { ...state.answers, [action.questionId]: action.value };

      if (state.phase === 'stage1') {
        const answered = getStage1AnsweredCount(newAnswers);
        if (answered >= STAGE1_QUESTIONS.length) {
          // Stage 1 complete → interim
          const scores = calculateBranchScores(newAnswers);
          const branches = selectBranches(scores);
          return {
            ...state,
            answers: newAnswers,
            phase: 'interim',
            selectedBranches: branches,
            visibleQuestionCount: STAGE1_QUESTIONS.length,
          };
        }
        return {
          ...state,
          answers: newAnswers,
          visibleQuestionCount: Math.min(answered + 1, STAGE1_QUESTIONS.length),
        };
      }

      if (state.phase === 'stage3') {
        // Check if all branch questions are answered
        if (allBranchQuestionsAnswered(state.selectedBranches, newAnswers)) {
          const result = estimate(newAnswers, { customSeatCount: state.customSeatCount });
          return {
            ...state,
            answers: newAnswers,
            phase: 'result',
            estimate: result,
            branchQuestionIndex: {
              ...state.branchQuestionIndex,
              ...Object.fromEntries(
                state.selectedBranches.map((b) => [b, getBranchQuestions(b).length])
              ),
            },
          };
        }

        // Update branch progress
        const newBranchIndex = { ...state.branchQuestionIndex };
        for (const b of state.selectedBranches) {
          newBranchIndex[b] = getBranchAnsweredCount(b, newAnswers);
        }

        return {
          ...state,
          answers: newAnswers,
          branchQuestionIndex: newBranchIndex,
        };
      }

      return { ...state, answers: newAnswers };
    }

    case 'CONFIRM_INTERIM': {
      // Move from interim to stage3; also compute estimate already
      const result = estimate(state.answers, { customSeatCount: state.customSeatCount });
      return {
        ...state,
        phase: state.selectedBranches.length > 0 ? 'stage3' : 'result',
        estimate: result,
        branchQuestionIndex: {
          automation: 0,
          productivity: 0,
          security: 0,
        },
      };
    }

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

export function useQuestionFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const answer = useCallback(
    (questionId: QuestionId, value: number) => {
      dispatch({ type: 'ANSWER', questionId, value });
    },
    [],
  );

  const confirmInterim = useCallback(() => {
    dispatch({ type: 'CONFIRM_INTERIM' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const currentEstimate: EstimateResult | null = useMemo(() => {
    if (state.phase === 'result') return state.estimate;
    if (state.phase === 'stage3') {
      return estimate(state.answers, { customSeatCount: state.customSeatCount });
    }
    return null;
  }, [state.phase, state.answers, state.estimate, state.customSeatCount]);

  const setCustomSeatCount = useCallback((count: number) => {
    dispatch({ type: 'SET_CUSTOM_SEATS', count });
  }, []);

  return {
    state,
    answer,
    confirmInterim,
    reset,
    currentEstimate,
    setCustomSeatCount,
  };
}
