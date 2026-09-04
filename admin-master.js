
/* ==========================================================================
   PADEL ADMIN MASTER CONSOLE - UNIFIED MASTER
   Versione corretta per il nuovo admin.html statico

   IMPORTANTI DIFFERENZE:
   - NON esiste più mount()
   - NON viene mai sostituito il contenuto di #areaAdmin
   - NON viene creato un secondo desktop
   - Il DOM .admin-page appartiene esclusivamente ad admin.html
   - Supabase viene inizializzato in modo robusto
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. SUPABASE
     ------------------------------------------------------------------------ */

  const SUPABASE_URL =
    "https://iybjvtmfaupgthqqsngd.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl";

  let sb = null;
  let supabaseInitPromise = null;

  async function initSupabase() {
    if (sb) {
      return sb;
    }

    if (supabaseInitPromise) {
      return supabaseInitPromise;
    }

    supabaseInitPromise = (async () => {
      /*
       * CASO 1:
       * Supabase è già stato caricato da admin.html.
       */
      if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
      ) {
        sb = window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY,
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true
            }
          }
        );

        window.sb = sb;
        window.supabaseClient = sb;

        return sb;
      }

      /*
       * CASO 2:
       * La libreria non è presente.
       *
       * Usiamo il nome corretto del pacchetto:
       * @supabase/supabase-js
       */
      await new Promise((resolve, reject) => {
        const existing = document.querySelector(
          'script[data-supabase-admin-loader="true"]'
        );

        if (existing) {
          if (
            window.supabase &&
            typeof window.supabase.createClient === "function"
          ) {
            resolve();
            return;
          }

          existing.addEventListener(
            "load",
            () => resolve(),
            { once: true }
          );

          existing.addEventListener(
            "error",
            () => reject(
              new Error(
                "Impossibile caricare Supabase JS."
              )
            ),
            { once: true }
          );

          return;
        }

        const script =
          document.createElement("script");

        script.src =
          "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.async = false;
        script.dataset.supabaseAdminLoader = "true";

        script.onload = () => resolve();

        script.onerror = () =>
          reject(
            new Error(
              "Impossibile caricare Supabase JS."
            )
          );

        document.head.appendChild(script);
      });

      if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
      ) {
        throw new Error(
          "Libreria Supabase JS non disponibile."
        );
      }

      sb = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );

      window.sb = sb;
      window.supabaseClient = sb;

      return sb;
    })();

    try {
      return await supabaseInitPromise;
    } catch (error) {
      supabaseInitPromise = null;
      throw error;
    }
  }

  /*
   * Funzione disponibile globalmente.
   * Gli altri script dell'admin possono utilizzarla.
   */
  window.initAdminSupabase =
    initSupabase;

  /* ------------------------------------------------------------------------
     2. STATO GLOBALE
     ------------------------------------------------------------------------ */

  let adminState = {
    adminLoggato: false,
    adminEmail: "",
    torneoSelezionato: null,
    tornei: [],
    sponsor: [],
    news: []
  };

  const ADMIN_STORAGE =
    "padel_admin_state";

  const STORAGE_LINK =
    "padel_admin_generated_link";

  window.iscrizioniTorneo = [];

  window.giocatoreSelezionatoCorrente =
    null;

  function sincronizzaAdminState() {
    window.adminState = adminState;
  }

  function salvaAdminState() {
    try {
      localStorage.setItem(
        ADMIN_STORAGE,
        JSON.stringify(adminState)
      );
    } catch (e) {
      console.error(
        "Errore salvataggio stato admin:",
        e
      );
    }

    sincronizzaAdminState();
  }

  window.salvaAdminState =
    salvaAdminState;

  function caricaAdminState() {
    try {
      const raw =
        localStorage.getItem(
          ADMIN_STORAGE
        );

      if (raw) {
        const saved =
          JSON.parse(raw);

        if (
          saved &&
          typeof saved === "object"
        ) {
          adminState = {
            ...adminState,
            ...saved
          };
        }
      }

      if (
        !Array.isArray(
          adminState.tornei
        )
      ) {
        adminState.tornei = [];
      }

      if (
        !Array.isArray(
          adminState.sponsor
        )
      ) {
        adminState.sponsor = [];
      }

      if (
        !Array.isArray(
          adminState.news
        )
      ) {
        adminState.news = [];
      }
    } catch (e) {
      console.error(
        "Errore caricamento stato admin:",
        e
      );
    }

    sincronizzaAdminState();
  }

  window.caricaAdminState =
    caricaAdminState;

  caricaAdminState();

  /* ------------------------------------------------------------------------
     3. UTILITY
     ------------------------------------------------------------------------ */

  function getTorneoAdminCorrente() {
    if (
      !Array.isArray(
        adminState.tornei
      )
    ) {
      return null;
    }

    return (
      adminState.tornei.find(
        t =>
          String(t.id) ===
          String(
            adminState.torneoSelezionato
          )
      ) || null
    );
  }

  window.getTorneoAdminCorrente =
    getTorneoAdminCorrente;

  function escapeHtml(value) {
    return String(
      value ?? ""
    ).replace(
      /[&<>'"]/g,
      c =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        })[c]
    );
  }

  window.escapeHtml =
    escapeHtml;

  function errorText(error) {
    return (
      error?.message ||
      error?.error_description ||
      String(
        error ||
        "Operazione non riuscita"
      )
    );
  }

  function report(label, error) {
    console.error(
      "[ADMIN]",
      label,
      error
    );

    alert(
      label +
        ": " +
        errorText(error)
    );
  }

  /* ------------------------------------------------------------------------
     4. LINK BOVE
     ------------------------------------------------------------------------ */

  function creaUrlBove(
    torneo,
    apriRegole = false
  ) {
    if (!torneo?.id) {
      return "";
    }

    if (
      String(torneo.id).startsWith(
        "temp_"
      )
    ) {
      const payload =
        encodeURIComponent(
          JSON.stringify(torneo)
        );

      return (
        "Bove.html?torneo=" +
        payload +
        (
          apriRegole
            ? "&apriRegole=true"
            : ""
        )
      );
    }

    return (
      "Bove.html?idTorneo=" +
      encodeURIComponent(
        String(torneo.id)
      ) +
      (
        apriRegole
          ? "&apriRegole=true"
          : ""
      )
    );
  }

  window.creaUrlBove =
    creaUrlBove;

  function buildTournamentLink(id) {
    return (
      location.origin +
      location.pathname.replace(
        /[^/]*$/,
        ""
      ) +
      "Bove.html?idTorneo=" +
      encodeURIComponent(
        String(id)
      )
    );
  }

  function applyGeneratedLink(value) {
    if (!value) {
      return;
    }

    const a =
      document.getElementById(
        "linkBoveGenerato"
      );

    const b =
      document.getElementById(
        "linkBoveGeneratoMirror"
      );

    if (a) {
      a.value = value;
    }

    if (b) {
      b.value = value;
    }
  }

  window.generaLinkPerId =
    function (id) {
      if (
        id === undefined ||
        id === null ||
        String(id).trim() === ""
      ) {
        alert(
          "Seleziona prima un torneo"
        );

        return false;
      }

      adminState.torneoSelezionato =
        id;

      salvaAdminState();

      const value =
        buildTournamentLink(id);

      try {
        localStorage.setItem(
          STORAGE_LINK,
          value
        );
      } catch {}

      applyGeneratedLink(value);

      [0, 150, 500].forEach(
        ms => {
          setTimeout(
            () =>
              applyGeneratedLink(
                value
              ),
            ms
          );
        }
      );

      return value;
    };

  window.generaLinkBove =
    function () {
      const id =
        adminState?.torneoSelezionato;

      if (id == null) {
        alert(
          "Seleziona prima un torneo"
        );

        return false;
      }

      return window.generaLinkPerId(
        id
      );
    };

  window.copiaLinkBove =
    async function () {
      let value =
        document.getElementById(
          "linkBoveGenerato"
        )?.value ||
        document.getElementById(
          "linkBoveGeneratoMirror"
        )?.value ||
        "";

      if (!value) {
        try {
          value =
            localStorage.getItem(
              STORAGE_LINK
            ) || "";
        } catch {}
      }

      if (
        !value &&
        adminState?.torneoSelezionato !=
          null
      ) {
        window.generaLinkPerId(
          adminState.torneoSelezionato
        );

        try {
          value =
            localStorage.getItem(
              STORAGE_LINK
            ) || "";
        } catch {}
      }

      if (!value) {
        alert(
          "Seleziona prima un torneo e genera il link."
        );

        return false;
      }

      try {
        if (
          navigator.clipboard &&
          typeof navigator.clipboard.writeText ===
            "function"
        ) {
          await navigator.clipboard.writeText(
            value
          );
        } else {
          const textarea =
            document.createElement(
              "textarea"
            );

          textarea.value = value;
          textarea.readOnly = true;

          textarea.style.position =
            "fixed";

          textarea.style.opacity =
            "0";

          document.body.appendChild(
            textarea
          );

          textarea.select();

          if (
            !document.execCommand(
              "copy"
            )
          ) {
            throw new Error(
              "Copia non disponibile"
            );
          }

          textarea.remove();
        }

        alert(
          "Link copiato negli appunti!"
        );

        return true;
      } catch {
        const input =
          document.getElementById(
            "linkBoveGenerato"
          ) ||
          document.getElementById(
            "linkBoveGeneratoMirror"
          );

        if (input) {
          input.value = value;
          input.focus();
          input.select();
        }

        alert(
          "Il link è pronto: selezionalo e copialo manualmente."
        );

        return false;
      }
    };

  window.apriBoveConTorneo =
    function (id) {
      if (
        id === undefined ||
        id === null ||
        String(id).trim() === ""
      ) {
        alert(
          "Seleziona prima un torneo"
        );

        return false;
      }

      const url =
        "Bove.html?idTorneo=" +
        encodeURIComponent(
          String(id)
        );

      const win =
        window.open(
          url,
          "_blank",
          "noopener"
        );

      if (!win) {
        window.location.href =
          url;
      }

      return true;
    };

  /* ------------------------------------------------------------------------
     5. TORNEI
     ------------------------------------------------------------------------ */

  async function caricaTorneiSupabase() {
    try {
      const client =
        await initSupabase();

      const {
        data,
        error
      } = await client
        .from("tornei")
        .select("*")
        .order(
          "id",
          {
            ascending: false
          }
        );

      if (error) {
        throw error;
      }

      if (Array.isArray(data)) {
        adminState.tornei =
          data;
      }

      salvaAdminState();

      renderAdmin();
      renderGestioneTorneo();
      renderPartecipanti();
      renderCoppie();

    } catch (e) {
      console.error(
        "Errore caricamento tornei Supabase:",
        e
      );
    }
  }

  window.caricaTorneiSupabase =
    caricaTorneiSupabase;

  /* ------------------------------------------------------------------------
     6. LOGIN
     ------------------------------------------------------------------------ */

  function mostraLoginMessaggio(
    testo,
    colore
  ) {
    const box =
      document.getElementById(
        "loginMessaggio"
      );

    if (box) {
      box.textContent = testo;
      box.style.color =
        colore || "inherit";
    }
  }

  window.mostraLoginMessaggio =
    mostraLoginMessaggio;

  async function loginAdmin() {
    try {
      const client =
        await initSupabase();

      const {
        data,
        error
      } = await client.auth.getSession();

      if (error) {
        throw error;
      }

      let session =
        data?.session;

      if (!session) {
        const email =
          document.getElementById(
            "adminEmail"
          )?.value?.trim();

        const password =
          document.getElementById(
            "adminPassword"
          )?.value || "";

        if (!email || !password) {
          mostraLoginMessaggio(
            "Inserisci email e password.",
            "#ff6678"
          );

          return;
        }

        const result =
          await client.auth.signInWithPassword(
            {
              email,
              password
            }
          );

        if (result.error) {
          throw result.error;
        }

        session =
          result.data?.session;
      }

      const sessionResult =
        await client.auth.getSession();

      session =
        sessionResult.data?.session;

      if (!session) {
        throw new Error(
          "Sessione Supabase non disponibile."
        );
      }

      adminState.adminLoggato =
        true;

      adminState.adminEmail =
        session.user?.email ||
        "Admin";

      salvaAdminState();

      document
        .getElementById(
          "boxLoginAdmin"
        )
        ?.classList.add(
          "hidden"
        );

      document
        .getElementById(
          "areaAdmin"
        )
        ?.classList.remove(
          "hidden"
        );

      await caricaTorneiSupabase();
      await caricaRichiesteIscrizione();
      await caricaNewsAdmin();
      await caricaSponsorAdmin();

      renderAdmin();
      renderGestioneTorneo();
      renderPartecipanti();
      renderCoppie();

    } catch (e) {
      console.error(
        "Errore login:",
        e
      );

      mostraLoginMessaggio(
        e?.message ||
          "Accesso non riuscito.",
        "#ff6678"
      );
    }
  }

  window.loginAdmin =
    loginAdmin;

  /* ------------------------------------------------------------------------
     7. NUOVO TORNEO
     ------------------------------------------------------------------------ */

  window.apriRegoleNuovoTorneo =
    function () {
      const nome =
        document.getElementById(
          "adminNomeTorneo"
        )?.value.trim() ||
        "Nuovo Torneo";

      const data =
        document.getElementById(
          "adminDataTorneo"
        )?.value ||
        "";

      const posti =
        Number(
          document.getElementById(
            "adminPosti"
          )?.value
        ) || 8;

      const descrizione =
        document.getElementById(
          "adminDescrizione"
        )?.value.trim() ||
        "";

      const tempId =
        "temp_" +
        Date.now();

      const torneoTemp = {
        id: tempId,
        nome,
        data,
        posti,
        descrizione,
        formula: "",
        stato: "bozza",
        iscritti: [],
        coppie: [],
        partecipanti: [],
        configurazione: {
          rules: {
            numeroSquadre:
              posti,
            numeroGironi:
              Math.ceil(
                posti / 4
              ),
            squadrePerGirone: 4
          }
        }
      };

      adminState.tornei.push(
        torneoTemp
      );

      adminState.torneoSelezionato =
        tempId;

      salvaAdminState();

      window.open(
        creaUrlBove(
          torneoTemp,
          true
        ),
        "_blank"
      );
    };

  window.creaNuovoTorneo =
    async function () {
      const nome =
        document.getElementById(
          "adminNomeTorneo"
        )?.value.trim() ||
        "Nuovo Torneo";

      const data =
        document.getElementById(
          "adminDataTorneo"
        )?.value ||
        "";

      const posti =
        Number(
          document.getElementById(
            "adminPosti"
          )?.value
        ) || 8;

      const descrizione =
        document.getElementById(
          "adminDescrizione"
        )?.value.trim() ||
        "";

      if (!data) {
        alert(
          "Inserisci la data del torneo."
        );

        return false;
      }

      try {
        const client =
          await initSupabase();

        const nuovoId =
          Date.now();

        const numeroGironi =
          Math.ceil(
            posti / 4
          );

        const configurazione = {
          coppie: [],
          partecipanti: [],
          rules: {
            numeroSquadre:
              posti,
            numeroGironi,
            squadrePerGirone: 4
          }
        };

        const nuovoTorneo = {
          id: novoIdSafe(
            nuovoId
          ),
          nome,
          data,
          posti,
          descrizione,
          formula: "",
          stato: "bozza",
          iscritti: [],
          coppie: [],
          partecipanti: [],
          configurazione
        };

        adminState.tornei =
          adminState.tornei.filter(
            t =>
              !String(
                t.id
              ).startsWith(
                "temp_"
              )
          );

        adminState.tornei.push(
          nuovoTorneo
        );

        adminState.torneoSelezionato =
          nuovoId;

        salvaAdminState();

        const {
          error
        } = await client
          .from("tornei")
          .insert({
            id: novoIdSafe(
              novoId
            ),
            nome,
            data,
            data_torneo: data,
            ora_inizio: null,
            posti,
            descrizione,
            formula: null,
            stato: "bozza",
            pubblicato: false,
            iscrizioni_chiuse: false,
            configurazione
          });

        if (error) {
          throw error;
        }

        renderAdmin();
        renderGestioneTorneo();
        renderPartecipanti();
        renderCoppie();

        window.open(
          "Bove.html?idTorneo=" +
            encodeURIComponent(
              novoIdSafe(
                nuovoId
              )
            ) +
            "&apriRegole=true",
          "_blank"
        );

        return true;

      } catch (e) {
        report(
          "Creazione torneo non riuscita",
          e
        );

        return false;
      }
    };

  /*
   * Mantiene il valore numerico originale senza introdurre
   * trasformazioni nello schema Supabase.
   */
  function novoIdSafe(id) {
    return Number(id);
  }

  window.eliminaTorneoAdmin =
    async function (id) {
      if (
        !confirm(
          "Vuoi davvero eliminare questo torneo?"
        )
      ) {
        return;
      }

      try {
        const client =
          await initSupabase();

        const {
          error
        } = await client
          .from("tornei")
          .delete()
          .eq(
            "id",
            id
          );

        if (error) {
          throw error;
        }

        adminState.tornei =
          adminState.tornei.filter(
            t =>
              String(t.id) !==
              String(id)
          );

        if (
          String(
            adminState.torneoSelezionato
          ) ===
          String(id)
        ) {
          adminState.torneoSelezionato =
            null;
        }

        salvaAdminState();

        renderAdmin();
        renderGestioneTorneo();
        renderPartecipanti();
        renderCoppie();

      } catch (e) {
        report(
          "Eliminazione torneo non riuscita",
          e
        );
      }
    };

  window.pubblicaTorneo =
    async function () {
      const torneo =
        getTorneoAdminCorrente();

      if (!torneo) {
        alert(
          "Seleziona prima un torneo"
        );

        return;
      }

      try {
        const client =
          await initSupabase();

        const {
          error
        } = await client
          .from("tornei")
          .update({
            pubblicato: true,
            stato: "attivo"
          })
          .eq(
            "id",
            torneo.id
          );

        if (error) {
          throw error;
        }

        torneo.pubblicato =
          true;

        torneo.stato =
          "attivo";

        salvaAdminState();

        renderAdmin();
        renderGestioneTorneo();

        alert(
          "Torneo pubblicato con successo!"
        );

      } catch (e) {
        report(
          "Pubblicazione torneo non riuscita",
          e
        );
      }
    };

  window.chiudiIscrizioniTorneo =
    async function () {
      const torneo =
        getTorneoAdminCorrente();

      if (!torneo) {
        alert(
          "Seleziona prima un torneo"
        );

        return;
      }

      try {
        const client =
          await initSupabase();

        const {
          error
        } = await client
          .from("tornei")
          .update({
            iscrizioni_chiuse:
              true
          })
          .eq(
            "id",
            torneo.id
          );

        if (error) {
          throw error;
        }

        torneo.iscrizioni_chiuse =
          true;

        salvaAdminState();

        renderAdmin();
        renderGestioneTorneo();

        alert(
          "Iscrizioni chiuse."
        );

      } catch (e) {
        report(
          "Chiusura iscrizioni non riuscita",
          e
        );
      }
    };

  /* ------------------------------------------------------------------------
     8. ISCRIZIONI
     ------------------------------------------------------------------------ */

  async function caricaRichiesteIscrizione() {
    const id =
      Number(
        adminState?.torneoSelezionato
      );

    if (
      !Number.isFinite(id) ||
      id <= 0
    ) {
      window.iscrizioniTorneo =
        [];

      renderGestioneTorneo();
      renderPartecipanti();
      renderCoppie();

      return true;
    }

    try {
      const client =
        await initSupabase();

      const {
        data,
        error
      } = await client
        .from("iscrizioni")
        .select("*")
        .eq(
          "torneo_id",
          id
        );

      if (error) {
        throw error;
      }

      window.iscrizioniTorneo =
        Array.isArray(data)
          ? data
          : [];

      renderGestioneTorneo();
      renderPartecipanti();
      renderCoppie();

      return true;

    } catch (e) {
      window.iscrizioniTorneo =
        [];

      renderGestioneTorneo();
      renderPartecipanti();
      renderCoppie();

      console.error(
        "Caricamento iscrizioni non riuscito",
        e
      );

      return false;
    }
  }

  window.caricaRichiesteIscrizione =
    caricaRichiesteIscrizione;

  function renderGestioneTorneo() {
    const box =
      document.getElementById(
        "dettaglioTorneoAdmin"
      );

    const card =
      document.getElementById(
        "gestioneTorneoAdmin"
      );

    if (!box || !card) {
      return;
    }

    const torneo =
      getTorneoAdminCorrente();

    if (!torneo) {
      card.classList.add(
        "hidden"
      );

      box.innerHTML = "";

      return;
    }

    card.classList.remove(
      "hidden"
    );

    const rules =
      torneo.configurazione?.rules ||
      torneo.rules ||
      {};

    box.innerHTML = `
      <div class="admin-detail">
        <h3>${escapeHtml(
          torneo.nome ||
            "Torneo"
        )}</h3>

        <p>
          📅 ${escapeHtml(
            torneo.data || "-"
          )}
          · 👥 ${
            torneo.posti ||
            rules.numeroSquadre ||
            0
          } squadre
          · 🏆 ${escapeHtml(
            rules.tipoTorneo ||
              torneo.formula ||
              "da configurare in Bove"
          )}
        </p>

        <p>
          Stato:
          <b>${escapeHtml(
            torneo.stato ||
              "bozza"
          )}</b>

          · Pubblicato:
          ${
            torneo.pubblicato
              ? "Sì"
              : "No"
          }

          · Iscrizioni:
          ${
            torneo.iscrizioni_chiuse
              ? "Chiuse"
              : "aperte"
          }
        </p>
      </div>
    `;

    const requests =
      document.getElementById(
        "richiesteIscrizione"
      );

    if (!requests) {
      return;
    }

    requests.innerHTML =
      window.iscrizioniTorneo.length
        ? window.iscrizioniTorneo
            .map(
              g => `
                <div class="lista-item">
                  <b>${escapeHtml(
                    g.nome_giocatore ||
                      g.nome ||
                      "Giocatore"
                  )}</b>

                  <br>

                  <small>${escapeHtml(
                    g.email || "-"
                  )}</small>

                  <br>

                  <span class="badge">
                    ${escapeHtml(
                      g.stato ||
                        "in attesa"
                    )}
                  </span>

                  <br>

                  <button
                    class="btn"
                    onclick="selezionaGiocatoreAdmin(${JSON.stringify(
                      g.id
                    )})">
                    Gestisci
                  </button>
                </div>
              `
            )
            .join("")
        : `
          <p class="notice">
            Nessuna richiesta di iscrizione.
          </p>
        `;
  }

  window.renderGestioneTorneo =
    renderGestioneTorneo;

  window.selezionaGiocatoreAdmin =
    async function (id) {
      try {
        const client =
          await initSupabase();

        const {
          data,
          error
        } = await client
          .from("iscrizioni")
          .select("*")
          .eq(
            "id",
            id
          )
          .single();

        if (
          error ||
          !data
        ) {
          alert(
            "Giocatore non trovato."
          );

          return;
        }

        window.giocatoreSelezionatoCorrente =
          data;

        const scheda =
          document.getElementById(
            "schedaGiocatoreAdmin"
          );

        if (scheda) {
          scheda.classList.remove(
            "hidden"
          );

          scheda.dataset.giocatoreId =
            data.id;
        }

        const setValue =
          (
            domId,
            value
          ) => {
            const element =
              document.getElementById(
                domId
              );

            if (element) {
              element.value =
                value ?? "";
            }
          };

        setValue(
          "adminNomeGiocatore",
          data.nome_giocatore ||
            data.nome ||
            ""
        );

        setValue(
          "adminEmailGiocatore",
          data.email ||
            ""
        );

        setValue(
          "adminTelefonoGiocatore",
          data.telefono ||
            ""
        );

        setValue(
          "adminLivelloGiocatore",
          data.livello ||
            "-"
        );

        setValue(
          "adminNotaGiocatore",
          data.note ||
            ""
        );

      } catch (e) {
        report(
          "Errore caricamento giocatore",
          e
        );
      }
    };

  window.approvaGiocatore =
    async function () {
      const id =
        window
          .giocatoreSelezionatoCorrente
          ?.id ||
        document.getElementById(
          "schedaGiocatoreAdmin"
        )?.dataset
          ?.giocatoreId;

      if (!id) {
        alert(
          "Nessun giocatore selezionato"
        );

        return;
      }

      try {
        const client =
          await initSupabase();

        const {
          data,
          error
        } = await client
          .from("iscrizioni")
          .update({
            stato: "approvato",
            approvato: true
          })
          .eq(
            "id",
            id
          )
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        window.giocatoreSelezionatoCorrente =
          data;

        window.chiudiSchedaGiocatore();

        await caricaRichiesteIscrizione();

      } catch (e) {
        alert(
          "Errore approvazione: " +
            errorText(e)
        );
      }
    };

  window.rifiutaGiocatore =
    async function () {
      const id =
        window
          .giocatoreSelezionatoCorrente
          ?.id ||
        document.getElementById(
          "schedaGiocatoreAdmin"
        )?.dataset
          ?.giocatoreId;

      if (!id) {
        alert(
          "Nessun giocatore selezionato."
        );

        return;
      }

      try {
        const client =
          await initSupabase();

        const {
          error
        } = await client
          .from("iscrizioni")
          .update({
            stato: "rifiutato",
            approvato: false
          })
          .eq(
            "id",
            id
          );

        if (error) {
          throw error;
        }

        window.chiudiSchedaGiocatore();

        await caricaRichiesteIscrizione();

      } catch (e) {
        alert(
          "Errore durante il rifiuto: " +
            errorText(e)
        );
      }
    };

  window.chiudiSchedaGiocatore =
    function () {
      const scheda =
        document.getElementById(
          "schedaGiocatoreAdmin"
        );

      if (scheda) {
        scheda.classList.add(
          "hidden"
        );

        delete scheda.dataset
          .giocatoreId;
      }

      window.giocatoreSelezionatoCorrente =
        null;
    };

  function renderPartecipanti() {
    const box =
      document.getElementById(
        "partecipantiAdmin"
      );

    if (!box) {
      return;
    }

    const approved =
      window.iscrizioniTorneo.filter(
        g =>
          g &&
          (
            g.stato ===
              "approvato" ||
            g.approvato === true
          )
      );

    box.innerHTML =
      approved.length
        ? approved
            .map(
              g => `
                <div class="lista-item">
                  ✅
                  <b>${escapeHtml(
                    g.nome_giocatore ||
                      g.nome ||
                      "Partecipante"
                  )}</b>
                  —
                  ${escapeHtml(
                    g.email || "-"
                  )}
                </div>
              `
            )
            .join("")
        : `
          <p class="notice">
            Nessun partecipante approvato.
          </p>
        `;
  }

  window.renderPartecipanti =
    renderPartecipanti;

  /* ------------------------------------------------------------------------
     9. COPPIE
     ------------------------------------------------------------------------ */

  function renderCoppie() {
    const box =
      document.getElementById(
        "creaCoppieBox"
      );

    const list =
      document.getElementById(
        "listaCoppieAdmin"
      );

    if (!box) {
      return;
    }

    const torneo =
      getTorneoAdminCorrente();

    if (!torneo) {
      box.innerHTML = `
        <p class="notice">
          Nessun torneo selezionato.
        </p>
      `;

      if (list) {
        list.innerHTML = "";
      }

      return;
    }

    if (
      !Array.isArray(
        torneo.coppie
      )
    ) {
      torneo.coppie = [];
    }

    if (!torneo.configurazione) {
      torneo.configurazione =
        {};
    }

    if (
      !Array.isArray(
        torneo.configurazione.coppie
      )
    ) {
      torneo.configurazione.coppie =
        torneo.coppie;
    }

    const approved =
      window.iscrizioniTorneo.filter(
        g =>
          g &&
          (
            g.stato ===
              "approvato" ||
            g.approvato === true
          )
      );

    const used =
      new Set(
        torneo.coppie.flatMap(
          coppia =>
            [
              coppia?.giocatore1?.id,
              coppia?.giocatore2?.id
            ]
              .filter(
                value =>
                  value != null
              )
              .map(String)
        )
      );

    const available =
      approved.filter(
        g =>
          !used.has(
            String(g.id)
          )
      );

    const name =
      g =>
        escapeHtml(
          [
            g?.nome,
            g?.cognome
          ]
            .filter(Boolean)
            .join(" ") ||
            g?.nome_giocatore ||
            g?.email ||
            "Giocatore"
        );

    if (
      available.length >= 2
    ) {
      box.innerHTML = `
        <div class="pair-form">

          <p>
            <b>Giocatori approvati:</b>
            ${approved.length}
            ·
            <b>Coppie:</b>
            ${torneo.coppie.length}
          </p>

          <select id="adminCoppiaGiocatore1">
            <option value="">
              Primo giocatore
            </option>

            ${available
              .map(
                g => `
                  <option value="${escapeHtml(
                    g.id
                  )}">
                    ${name(g)}
                  </option>
                `
              )
              .join("")}
          </select>

          <select id="adminCoppiaGiocatore2">
            <option value="">
              Secondo giocatore
            </option>

            ${available
              .map(
                g => `
                  <option value="${escapeHtml(
                    g.id
                  )}">
                    ${name(g)}
                  </option>
                `
              )
              .join("")}
          </select>

          <button
            class="btn primary"
            id="btnCreaCoppiaAdmin">
            ＋ Crea coppia
          </button>

        </div>
      `;
    } else {
      box.innerHTML = `
        <p class="notice">
          ${
            approved.length < 2
              ? "Servono almeno due giocatori approvati."
              : "Tutti i giocatori approvati sono già assegnati."
          }
        </p>
      `;
    }

    if (list) {
      list.innerHTML =
        torneo.coppie.length
          ? torneo.coppie
              .map(
                (coppia, index) => `
                  <div class="lista-item">
                    <b>
                      Coppia ${index + 1}
                    </b>

                    <br>
                    👤 ${name(
                      coppia.giocatore1
                    )}

                    <br>
                    👤 ${name(
                      coppia.giocatore2
                    )}
                  </div>
                `
              )
              .join("")
          : `
            <p class="notice">
              Nessuna coppia creata.
            </p>
          `;
    }

    document
      .getElementById(
        "btnCreaCoppiaAdmin"
      )
      ?.addEventListener(
        "click",
        async () => {
          const id1 =
            document.getElementById(
              "adminCoppiaGiocatore1"
            )?.value;

          const id2 =
            document.getElementById(
              "adminCoppiaGiocatore2"
            )?.value;

          if (
            !id1 ||
            !id2 ||
            id1 === id2
          ) {
            alert(
              "Seleziona due giocatori diversi."
            );

            return;
          }

          const g1 =
            approved.find(
              g =>
                String(g.id) ===
                String(id1)
            );

          const g2 =
            approved.find(
              g =>
                String(g.id) ===
                String(id2)
            );

          if (!g1 || !g2) {
            return;
          }

          torneo.coppie.push({
            id: Date.now(),

            giocatore1: {
              id: g1.id,
              nome:
                g1.nome || "",
              cognome:
                g1.cognome || "",
              nome_giocatore:
                g1.nome_giocatore ||
                "",
              email:
                g1.email || ""
            },

            giocatore2: {
              id: g2.id,
              nome:
                g2.nome || "",
              cognome:
                g2.cognome || "",
              nome_giocatore:
                g2.nome_giocatore ||
                "",
              email:
                g2.email || ""
            }
          });

          torneo.configurazione.coppie =
            torneo.coppie;

          const index =
            adminState.tornei.findIndex(
              t =>
                String(t.id) ===
                String(torneo.id)
            );

          if (index >= 0) {
            adminState.tornei[index] =
              torneo;
          }

          salvaAdminState();

          try {
            const client =
              await initSupabase();

            const result =
              await client
                .from("tornei")
                .update({
                  configurazione:
                    torneo.configurazione
                })
                .eq(
                  "id",
                  torneo.id
                );

            if (result.error) {
              console.error(
                result.error
              );
            }
          } catch (e) {
            console.error(
              "Salvataggio coppia non riuscito:",
              e
            );
          }

          renderCoppie();
        }
      );
  }

  window.renderCoppie =
    renderCoppie;

  /* ------------------------------------------------------------------------
     10. WHATSAPP
     ------------------------------------------------------------------------ */

  window.inviaWhatsAppTutti =
    function () {
      const message =
        document.getElementById(
          "messaggioWhatsApp"
        )?.value.trim() ||
        document.getElementById(
          "whatsappMenuMessage"
        )?.value.trim();

      if (!message) {
        alert(
          "Scrivi un messaggio"
        );

        return false;
      }

      window.open(
        "https://api.whatsapp.com/send?text=" +
          encodeURIComponent(
            message
          ),
        "_blank",
        "noopener"
      );

      return true;
    };

  window.inviaWhatsAppApprovati =
    function () {
      return window.inviaWhatsAppTutti();
    };

  /* ------------------------------------------------------------------------
     11. NEWS
     ------------------------------------------------------------------------ */

  async function caricaNewsAdmin() {
    try {
      const client =
        await initSupabase();

      const {
        data,
        error
      } = await client
        .from("news")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );

      if (error) {
        throw error;
      }

      adminState.news =
        Array.isArray(data)
          ? data
          : [];

      salvaAdminState();

      renderNewsAdmin();

    } catch (e) {
      console.error(
        "Errore caricamento news:",
        e
      );
    }
  }

  window.caricaNewsAdmin =
    caricaNewsAdmin;

  function renderNewsAdmin() {
    const list =
      document.getElementById(
        "listaNewsAdmin"
      );

    if (!list) {
      return;
    }

    const items =
      adminState.news ||
      [];

    list.innerHTML =
      items.length
        ? items
            .map(
              n => `
                <div class="lista-item">

                  <b>${escapeHtml(
                    n.titolo ||
                      "News"
                  )}</b>

                  <br>

                  <small>
                    ${escapeHtml(
                      n.created_at ||
                        n.data ||
                        "-"
                    )}
                  </small>

                  <p>
                    ${escapeHtml(
                      n.testo || ""
                    )}
                  </p>

                  <button
                    class="btn danger"
                    onclick="eliminaNewsAdmin(${JSON.stringify(
                      n.id
                    )})">
                    Elimina
                  </button>

                </div>
              `
            )
            .join("")
        : `
          <p class="notice">
            Nessuna news pubblicata.
          </p>
        `;
  }

  window.renderNewsAdmin =
    renderNewsAdmin;

  window.creaNewsAdmin =
    async function () {
      const titolo =
        document.getElementById(
          "adminTitoloNews"
        )?.value.trim();

      const testo =
        document.getElementById(
          "adminTestoNews"
        )?.value.trim();

      if (!titolo || !testo) {
        alert(
          "Compila titolo e testo della news"
        );

        return;
      }

      try {
        const client =
          await initSupabase();

        const {
          data: result,
          error
        } = await client
          .from("news")
          .insert({
            titolo,
            testo
          })
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        if (result) {
          adminState.news.unshift(
            result
          );
        }

        salvaAdminState();
        renderNewsAdmin();

        const titoloInput =
          document.getElementById(
            "adminTitoloNews"
          );

        const testoInput =
          document.getElementById(
            "adminTestoNews"
          );

        if (titoloInput) {
          titoloInput.value = "";
        }

        if (testoInput) {
          testoInput.value = "";
        }

      } catch (e) {
        alert(
          "Errore creazione news: " +
            errorText(e)
        );
      }
    };

  window.eliminaNewsAdmin =
    async function (id) {
      if (
        !confirm(
          "Eliminare questa news?"
        )
      ) {
        return;
      }

      try {
        const client =
          await initSupabase();

        const {
          error
        } = await client
          .from("news")
          .delete()
          .eq(
            "id",
            id
          );

        if (error) {
          throw error;
        }

        adminState.news =
          adminState.news.filter(
            n =>
              String(n.id) !==
              String(id)
          );

        salvaAdminState();
        renderNewsAdmin();

      } catch (e) {
        alert(
          "Errore eliminazione: " +
            errorText(e)
        );
      }
    };

  /* ------------------------------------------------------------------------
     12. SPONSOR
     ------------------------------------------------------------------------ */

  async function caricaSponsorAdmin() {
    try {
      const client =
        await initSupabase();

      const {
        data,
        error
      } = await client
        .from("sponsor")
        .select("*");

      if (error) {
        throw error;
      }

      adminState.sponsor =
        Array.isArray(data)
          ? data
          : [];

      salvaAdminState();

      renderSponsorAdmin();

    } catch (e) {
      console.error(
        "Errore caricamento sponsor:",
        e
      );
    }
  }

  window.caricaSponsorAdmin =
    caricaSponsorAdmin;

  function renderSponsorAdmin() {
    const list =
      document.getElementById(
        "listaSponsorAdmin"
      );

    if (!list) {
      return;
    }

    const items =
      adminState.sponsor ||
      [];

    list.innerHTML =
      items.length
        ? items
            .map(
              sponsor => `
                <div class="lista-item">

                  <b>${escapeHtml(
                    sponsor.nome ||
                      "Sponsor"
                  )}</b>

                  <br>

                  <small>
                    ${escapeHtml(
                      sponsor.categoria ||
                        "-"
                    )}
                  </small>

                  <br>

                  <button
                    class="btn danger"
                    onclick="eliminaSponsorAdmin(${JSON.stringify(
                      sponsor.id
                    )})">
                    Elimina
                  </button>

                </div>
              `
            )
            .join("")
        : `
          <p class="notice">
            Nessuno sponsor inserito.
          </p>
        `;
  }

  window.renderSponsorAdmin =
    renderSponsorAdmin;

  window.creaSponsorAdmin =
    async function () {
      const nome =
        document.getElementById(
          "adminNomeSponsor"
        )?.value.trim();

      const categoria =
        document.getElementById(
          "adminCategoriaSponsor"
        )?.value.trim() ||
        "Gold";

      const logo_url =
        document.getElementById(
          "adminLogoSponsor"
        )?.value.trim() ||
        "";

      if (!nome) {
        alert(
          "Inserisci il nome dello sponsor"
        );

        return;
      }

      try {
        const client =
          await initSupabase();

        const {
          data: result,
          error
        } = await client
          .from("sponsor")
          .insert({
            nome,
            categoria,
            logo_url
          })
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        if (result) {
          adminState.sponsor.push(
            result
          );
        }

        salvaAdminState();
        renderSponsorAdmin();

        const nomeInput =
          document.getElementById(
            "adminNomeSponsor"
          );

        const logoInput =
          document.getElementById(
            "adminLogoSponsor"
          );

        if (nomeInput) {
          nomeInput.value = "";
        }

        if (logoInput) {
          logoInput.value = "";
        }

      } catch (e) {
        alert(
          "Errore inserimento sponsor: " +
            errorText(e)
        );
      }
    };

  window.eliminaSponsorAdmin =
    async function (id) {
      if (
        !confirm(
          "Rimuovere questo sponsor?"
        )
      ) {
        return;
      }

      try {
        const client =
          await initSupabase();

        const {
          error
        } = await client
          .from("sponsor")
          .delete()
          .eq(
            "id",
            id
          );

        if (error) {
          throw error;
        }

        adminState.sponsor =
          adminState.sponsor.filter(
            sponsor =>
              String(
                sponsor.id
              ) !==
              String(id)
          );

        salvaAdminState();
        renderSponsorAdmin();

      } catch (e) {
        alert(
          "Errore eliminazione sponsor: " +
            errorText(e)
        );
      }
    };

  /* ------------------------------------------------------------------------
     13. CALENDARIO BIENNALE
     ------------------------------------------------------------------------ */

  window.creaCalendarioBiennale =
    function () {
      const annoInizio =
        Number(
          document.getElementById(
            "calendarioAnnoInizio"
          )?.value
        ) || 2026;

      const frequenza =
        document.getElementById(
          "calendarioFrequenza"
        )?.value ||
        "mensile";

      const baseNome =
        document.getElementById(
          "calendarioNomeBase"
        )?.value.trim() ||
        "Torneo Padel";

      const posti =
        Number(
          document.getElementById(
            "calendarioPosti"
          )?.value
        ) || 8;

      const generati = [];

      let current =
        new Date(
          annoInizio,
          0,
          15
        );

      const fine =
        new Date(
          annoInizio + 1,
          11,
          31
        );

      while (
        current <= fine
      ) {
        const data =
          current
            .toISOString()
            .split("T")[0];

        const nome =
          `${baseNome} - ${current
            .toLocaleString(
              "it-IT",
              {
                month:
                  "long",
                year:
                  "numeric"
              }
            )
            .toUpperCase()}`;

        generati.push({
          id:
            "gen_" +
            Date.now() +
            Math.floor(
              Math.random() *
                1000
            ),

          nome,

          data,

          posti,

          descrizione:
            "Torneo ufficiale programmato da calendario biennale 2026-2028.",

          stato:
            "bozza",

          configurazione: {
            rules: {
              numeroSquadre:
                posti,

              numeroGironi:
                Math.ceil(
                  posti / 4
                ),

              squadrePerGirone:
                4
            }
          }
        });

        if (
          frequenza ===
          "settimanale"
        ) {
          current.setDate(
            current.getDate() +
              7
          );
        } else if (
          frequenza ===
          "quindicinale"
        ) {
          current.setDate(
            current.getDate() +
              14
          );
        } else {
          current.setMonth(
            current.getMonth() +
              1
          );
        }
      }

      if (
        !Array.isArray(
          adminState.tornei
        )
      ) {
        adminState.tornei = [];
      }

      adminState.tornei.push(
        ...generati
      );

      salvaAdminState();
      renderAdmin();

      alert(
        `Creati con successo ${generati.length} tornei per il calendario biennale!`
      );
    };

  /* ------------------------------------------------------------------------
     14. RENDER TORNEI
     ------------------------------------------------------------------------ */

  function renderAdmin() {
    const box =
      document.getElementById(
        "listaTorneiAdmin"
      );

    if (!box) {
      return;
    }

    const tornei =
      Array.isArray(
        adminState.tornei
      )
        ? adminState.tornei
        : [];

    box.innerHTML =
      tornei.length
        ? tornei
            .map(
              torneo => `
                <div class="lista-item">

                  <b>${escapeHtml(
                    torneo.nome ||
                      "Torneo"
                  )}</b>

                  (${escapeHtml(
                    torneo.data ||
                      "-"
                  )})

                  <br>

                  <small>
                    Stato:
                    ${escapeHtml(
                      torneo.stato ||
                        "bozza"
                    )}
                  </small>

                  <br>

                  <button
                    class="btn"
                    onclick="selezionaTorneoAdmin(${JSON.stringify(
                      torneo.id
                    )})">
                    Seleziona
                  </button>

                  <button
                    class="btn danger"
                    onclick="eliminaTorneoAdmin(${JSON.stringify(
                      torneo.id
                    )})">
                    Elimina
                  </button>

                </div>
              `
            )
            .join("")
        : `
          <p class="notice">
            Nessun torneo disponibile.
          </p>
        `;
  }

  window.renderAdmin =
    renderAdmin;

  window.selezionaTorneoAdmin =
    async function (id) {
      adminState.torneoSelezionato =
        id;

      salvaAdminState();

      window.generaLinkPerId?.(
        id
      );

      await caricaRichiesteIscrizione();

      renderGestioneTorneo();
      renderPartecipanti();
      renderCoppie();
      renderAdmin();
    };

  /* ------------------------------------------------------------------------
     15. AVVIO
     ------------------------------------------------------------------------

     FONDAMENTALE:

     NON viene definito mount().
     NON viene definito __adminDesktopRender.
     NON viene modificato il contenuto di #areaAdmin.

     admin.html contiene già:
       .desktop-app
       .desktop-nav
       .admin-page
       #page-dashboard
       #page-configurazione
       ecc.

     Questo file si limita a gestire i dati e i pulsanti.
     ------------------------------------------------------------------------ */

  async function avviaAdmin() {
    caricaAdminState();

    if (!adminState.adminLoggato) {
      return;
    }

    const loginBox =
      document.getElementById(
        "boxLoginAdmin"
      );

    const area =
      document.getElementById(
        "areaAdmin"
      );

    if (loginBox) {
      loginBox.classList.add(
        "hidden"
      );
    }

    if (area) {
      area.classList.remove(
        "hidden"
      );
    }

    /*
     * NON fare:
     *
     * area.innerHTML = "";
     *
     * NON creare un nuovo desktop.
     */

    try {
      await initSupabase();

      await caricaTorneiSupabase();
      await caricaRichiesteIscrizione();
      await caricaNewsAdmin();
      await caricaSponsorAdmin();

      renderAdmin();
      renderGestioneTorneo();
      renderPartecipanti();
      renderCoppie();

    } catch (e) {
      console.error(
        "[ADMIN] Avvio non riuscito:",
        e
      );
    }
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      avviaAdmin,
      {
        once: true
      }
    );
  } else {
    avviaAdmin();
  }

})();

