import type {
  Answers,
  CostRange,
  PlanTier,
  CopilotPlan,
  SecuritySku,
  AutomationLevel,
  CodespacesLevel,
  ProductRecommendation,
  SkuAlternative,
} from './types';
import { PRICES } from './pricing';

export function generateRecommendations(
  answers: Answers,
  plan: PlanTier,
  copilotPlan: CopilotPlan,
  securitySku: SecuritySku,
  automationLevel: AutomationLevel,
  codespacesLevel: CodespacesLevel,
  seats: CostRange,
  copilotSeats: CostRange,
  securityCommitters: CostRange,
): ProductRecommendation[] {
  const recs: ProductRecommendation[] = [];

  recs.push(buildPlanRecommendation(answers, plan, seats));

  if (copilotPlan !== 'none') {
    recs.push(buildCopilotRecommendation(answers, copilotPlan, copilotSeats, plan));
  }

  if (securitySku !== 'none') {
    recs.push(buildSecurityRecommendation(answers, securitySku, securityCommitters));
  }

  if (automationLevel !== 'low') {
    recs.push(buildActionsRecommendation(answers, automationLevel));
  }

  if (codespacesLevel !== 'none') {
    recs.push(buildCodespacesRecommendation(answers, codespacesLevel));
  }

  return recs;
}

function buildPlanRecommendation(
  answers: Answers,
  plan: PlanTier,
  seats: CostRange,
): ProductRecommendation {
  const q3 = answers.Q3 ?? 2;
  const planNames: Record<PlanTier, string> = {
    free: 'Free',
    team: 'GitHub Team',
    enterprise: 'GitHub Enterprise Cloud',
  };

  const overviews: Record<PlanTier, string> = {
    free: 'GitHub の無料プランです。パブリックリポジトリは無制限、プライベートリポジトリでも基本的な機能が使えます。',
    team: 'チーム開発に必要なブランチ保護ルール、コードオーナー、詳細な権限管理などが含まれる有料プランです。',
    enterprise: '大規模組織向けのプランで、SAML SSO・SCIM・監査ログ・IP許可リストなどのコンプライアンス機能を備えます。',
  };

  const appealPoints: string[] = [];
  if (plan === 'enterprise') {
    appealPoints.push('SAML SSO / SCIM による統合 ID 管理が可能');
    appealPoints.push('監査ログ・IP 許可リストでコンプライアンス要件に対応');
    if (q3 >= 4) appealPoints.push('ヒアリング結果: 複数組織にまたがる厳格な運用体制');
    appealPoints.push('Enterprise Managed Users でアカウントを一元管理');
  } else if (plan === 'team') {
    appealPoints.push('ブランチ保護ルール・コードオーナーで品質管理を強化');
    appealPoints.push('チーム単位のアクセス制御でセキュリティを確保');
    if (q3 >= 2) appealPoints.push('ヒアリング結果: 役割分担した開発体制に適合');
    appealPoints.push('Draft PR・必須レビューなどのコラボレーション機能');
  } else {
    appealPoints.push('基本的な Git ホスティングとコラボレーション機能');
    appealPoints.push('パブリックリポジトリは無制限で利用可能');
  }

  const alternatives: SkuAlternative[] = [];
  if (plan === 'enterprise') {
    const diff = (PRICES.plans.enterprise - PRICES.plans.team);
    alternatives.push({
      name: 'GitHub Team',
      unitPrice: PRICES.plans.team,
      monthlyDiff: {
        min: -diff * seats.min,
        max: -diff * seats.max,
      },
      reason: 'SSO やコンプライアンス機能が不要であれば Team で十分です。ただし組織規模が大きい場合、管理工数の面で Enterprise が効率的です。',
    });
    alternatives.push({
      name: 'Free',
      unitPrice: PRICES.plans.free,
      monthlyDiff: {
        min: -PRICES.plans.enterprise * seats.min,
        max: -PRICES.plans.enterprise * seats.max,
      },
      reason: 'コスト面では最も安価ですが、ブランチ保護や詳細な権限管理が使えないため、チーム開発には不向きです。',
    });
  } else if (plan === 'team') {
    alternatives.push({
      name: 'GitHub Enterprise Cloud',
      unitPrice: PRICES.plans.enterprise,
      monthlyDiff: {
        min: (PRICES.plans.enterprise - PRICES.plans.team) * seats.min,
        max: (PRICES.plans.enterprise - PRICES.plans.team) * seats.max,
      },
      reason: 'SSO・監査ログ・EMU が必要になった場合はアップグレードを検討してください。',
    });
    alternatives.push({
      name: 'Free',
      unitPrice: PRICES.plans.free,
      monthlyDiff: {
        min: -PRICES.plans.team * seats.min,
        max: -PRICES.plans.team * seats.max,
      },
      reason: 'ブランチ保護やチーム管理を使わない場合は Free でも可能ですが、チーム開発には制約があります。',
    });
  } else {
    alternatives.push({
      name: 'GitHub Team',
      unitPrice: PRICES.plans.team,
      monthlyDiff: {
        min: PRICES.plans.team * seats.min,
        max: PRICES.plans.team * seats.max,
      },
      reason: 'チーム人数が増えたり、ブランチ保護やアクセス制御が必要になったらアップグレードを検討してください。',
    });
  }

  let selectedSkuReason = '';
  if (plan === 'enterprise') {
    selectedSkuReason = 'ヒアリングで複数組織・厳格な運用体制が確認されたため、コンプライアンス機能を備えた Enterprise Cloud を選択しています。';
  } else if (plan === 'team') {
    selectedSkuReason = 'ヒアリングでチーム単位の開発体制が確認されたため、アクセス制御やブランチ保護が使える Team を選択しています。';
  } else {
    selectedSkuReason = '現在の規模・体制では Free プランで必要な機能が揃っています。';
  }

  return {
    id: 'plan',
    productName: planNames[plan],
    selectedSku: planNames[plan],
    overview: overviews[plan],
    appealPoints,
    selectedSkuReason,
    alternatives,
  };
}

