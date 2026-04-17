import type { Question } from '../engine/types';

export const STAGE1_QUESTIONS: Question[] = [
  {
    id: 'Q1',
    stage: 'stage1',
    text: '日常的にコードやレビューに関わる人は、どれくらいですか？',
    options: [
      { label: '1人', value: 1 },
      { label: '2〜5人', value: 2 },
      { label: '6〜20人', value: 3 },
      { label: '21〜50人', value: 4 },
      { label: '51〜200人', value: 5 },
      { label: '201人以上', value: 6 },
      { label: '具体的な人数を入力', value: 0 },
    ],
    helpText: 'コードを書く人、レビューする人、両方含みます。',
    allowCustomInput: true,
    customInputLabel: '人数',
  },
  {
    id: 'Q2',
    stage: 'stage1',
    text: 'その中で、週に何度もコードを触る人はどれくらいですか？',
    options: [
      { label: 'ほぼ全員', value: 4 },
      { label: '7割前後', value: 3 },
      { label: '半分前後', value: 2 },
      { label: '3割以下', value: 1 },
    ],
  },
  {
    id: 'Q3',
    stage: 'stage1',
    text: '今の進め方に一番近いものはどれですか？',
    options: [
      { label: '少人数で進める', value: 1 },
      { label: '役割分担して進める', value: 2 },
      { label: '複数チームで並行', value: 3 },
      { label: '複数組織・厳格運用', value: 4 },
    ],
  },
  {
    id: 'Q4',
    stage: 'stage1',
    text: '変更が入ったあと、確認や公開前の作業はどれくらい自動で回っていますか？',
    options: [
      { label: 'ほぼ手作業', value: 1 },
      { label: '一部だけ自動', value: 2 },
      { label: 'かなり自動', value: 3 },
      { label: 'ほぼ全部自動', value: 4 },
    ],
  },
  {
    id: 'Q5',
    stage: 'stage1',
    text: '外に出せないコードや、パスワード・鍵のような大事な値を扱いますか？',
    options: [
      { label: 'ほぼない', value: 1 },
      { label: '一部ある', value: 2 },
      { label: 'かなりある', value: 3 },
      { label: '厳格に扱う', value: 4 },
    ],
  },
  {
    id: 'Q6',
    stage: 'stage1',
    text: '開発で詰まりやすいのはどこですか？',
    options: [
      { label: '書き始め', value: 1 },
      { label: '既存コードの理解', value: 2 },
      { label: 'レビュー整理', value: 3 },
      { label: '環境準備', value: 4 },
      { label: '特にない', value: 0 },
    ],
  },
];

export const BRANCH_A_QUESTIONS: Question[] = [
  {
    id: 'A1',
    stage: 'branchA',
    text: '変更ごとに走らせたい確認は、どこまでですか？',
    options: [
      { label: '軽い確認だけ', value: 1 },
      { label: 'ビルドやテストまで', value: 2 },
      { label: '複数環境でも確認したい', value: 3 },
      { label: '配布や公開まで', value: 4 },
    ],
  },
  {
    id: 'A2',
    stage: 'branchA',
    text: 'それはどれくらいの頻度で走りそうですか？',
    options: [
      { label: '週に数回', value: 1 },
      { label: '毎日数回', value: 2 },
      { label: '変更のたび', value: 3 },
      { label: '1日に何十回も', value: 4 },
    ],
  },
  {
    id: 'A3',
    stage: 'branchA',
    text: '主にどこでその処理を回したいですか？',
    options: [
      { label: '手元中心', value: 1 },
      { label: '社内環境中心', value: 2 },
      { label: 'クラウドも使いたい', value: 3 },
      { label: 'まだ未定', value: 4 },
    ],
  },
  {
    id: 'A4',
    stage: 'branchA',
    text: '標準的なLinuxだけで足りますか？',
    options: [
      { label: 'ほぼ足りる', value: 1 },
      { label: 'Windowsも必要', value: 2 },
      { label: 'Macも必要', value: 3 },
      { label: 'まだ不明', value: 4 },
    ],
  },
];

