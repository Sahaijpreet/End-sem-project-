import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Share } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('saar-pwa-prompt-seen');
        const lastPromptTime = localStorage.getItem('saar-pwa-prompt-time');
        const now = Date.now();
        
        if (!hasSeenPrompt || (lastPromptTime && now - parseInt(lastPromptTime) > 7 * 24 * 60 * 60 * 1000)) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('SAAR PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
    localStorage.setItem('saar-pwa-prompt-seen', 'true');
    localStorage.setItem('saar-pwa-prompt-time', Date.now().toString());
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('saar-pwa-prompt-seen', 'true');
    localStorage.setItem('saar-pwa-prompt-time', Date.now().toString());
  };

  if (isInstalled) {
    return null;
  }

  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ink-900 dark:text-white">
              Install SAAR on iOS
            </h3>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="p-1 text-ink-600 dark:text-slate-400 hover:text-ink-900 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4 text-sm text-ink-700 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Share className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium mb-1">1. Tap the Share button</p>
                <p className="text-xs text-ink-600 dark:text-slate-400">
                  Look for the share icon in Safari's toolbar
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                <Smartphone className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium mb-1">2. Select "Add to Home Screen"</p>
                <p className="text-xs text-ink-600 dark:text-slate-400">
                  Scroll down in the share menu to find this option
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                <Download className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium mb-1">3. Tap "Add"</p>
                <p className="text-xs text-ink-600 dark:text-slate-400">
                  SAAR will be added to your home screen
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowIOSInstructions(false)}
            className="w-full mt-6 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-parchment-200 dark:border-slate-700 p-4 z-40 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="bg-accent-primary/10 p-2 rounded-lg flex-shrink-0">
          <Download className="h-5 w-5 text-accent-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-ink-900 dark:text-white mb-1">
            Install SAAR App
          </h4>
          <p className="text-sm text-ink-600 dark:text-slate-400 mb-3">
            Get the full experience with offline access, push notifications, and faster loading.
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-3 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              {isIOS ? 'Instructions' : 'Install'}
            </button>
            
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-ink-600 dark:text-slate-400 hover:text-ink-900 dark:hover:text-slate-200 transition-colors text-sm"
            >
              Not now
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="p-1 text-ink-600 dark:text-slate-400 hover:text-ink-900 dark:hover:text-slate-200 transition-colors flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function InstallButton({ className = '' }) {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  if (isInstalled) {
    return (
      <div className={`flex items-center gap-2 text-green-600 dark:text-green-400 ${className}`}>
        <Monitor className="h-4 w-4" />
        <span className="text-sm font-medium">App Installed</span>
      </div>
    );
  }

  if (!canInstall) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      className={`flex items-center gap-2 px-3 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium ${className}`}
    >
      <Download className="h-4 w-4" />
      Install App
    </button>
  );
}

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    setCanInstall(false);
    
    return outcome === 'accepted';
  };

  return {
    canInstall,
    isInstalled,
    install
  };
}