function buildCopilotRecommendation(
  answers: Answers,
  copilotPlan: CopilotPlan,
  copilotSeats: CostRange,
  plan: PlanTier,
): ProductRecommendation {
  const b1 = answers.B1;
  const b2 = answers.B2;
  const q6 = answers.Q6 ?? 0;

  const skuName = copilotPlan === 'enterprise' ? 'Copilot Enterprise' : 'Copilot Business';
  const overview =
    copilotPlan === 'enterprise'
      ? 'GitHub Copilot Enterprise は Business の全機能に加え、組織のコードベースに合わせたカスタマイズや Bing 連携の Chat 機能を提供します。'
      : 'GitHub Copilot Business はコード補完・Chat・CLI 支援など AI アシスト機能をチーム全体で利用できるプランです。';

  const appealPoints: string[] = [];
  if (b1 !== undefined && b1 >= 3) {
    appealPoints.push('ヒアリング結果: 開発者の多くが AI コード補完に期待');
  }
  if (q6 === 1 || q6 === 2) {
    appealPoints.push('ヒアリング結果: コーディング速度・既存コード理解に課題あり');
  }
  if (b2 !== undefined && b2 >= 3) {
    appealPoints.push('ヒアリング結果: コードレビューの効率化ニーズあり');
  }
  appealPoints.push('エディタ内でのリアルタイムコード補完でコーディング速度を向上');
  appealPoints.push('Copilot Chat でコードの説明・リファクタリング提案を取得');
  if (copilotPlan === 'enterprise') {
    appealPoints.push('組織のリポジトリを学習し、よりコンテキストに沿った補完を提供');
  }

  const alternatives: SkuAlternative[] = [];
  if (copilotPlan === 'enterprise') {
    const diff = PRICES.copilot.enterprise - PRICES.copilot.business;
    alternatives.push({
      name: 'Copilot Business',
      unitPrice: PRICES.copilot.business,
      monthlyDiff: {
        min: -diff * copilotSeats.min,
        max: -diff * copilotSeats.max,
      },
      reason: '組織コードベースの学習機能が不要であれば Business で主要機能は利用可能です。',
    });
  } else {
    const diff = PRICES.copilot.enterprise - PRICES.copilot.business;
    alternatives.push({
      name: 'Copilot Enterprise',
      unitPrice: PRICES.copilot.enterprise,
      monthlyDiff: {
        min: diff * copilotSeats.min,
        max: diff * copilotSeats.max,
      },
      reason: plan === 'enterprise'
        ? 'Enterprise Cloud をお使いなら Copilot Enterprise にアップグレードでき、組織に最適化された補完が得られます。'
        : 'Copilot Enterprise は GitHub Enterprise Cloud プランが前提となります。',
    });
  }

  const selectedSkuReason =
    copilotPlan === 'enterprise'
      ? 'Enterprise Cloud プランのため Copilot Enterprise が利用可能です。組織のコードベースに最適化された補完で、より高い効果が期待できます。'
      : 'チーム向けの AI コーディング支援として Copilot Business を選択しています。コスト効率が高く、主要機能をすべて利用できます。';

  return {
    id: 'copilot',
    productName: skuName,
    selectedSku: skuName,
    overview,
    appealPoints,
    selectedSkuReason,
    alternatives,
  };
}

