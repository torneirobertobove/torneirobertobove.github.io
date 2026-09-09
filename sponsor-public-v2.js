content = r'''/* SPONSOR PUBBLICI — pulsante "Sponsorizzato da" con logo */
(function () {
    'use strict';

    function client() {
        return window.supabaseClient || window.sb || null;
    }

    function esc(value) {
        return String(value ?? '').replace(/[&<>"']/g, function (m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[m];
        });
    }

    function addStyles() {
        if (document.getElementById('sponsor-public-style')) return;

        const style = document.createElement('style');
        style.id = 'sponsor-public-style';

        style.textContent = `
#sponsor-public-wrap {
    width: min(1040px, calc(100% - 24px));
    margin: 24px auto 18px;
    display: flex;
    justify-content: center;
    position: relative;
    z-index: 100;
}

#sponsor-public-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 60px;
    max-width: 100%;
    padding: 8px 20px;
    border: 1px solid rgba(255,255,255,.30);
    border-radius: 20px;
    background:
        linear-gradient(
            135deg,
            rgba(255,255,255,.18),
            rgba(255,255,255,.07)
        );
    backdrop-filter: blur(18px) saturate(145%);
    -webkit-backdrop-filter: blur(18px) saturate(145%);
    box-shadow:
        0 12px 32px rgba(0,0,0,.26),
        inset 0 1px 0 rgba(255,255,255,.20),
        inset 0 -1px 0 rgba(255,255,255,.05);
    color: #fff;
    cursor: pointer;
    text-decoration: none;
    box-sizing: border-box;
    overflow: hidden;
    transition:
        transform .22s ease,
        background .22s ease,
        box-shadow .22s ease,
        border-color .22s ease;
}

#sponsor-public-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 8%;
    right: 8%;
    height: 1px;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,.55),
        transparent
    );
    pointer-events: none;
}

#sponsor-public-button:hover {
    transform: translateY(-2px);
    border-color: rgba(255,255,255,.40);
    background:
        linear-gradient(
            135deg,
            rgba(255,255,255,.23),
            rgba(255,255,255,.09)
        );
    box-shadow:
        0 16px 38px rgba(0,0,0,.32),
        inset 0 1px 0 rgba(255,255,255,.24),
        inset 0 -1px 0 rgba(255,255,255,.06);
}

#sponsor-public-button:active {
    transform: translateY(0);
}

#sponsor-public-button:focus-visible {
    outline: 2px solid rgba(255,255,255,.65);
    outline-offset: 3px;
}

#sponsor-public-label {
    position: relative;
    z-index: 1;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.7px;
    text-transform: uppercase;
    white-space: nowrap;
    color: rgba(255,255,255,.76);
}

#sponsor-public-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
}

#sponsor-public-logo {
    display: block;
    width: auto;
    height: auto;
    max-width: 155px;
    max-height: 42px;
    object-fit: contain;
    filter: drop-shadow(0 2px 7px rgba(0,0,0,.18));
}

#sponsor-public-name {
    display: block;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: .25px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 250px;
}

#sponsor-public-more {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid rgba(255,255,255,.20);
    border-radius: 50%;
    background: rgba(255,255,255,.08);
    color: rgba(255,255,255,.82);
    font-size: 20px;
    line-height: 1;
    opacity: .85;
    transition:
        background .2s ease,
        transform .2s ease;
}

#sponsor-public-button:hover #sponsor-public-more {
    background: rgba(255,255,255,.14);
    transform: translateX(2px);
}

#sponsor-public-modal {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0,0,0,.58);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-sizing: border-box;
}

#sponsor-public-modal.open {
    display: flex;
}

#sponsor-public-panel {
    position: relative;
    width: min(620px, 100%);
    max-height: min(760px, 90vh);
    overflow: auto;
    padding: 22px;
    border: 1px solid rgba(255,255,255,.25);
    border-radius: 26px;
    background:
        linear-gradient(
            145deg,
            rgba(255,255,255,.18),
            rgba(255,255,255,.07)
        );
    backdrop-filter: blur(24px) saturate(145%);
    -webkit-backdrop-filter: blur(24px) saturate(145%);
    box-shadow:
        0 24px 75px rgba(0,0,0,.44),
        inset 0 1px 0 rgba(255,255,255,.18);
    color: #fff;
    box-sizing: border-box;
}

#sponsor-public-panel::before {
    content: "";
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,.50),
        transparent
    );
}

#sponsor-public-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
}

#sponsor-public-title {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 1.6px;
    text-transform: uppercase;
    color: rgba(255,255,255,.90);
}

#sponsor-public-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 50%;
    background: rgba(255,255,255,.09);
    color: #fff;
    font-size: 21px;
    line-height: 1;
    cursor: pointer;
    transition:
        background .2s ease,
        transform .2s ease;
}

#sponsor-public-close:hover {
    background: rgba(255,255,255,.16);
    transform: rotate(90deg);
}

.sponsor-public-card {
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 84px;
    margin: 10px 0;
    padding: 13px 15px;
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 18px;
    background:
        linear-gradient(
            135deg,
            rgba(255,255,255,.10),
            rgba(255,255,255,.045)
        );
    box-shadow:
        inset 0 1px 0 rgba(255,255,255,.08);
    color: #fff;
    text-decoration: none;
    box-sizing: border-box;
    transition:
        transform .18s ease,
        background .18s ease,
        border-color .18s ease;
}

.sponsor-public-card:hover {
    transform: translateY(-1px);
    background:
        linear-gradient(
            135deg,
            rgba(255,255,255,.15),
            rgba(255,255,255,.06)
        );
    border-color: rgba(255,255,255,.28);
}

.sponsor-public-card img {
    flex: 0 0 auto;
    display: block;
    max-width: 160px;
    max-height: 58px;
    width: auto;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 2px 7px rgba(0,0,0,.18));
}

.sponsor-public-card > div {
    min-width: 0;
}

.sponsor-public-card-name {
    font-size: 14px;
    font-weight: 800;
    letter-spacing: .2px;
}

.sponsor-public-card-video {
    margin-top: 5px;
    font-size: 10px;
    opacity: .68;
    word-break: break-word;
}

.sponsor-public-empty {
    text-align: center;
    padding: 18px;
    font-size: 12px;
    opacity: .7;
}

@media (max-width: 599px) {
    #sponsor-public-wrap {
        width: calc(100% - 14px);
        margin: 18px auto 12px;
    }

    #sponsor-public-button {
        min-height: 54px;
        padding: 7px 11px;
        border-radius: 17px;
        gap: 7px;
    }

    #sponsor-public-label {
        font-size: 8px;
        letter-spacing: 1px;
    }

    #sponsor-public-logo {
        max-width: 105px;
        max-height: 34px;
    }

    #sponsor-public-name {
        font-size: 12px;
        max-width: 135px;
    }

    #sponsor-public-more {
        width: 25px;
        height: 25px;
        font-size: 18px;
    }

    #sponsor-public-panel {
        padding: 18px;
        border-radius: 22px;
    }

    .sponsor-public-card {
        gap: 12px;
        min-height: 74px;
        padding: 10px 12px;
        border-radius: 16px;
    }

    .sponsor-public-card img {
        max-width: 110px;
        max-height: 48px;
    }
}
`;

        document.head.appendChild(style);
    }

    function getFooter() {
        return document.querySelector('footer');
    }

    function ensureUI() {
        let wrap = document.getElementById('sponsor-public-wrap');

        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'sponsor-public-wrap';

            wrap.innerHTML = `
                <button
                    id="sponsor-public-button"
                    type="button"
                    aria-label="Sponsorizzato da"
                >
                    <span id="sponsor-public-label">
                        Sponsorizzato da
                    </span>

                    <span id="sponsor-public-content"></span>

                    <span
                        id="sponsor-public-more"
                        aria-hidden="true"
                    >
                        ›
                    </span>
                </button>
            `;

            const footer = getFooter();

            if (footer && footer.parentNode) {
                footer.parentNode.insertBefore(wrap, footer);
            } else {
                document.body.appendChild(wrap);
            }
        }

        let modal = document.getElementById('sponsor-public-modal');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'sponsor-public-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');

            modal.innerHTML = `
                <div id="sponsor-public-panel">
                    <div id="sponsor-public-head">
                        <div id="sponsor-public-title">
                            Sponsorizzato da
                        </div>

                        <button
                            id="sponsor-public-close"
                            type="button"
                            aria-label="Chiudi"
                        >
                            ×
                        </button>
                    </div>

                    <div id="sponsor-public-list"></div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.addEventListener('click', function (event) {
                if (event.target === modal) {
                    modal.classList.remove('open');
                }
            });

            document
                .getElementById('sponsor-public-close')
                .addEventListener('click', function () {
                    modal.classList.remove('open');
                });

            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') {
                    modal.classList.remove('open');
                }
            });
        }

        const button = document.getElementById('sponsor-public-button');

        if (!button.dataset.bound) {
            button.dataset.bound = '1';

            button.addEventListener('click', function () {
                const sponsors =
                    window.__PUBLIC_SPONSORS__ || [];

                if (!sponsors.length) return;

                if (
                    sponsors.length === 1 &&
                    sponsors[0].link
                ) {
                    window.open(
                        sponsors[0].link,
                        '_blank',
                        'noopener,noreferrer'
                    );
                    return;
                }

                renderModal(sponsors);

                document
                    .getElementById('sponsor-public-modal')
                    .classList.add('open');
            });
        }

        return wrap;
    }

    function renderModal(sponsors) {
        const list =
            document.getElementById('sponsor-public-list');

        if (!list) return;

        if (!sponsors.length) {
            list.innerHTML = `
                <div class="sponsor-public-empty">
                    Nessuno sponsor disponibile
                </div>
            `;
            return;
        }

        list.innerHTML = sponsors
            .map(function (sponsor) {
                const logo = sponsor.immagine
                    ? `
                        <img
                            src="${esc(sponsor.immagine)}"
                            alt="${esc(sponsor.nome)}"
                            loading="lazy"
                        >
                    `
                    : '';

                const details = `
                    <div>
                        <div class="sponsor-public-card-name">
                            ${esc(sponsor.nome)}
                        </div>

                        ${
                            sponsor.video
                                ? `
                                    <div class="sponsor-public-card-video">
                                        ${esc(sponsor.video)}
                                    </div>
                                `
                                : ''
                        }
                    </div>
                `;

                const inner = logo + details;

                return sponsor.link
                    ? `
                        <a
                            class="sponsor-public-card"
                            href="${esc(sponsor.link)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            ${inner}
                        </a>
                    `
                    : `
                        <div class="sponsor-public-card">
                            ${inner}
                        </div>
                    `;
            })
            .join('');
    }

    function renderButton(sponsors) {
        const content =
            document.getElementById('sponsor-public-content');

        const more =
            document.getElementById('sponsor-public-more');

        if (!content || !more) return;

        if (!sponsors.length) {
            content.innerHTML = `
                <span id="sponsor-public-name">
                    Nessuno sponsor
                </span>
            `;

            more.style.display = 'none';
            return;
        }

        const sponsor = sponsors[0];

        if (sponsor.immagine) {
            content.innerHTML = `
                <img
                    id="sponsor-public-logo"
                    src="${esc(sponsor.immagine)}"
                    alt="${esc(sponsor.nome)}"
                >
            `;
        } else {
            content.innerHTML = `
                <span id="sponsor-public-name">
                    ${esc(sponsor.nome)}
                </span>
            `;
        }

        more.style.display =
            sponsors.length > 1 ? 'flex' : 'none';
    }

    async function load() {
        addStyles();
        ensureUI();

        const sb = client();

        if (!sb) return;

        try {
            const result = await sb
                .from('sponsor')
                .select('id,nome,immagine,video,link')
                .order('id', {
                    ascending: true
                });

            if (result.error) {
                throw result.error;
            }

            const sponsors = (result.data || [])
                .filter(function (sponsor) {
                    return String(
                        sponsor?.nome || ''
                    ).trim();
                })
                .map(function (sponsor) {
                    return {
                        id: sponsor.id,
                        nome: String(
                            sponsor.nome || ''
                        ).trim(),
                        immagine: String(
                            sponsor.immagine || ''
                        ).trim(),
                        video: String(
                            sponsor.video || ''
                        ).trim(),
                        link: String(
                            sponsor.link || ''
                        ).trim()
                    };
                });

            window.__PUBLIC_SPONSORS__ = sponsors;

            renderButton(sponsors);

        } catch (error) {
            console.error(
                'SPONSOR PUBBLICI:',
                error
            );
        }
    }

    function start() {
        if (!document.body) return;
        load();
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            start,
            { once: true }
        );
    } else {
        start();
    }
})();
'''

path = "/mnt/data/sponsor-public-v2.js"
with open(path, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

# Concrete cleanliness checks
assert "```" not in content
assert content.startswith('/* SPONSOR PUBBLICI')
assert content.rstrip().endswith('})();')
print(f"Creato: {path}")
print(f"Dimensione: {len(content)} caratteri")
print("Controllo caratteri Markdown ```: PASS")
print("Controllo inizio/fine file: PASS")
