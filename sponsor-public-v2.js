/* SPONSOR PUBBLICI — usa esclusivamente il client Supabase già esistente */
(function(){
    function client(){ return window.supabaseClient || window.sb || null; }
    function parse(v){
        if(v && typeof v==='object') return v;
        if(typeof v==='string'){ try{return JSON.parse(v)||{};}catch(e){return {};} }
        return {};
    }
    function sponsorsFrom(data){
        const out=[],seen=new Set();
        (data||[]).forEach(t=>{
            const cfg=parse(t.configurazione);
            const list=Array.isArray(cfg.sponsor)?cfg.sponsor:[];
            list.forEach(s=>{
                const nome=String(s?.nome||'').trim(),url=String(s?.url||'').trim(),descrizione=String(s?.descrizione||'').trim();
                if(!nome)return;
                const key=String(s?.id||'')||`${nome}|${url}`;
                if(seen.has(key))return;
                seen.add(key);out.push({nome,url,descrizione});
            });
        });
        return out;
    }
    function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
    function ensureBoardBanner(){
        if(document.querySelector('.sponsor-track')) return;
        if(!/Bove\.html$/i.test(location.pathname)) return;
        const container=document.querySelector('.container') || document.body.firstElementChild || document.body;
        const banner=document.createElement('div');
        banner.className='sponsor-banner sponsor-banner-global';
        banner.setAttribute('aria-label','I nostri sponsor');
        banner.innerHTML='<div class="sponsor-title">I nostri sponsor</div><div class="sponsor-window"><div class="sponsor-track"><div class="sponsor-empty">Caricamento sponsor...</div></div></div>';
        if(container===document.body) document.body.insertBefore(banner,document.body.firstChild);
        else container.parentNode.insertBefore(banner,container);
        if(!document.getElementById('sponsor-global-style')){
            const style=document.createElement('style');
            style.id='sponsor-global-style';
            style.textContent=`
.sponsor-banner-global{width:100%;max-width:1000px;margin:0 auto 14px;padding:10px;border:1px solid rgba(255,255,255,.25);border-radius:12px;background:rgba(17,24,39,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-sizing:border-box}
.sponsor-banner-global .sponsor-title{text-align:center;font-size:12px;font-weight:700;color:#e5e7eb;margin-bottom:8px}
.sponsor-banner-global .sponsor-window{overflow-x:auto;scrollbar-width:none}
.sponsor-banner-global .sponsor-window::-webkit-scrollbar{display:none}
.sponsor-banner-global .sponsor-track{display:flex;gap:10px;align-items:stretch;min-width:max-content}
.sponsor-banner-global .sponsor-item{display:flex;flex-direction:column;justify-content:center;min-width:180px;max-width:280px;padding:8px 12px;border:1px solid rgba(255,255,255,.18);border-radius:9px;background:rgba(0,0,0,.18);color:#fff;text-decoration:none;text-align:center;box-sizing:border-box}
.sponsor-banner-global .sponsor-name{font-weight:700;font-size:13px}
.sponsor-banner-global .sponsor-desc{font-size:10px;line-height:1.25;color:#cbd5e1;margin-top:3px}
.sponsor-banner-global .sponsor-empty{width:100%;text-align:center;color:#94a3b8;font-size:11px;padding:5px}
@media(max-width:599px){.sponsor-banner-global{margin-bottom:10px}.sponsor-banner-global .sponsor-item{min-width:155px;max-width:230px}}
`;
            document.head.appendChild(style);
        }
    }
    async function load(){
        ensureBoardBanner();
        const sb=client();
        if(!sb)return;
        try{
            const {data,error}=await sb.from('tornei').select('id,configurazione');
            if(error)throw error;
            const sponsors=sponsorsFrom(data);
            document.querySelectorAll('.sponsor-track').forEach(track=>{
                if(!sponsors.length){track.innerHTML='<div class="sponsor-empty">Nessuno sponsor configurato</div>';return;}
                const html=sponsors.map(s=>{
                    const inner=`<span class="sponsor-name">${esc(s.nome)}</span>${s.descrizione?`<span class="sponsor-desc">${esc(s.descrizione)}</span>`:''}`;
                    return s.url?`<a class="sponsor-item" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`:`<div class="sponsor-item">${inner}</div>`;
                }).join('');
                track.innerHTML=html;
            });
        }catch(e){console.error('SPONSOR PUBBLICI:',e);}
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
