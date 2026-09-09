/* SPONSOR PUBBLICI GLOBALI — usa esclusivamente il client Supabase già esistente */
(function(){
    function client(){ return window.supabaseClient || window.sb || null; }
    function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

    function ensureBanner(){
        if(document.querySelector('.sponsor-track')) return;
        const anchor=document.querySelector('.container, .main, main, .box, .content') || document.body.firstElementChild || document.body;
        const banner=document.createElement('div');
        banner.className='sponsor-banner sponsor-banner-global';
        banner.setAttribute('aria-label','I nostri sponsor');
        banner.innerHTML='<div class="sponsor-title">I nostri sponsor</div><div class="sponsor-window"><div class="sponsor-track"><div class="sponsor-empty">Caricamento sponsor...</div></div></div>';
        if(anchor===document.body) document.body.insertBefore(banner,document.body.firstChild);
        else anchor.parentNode.insertBefore(banner,anchor);
        if(!document.getElementById('sponsor-global-style')){
            const style=document.createElement('style');
            style.id='sponsor-global-style';
            style.textContent=`
.sponsor-banner-global{width:min(1000px,calc(100% - 20px));margin:14px auto;padding:10px;border:1px solid rgba(255,255,255,.25);border-radius:12px;background:rgba(17,24,39,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-sizing:border-box;position:relative;z-index:20}
.sponsor-banner-global .sponsor-title{text-align:center;font-size:12px;font-weight:700;color:#e5e7eb;margin-bottom:8px}
.sponsor-banner-global .sponsor-window{overflow-x:auto;scrollbar-width:none}
.sponsor-banner-global .sponsor-window::-webkit-scrollbar{display:none}
.sponsor-banner-global .sponsor-track{display:flex;gap:10px;align-items:stretch;min-width:max-content}
.sponsor-banner-global .sponsor-item{display:flex;flex-direction:column;justify-content:center;align-items:center;min-width:180px;max-width:280px;min-height:75px;padding:8px 12px;border:1px solid rgba(255,255,255,.18);border-radius:9px;background:rgba(0,0,0,.18);color:#fff;text-decoration:none;text-align:center;box-sizing:border-box}
.sponsor-banner-global .sponsor-logo{display:block;max-width:150px;max-height:48px;object-fit:contain;margin:auto}
.sponsor-banner-global .sponsor-name{font-weight:700;font-size:13px}
.sponsor-banner-global .sponsor-desc{font-size:10px;line-height:1.25;color:#cbd5e1;margin-top:5px;max-width:100%;word-break:break-word}
.sponsor-banner-global .sponsor-video{font-size:10px;line-height:1.25;color:#f8fafc;margin-top:3px;max-width:100%;word-break:break-word}
.sponsor-banner-global .sponsor-empty{width:100%;text-align:center;color:#94a3b8;font-size:11px;padding:5px}
@media(max-width:599px){.sponsor-banner-global{width:calc(100% - 12px);margin:8px auto}.sponsor-banner-global .sponsor-item{min-width:155px;max-width:230px}}
`;
            document.head.appendChild(style);
        }
    }

    async function load(){
        ensureBanner();
        const sb=client();
        if(!sb)return;
        try{
            const {data,error}=await sb.from('sponsor').select('id,nome,immagine,video,link').order('id',{ascending:true});
            if(error)throw error;
            const sponsors=(data||[]).filter(s=>String(s?.nome||'').trim()).map(s=>({
                nome:String(s.nome||'').trim(),
                url:String(s.link||'').trim(),
                immagine:String(s.immagine||'').trim(),
                video:String(s.video||'').trim()
            }));
            document.querySelectorAll('.sponsor-track').forEach(track=>{
                if(!sponsors.length){track.innerHTML='<div class="sponsor-empty">Nessuno sponsor configurato</div>';return;}
                track.innerHTML=sponsors.map(s=>{
                    const visual=s.immagine?`<img class="sponsor-logo" src="${esc(s.immagine)}" alt="${esc(s.nome)}">`:`<span class="sponsor-name">${esc(s.nome)}</span>`;
                    const video=s.video?`<span class="sponsor-video">${esc(s.video)}</span>`:'';
                    const inner=`${visual}${video}`;
                    return s.url?`<a class="sponsor-item" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`:`<div class="sponsor-item">${inner}</div>`;
                }).join('');
            });
        }catch(e){console.error('SPONSOR PUBBLICI:',e);}
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
