import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { QuestionFlow } from './components/questions/QuestionFlow';

function App() {
  useEffect(() => {
    const init = async () => {
      await import('preline');
      window.HSStaticMethods?.autoInit();
    };
    init();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
      <Header />
      <main className="flex-1">
        <QuestionFlow />
      </main>
      <Footer />
    </div>
  );
}

export default App;
