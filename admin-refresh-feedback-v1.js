(()=>{
'use strict';
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
function showRefreshNotice(){
  let n=document.getElementById('refreshPressNotice');
  if(!n){
    n=document.createElement('div');
    n.id='refreshPressNotice';
    n.textContent='↻ Aggiorna premuto';
    n.style.cssText='position:fixed;top:20px;right:20px;z-index:99999;padding:10px 16px;border-radius:10px;background:#111827;color:#fff;font:600 13px Arial,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.22);opacity:0;transform:translateY(-6px);transition:opacity .18s ease,transform .18s ease;pointer-events:none;';
    document.body.appendChild(n);
  }
  clearTimeout(window.__refreshPressNoticeTimer);
  n.style.opacity='1';
  n.style.transform='translateY(0)';
  window.__refreshPressNoticeTimer=setTimeout(()=>{n.style.opacity='0';n.style.transform='translateY(-6px)'},1800);
}
function bindRefreshButtonNotice(){
  if(document.documentElement.dataset.refreshButtonNoticeBound)return;
  document.documentElement.dataset.refreshButtonNoticeBound='1';
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('#refreshTournaments,#topRefresh,#sideRefresh');
    if(b)showRefreshNotice();
  });
}
function boot(){install();bindRefreshButtonNotice();setTimeout(install,100);setTimeout(install,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
