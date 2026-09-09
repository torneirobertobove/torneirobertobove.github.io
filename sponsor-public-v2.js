/* SPONSOR PUBBLICI — pulsante "Sponsorizzato da" con logo */
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
#sponsor-public-wrap{
    width:min(1040px,calc(100% - 24px));
    margin:24px auto 18px;
    display:flex;
    justify-content:center;
    position:relative;
    z-index:100;
}
#sponsor-public-button{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    min-height:58px;
    max-width:100%;
    padding:8px 18px;
    border:1px solid rgba(255,255,255,.28);
    border-radius:18px;
    background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.06));
    backdrop-filter:blur(16px) saturate(135%);
    -webkit-backdrop-filter:blur(16px) saturate(135%);
    box-shadow:0 10px 30px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.16);
    color:#fff;
    cursor:pointer;
    text-decoration:none;
    box-sizing:border-box;
    transition:transform .2s ease,background .2s ease,box-shadow .2s ease;
}
#sponsor-public-button:hover{
    transform:translateY(-2px);
    background:linear-gradient(135deg,rgba(255,255,255,.22),rgba(255,255,255,.08));
    box-shadow:0 14px 34px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.2);
}
#sponsor-public-label{
    font-size:11px;
    font-weight:800;
    letter-spacing:1.5px;
    text-transform:uppercase;
    white-space:nowrap;
    color:rgba(255,255,255,.78);
}
#sponsor-public-logo{
    display:block;
    width:auto;
    height:auto;
    max-width:150px;
    max-height:42px;
    object-fit:contain;
}
#sponsor-public-name{
    font-size:14px;
    font-weight:800;
    letter-spacing:.2px;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
    max-width:240px;
}
#sponsor-public-more{
    font-size:17px;
    line-height:1;
    opacity:.72;
}
#sponsor-public-modal{
    position:fixed;
    inset:0;
    z-index:99999;
    display:none;
    align-items:center;
    justify-content:center;
    padding:20px;
    background:rgba(0,0,0,.58);
    backdrop-filter:blur(7px);
    -webkit-backdrop-filter:blur(7px);
}
#sponsor-public-modal.open{
    display:flex;
}
#sponsor-public-panel{
    width:min(620px,100%);
    max-height:min(760px,90vh);
    overflow:auto;
    padding:20px;
    border:1px solid rgba(255,255,255,.24);
    border-radius:24px;
    background:linear-gradient(145deg,rgba(255,255,255,.17),rgba(255,255,255,.07));
    backdrop-filter:blur(22px) saturate(140%);
    -webkit-backdrop-filter:blur(22px) saturate(140%);
    box-shadow:0 22px 70px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.16);
    color:#fff;
    box-sizing:border-box;
}
#sponsor-public-head{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    margin-bottom:16px;
}
#sponsor-public-title{
    font-size:16px;
    font-weight:800;
    letter-spacing:1.5px;
    text-transform:uppercase;
}
#sponsor-public-close{
    width:34px;
    height:34px;
    border:1px solid rgba(255,255,255,.22);
    border-radius:50%;
    background:rgba(255,255,255,.09);
    color:#fff;
    font-size:20px;
    cursor:pointer;
}
.sponsor-public-card{
    display:flex;
    align-items:center;
    gap:16px;
    min-height:84px;
    margin:10px 0;
    padding:12px 14px;
    border:1px solid rgba(255,255,255,.18);
    border-radius:17px;
    background:rgba(255,255,255,.07);
    color:#fff;
    text-decoration:none;
    box-sizing:border-box;
}
.sponsor-public-card img{
    flex:0 0 auto;
    max-width:160px;
    max-height:58px;
    width:auto;
    height:auto;
    object-fit:contain;
}
.sponsor-public-card-name{
    font-size:14px;
    font-weight:800;
}
.sponsor-public-card-video{
    margin-top:4px;
    font-size:10px;
    opacity:.72;
    word-break:break-word;
}
.sponsor-public-empty{
    text-align:center;
    padding:18px;
    font-size:12px;
    opacity:.7;
}
@media(max-width:599px){
    #sponsor-public-wrap{
        width:calc(100% - 14px);
        margin:18px auto 12px;
    }
    #sponsor-public-button{
        min-height:54px;
        padding:7px 12px;
        border-radius:16px;
        gap:7px;
    }
    #sponsor-public-label{
        font-size:9px;
        letter-spacing:1px;
    }
    #sponsor-public-logo{
        max-width:105px;
        max-height:34px;
    }
    #sponsor-public-name{
        font-size:12px;
        max-width:135px;
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
                <button id="sponsor-public-button" type="button" aria-label="Sponsorizzato da">
                    <span id="sponsor-public-label">Sponsorizzato da</span>
                    <span id="sponsor-public-content"></span>
                    <span id="sponsor-public-more" aria-hidden="true">›</span>
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
                        <div id="sponsor-public-title">Sponsorizzato da</div>
                        <button id="sponsor-public-close" type="button" aria-label="Chiudi">×</button>
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

            document.getElementById('sponsor-public-close')
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
                const sponsors = window.__PUBLIC_SPONSORS__ || [];

                if (!sponsors.length) return;

                if (sponsors.length === 1 && sponsors[0].link) {
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
        const list = document.getElementById('sponsor-public-list');

        if (!list) return;

        list.innerHTML = sponsors.map(function (sponsor) {
            const logo = sponsor.immagine
                ? `<img src="${esc(sponsor.immagine)}" alt="${esc(sponsor.nome)}">`
                : '';

            const details = `
                <div>
                    <div class="sponsor-public-card-name">
                        ${esc(sponsor.nome)}
                    </div>
                    ${
                        sponsor.video
                            ? `<div class="sponsor-public-card-video">
                                ${esc(sponsor.video)}
                               </div>`
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
        }).join('');
    }

    function renderButton(sponsors) {
        const content = document.getElementById('sponsor-public-content');
        const more = document.getElementById('sponsor-public-more');

        if (!content || !more) return;

        if (!sponsors.length) {
            content.innerHTML =
                '<span id="sponsor-public-name">Nessuno sponsor</span>';

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

        more.style.display = sponsors.length > 1 ? '' : 'none';
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
                .order('id', { ascending: true });

            if (result.error) {
                throw result.error;
            }

            const sponsors = (result.data || [])
                .filter(function (sponsor) {
                    return String(sponsor?.nome || '').trim();
                })
                .map(function (sponsor) {
                    return {
                        id: sponsor.id,
                        nome: String(sponsor.nome || '').trim(),
                        immagine: String(sponsor.immagine || '').trim(),
                        video: String(sponsor.video || '').trim(),
                        link: String(sponsor.link || '').trim()
                    };
                });

            window.__PUBLIC_SPONSORS__ = sponsors;

            renderButton(sponsors);

        } catch (error) {
            console.error('SPONSOR PUBBLICI:', error);
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
