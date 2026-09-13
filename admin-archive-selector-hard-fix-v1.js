(()=>{
'use strict';
const isArchived=t=>String(t?.stato||'').toLowerCase()==='archiviato';
const clean=()=>{
  const s=window.adminState||{};
  const ids=new Set((s.tornei||[]).filter(isArchived).map(t=>String(t.id)));
  document.querySelectorAll('#torneoSelector').forEach(sel=>{
    const wasArchived=ids.has(String(sel.value));
    [...sel.options].forEach(o=>{if(ids.has(String(o.value)))o.remove()});
    if(wasArchived)sel.value='';
  });
};
const patch=()=>{
  if(typeof window.renderCleanAdmin==='function'&&!window.__ARCHIVE_SELECTOR_HARD_PATCH__){
    const original=window.renderCleanAdmin;
    window.__ARCHIVE_SELECTOR_HARD_PATCH__=true;
    window.renderCleanAdmin=function(){
      const r=original.apply(this,arguments);
      clean();
      requestAnimationFrame(clean);
      return r;
    };
  }
  clean();
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch,{once:true});else patch();
setTimeout(patch,100);setTimeout(patch,500);setTimeout(patch,1200);
window.addEventListener('admin:rendered',patch);
window.addEventListener('admin:render',patch);
const root=document.getElementById('appContent');
if(root)new MutationObserver(()=>clean()).observe(root,{childList:true,subtree:true});
})();
