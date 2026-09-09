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
    async function load(){
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
