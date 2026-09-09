/* SPONSOR PUBBLICI GLOBALI — usa esclusivamente il client Supabase già esistente */
(function(){
    function client(){ return window.supabaseClient || window.sb || null; }
    function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
    function getBanner(){const track=document.querySelector('.sponsor-track');return track?(track.closest('.sponsor-banner')||track.closest('.sponsor-banner-global')):null;}
    function moveBannerToBottom(banner){if(!banner)return;const footer=document.querySelector('footer');if(footer&&footer.parentNode)footer.parentNode.insertBefore(banner,footer);else document.body.appendChild(banner);}
    function ensureBanner(){
        let banner=getBanner();
        if(!banner){banner=document.createElement('div');banner.className='sponsor-banner sponsor-banner-global';banner.setAttribute('aria-label','I nostri sponsor');banner.innerHTML='<div class="sponsor-title">I nostri sponsor</div><div class="sponsor-window"><div class="sponsor-track"><div class="sponsor-empty">Caricamento sponsor...</div></div></div>';}
        else banner.classList.add('sponsor-banner-global');
        moveBannerToBottom(banner);
        if(!document.getElementById('sponsor-global-style')){
            const style=document.createElement('style');style.id='sponsor-global-style';style.textContent=`
.sponsor-banner-global{width:min(1040px,calc(100% - 24px));margin:28px auto 18px;padding:12px 14px 14px;border:1px solid rgba(255,255,255,.24);border-radius:22px;background:linear-gradient(135deg,rgba(255,255,255,.13),rgba(255,255,255,.055));backdrop-filter:blur(16px) saturate(135%);-webkit-backdrop-filter:blur(16px) saturate(135%);box-shadow:0 12px 38px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.16);box-sizing:border-box;position:relative;z-index:20}
.sponsor-banner-global .sponsor-title{text-align:center;font-size:12px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;color:rgba(255,255,255,.94);text-shadow:0 1px 8px rgba(0,0,0,.35);margin:0 0 11px}
.sponsor-banner-global .sponsor-window{width:100%;overflow:hidden;border-radius:16px}
.sponsor-banner-global .sponsor-track{display:flex;gap:12px;align-items:stretch;width:max-content;padding:2px;animation:sponsorGlobalScroll 24s linear infinite}
.sponsor-banner-global .sponsor-item{display:flex;flex-direction:column;justify-content:center;align-items:center;min-width:190px;max-width:280px;min-height:78px;padding:11px 16px;border:1px solid rgba(255,255,255,.22);border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.15),rgba(255,255,255,.055));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 7px 20px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.12);color:#fff;text-decoration:none;text-align:center;box-sizing:border-box;transition:transform .2s ease,background .2s ease,box-shadow .2s ease}
.sponsor-banner-global a.sponsor-item:hover{transform:translateY(-2px);background:linear-gradient(145deg,rgba(255,255,255,.21),rgba(255,255,255,.08));box-shadow:0 10px 26px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.18)}
.sponsor-banner-global .sponsor-logo{display:block;max-width:165px;max-height:50px;width:auto;height:auto;object-fit:contain;margin:auto}.sponsor-banner-global .sponsor-name{font-weight:800;font-size:14px;letter-spacing:.4px}.sponsor-banner-global .sponsor-video{font-size:10px;line-height:1.25;color:rgba(255,255,255,.78);margin-top:4px;max-width:100%;word-break:break-word}.sponsor-banner-global .sponsor-empty{width:100%;text-align:center;color:rgba(255,255,255,.68);font-size:11px;padding:7px}
@keyframes sponsorGlobalScroll{from{transform:translateX(0)}to{transform:translateX(calc(-50% - 6px))}}
@media(max-width:599px){.sponsor-banner-global{width:calc(100% - 14px);margin:20px auto 12px;padding:10px 10px 12px;border-radius:18px}.sponsor-banner-global .sponsor-item{min-width:155px;max-width:225px;min-height:72px;padding:9px 12px}.sponsor-banner-global .sponsor-logo{max-width:140px;max-height:44px}}
@media(prefers-reduced-motion:reduce){.sponsor-banner-global .sponsor-track{animation:none}}
`;document.head.appendChild(style);
        }return banner;
    }
    async function load(){
        const banner=ensureBanner();moveBannerToBottom(banner);const sb=client();if(!sb)return;
        try{const {data,error}=await sb.from('sponsor').select('id,nome,immagine,video,link').order('id',{ascending:true});if(error)throw error;
            const sponsors=(data||[]).filter(s=>String(s?.nome||'').trim()).map(s=>({nome:String(s.nome||'').trim(),url:String(s.link||'').trim(),immagine:String(s.immagine||'').trim(),video:String(s.video||'').trim()}));
            document.querySelectorAll('.sponsor-track').forEach(track=>{if(!sponsors.length){track.innerHTML='<div class="sponsor-empty">Nessuno sponsor configurato</div>';return;}track.innerHTML=sponsors.map(s=>{const visual=s.immagine?`<img class="sponsor-logo" src="${esc(s.immagine)}" alt="${esc(s.nome)}">`:`<span class="sponsor-name">${esc(s.nome)}</span>`;const video=s.video?`<span class="sponsor-video">${esc(s.video)}</span>`:'';const inner=`${visual}${video}`;return s.url?`<a class="sponsor-item" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`:`<div class="sponsor-item">${inner}</div>`;}).join('');});
        }catch(e){console.error('SPONSOR PUBBLICI:',e);}
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
