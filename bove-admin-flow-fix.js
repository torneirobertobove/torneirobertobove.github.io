(() => {
  function restoreNeutralFormulaFromAdmin() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('apriRegole') !== 'true') return;
      const raw = params.get('torneo');
      if (!raw) return;

      const torneo = JSON.parse(decodeURIComponent(raw));
      const rules = torneo?.configurazione?.rules || torneo?.rules || {};

      // During creation these fields are intentionally empty. The legacy
      // Bove loader may otherwise turn an empty value into Gironi + Finale.
      if (typeof state !== 'undefined' && state.rules) {
        if (rules.tipoTorneo === '') state.rules.tipoTorneo = '';
        if (rules.formatoTorneo === '') state.rules.formatoTorneo = '';
        if (rules.formulaGironi === '') state.rules.formulaGironi = '';
        if (rules.formulaFinale === '') state.rules.formulaFinale = '';
      }
    } catch (e) {
      console.error('Errore ripristino formula neutra:', e);
    }
  }

  function preserveTournamentResults() {
    try {
      if (typeof generaPartiteGironi !== 'function' || typeof state === 'undefined') return;
      if (window.__BOVE_RESULTS_PATCHED__) return;

      const original = generaPartiteGironi;
      window.__BOVE_RESULTS_PATCHED__ = true;

      generaPartiteGironi = function () {
        const saved = {};
        ['A','B','C','D','E','F','G'].forEach(g => {
          ['res','time','camp'].forEach(suffix => {
            const key = g + suffix;
            if (Array.isArray(state[key]) && state[key].length) {
              saved[key] = state[key].slice();
            }
          });
        });

        original();

        Object.keys(saved).forEach(key => {
          if (Array.isArray(state[key]) && state[key].length === saved[key].length) {
            state[key] = saved[key];
          }
        });
      };
    } catch (e) {
      console.error('Errore protezione risultati torneo:', e);
    }
  }

  preserveTournamentResults();

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
