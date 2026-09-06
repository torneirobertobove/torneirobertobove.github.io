(() => {
  function openRequestedRules() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('apriRegole') !== 'true') return;
      if (typeof window.openRules === 'function') {
        window.openRules();
      }
    } catch (e) {
      console.error('Errore apertura configurazione formula:', e);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(openRequestedRules, 0);
  });
})();
