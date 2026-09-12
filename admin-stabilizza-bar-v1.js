(()=>{'use strict';function stabilizzaBar(bar){if(!bar||bar.dataset.stabilizzata==='1')return;bar.dataset.stabilizzata='1';const desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(bar,'innerHTML',{configurable:true,get(){return desc.get.call(this)},set(v){if(v==='')return desc.set.call(this,v)}});const append=bar.appendChild.bind(bar);bar.appendChild=function(node){const role=node?.dataset?.role;if(role&&bar.querySelector('[data-role="'+role+'"]'))return bar.querySelector('[data-role="'+role+'"]');return append(node)}}function scan(){const bar=document.getElementById('adminTournamentControls');if(bar)stabilizzaBar(bar)}const observer=new MutationObserver(scan);observer.observe(document.body,{childList:true,subtree:true});scan();let tentativi=0;const wrap=setInterval(()=>{if(typeof window.renderCleanAdmin==='function'){clearInterval(wrap);const originale=window.renderCleanAdmin;if(!originale.__stabilizzato){const wrapper=function(){const r=originale.apply(this,arguments);requestAnimationFrame(()=>{window.dispatchEvent(new Event('admin:render'));scan()});return r};wrapper.__stabilizzato=true;window.renderCleanAdmin=wrapper}}tentativi++;if(tentativi>100)clearInterval(wrap)},50);

/* USCITA ADMIN: torna sempre alla pagina pubblica/login */
window.logoutAdmin=async function(){
  try{await window.sb?.auth?.signOut()}catch(e){}
  window.adminState=window.adminState||{};
  window.adminState.adminLoggato=false;
  try{localStorage.removeItem('padel_admin_state')}catch(e){}
  window.location.replace('https://torneirobertobove.github.io/');
};

/* FIX LINK BOVE: normalizza e persiste solo ID numerici */
(function(){
  function patchLinkBove(){
    if(typeof window.generaLinkBove!=='function'||window.__BOVE_LINK_PATCHED__)return;
    const originale=window.generaLinkBove;
    window.__BOVE_LINK_PATCHED__=true;
    window.generaLinkBove=function(){
      const r=originale.apply(this,arguments);
      try{
        const input=document.getElementById('linkBoveGenerato');
        const value=input?.value||'';
        const m=value.match(/[?&]idTorneo=([^&#]+)/);
        const id=m?decodeURIComponent(m[1]):'';
        if(id&&Number.isFinite(Number(id))){
          const corretto=location.origin+'/Bove.html?idTorneo='+encodeURIComponent(Number(id));
          if(input)input.value=corretto;
          localStorage.setItem('padel_admin_generated_link',corretto);
        }else{
          localStorage.removeItem('padel_admin_generated_link');
        }
      }catch(e){
        console.warn('Fix link Bove:',e);
      }
      return r;
    };
  }
  patchLinkBove();
  const t=setInterval(()=>{
    patchLinkBove();
    if(window.__BOVE_LINK_PATCHED__)clearInterval(t);
  },100);
})();
})();
