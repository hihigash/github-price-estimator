export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 py-6 mt-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>本ツールの見積もりは参考値です。</strong>GitHub の公式見積もりではありません。
            実際の課金は利用状況により変動します。正式な見積もりについては{' '}
            <a
              href="https://github.com/enterprise/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-amber-600/50 hover:text-amber-900 dark:hover:text-amber-200"
            >
              GitHub Sales
            </a>{' '}
            にお問い合わせください。
          </p>
        </div>
        <p className="text-xs text-gray-500 dark:text-neutral-400 text-center">
          価格情報は{' '}
          <a href="https://github.com/pricing" target="_blank" rel="noopener noreferrer" className="underline decoration-gray-400/50 hover:text-gray-700 dark:hover:text-neutral-300">
            GitHub Pricing
          </a>{' '}
          および{' '}
          <a href="https://docs.github.com" target="_blank" rel="noopener noreferrer" className="underline decoration-gray-400/50 hover:text-gray-700 dark:hover:text-neutral-300">
            GitHub Docs
          </a>{' '}
          に基づきます。最新情報は公式サイトをご確認ください。
        </p>
      </div>
    </footer>
  );
}