function buildSecurityRecommendation(
  answers: Answers,
  securitySku: SecuritySku,
  committers: CostRange,
): ProductRecommendation {
  const q5 = answers.Q5 ?? 1;
  const c1 = answers.C1;

  const skuNames: Record<SecuritySku, string> = {
    none: '',
    secret: 'Secret Protection',
    code: 'Code Security',
    both: 'Secret Protection + Code Security',
  };

  const overview =
    securitySku === 'both'
      ? 'Secret Protection でクレデンシャルの漏洩を防ぎつつ、Code Security でコード・依存関係の脆弱性を自動検出するフルセットです。'
      : securitySku === 'secret'
        ? 'Secret Protection はコミットされたパスワードや API キーなどの秘密情報を自動検出・ブロックし、漏洩事故を未然に防ぎます。'
        : 'Code Security はコードや依存ライブラリの脆弱性を自動スキャンし、修正パッチを提案します。';

  const appealPoints: string[] = [];
  if (q5 >= 3) {
    appealPoints.push('ヒアリング結果: 機密性の高い情報を多く扱っている');
  } else if (q5 >= 2) {
    appealPoints.push('ヒアリング結果: 一部に機密性の高い情報がある');
  }
  if (c1 !== undefined) {
    if (c1 === 3) appealPoints.push('ヒアリング結果: 秘密情報保護と脆弱性検出の両方が必要');
    else if (c1 === 1) appealPoints.push('ヒアリング結果: 秘密情報の漏洩防止を重視');
    else if (c1 === 2) appealPoints.push('ヒアリング結果: コード脆弱性の検出を重視');
  }
  if (securitySku === 'secret' || securitySku === 'both') {
    appealPoints.push('プッシュ保護: コミット時に秘密情報を自動ブロック');
  }
  if (securitySku === 'code' || securitySku === 'both') {
    appealPoints.push('Dependabot: 脆弱な依存関係を検出し自動 PR で修正提案');
    appealPoints.push('CodeQL: コードの静的解析で脆弱性パターンを検出');
  }

  const alternatives: SkuAlternative[] = [];
  if (securitySku === 'both') {
    alternatives.push({
      name: 'Secret Protection のみ',
      unitPrice: PRICES.security.secretProtection,
      monthlyDiff: {
        min: -PRICES.security.codeSecurity * committers.min,
        max: -PRICES.security.codeSecurity * committers.max,
      },
      reason: 'コード脆弱性の検出が不要な場合、Secret Protection のみでコスト削減が可能です。',
    });
    alternatives.push({
      name: 'Code Security のみ',
      unitPrice: PRICES.security.codeSecurity,
      monthlyDiff: {
        min: -PRICES.security.secretProtection * committers.min,
        max: -PRICES.security.secretProtection * committers.max,
      },
      reason: '秘密情報の漏洩リスクが低い場合は Code Security のみに絞ることも可能です。',
    });
  } else if (securitySku === 'secret') {
    alternatives.push({
      name: 'Secret Protection + Code Security',
      unitPrice: PRICES.security.secretProtection + PRICES.security.codeSecurity,
      monthlyDiff: {
        min: PRICES.security.codeSecurity * committers.min,
        max: PRICES.security.codeSecurity * committers.max,
      },
      reason: 'コード脆弱性の検出も加えることで、セキュリティ対策をより包括的にできます。',
    });
  } else if (securitySku === 'code') {
    alternatives.push({
      name: 'Secret Protection + Code Security',
      unitPrice: PRICES.security.secretProtection + PRICES.security.codeSecurity,
      monthlyDiff: {
        min: PRICES.security.secretProtection * committers.min,
        max: PRICES.security.secretProtection * committers.max,
      },
      reason: '秘密情報の漏洩防止も加えることで、セキュリティ対策をより包括的にできます。',
    });
  }

  const selectedSkuReason =
    securitySku === 'both'
      ? 'ヒアリングで秘密情報保護と脆弱性検出の両方が必要と判断されたため、フルセットを選択しています。'
      : securitySku === 'secret'
        ? 'ヒアリングで秘密情報の漏洩防止を重視されているため、Secret Protection を選択しています。'
        : 'ヒアリングでコード脆弱性の検出を重視されているため、Code Security を選択しています。';

  return {
    id: 'security',
    productName: skuNames[securitySku],
    selectedSku: skuNames[securitySku],
    overview,
    appealPoints,
    selectedSkuReason,
    alternatives,
  };
}