export const BRANCH_B_QUESTIONS: Question[] = [
  {
    id: 'B1',
    stage: 'branchB',
    text: '実装中に、その場で候補や説明が出ると助かる人はどれくらいですか？',
    options: [
      { label: 'ほぼ全員', value: 4 },
      { label: '半分くらい', value: 3 },
      { label: '一部', value: 2 },
      { label: 'ほとんどいない', value: 1 },
    ],
  },
  {
    id: 'B2',
    stage: 'branchB',
    text: '効果が大きそうなのは誰ですか？',
    options: [
      { label: '日常的に実装する人', value: 3 },
      { label: '実装とレビューの両方をする人', value: 4 },
      { label: '一部の専門メンバー', value: 2 },
      { label: 'まだ分からない', value: 2 },
    ],
  },
  {
    id: 'B3',
    stage: 'branchB',
    text: '新しい作業を始めるまでの準備は、体感でどれくらいですか？',
    options: [
      { label: 'すぐ始められる', value: 1 },
      { label: '30分前後', value: 2 },
      { label: '半日くらい', value: 3 },
      { label: '人によってかなり差がある', value: 3 },
    ],
  },
  {
    id: 'B4',
    stage: 'branchB',
    text: 'ブラウザや別端末から、同じ環境ですぐ続きができると助かる人は？',
    options: [
      { label: 'ほぼいない', value: 1 },
      { label: '一部', value: 2 },
      { label: '半分くらい', value: 3 },
      { label: '多い', value: 4 },
    ],
  },
];

export const BRANCH_C_QUESTIONS: Question[] = [
  {
    id: 'C1',
    stage: 'branchC',
    text: '守りたいのはどれに近いですか？',
    options: [
      { label: 'まずは最低限', value: 0 },
      { label: '大事な値の混入防止', value: 1 },
      { label: 'コードや依存関係の弱点', value: 2 },
      { label: '両方しっかり', value: 3 },
    ],
  },
  {
    id: 'C2',
    stage: 'branchC',
    text: 'その保護をかけたいのは全体のどれくらいですか？',
    options: [
      { label: '一部の重要なものだけ', value: 1 },
      { label: '半分くらい', value: 2 },
      { label: '大半', value: 3 },
      { label: 'ほぼ全部', value: 4 },
    ],
  },
  {
    id: 'C3',
    stage: 'branchC',
    text: '誰がいつ何をしたかを後から追えることは、どれくらい重要ですか？',
    options: [
      { label: '不要', value: 0 },
      { label: 'あると安心', value: 1 },
      { label: '重要', value: 2 },
      { label: '必須', value: 3 },
    ],
  },
  {
    id: 'C4',
    stage: 'branchC',
    text: '利用者管理を社内の認証基盤に合わせたいですか？',
    options: [
      { label: '不要', value: 0 },
      { label: 'あれば便利', value: 1 },
      { label: '重要', value: 2 },
      { label: '必須', value: 3 },
    ],
  },
];

export const ALL_QUESTIONS: Question[] = [
  ...STAGE1_QUESTIONS,
  ...BRANCH_A_QUESTIONS,
  ...BRANCH_B_QUESTIONS,
  ...BRANCH_C_QUESTIONS,
];

export const BRANCH_LABELS: Record<string, string> = {
  automation: '自動化・公開前チェック',
  productivity: '開発効率化',
  security: 'セキュリティ・統制',
};

export function getBranchQuestions(branchId: string): Question[] {
  switch (branchId) {
    case 'automation': return BRANCH_A_QUESTIONS;
    case 'productivity': return BRANCH_B_QUESTIONS;
    case 'security': return BRANCH_C_QUESTIONS;
    default: return [];
  }
}
