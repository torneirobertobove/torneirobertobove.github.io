(function () {
"use strict";

var results = [];
var started = Date.now();

function add(status, name, detail) {
results.push({
status: status,
name: name,
detail: detail || ""
});
}

function pass(name, detail) {
add("PASS", name, detail);
}

function fail(name, detail) {
add("FAIL", name, detail);
}

function warn(name, detail) {
add("WARN", name, detail);
}

function hasElement(id) {
return !!document.getElementById(id);
}

function hasSelector(selector) {
return !!document.querySelector(selector);
}

function hasFunction(name) {
return typeof window[name] === "function";
}

function testElement(id, label) {
if (hasElement(id)) {
pass(label || ("Elemento #" + id), "presente");
} else {
fail(label || ("Elemento #" + id), "MANCANTE");
}
}

function testFunction(name) {
if (hasFunction(name)) {
pass("Funzione " + name, "disponibile");
} else {
warn("Funzione " + name, "non presente");
}
}

function safeText(element) {
return String(element && element.textContent || "")
.replace(/\s+/g, " ")
.trim();
}

function escapeHtml(value) {
return String(value)
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");
}

/*

* =========================================================
* 1. DOCUMENTO
* =========================================================
  */

pass(
"Test avviato",
new Date().toLocaleTimeString()
);

if (document.readyState !== "loading") {
pass(
"DOM pronto",
document.readyState
);
} else {
fail(
"DOM pronto",
"document ancora in loading"
);
}

testElement(
"areaAdmin",
"Contenitore Admin"
);

testElement(
"boxLoginAdmin",
"Box login Admin"
);

/*

* =========================================================
* 2. CSS E LAYOUT
* =========================================================
  */

var stylesheets = Array.from(
document.querySelectorAll(
'link[rel="stylesheet"]'
)
);

var adminCss = stylesheets.find(function (link) {
return /admin-desktop.css/i.test(
link.getAttribute("href") || ""
);
});

if (adminCss) {
pass(
"admin-desktop.css",
adminCss.getAttribute("href")
);
} else {
fail(
"admin-desktop.css",
"foglio CSS non trovato"
);
}

[
[".desktop-app", "Layout desktop"],
[".desktop-sidebar", "Sidebar"],
[".desktop-main", "Main"],
[".desktop-topbar", "Topbar"],
[".desktop-nav", "Navigazione"],
[".desktop-content", "Contenuto"],
[".desktop-page-title", "Titolo pagina"]
].forEach(function (item) {
if (hasSelector(item[0])) {
pass(
item[1],
item[0] + " presente"
);
} else {
fail(
item[1],
item[0] + " MANCANTE"
);
}
});

/*

* =========================================================
* 3. PAGINE ADMIN
* =========================================================
  */

var pages = [
["dashboard", "page-dashboard"],
["configurazione", "page-configurazione"],
["iscritti", "page-iscritti"],
["coppie", "page-coppie"],
["tabellone", "page-tabellone"],
["news", "page-news"],
["sponsor", "page-sponsor"],
["whatsapp", "page-whatsapp"],
["link", "page-link"]
];

pages.forEach(function (page) {
if (hasElement(page[1])) {
pass(
"Pagina " + page[0],
"#" + page[1] + " presente"
);
} else {
fail(
"Pagina " + page[0],
"#" + page[1] + " MANCANTE"
);
}
});

/*

* =========================================================
* 4. MENU LATERALE
* =========================================================
  */

var navButtons = Array.from(
document.querySelectorAll(
".desktop-nav button"
)
);

if (navButtons.length) {
pass(
"Menu laterale",
navButtons.length + " pulsanti trovati"
);
} else {
fail(
"Menu laterale",
"nessun pulsante trovato"
);
}

pages.forEach(function (page) {
var button = document.querySelector(
'.desktop-nav button[data-page="' +
page[0] +
'"]'
);

```
if (button) {
  pass(
    "Menu " + page[0],
    "pulsante presente"
  );
} else {
  fail(
    "Menu " + page[0],
    "pulsante MANCANTE"
  );
}
```

});

/*

* =========================================================
* 5. NAVIGAZIONE
* =========================================================
  */

if (hasFunction("openAdminPage")) {
pass(
"openAdminPage",
"funzione disponibile"
);

```
pages.forEach(function (page) {
  try {
    window.openAdminPage(page[0]);

    var expectedPage =
      page[0] === "configurazione"
        ? "config"
        : page[0] === "link"
          ? "links"
          : page[0];

    var target = document.querySelector(
      '.admin-page[data-page="' +
      expectedPage +
      '"]'
    );

    if (target) {
      pass(
        "Navigazione " + page[0],
        "pagina raggiungibile"
      );
    } else {
      fail(
        "Navigazione " + page[0],
        "pagina target non trovata"
      );
    }
  } catch (error) {
    fail(
      "Navigazione " + page[0],
      error.message || String(error)
    );
  }
});
```

} else {
fail(
"openAdminPage",
"funzione MANCANTE"
);
}

/*

* =========================================================
* 6. FUNZIONI PUBBLICHE
* =========================================================
  */

[
"avviaAdmin",
"loginAdmin",
"logoutAdmin",
"renderAdmin",
"caricaTorneiSupabase",
"caricaIscrizioni",
"creaNuovoTorneo",
"eliminaTorneo",
"pubblicaTorneo",
"chiudiIscrizioni",
"approvaIscritto",
"rifiutaIscritto",
"generaCoppie",
"generaCoppieAdmin",
"accoppiaACaso",
"generaCoppieCasuali",
"creaCoppieCasuali",
"generaLinkBove",
"generaLinkBoveMirror",
"copiaLinkBove",
"apriLinkBove",
"apriRegoleNuovoTorneo",
"inviaWhatsAppTutti",
"inviaWhatsAppApprovati",
"caricaNewsAdmin",
"creaNewsAdmin",
"eliminaNewsAdmin",
"caricaSponsorAdmin",
"creaSponsorAdmin",
"eliminaSponsorAdmin",
"__adminRefresh",
"__adminButtonAction"
].forEach(testFunction);

/*

* =========================================================
* 7. ELEMENTI DASHBOARD
* =========================================================
  */

[
["listaTorneiAdmin", "Lista tornei"],
["statTornei", "Stat tornei"],
["statIscritti", "Stat iscritti"],
["statCoppie", "Stat coppie"],
["statStato", "Stat stato"],
["btnAggiorna", "Pulsante aggiorna"],
["btnNuovoTorneo", "Pulsante nuovo torneo"]
].forEach(function (item) {
testElement(item[0], item[1]);
});

/*

* =========================================================
* 8. ISCRITTI
* =========================================================
  */

[
["listaIscrittiAdmin", "Lista iscritti"]
].forEach(function (item) {
testElement(item[0], item[1]);
});

/*

* =========================================================
* 9. COPPIE / TABELLONE
* =========================================================
  */

[
["coppieAdmin", "Area coppie"],
["tabelloneAdmin", "Area tabellone"]
].forEach(function (item) {
testElement(item[0], item[1]);
});

/*

* =========================================================
* 10. NEWS
* =========================================================
  */

[
["titoloNews", "Titolo news"],
["testoNews", "Testo news"],
["btnSalvaNews", "Salva news"],
["newsPanel", "Pannello news"]
].forEach(function (item) {
testElement(item[0], item[1]);
});

/*

* =========================================================
* 11. SPONSOR
* =========================================================
  */

[
["nomeSponsor", "Nome sponsor"],
["logoSponsor", "Logo sponsor"],
["linkSponsor", "Link sponsor"],
["btnSalvaSponsor", "Salva sponsor"],
["sponsorPanel", "Pannello sponsor"]
].forEach(function (item) {
testElement(item[0], item[1]);
});

/*

* =========================================================
* 12. WHATSAPP
* =========================================================
  */

[
["messaggioWhatsApp", "Messaggio WhatsApp"],
["btnWhatsAppTutti", "WhatsApp tutti"],
["btnWhatsAppApprovati", "WhatsApp approvati"]
].forEach(function (item) {
testElement(item[0], item[1]);
});

/*

* =========================================================
* 13. LINK
* =========================================================
  */

[
["linkBoveGenerato", "Link generato"],
["linkBoveGeneratoMirror", "Link mirror"],
["btnGeneraLinkBove", "Genera link"],
["btnCopiaLink", "Copia link"],
["btnApriLink", "Apri link"]
].forEach(function (item) {
testElement(item[0], item[1]);
});

/*

* =========================================================
* 14. LOGIN
* =========================================================
  */

[
["emailAdmin", "Email admin"],
["passwordAdmin", "Password admin"]
].forEach(function (item) {
testElement(item[0], item[1]);
});

/*

* =========================================================
* 15. SUPABASE
* =========================================================
  */

if (window.supabase) {
pass(
"Libreria Supabase",
"caricata"
);
} else {
fail(
"Libreria Supabase",
"window.supabase non presente"
);
}

if (window.sb) {
pass(
"Client Supabase",
"window.sb presente"
);
} else if (window.supabaseClient) {
pass(
"Client Supabase",
"window.supabaseClient presente"
);
} else {
warn(
"Client Supabase",
"client globale non rilevato"
);
}

/*

* =========================================================
* 16. ADMIN STATE
* =========================================================
  */

if (window.adminState) {
pass(
"adminState",
"presente"
);
} else {
warn(
"adminState",
"non disponibile"
);
}

/*

* =========================================================
* 17. CONTROLLO PULSANTI
* =========================================================
  */

var buttons = Array.from(
document.querySelectorAll(
"#areaAdmin button"
)
);

var withoutAction = [];

buttons.forEach(function (button) {
var onclick =
button.getAttribute("onclick");

```
var dataPage =
  button.getAttribute("data-page");

var text =
  safeText(button);

var knownNavigation =
  !!dataPage;

var knownListener =
  !!button.__adminNavigationBound;

if (
  text &&
  !onclick &&
  !knownNavigation &&
  !knownListener
) {
  withoutAction.push(text);
}
```

});

if (withoutAction.length === 0) {
pass(
"Pulsanti senza azione",
"nessuno rilevato"
);
} else {
warn(
"Pulsanti senza azione",
withoutAction.join(" | ")
);
}

/*

* =========================================================
* 18. HASH URL
* =========================================================
  */

if (location.hash) {
pass(
"Hash URL",
location.hash
);
} else {
warn(
"Hash URL",
"nessun hash attuale"
);
}

/*

* =========================================================
* 19. ERRORI JAVASCRIPT
* =========================================================
  */

var runtimeErrors = [];

var oldErrorHandler =
window.__adminTestOriginalErrorHandler;

if (!oldErrorHandler) {
window.__adminTestOriginalErrorHandler =
window.onerror;

```
window.onerror = function (
  message,
  source,
  line,
  column
) {
  runtimeErrors.push({
    message: String(message),
    source: source || "",
    line: line || "",
    column: column || ""
  });

  if (
    typeof oldErrorHandler === "function"
  ) {
    return oldErrorHandler.apply(
      this,
      arguments
    );
  }

  return false;
};
```

}

/*

* =========================================================
* 20. RISULTATO
* =========================================================
  */

var duration =
Date.now() - started;

var passed =
results.filter(function (item) {
return item.status === "PASS";
}).length;

var failed =
results.filter(function (item) {
return item.status === "FAIL";
}).length;

var warnings =
results.filter(function (item) {
return item.status === "WARN";
}).length;

/*

* =========================================================
* 21. PANNELLO
* =========================================================
  */

var oldPanel =
document.getElementById(
"adminTestPanel"
);

if (oldPanel) {
oldPanel.remove();
}

var panel =
document.createElement("section");

panel.id =
"adminTestPanel";

panel.style.cssText =
[
"position:fixed",
"right:20px",
"bottom:20px",
"width:min(820px,calc(100vw - 40px))",
"max-height:80vh",
"overflow:auto",
"z-index:999999",
"background:#11161c",
"color:#f1f4f7",
"border:1px solid rgba(255,255,255,.16)",
"border-radius:16px",
"padding:20px",
"box-shadow:0 25px 80px rgba(0,0,0,.55)",
"font-family:Inter,system-ui,sans-serif",
"font-size:13px"
].join(";");

var title =
document.createElement("div");

title.innerHTML =
"<strong style='font-size:18px'>" +
"ADMIN — CONTROLLO COMPLETO" +
"</strong>" +
"<div style='margin-top:6px;color:#a5afb9'>" +
"Controllo non distruttivo · " +
duration +
" ms" +
"</div>";

panel.appendChild(title);

var summary =
document.createElement("div");

summary.style.cssText =
"display:flex;gap:8px;flex-wrap:wrap;margin:16px 0";

summary.innerHTML =
"<span style='padding:8px 11px;border-radius:8px;background:rgba(66,211,146,.13);color:#42d392;font-weight:700'>PASS " +
passed +
"</span>" +

```
"<span style='padding:8px 11px;border-radius:8px;background:rgba(255,102,120,.13);color:#ff6678;font-weight:700'>FAIL " +
failed +
"</span>" +

"<span style='padding:8px 11px;border-radius:8px;background:rgba(242,201,76,.13);color:#f2c94c;font-weight:700'>WARN " +
warnings +
"</span>";
```

panel.appendChild(summary);

if (failed === 0) {
var overall =
document.createElement("div");

```
overall.style.cssText =
  "padding:12px;margin-bottom:12px;border-radius:10px;background:rgba(66,211,146,.08);border:1px solid rgba(66,211,146,.18);color:#42d392;font-weight:700";

overall.textContent =
  "Nessun errore strutturale rilevato.";

panel.appendChild(overall);
```

} else {
var overallFail =
document.createElement("div");

```
overallFail.style.cssText =
  "padding:12px;margin-bottom:12px;border-radius:10px;background:rgba(255,102,120,.08);border:1px solid rgba(255,102,120,.18);color:#ff6678;font-weight:700";

overallFail.textContent =
  "Sono presenti " +
  failed +
  " problemi da correggere.";

panel.appendChild(overallFail);
```

}

var list =
document.createElement("div");

results.forEach(function (item) {
var row =
document.createElement("div");

```
var symbol =
  item.status === "PASS"
    ? "✓"
    : item.status === "FAIL"
      ? "✕"
      : "⚠";

var color =
  item.status === "PASS"
    ? "#42d392"
    : item.status === "FAIL"
      ? "#ff6678"
      : "#f2c94c";

row.style.cssText =
  "padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06)";

row.innerHTML =
  "<span style='color:" +
  color +
  ";font-weight:900'>" +
  symbol +
  "</span> " +

  "<strong>" +
  escapeHtml(item.name) +
  "</strong>" +

  (
    item.detail
      ? "<span style='color:#a5afb9'> — " +
        escapeHtml(item.detail) +
        "</span>"
      : ""
  );

list.appendChild(row);
```

});

panel.appendChild(list);

var close =
document.createElement("button");

close.type =
"button";

close.textContent =
"Chiudi controllo";

close.style.cssText =
"margin-top:16px;padding:9px 14px;border-radius:9px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#fff;cursor:pointer";

close.onclick =
function () {
panel.remove();
};

panel.appendChild(close);

document.body.appendChild(panel);

/*

* =========================================================
* 22. REPORT GLOBALE
* =========================================================
  */

window.adminTestResults =
results;

window.adminTestSummary = {
pass: passed,
fail: failed,
warn: warnings,
duration: duration
};

console.group(
"ADMIN — CONTROLLO COMPLETO"
);

console.log(
"PASS:",
passed
);

console.log(
"FAIL:",
failed
);

console.log(
"WARN:",
warnings
);

console.log(
"Durata:",
duration + " ms"
);

console.table(
results
);

if (runtimeErrors.length) {
console.error(
"Errori runtime rilevati:",
runtimeErrors
);
}

console.groupEnd();
})();