function buildActionsRecommendation(
  answers: Answers,
  automationLevel: AutomationLevel,
): ProductRecommendation {
  const q4 = answers.Q4 ?? 1;
  const a1 = answers.A1;

  const overview = 'GitHub Actions は CI/CD パイプラインをリポジトリ内で定義・実行できるサービスです。プランに含まれる無料枠を超えた分が従量課金されます。';

  const appealPoints: string[] = [];
  if (q4 >= 3) {
    appealPoints.push('ヒアリング結果: 確認作業の多くを自動化したい / している');
  } else {
    appealPoints.push('ヒアリング結果: 一部の確認作業を自動化している');
  }
  if (a1 !== undefined && a1 >= 3) {
    appealPoints.push('ヒアリング結果: ワークフロー実行時間が比較的長い');
  }
  appealPoints.push('リポジトリ内で CI/CD を完結 — 外部ツール不要');
  appealPoints.push('豊富なマーケットプレイスアクションで構築を効率化');
  appealPoints.push('セルフホステッドランナーで独自環境での実行も可能');

  return {
    id: 'actions',
    productName: 'GitHub Actions',
    selectedSku: automationLevel === 'high' ? '高利用' : '中利用',
    overview,
    appealPoints,
    selectedSkuReason: 'ヒアリングで自動化の利用度が確認されたため、Actions の従量課金分を見積もりに含めています。',
    alternatives: [],
  };
}

function buildCodespacesRecommendation(
  answers: Answers,
  codespacesLevel: CodespacesLevel,
): ProductRecommendation {
  const b3 = answers.B3;
  const b4 = answers.B4;

  const overview = 'GitHub Codespaces はブラウザや VS Code からクラウド上の開発環境を即座に起動できるサービスです。環境構築の手間を大幅に削減します。';

  const appealPoints: string[] = [];
  if (b3 !== undefined && b3 >= 3) {
    appealPoints.push('ヒアリング結果: 環境構築に半日以上かかるケースがある');
  }
  if (b4 !== undefined && b4 >= 3) {
    appealPoints.push('ヒアリング結果: 別端末からの作業ニーズが多い');
  }
  appealPoints.push('ブラウザからワンクリックで開発環境を起動');
  appealPoints.push('devcontainer.json で環境を統一 — 「動かない」を解消');
  appealPoints.push('新メンバーのオンボーディング時間を大幅短縮');

  return {
    id: 'codespaces',
    productName: 'GitHub Codespaces',
    selectedSku: codespacesLevel === 'wide' ? '広め導入' : '一部導入',
    overview,
    appealPoints,
    selectedSkuReason: 'ヒアリングで環境構築の課題やリモート作業のニーズが確認されたため、Codespaces の利用を推奨しています。',
    alternatives: [],
  };
}
