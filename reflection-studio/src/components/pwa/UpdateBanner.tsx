/// <reference types="vite-plugin-pwa/react" />
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 bg-violet-600 text-white p-4 rounded-xl shadow-lg z-50 flex flex-col gap-3">
      <div>
        <h3 className="font-semibold">Update Available</h3>
        <p className="text-sm text-violet-200 mt-1">A new version of Reflection Studio is available.</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => updateServiceWorker(true)}
          className="flex-1 py-2 bg-white text-violet-900 rounded-lg font-medium hover:bg-violet-50 transition-colors"
        >
          Reload
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="px-4 py-2 bg-violet-700 text-white rounded-lg font-medium hover:bg-violet-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
