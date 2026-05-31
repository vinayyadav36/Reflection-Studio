import { useEffect, useState } from 'react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 left-4 md:left-auto md:w-80 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Install Reflection Studio</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Install our app for easy access and offline support.</p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <span className="sr-only">Close</span>
          &times;
        </button>
      </div>
      <button
        onClick={handleInstallClick}
        className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
      >
        Install App
      </button>
    </div>
  );
}
