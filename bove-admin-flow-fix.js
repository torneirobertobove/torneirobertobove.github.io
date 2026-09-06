(() => {
  function restoreNeutralFormulaFromAdmin() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('apriRegole') !== 'true') return;
      const raw = params.get('torneo');
      if (!raw || !window.state?.rules) return;

      const torneo = JSON.parse(decodeURIComponent(raw));
      const rules = torneo?.configurazione?.rules || torneo?.rules || {};

      // During creation these fields are intentionally empty. The legacy
      // Bove loader may otherwise turn an empty value into Gironi + Finale.
      if (rules.tipoTorneo === '') window.state.rules.tipoTorneo = '';
      if (rules.formatoTorneo === '') window.state.rules.formatoTorneo = '';
      if (rules.formulaGironi === '') window.state.rules.formulaGironi = '';
      if (rules.formulaFinale === '') window.state.rules.formulaFinale = '';
    } catch (e) {
      console.error('Errore ripristino formula neutra:', e);
    }
  }

  function openRequestedRules() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('apriRegole') !== 'true') return;
      restoreNeutralFormulaFromAdmin();
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
