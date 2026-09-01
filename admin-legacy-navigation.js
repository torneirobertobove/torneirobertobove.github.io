/* Legacy navigation aliases: keep config/links internal while exposing legacy selectors. */
(function(){
  'use strict';
  function install(){
    var area=document.getElementById('areaAdmin');
    if(!area) return;
    function alias(internal, legacy, matcher){
      var found=[].slice.call(area.querySelectorAll('[data-page="'+internal+'"]')).find(function(el){
        return !matcher || matcher((el.textContent||'').trim());
      });
      if(!found) return;
      found.dataset.page=legacy;
      found.dataset.internalPage=internal;
    }
    alias('config','configurazione',function(t){return /configurazione|impostazioni|nuovo torneo|crea torneo/i.test(t);});
    alias('links','link',function(t){return /link/i.test(t);});
    area.querySelectorAll('[data-page="configurazione"],[data-page="link"]').forEach(function(el){
      if(el.dataset.internalPage) return;
      el.dataset.internalPage=el.dataset.page==='configurazione'?'config':'links';
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(install,300);});
  else setTimeout(install,300);
  setInterval(install,1000);
})();
