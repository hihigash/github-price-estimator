import type { Answers } from './types';

export function generateProductExplanation(
  itemId: string,
  answers: Answers,
): string {
  const q3 = answers.Q3 ?? 2;
  const q4 = answers.Q4 ?? 1;
  const q5 = answers.Q5 ?? 1;
  const q6 = answers.Q6 ?? 0;

  switch (itemId) {
    case 'plan': {
      if (q3 >= 4) {
        return '複数組織・厳格運用の進め方とのことで、Enterprise Cloud のアクセス管理やコンプライアンス機能が必要と判断しました。';
      }
      if (q3 >= 3) {
        return '複数チームで並行して開発する規模のため、チーム管理やブランチ保護ルールなどが充実した Team プランが適しています。';
      }
      if (q3 >= 2) {
        return '役割分担して開発を進める体制のため、アクセス制御やコードレビュー機能が使える Team プランを推奨します。';
      }
      return '現在の規模では Free プランで基本機能がカバーできます。';
    }

    case 'copilot': {
      const b1 = answers.B1;
      if (b1 !== undefined && b1 >= 3) {
        return '開発者の多くがコード補完・提案機能を求めており、実装スピードとコード品質の向上に直結するため Copilot を推奨します。';
      }
      if (q6 === 1 || q6 === 2) {
        return '書き始めや既存コードの理解に詰まりやすいとのことで、Copilot の補完・説明機能が課題解決に効果的です。';
      }
      return 'チームの生産性向上のため、AI アシスト機能を活用できる Copilot の導入を推奨します。';
    }

    case 'actions': {
      if (q4 >= 3) {
        return '確認作業がかなり自動化されている／したい方針のため、Actions による CI/CD パイプラインの利用量が見込まれます。';
      }
      if (q4 >= 2) {
        return '一部の確認作業を自動化しているため、Actions の利用で品質維持と効率化を両立できます。';
      }
      return '自動化の活用度に応じて Actions の利用が見込まれます。';
    }

    case 'secret_protection': {
      if (q5 >= 3) {
        return 'パスワードや鍵などの機密情報をかなり扱うとのことで、コードへの混入を自動検知する Secret Protection が不可欠です。';
      }
      if (q5 >= 2) {
        return '一部に機密性の高い情報があるため、秘密情報の漏洩を防ぐ Secret Protection の導入を推奨します。';
      }
      return 'セキュリティ対策として、秘密情報のスキャン機能を推奨します。';
    }

    case 'code_security': {
      if (q5 >= 3) {
        return '外部に出せないコードが多く、コードの脆弱性や依存関係の弱点を自動的に検出する Code Security が重要です。';
      }
      return 'コードや依存関係に潜む脆弱性を検出するため、Code Security の導入を推奨します。';
    }

    case 'codespaces': {
      const b3 = answers.B3;
      const b4 = answers.B4;
      if (b3 !== undefined && b3 >= 3) {
        return '環境準備に半日以上かかるケースがあるとのことで、ブラウザからすぐ開発環境が立ち上がる Codespaces で大幅に短縮できます。';
      }
      if (b4 !== undefined && b4 >= 3) {
        return '別端末からの作業ニーズが多いとのことで、どこからでも同じ環境で作業を再開できる Codespaces が効果的です。';
      }
      return 'クラウド開発環境の利用ニーズに応じて Codespaces を推奨します。';
    }

    default:
      return '';
  }
}
