// src/serviceWorkerRegistration.js
export function register(swPath = '/sw.js') {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register(swPath)
          .then((registration) => {
            // 可選：監聽更新
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  // console.log('SW state:', installingWorker.state);
                };
              }
            };
          })
          .catch((error) => {
            console.error('SW register failed:', error);
          });
      });
    }
  }
  
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
  }
  