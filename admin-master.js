/*

* PADEL ADMIN MASTER CONSOLE
* Versione coordinata con admin.html statico
* Versione 22
  */

(function () {
"use strict";

/* ============================================================
CONFIGURAZIONE SUPABASE
============================================================ */

const SUPABASE_URL =
"https://iybjvtmfaupgthqqsngd.supabase.co";

const SUPABASE_KEY =
"sb_publishable_oLLML3_ne0I1dWKIinSRNA_K1Ao5SOl";

let supabaseClient = null;
let supabaseInitPromise = null;

/* ============================================================
STATO ADMIN
============================================================ */

const defaultState = {
adminLoggato: false,
adminEmail: "",
torneoSelezionato: null,
tornei: [],
sponsor: [],
news: [],
iscrizioni: []
};

let adminState = Object.assign({}, defaultState);

function sincronizzaAdminState() {
window.adminState = adminState;
}

sincronizzaAdminState();

function salvaStato() {
try {
localStorage.setItem(
"padel_admin_state",
JSON.stringify(adminState)
);
} catch (error) {
console.warn(
"Impossibile salvare lo stato admin:",
error
);
}

```
sincronizzaAdminState();
```

}

function caricaStato() {
try {
const raw = localStorage.getItem(
"padel_admin_state"
);

```
  if (!raw) {
    sincronizzaAdminState();
    return;
  }

  const parsed = JSON.parse(raw);

  if (
    parsed &&
    typeof parsed === "object"
  ) {
    adminState = Object.assign(
      {},
      defaultState,
      parsed
    );
  }
} catch (error) {
  console.warn(
    "Stato admin non valido:",
    error
  );

  adminState = Object.assign(
    {},
    defaultState
  );
}

sincronizzaAdminState();
```

}

/* ============================================================
NAVIGAZIONE
============================================================ */

const PAGE_MAP = {
dashboard: "dashboard",
configurazione: "configurazione",
config: "configurazione",
iscritti: "iscritti",
coppie: "coppie",
tabellone: "tabellone",
news: "news",
sponsor: "sponsor",
whatsapp: "whatsapp",
link: "link"
};

function normalizzaPagina(page) {
if (!page) {
return "dashboard";
}

```
let value = String(page)
  .trim()
  .replace(/^#/, "")
  .toLowerCase();

if (value === "home") {
  value = "dashboard";
}

return PAGE_MAP[value] || "dashboard";
```

}

window.normalizzaPagina = normalizzaPagina;

window.openAdminPage = function (
page,
updateHash
) {
const pagina = normalizzaPagina(page);

```
if (updateHash !== false) {
  try {
    window.location.hash = pagina;
  } catch (error) {
    console.warn(
      "Impossibile aggiornare hash:",
      error
    );
  }
}

document
  .querySelectorAll(
    ".admin-page, .desktop-page"
  )
  .forEach(function (element) {
    element.classList.add("hidden");
  });

Object.keys(PAGE_MAP).forEach(function (key) {
  const id = PAGE_MAP[key];

  const element =
    document.getElementById(
      "page-" + id
    );

  if (element) {
    element.classList.add("hidden");
  }
});

const target =
  document.getElementById(
    "page-" + pagina
  );

if (target) {
  target.classList.remove("hidden");
}

document
  .querySelectorAll(
    ".desktop-nav button, .desktop-nav a, .nav button"
  )
  .forEach(function (element) {
    const targetPage =
      element.dataset.page ||
      element.dataset.target ||
      element.getAttribute("data-page") ||
      element.getAttribute("data-target") ||
      "";

    if (
      normalizzaPagina(targetPage) ===
      pagina
    ) {
      element.classList.add("active");
    } else {
      element.classList.remove("active");
    }
  });

if (
  pagina === "dashboard" &&
  typeof window.renderAdmin === "function"
) {
  window.renderAdmin();
}

if (
  pagina === "tabellone" &&
  typeof window.renderAdmin === "function"
) {
  window.renderAdmin();
}

if (
  pagina === "link" &&
  typeof window.generaLinkBove === "function"
) {
  const id = getSelectedTournamentId();

  if (
    id !== null &&
    id !== undefined &&
    id !== ""
  ) {
    window.generaLinkBove();
  }
}

return true;
```

};

/* ============================================================
SUPABASE
============================================================ */

function initSupabase() {
if (supabaseClient) {
return Promise.resolve(
supabaseClient
);
}

```
if (supabaseInitPromise) {
  return supabaseInitPromise;
}

supabaseInitPromise =
  new Promise(function (
    resolve,
    reject
  ) {
    function createClientNow() {
      if (
        !window.supabase ||
        typeof window.supabase.createClient !==
          "function"
      ) {
        reject(
          new Error(
            "Libreria Supabase non disponibile."
          )
        );
        return;
      }

      try {
        supabaseClient =
          window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
          );

        window.sb =
          supabaseClient;

        window.supabaseClient =
          supabaseClient;

        resolve(
          supabaseClient
        );
      } catch (error) {
        reject(error);
      }
    }

    if (
      window.supabase &&
      typeof window.supabase.createClient ===
        "function"
    ) {
      createClientNow();
      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

    script.async = true;

    script.onload =
      createClientNow;

    script.onerror =
      function () {
        reject(
          new Error(
            "Impossibile caricare Supabase."
          )
        );
      };

    document.head.appendChild(
      script
    );
  });

return supabaseInitPromise;
```

}

window.initAdminSupabase =
initSupabase;

/* ============================================================
UTILITY
============================================================ */

function escapeHtml(value) {
if (
value === null ||
value === undefined
) {
return "";
}

```
return String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");
```

}

function getAreaAdmin() {
return document.getElementById(
"areaAdmin"
);
}

function getSelectedTournament() {
const id =
adminState.torneoSelezionato;

```
if (
  id === null ||
  id === undefined ||
  id === ""
) {
  return null;
}

return (
  adminState.tornei.find(
    function (torneo) {
      return (
        String(torneo.id) ===
        String(id)
      );
    }
  ) || null
);
```

}

function getSelectedTournamentId() {
const torneo =
getSelectedTournament();

```
if (torneo) {
  return torneo.id;
}

return adminState.torneoSelezionato;
```

}

function showMessage(
elementId,
message
) {
const element =
document.getElementById(
elementId
);

```
if (element) {
  element.textContent =
    message || "";
}
```

}

/* ============================================================
LINK BOVE
============================================================ */

function generaLinkValue(id) {
if (
id === null ||
id === undefined ||
id === ""
) {
return "";
}

```
return (
  window.location.origin +
  window.location.pathname.replace(
    /[^/]*$/,
    ""
  ) +
  "Bove.html?idTorneo=" +
  encodeURIComponent(
    String(id)
  )
);
```

}

function setLinkBove(value) {
if (!value) {
return;
}

```
[
  "linkBoveGenerato",
  "linkBoveGeneratoMirror"
].forEach(function (id) {
  const element =
    document.getElementById(id);

  if (element) {
    element.value = value;
  }
});

try {
  localStorage.setItem(
    "padel_admin_generated_link",
    value
  );

  sessionStorage.setItem(
    "padel_admin_generated_link",
    value
  );
} catch (error) {
  console.warn(
    "Storage link non disponibile:",
    error
  );
}
```

}

window.generaLinkBove =
function () {
const id =
getSelectedTournamentId();

```
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    alert(
      "Seleziona prima un torneo."
    );
    return false;
  }

  const link =
    generaLinkValue(id);

  setLinkBove(link);

  return true;
};
```

window.generaLinkBoveMirror =
function () {
return window.generaLinkBove();
};

window.copiaLinkBove =
async function () {
let value = "";

```
  const input =
    document.getElementById(
      "linkBoveGenerato"
    );

  if (input) {
    value =
      input.value.trim();
  }

  if (!value) {
    const mirror =
      document.getElementById(
        "linkBoveGeneratoMirror"
      );

    if (mirror) {
      value =
        mirror.value.trim();
    }
  }

  if (!value) {
    window.generaLinkBove();

    if (input) {
      value =
        input.value.trim();
    }
  }

  if (!value) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(
      value
    );

    alert(
      "Link copiato."
    );

    return true;
  } catch (error) {
    if (input) {
      input.focus();
      input.select();

      try {
        document.execCommand(
          "copy"
        );

        alert(
          "Link copiato."
        );

        return true;
      } catch (copyError) {
        console.warn(
          "Copia fallback fallita:",
          copyError
        );
      }
    }

    alert(
      "Non è stato possibile copiare il link."
    );

    return false;
  }
};
```

window.apriBoveConTorneo =
function () {
const id =
getSelectedTournamentId();

```
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    alert(
      "Seleziona prima un torneo."
    );

    return false;
  }

  const url =
    generaLinkValue(id);

  window.open(
    url,
    "_blank",
    "noopener"
  );

  return true;
};
```

window.generaLink =
window.generaLinkBove;

window.copiaLink =
window.copiaLinkBove;

window.apriLink =
window.apriBoveConTorneo;

window.generaLinkAdmin =
window.generaLinkBove;

/* ============================================================
LOGIN
============================================================ */

window.loginAdmin =
async function () {
const email =
document.getElementById(
"emailAdmin"
)?.value.trim();

```
  const password =
    document.getElementById(
      "passwordAdmin"
    )?.value || "";

  if (!email || !password) {
    showMessage(
      "messaggioLoginAdmin",
      "Inserisci email e password."
    );

    return false;
  }

  try {
    const sb =
      await initSupabase();

    const result =
      await sb.auth.signInWithPassword({
        email: email,
        password: password
      });

    if (result.error) {
      throw result.error;
    }

    adminState.adminLoggato =
      true;

    adminState.adminEmail =
      email;

    salvaStato();

    mostraAdmin();

    await Promise.all([
      caricaTorneiSupabase(),
      caricaNewsAdmin(),
      caricaSponsorAdmin()
    ]);

    return true;
  } catch (error) {
    console.error(
      "Login admin:",
      error
    );

    showMessage(
      "messaggioLoginAdmin",
      error.message ||
      "Errore durante l'accesso."
    );

    return false;
  }
};
```

async function logoutAdmin() {
try {
if (supabaseClient) {
await supabaseClient.auth.signOut();
}
} catch (error) {
console.warn(
"Logout Supabase:",
error
);
}

```
adminState.adminLoggato =
  false;

adminState.adminEmail =
  "";

salvaStato();

const login =
  document.getElementById(
    "boxLoginAdmin"
  );

const area =
  getAreaAdmin();

if (login) {
  login.classList.remove(
    "hidden"
  );
}

if (area) {
  area.classList.add(
    "hidden"
  );
}
```

}

window.logoutAdmin =
logoutAdmin;

function mostraAdmin() {
const login =
document.getElementById(
"boxLoginAdmin"
);

```
const area =
  getAreaAdmin();

if (login) {
  login.classList.add(
    "hidden"
  );
}

if (area) {
  area.classList.remove(
    "hidden"
  );
}

const email =
  document.getElementById(
    "adminEmailVisual"
  );

if (email) {
  email.textContent =
    adminState.adminEmail || "";
}
```

}

/* ============================================================
TORNEI
============================================================ */

async function caricaTorneiSupabase() {
try {
const sb =
await initSupabase();

```
  const result =
    await sb
      .from("tornei")
      .select("*")
      .order("id", {
        ascending: false
      });

  if (result.error) {
    throw result.error;
  }

  adminState.tornei =
    Array.isArray(result.data)
      ? result.data
      : [];

  if (
    adminState.torneoSelezionato ===
      null ||
    adminState.torneoSelezionato ===
      undefined
  ) {
    if (
      adminState.tornei.length
    ) {
      adminState.torneoSelezionato =
        adminState.tornei[0].id;
    }
  }

  salvaStato();

  renderListaTornei();
  renderTorneoSelezionato();

  const selected =
    getSelectedTournamentId();

  if (
    selected !== null &&
    selected !== undefined &&
    selected !== ""
  ) {
    await caricaRichiesteIscrizione(
      selected
    );
  }

  return adminState.tornei;
} catch (error) {
  console.error(
    "Caricamento tornei:",
    error
  );

  renderListaTornei();

  return [];
}
```

}

window.caricaTorneiSupabase =
caricaTorneiSupabase;

window.caricaTornei =
caricaTorneiSupabase;

window.caricaTorneiAdmin =
caricaTorneiSupabase;

function renderListaTornei() {
const select =
document.getElementById(
"selectTorneoAdmin"
);

```
if (!select) {
  return;
}

select.innerHTML =
  '<option value="">Seleziona un torneo</option>';

adminState.tornei.forEach(
  function (torneo) {
    const option =
      document.createElement(
        "option"
      );

    option.value =
      torneo.id;

    const nome =
      torneo.nome ||
      torneo.titolo ||
      torneo.name ||
      ("Torneo " + torneo.id);

    option.textContent =
      nome;

    if (
      String(torneo.id) ===
      String(
        adminState.torneoSelezionato
      )
    ) {
      option.selected = true;
    }

    select.appendChild(
      option
    );
  }
);
```

}

function renderTorneoSelezionato() {
const container =
document.getElementById(
"dettaglioTorneoAdmin"
);

```
if (!container) {
  return;
}

const torneo =
  getSelectedTournament();

if (!torneo) {
  container.innerHTML =
    "<p>Nessun torneo selezionato.</p>";

  return;
}

const nome =
  torneo.nome ||
  torneo.titolo ||
  torneo.name ||
  "Torneo";

const stato =
  torneo.stato ||
  torneo.status ||
  "";

container.innerHTML = `
  <div class="admin-tournament-detail">
    <strong>${escapeHtml(nome)}</strong>
    <div>ID: ${escapeHtml(torneo.id)}</div>
    ${
      stato
        ? `<div>Stato: ${escapeHtml(stato)}</div>`
        : ""
    }
  </div>
`;

setLinkBove(
  generaLinkValue(
    torneo.id
  )
);
```

}

function onTournamentChange(event) {
const value =
event.target.value;

```
if (!value) {
  adminState.torneoSelezionato =
    null;

  salvaStato();

  renderTorneoSelezionato();

  return;
}

const torneo =
  adminState.tornei.find(
    function (item) {
      return (
        String(item.id) ===
        String(value)
      );
    }
  );

if (torneo) {
  adminState.torneoSelezionato =
    torneo.id;

  salvaStato();

  renderTorneoSelezionato();

  caricaRichiesteIscrizione(
    torneo.id
  );
}
```

}

/* ============================================================
NUOVO TORNEO
============================================================ */

window.apriRegoleNuovoTorneo =
function () {
const nome =
prompt(
"Nome del nuovo torneo:"
);

```
  if (!nome) {
    return false;
  }

  return window.creaNuovoTorneo(
    nome.trim()
  );
};
```

window.creaNuovoTorneo =
async function (
nomeParam
) {
const nome =
nomeParam ||
prompt(
"Nome del nuovo torneo:"
);

```
  if (!nome) {
    return false;
  }

  try {
    const sb =
      await initSupabase();

    const id =
      Date.now();

    const payload = {
      id: id,
      nome: String(nome).trim(),
      stato: "bozza",
      pubblicato: false,
      iscrizioni_aperte: true
    };

    const result =
      await sb
        .from("tornei")
        .insert(payload)
        .select()
        .single();

    if (result.error) {
      throw result.error;
    }

    adminState.torneoSelezionato =
      result.data.id;

    await caricaTorneiSupabase();

    window.openAdminPage(
      "configurazione"
    );

    return result.data;
  } catch (error) {
    console.error(
      "Creazione torneo:",
      error
    );

    alert(
      error.message ||
      "Errore durante la creazione del torneo."
    );

    return false;
  }
};
```

window.creaTorneo =
window.creaNuovoTorneo;

/* ============================================================
PUBBLICAZIONE
============================================================ */

window.pubblicaTorneo =
async function () {
const id =
getSelectedTournamentId();

```
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    alert(
      "Seleziona prima un torneo."
    );

    return false;
  }

  try {
    const sb =
      await initSupabase();

    const result =
      await sb
        .from("tornei")
        .update({
          pubblicato: true,
          stato: "pubblicato"
        })
        .eq("id", id);

    if (result.error) {
      throw result.error;
    }

    await caricaTorneiSupabase();

    alert(
      "Torneo pubblicato."
    );

    return true;
  } catch (error) {
    console.error(
      "Pubblicazione torneo:",
      error
    );

    alert(
      error.message ||
      "Errore durante la pubblicazione."
    );

    return false;
  }
};
```

window.pubblicaTorneoAdmin =
window.pubblicaTorneo;

window.chiudiIscrizioniTorneo =
async function () {
const id =
getSelectedTournamentId();

```
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    alert(
      "Seleziona prima un torneo."
    );

    return false;
  }

  try {
    const sb =
      await initSupabase();

    const result =
      await sb
        .from("tornei")
        .update({
          iscrizioni_aperte: false
        })
        .eq("id", id);

    if (result.error) {
      throw result.error;
    }

    await caricaTorneiSupabase();

    alert(
      "Iscrizioni chiuse."
    );

    return true;
  } catch (error) {
    console.error(
      "Chiusura iscrizioni:",
      error
    );

    alert(
      error.message ||
      "Errore durante la chiusura delle iscrizioni."
    );

    return false;
  }
};
```

window.chiudiIscrizioni =
window.chiudiIscrizioniTorneo;

/* ============================================================
ISCRIZIONI
============================================================ */

async function caricaRichiesteIscrizione(
tournamentId
) {
const container =
document.getElementById(
"listaIscrittiAdmin"
);

```
if (!container) {
  return [];
}

if (
  tournamentId === null ||
  tournamentId === undefined ||
  tournamentId === ""
) {
  container.innerHTML =
    "<p>Nessun torneo selezionato.</p>";

  return [];
}

try {
  const sb =
    await initSupabase();

  const result =
    await sb
      .from("iscrizioni")
      .select("*")
      .eq(
        "torneo_id",
        tournamentId
      )
      .order("created_at", {
        ascending: false
      });

  if (result.error) {
    throw result.error;
  }

  adminState.iscrizioni =
    Array.isArray(result.data)
      ? result.data
      : [];

  salvaStato();

  renderIscrizioni();

  return adminState.iscrizioni;
} catch (error) {
  console.error(
    "Caricamento iscrizioni:",
    error
  );

  container.innerHTML =
    "<p>Impossibile caricare le iscrizioni.</p>";

  return [];
}
```

}

window.caricaRichiesteIscrizione =
caricaRichiesteIscrizione;

window.caricaIscrizioni =
caricaRichiesteIscrizione;

function renderIscrizioni() {
const container =
document.getElementById(
"listaIscrittiAdmin"
);

```
if (!container) {
  return;
}

const rows =
  adminState.iscrizioni || [];

if (!rows.length) {
  container.innerHTML =
    "<p>Nessuna iscrizione trovata.</p>";

  return;
}

container.innerHTML = `
  <div class="admin-table-wrap">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Giocatore</th>
          <th>Email</th>
          <th>Stato</th>
          <th>Azione</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(
          function (
            item,
            index
          ) {
            const nome =
              item.nome ||
              item.nome_giocatore ||
              item.nome_completo ||
              item.name ||
              "Giocatore";

            const email =
              item.email ||
              item.email_giocatore ||
              "";

            const stato =
              item.stato ||
              item.status ||
              "in_attesa";

            return `
              <tr>
                <td>${escapeHtml(nome)}</td>
                <td>${escapeHtml(email)}</td>
                <td>${escapeHtml(stato)}</td>
                <td>
                  <button
                    type="button"
                    data-iscrizione-index="${index}"
                    class="btn-scheda-iscrizione"
                  >
                    Gestisci
                  </button>
                </td>
              </tr>
            `;
          }
        ).join("")}
      </tbody>
    </table>
  </div>
`;

container
  .querySelectorAll(
    ".btn-scheda-iscrizione"
  )
  .forEach(function (
    button
  ) {
    button.addEventListener(
      "click",
      function () {
        const index =
          Number(
            button.dataset
              .iscrizioneIndex
          );

        apriSchedaGiocatore(
          index
        );
      }
    );
  });
```

}

let iscrizioneSelezionata =
null;

function apriSchedaGiocatore(
index
) {
const item =
adminState.iscrizioni[
index
];

```
if (!item) {
  return;
}

iscrizioneSelezionata =
  item;

const box =
  document.getElementById(
    "schedaGiocatoreAdmin"
  );

const detail =
  document.getElementById(
    "dettaglioGiocatoreAdmin"
  );

if (!box || !detail) {
  return;
}

detail.innerHTML = `
  <p>
    <strong>
      ${escapeHtml(
        item.nome ||
        item.nome_giocatore ||
        item.nome_completo ||
        item.name ||
        "Giocatore"
      )}
    </strong>
  </p>

  ${
    item.email
      ? `<p>Email: ${escapeHtml(item.email)}</p>`
      : ""
  }

  ${
    item.telefono
      ? `<p>Telefono: ${escapeHtml(item.telefono)}</p>`
      : ""
  }

  ${
    item.categoria
      ? `<p>Categoria: ${escapeHtml(item.categoria)}</p>`
      : ""
  }

  ${
    item.stato
      ? `<p>Stato: ${escapeHtml(item.stato)}</p>`
      : ""
  }
`;

box.classList.remove(
  "hidden"
);
```

}

window.approvaGiocatore =
async function () {
return cambiaStatoIscrizione(
"approvato"
);
};

window.approvaIscrizione =
window.approvaGiocatore;

window.rifiutaGiocatore =
async function () {
return cambiaStatoIscrizione(
"rifiutato"
);
};

window.rifiutaIscrizione =
window.rifiutaGiocatore;

async function cambiaStatoIscrizione(
stato
) {
if (!iscrizioneSelezionata) {
alert(
"Seleziona prima un giocatore."
);

```
  return false;
}

if (
  !iscrizioneSelezionata.id
) {
  alert(
    "L'iscrizione selezionata non ha un ID valido."
  );

  return false;
}

try {
  const sb =
    await initSupabase();

  const result =
    await sb
      .from("iscrizioni")
      .update({
        stato: stato
      })
      .eq(
        "id",
        iscrizioneSelezionata.id
      );

  if (result.error) {
    throw result.error;
  }

  const torneoId =
    getSelectedTournamentId();

  await caricaRichiesteIscrizione(
    torneoId
  );

  iscrizioneSelezionata =
    null;

  window.chiudiSchedaGiocatore();

  return true;
} catch (error) {
  console.error(
    "Aggiornamento iscrizione:",
    error
  );

  alert(
    error.message ||
    "Errore durante l'aggiornamento."
  );

  return false;
}
```

}

window.chiudiSchedaGiocatore =
function () {
const box =
document.getElementById(
"schedaGiocatoreAdmin"
);

```
  if (box) {
    box.classList.add(
      "hidden"
    );
  }

  iscrizioneSelezionata =
    null;
};
```

/* ============================================================
COPPIE
============================================================ */

window.generaCoppieAdmin =
function () {
const torneo =
getSelectedTournament();

```
  if (!torneo) {
    alert(
      "Seleziona prima un torneo."
    );

    return false;
  }

  const iscritti =
    (adminState.iscrizioni || [])
      .filter(function (item) {
        return (
          String(
            item.stato ||
            item.status ||
            ""
          ).toLowerCase() ===
          "approvato"
        );
      });

  if (!iscritti.length) {
    alert(
      "Non ci sono giocatori approvati."
    );

    return false;
  }

  const shuffled =
    iscritti
      .slice()
      .sort(function () {
        return (
          Math.random() - 0.5
        );
      });

  const coppie = [];

  for (
    let i = 0;
    i < shuffled.length;
    i += 2
  ) {
    const a =
      shuffled[i];

    const b =
      shuffled[i + 1] ||
      null;

    coppie.push({
      id:
        "coppia_" +
        Date.now() +
        "_" +
        i,

      giocatore1:
        a.id ||
        a.nome ||
        a.nome_giocatore ||
        "",

      giocatore2:
        b
          ? (
              b.id ||
              b.nome ||
              b.nome_giocatore ||
              ""
            )
          : null
    });
  }

  salvaCoppieLocali(
    torneo,
    coppie
  );

  renderCoppie(
    coppie
  );

  return coppie;
};
```

window.generaCoppie =
window.generaCoppieAdmin;

window.generaCoppieAutomatiche =
window.generaCoppieAdmin;

window.generaCoppieLocali =
window.generaCoppieAdmin;

window.generaSfide =
window.generaCoppieAdmin;

window.accoppiaACaso =
window.generaCoppieAdmin;

window.accoppiaCasualmente =
window.generaCoppieAdmin;

window.generaCoppieCasuali =
window.generaCoppieAdmin;

window.creaCoppieCasuali =
window.generaCoppieAdmin;

function salvaCoppieLocali(
torneo,
coppie
) {
torneo.configurazione =
torneo.configurazione || {};

```
torneo.configurazione.coppie =
  coppie;

torneo.coppie =
  coppie;

const index =
  adminState.tornei.findIndex(
    function (item) {
      return (
        String(item.id) ===
        String(torneo.id)
      );
    }
  );

if (index >= 0) {
  adminState.tornei[index] =
    torneo;
}

salvaStato();
```

}

function renderCoppie(
coppie
) {
const container =
document.getElementById(
"coppieAdmin"
);

```
if (!container) {
  return;
}

if (!coppie.length) {
  container.innerHTML =
    "<p>Nessuna coppia.</p>";

  return;
}

container.innerHTML = `
  <div class="admin-coppie-list">
    ${coppie.map(
      function (
        coppia,
        index
      ) {
        return `
          <div class="admin-coppia">
            <strong>
              Coppia ${index + 1}
            </strong>

            <div>
              ${escapeHtml(
                coppia.giocatore1
              )}
            </div>

            <div>
              ${
                coppia.giocatore2
                  ? escapeHtml(
                      coppia.giocatore2
                    )
                  : "In attesa"
              }
            </div>
          </div>
        `;
      }
    ).join("")}
  </div>
`;
```

}

/* ============================================================
TABELELLONE
============================================================ */

function renderTabellone() {
const container =
document.getElementById(
"tabelloneAdmin"
);

```
if (!container) {
  return;
}

const torneo =
  getSelectedTournament();

if (!torneo) {
  container.innerHTML =
    "<p>Nessun torneo selezionato.</p>";

  return;
}

const coppie =
  torneo.coppie ||
  torneo.configurazione?.coppie ||
  [];

if (!coppie.length) {
  container.innerHTML =
    "<p>Nessuna coppia presente. Genera prima le coppie.</p>";

  return;
}

container.innerHTML = `
  <div class="admin-tabellone">
    ${coppie.map(
      function (
        coppia,
        index
      ) {
        return `
          <div class="admin-match">
            <strong>
              Match ${index + 1}
            </strong>

            <div>
              ${escapeHtml(
                coppia.giocatore1
              )}
            </div>

            <div>
              ${escapeHtml(
                coppia.giocatore2 ||
                "BYE"
              )}
            </div>
          </div>
        `;
      }
    ).join("")}
  </div>
`;
```

}

/* ============================================================
NEWS
============================================================ */

async function caricaNewsAdmin() {
try {
const sb =
await initSupabase();

```
  const result =
    await sb
      .from("news")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (result.error) {
    throw result.error;
  }

  adminState.news =
    Array.isArray(result.data)
      ? result.data
      : [];

  salvaStato();

  renderNews();

  return adminState.news;
} catch (error) {
  console.error(
    "Caricamento news:",
    error
  );

  adminState.news =
    adminState.news || [];

  renderNews();

  return adminState.news;
}
```

}

window.caricaNewsAdmin =
caricaNewsAdmin;

function renderNews() {
const container =
document.getElementById(
"listaNewsAdmin"
);

```
if (!container) {
  return;
}

if (!adminState.news.length) {
  container.innerHTML =
    "<p>Nessuna news.</p>";

  return;
}

container.innerHTML =
  adminState.news
    .map(function (item) {
      return `
        <article class="admin-news-item">
          <h3>
            ${escapeHtml(
              item.titolo ||
              item.title ||
              "News"
            )}
          </h3>

          <p>
            ${escapeHtml(
              item.testo ||
              item.contenuto ||
              item.body ||
              ""
            )}
          </p>
        </article>
      `;
    })
    .join("");
```

}

window.creaNewsAdmin =
async function () {
const titolo =
document.getElementById(
"titoloNewsAdmin"
)?.value.trim();

```
  const testo =
    document.getElementById(
      "testoNewsAdmin"
    )?.value.trim();

  if (!titolo || !testo) {
    alert(
      "Inserisci titolo e testo della news."
    );

    return false;
  }

  try {
    const sb =
      await initSupabase();

    const result =
      await sb
        .from("news")
        .insert({
          titolo: titolo,
          testo: testo
        })
        .select()
        .single();

    if (result.error) {
      throw result.error;
    }

    const titoloInput =
      document.getElementById(
        "titoloNewsAdmin"
      );

    const testoInput =
      document.getElementById(
        "testoNewsAdmin"
      );

    if (titoloInput) {
      titoloInput.value = "";
    }

    if (testoInput) {
      testoInput.value = "";
    }

    await caricaNewsAdmin();

    return result.data;
  } catch (error) {
    console.error(
      "Creazione news:",
      error
    );

    alert(
      error.message ||
      "Errore durante la creazione della news."
    );

    return false;
  }
};
```

window.creaNews =
window.creaNewsAdmin;

/* ============================================================
SPONSOR
============================================================ */

async function caricaSponsorAdmin() {
try {
const sb =
await initSupabase();

```
  const result =
    await sb
      .from("sponsor")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (result.error) {
    throw result.error;
  }

  adminState.sponsor =
    Array.isArray(result.data)
      ? result.data
      : [];

  salvaStato();

  renderSponsor();

  return adminState.sponsor;
} catch (error) {
  console.error(
    "Caricamento sponsor:",
    error
  );

  adminState.sponsor =
    adminState.sponsor || [];

  renderSponsor();

  return adminState.sponsor;
}
```

}

window.caricaSponsorAdmin =
caricaSponsorAdmin;

function renderSponsor() {
const container =
document.getElementById(
"listaSponsorAdmin"
);

```
if (!container) {
  return;
}

if (!adminState.sponsor.length) {
  container.innerHTML =
    "<p>Nessuno sponsor.</p>";

  return;
}

container.innerHTML =
  adminState.sponsor
    .map(function (item) {
      const nome =
        item.nome ||
        item.name ||
        "Sponsor";

      const logo =
        item.logo ||
        item.logo_url ||
        "";

      const link =
        item.link ||
        item.url ||
        "";

      return `
        <article class="admin-sponsor-item">

          ${
            logo
              ? `
                <img
                  src="${escapeHtml(logo)}"
                  alt="${escapeHtml(nome)}"
                  loading="lazy"
                >
              `
              : ""
          }

          <h3>
            ${escapeHtml(nome)}
          </h3>

          ${
            link
              ? `
                <a
                  href="${escapeHtml(link)}"
                  target="_blank"
                  rel="noopener"
                >
                  Apri
                </a>
              `
              : ""
          }

        </article>
      `;
    })
    .join("");
```

}

window.creaSponsorAdmin =
async function () {
const nome =
document.getElementById(
"nomeSponsorAdmin"
)?.value.trim();

```
  const logo =
    document.getElementById(
      "logoSponsorAdmin"
    )?.value.trim();

  const link =
    document.getElementById(
      "linkSponsorAdmin"
    )?.value.trim();

  if (!nome) {
    alert(
      "Inserisci il nome dello sponsor."
    );

    return false;
  }

  try {
    const sb =
      await initSupabase();

    const result =
      await sb
        .from("sponsor")
        .insert({
          nome: nome,
          logo: logo || null,
          link: link || null
        })
        .select()
        .single();

    if (result.error) {
      throw result.error;
    }

    [
      "nomeSponsorAdmin",
      "logoSponsorAdmin",
      "linkSponsorAdmin"
    ].forEach(function (id) {
      const element =
        document.getElementById(id);

      if (element) {
        element.value = "";
      }
    });

    await caricaSponsorAdmin();

    return result.data;
  } catch (error) {
    console.error(
      "Creazione sponsor:",
      error
    );

    alert(
      error.message ||
      "Errore durante la creazione dello sponsor."
    );

    return false;
  }
};
```

window.creaSponsor =
window.creaSponsorAdmin;

/* ============================================================
WHATSAPP
============================================================ */

window.inviaWhatsAppTutti =
function () {
const message =
document.getElementById(
"messaggioWhatsApp"
)?.value.trim() ||
document.getElementById(
"whatsappMenuMessage"
)?.value.trim();

```
  if (!message) {
    alert(
      "Scrivi un messaggio."
    );

    return false;
  }

  const url =
    "https://api.whatsapp.com/send?text=" +
    encodeURIComponent(
      message
    );

  window.open(
    url,
    "_blank",
    "noopener"
  );

  return true;
};
```

window.inviaWhatsAppApprovati =
function () {
return window.inviaWhatsAppTutti();
};

window.inviaWhatsApp =
window.inviaWhatsAppTutti;

/* ============================================================
CALENDARIO
============================================================ */

function generaCalendario() {
const calendario = [];

```
const start =
  new Date(
    new Date().getFullYear(),
    0,
    1
  );

const end =
  new Date(
    2028,
    11,
    31
  );

const current =
  new Date(start);

while (
  current <= end
) {
  calendario.push({
    id:
      "gen_" +
      current
        .toISOString()
        .slice(0, 10),

    data:
      current
        .toISOString()
        .slice(0, 10),

    titolo:
      "Disponibilità"
  });

  current.setDate(
    current.getDate() + 1
  );
}

return calendario;
```

}

function renderCalendario() {
const container =
document.getElementById(
"adminCalendar"
);

```
if (!container) {
  return;
}

const calendario =
  generaCalendario();

container.innerHTML = `
  <div class="admin-calendar-summary">
    Calendario generato fino al
    31/12/2028.
    <br>
    Giorni disponibili:
    ${calendario.length}
  </div>
`;
```

}

window.generaCalendario =
generaCalendario;

/* ============================================================
AVVIO
============================================================ */

async function avviaAdmin() {
caricaStato();

```
if (
  adminState.adminLoggato
) {
  mostraAdmin();

  try {
    await initSupabase();

    await Promise.all([
      caricaTorneiSupabase(),
      caricaNewsAdmin(),
      caricaSponsorAdmin()
    ]);

    const id =
      getSelectedTournamentId();

    if (
      id !== null &&
      id !== undefined &&
      id !== ""
    ) {
      await caricaRichiesteIscrizione(
        id
      );
    }
  } catch (error) {
    console.error(
      "Avvio admin:",
      error
    );
  }
}

renderCalendario();
renderTorneoSelezionato();

const select =
  document.getElementById(
    "selectTorneoAdmin"
  );

if (select) {
  select.addEventListener(
    "change",
    onTournamentChange
  );
}

const hash =
  window.location.hash ||
  "#dashboard";

window.openAdminPage(
  hash,
  false
);
```

}

document.addEventListener(
"DOMContentLoaded",
function () {
avviaAdmin();
}
);

window.avviaAdmin =
avviaAdmin;

/* ============================================================
RENDER COMPLETO
============================================================ */

window.renderAdmin =
function () {
renderListaTornei();
renderTorneoSelezionato();
renderIscrizioni();
renderNews();
renderSponsor();
renderCalendario();
renderTabellone();

```
  sincronizzaAdminState();

  return true;
};
```

window.__adminRefresh =
function () {
if (
typeof window.caricaTorneiSupabase ===
"function"
) {
return window.caricaTorneiSupabase();
}

```
  return window.renderAdmin();
};


})();
