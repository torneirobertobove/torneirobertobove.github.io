(()=>{'use strict';
function install(){
  const fn=window.refreshCleanAdmin;
  if(typeof fn!=='function'||fn.__refreshFeedback)return false;
  const wrapped=async function(){
    const buttons=[document.getElementById('topRefresh'),document.getElementById('sideRefresh')].filter(Boolean);
    const original=buttons.map(b=>({b,text:b.textContent,disabled:b.disabled}));
    buttons.forEach(b=>{b.disabled=true;b.textContent='↻ Aggiornamento…';b.setAttribute('aria-busy','true')});
    try{return await fn.apply(this,arguments)}
    finally{
      requestAnimationFrame(()=>original.forEach(x=>{x.b.disabled=x.disabled;x.b.textContent=x.text;x.b.removeAttribute('aria-busy')}));
    }
  };
  wrapped.__refreshFeedback=true;
  window.refreshCleanAdmin=wrapped;
  return true;
}
function boot(){install();setTimeout(install,100);setTimeout(install,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
