// Pricing-related type definitions

export interface SeatRange {
  min: number;
  max: number;
}

export type PlanTier = 'free' | 'team' | 'enterprise';
export type CopilotPlan = 'none' | 'business' | 'enterprise';
export type SecuritySku = 'none' | 'secret' | 'code' | 'both';
export type AutomationLevel = 'low' | 'medium' | 'high';
export type CodespacesLevel = 'none' | 'partial' | 'wide';
export type Confidence = 'high' | 'medium' | 'low';

export type BranchId = 'automation' | 'productivity' | 'security';

export type QuestionId =
  | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6'
  | 'A1' | 'A2' | 'A3' | 'A4'
  | 'B1' | 'B2' | 'B3' | 'B4'
  | 'C1' | 'C2' | 'C3' | 'C4';

export type Answers = Partial<Record<QuestionId, number>>;

export interface QuestionOption {
  label: string;
  value: number;
}

export interface Question {
  id: QuestionId;
  stage: 'stage1' | 'branchA' | 'branchB' | 'branchC';
  text: string;
  options: QuestionOption[];
  helpText?: string;
  allowCustomInput?: boolean;
  customInputLabel?: string;
}

export interface CostRange {
  min: number;
  max: number;
}

export interface BreakdownItem {
  id: string;
  label: string;
  cost: CostRange;
  detail: string;
  explanation: string;
  adjustable: boolean;
  quantity: CostRange;
  unitPrice: number;
}

export interface EstimateOptions {
  customSeatCount?: number;
}

export interface SkuAlternative {
  name: string;
  unitPrice: number;
  monthlyDiff: CostRange;
  reason: string;
}

export interface ProductRecommendation {
  id: string;
  productName: string;
  selectedSku: string;
  overview: string;
  appealPoints: string[];
  selectedSkuReason: string;
  alternatives: SkuAlternative[];
}

export interface EstimateResult {
  plan: PlanTier;
  copilotPlan: CopilotPlan;
  securitySku: SecuritySku;
  automationLevel: AutomationLevel;
  codespacesLevel: CodespacesLevel;

  monthlyCost: CostRange;
  annualCost: CostRange;

  breakdown: BreakdownItem[];
  recommendations: ProductRecommendation[];

  confidence: Confidence;
  assumptionCount: number;
  assumptions: string[];
  explanations: string[];
  variableFactors: string[];
}

export interface BranchScores {
  automation: number;
  productivity: number;
  security: number;
}

export type FlowPhase = 'stage1' | 'interim' | 'stage3' | 'result';

export interface FlowState {
  phase: FlowPhase;
  answers: Answers;
  visibleQuestionCount: number;
  selectedBranches: BranchId[];
  branchQuestionIndex: Record<BranchId, number>;
  estimate: EstimateResult | null;
  customSeatCount?: number;
}
