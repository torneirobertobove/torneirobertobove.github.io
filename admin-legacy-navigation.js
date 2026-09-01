/* Legacy navigation aliases: keep config/links internal while exposing legacy selectors only on sidebar navigation. */
(function(){
  'use strict';

  function install(){
    var area=document.getElementById('areaAdmin');
    if(!area) return;

    var nav=area.querySelector('.sidebar .nav');
    if(!nav) return;

    /* Remove legacy selector values from content controls/sections; keep canonical keys internally. */
    area.querySelectorAll('[data-page="configurazione"],[data-page="link"]').forEach(function(el){
      if(!nav.contains(el)){
        var canonical=el.dataset.orgPage || (el.dataset.page==='link'?'links':'config');
        el.dataset.page=canonical;
        if(canonical==='config') el.dataset.internalPage='config';
        if(canonical==='links') el.dataset.internalPage='links';
        el.removeAttribute('data-legacy-page');
      }
    });

    function ensure(internal, legacy, matcher){
      var buttons=[].slice.call(nav.querySelectorAll('button'));
      var found=buttons.find(function(el){
        var raw=String(el.dataset.page||el.dataset.orgPage||'').toLowerCase().trim();
        var text=(el.textContent||'').trim();
        return (raw===internal || raw===legacy || (internal==='config' && /configurazione|impostazioni/i.test(text)) || (internal==='links' && /link/i.test(text))) && (!matcher || matcher(text));
      });

      if(found){
        found.dataset.orgPage=internal;
        found.dataset.page=legacy;
        found.dataset.internalPage=internal;
        found.setAttribute('data-legacy-page',legacy);
        return;
      }

      var button=document.createElement('button');
      button.type='button';
      button.dataset.page=legacy;
      button.dataset.orgPage=internal;
      button.dataset.internalPage=internal;
      button.setAttribute('data-legacy-page',legacy);
      button.textContent=internal==='config'?'⚙️ Configurazione':'🔗 Link pubblici';
      button.addEventListener('click',function(){
        var fn=window.openAdminPage||window.goAdminPage||window.adminGoPage;
        if(typeof fn==='function') fn(internal);
      });
      nav.appendChild(button);
    }

    ensure('config','configurazione',function(t){return /configurazione|impostazioni/i.test(t);});
    ensure('links','link',function(t){return /link/i.test(t);});
  }

  function start(){
    install();
    var body=document.body;
    if(body && !window.__legacyNavigationObserver){
      window.__legacyNavigationObserver=new MutationObserver(function(){install();});
      window.__legacyNavigationObserver.observe(body,{childList:true,subtree:true});
    }
    setInterval(install,500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
