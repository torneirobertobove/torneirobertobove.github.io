/* Compatibility loader: active admin fixes live in admin-desktop-v4.js. */
(function(){
  function installLegacyNavigation(){
    var area=document.getElementById('areaAdmin');
    if(!area) return;

    var nav=area.querySelector('.sidebar .nav');
    if(!nav) return;

    /* Only sidebar navigation buttons expose legacy data-page aliases. */
    area.querySelectorAll('[data-page="configurazione"],[data-page="link"]').forEach(function(el){
      if(!nav.contains(el)){
        var canonical=el.dataset.orgPage || (el.dataset.page==='link'?'links':'config');
        el.dataset.page=canonical;
        el.dataset.internalPage=canonical;
        el.removeAttribute('data-legacy-page');
      }
    });

    nav.querySelectorAll('button').forEach(function(button){
      var raw=String(button.dataset.orgPage||button.dataset.page||'').toLowerCase().trim();
      var text=String(button.textContent||'').toLowerCase().trim();
      var canonical=raw;
      if(raw==='configurazione'||raw==='config'||/configurazione|impostazioni/.test(text)) canonical='config';
      if(raw==='link'||raw==='links'||/link pubblici/.test(text)) canonical='links';

      if(canonical==='config'){
        button.dataset.orgPage='config';
        button.dataset.internalPage='config';
        button.dataset.page='configurazione';
        button.setAttribute('data-legacy-page','configurazione');
      }else if(canonical==='links'){
        button.dataset.orgPage='links';
        button.dataset.internalPage='links';
        button.dataset.page='link';
        button.setAttribute('data-legacy-page','link');
      }
    });
  }

  function load(){
    if(!document.getElementById('admin-desktop-v4-loader')){
      var s=document.createElement('script');
      s.id='admin-desktop-v4-loader';
      s.src='admin-desktop-v4.js?v=2';
      s.async=false;
      document.head.appendChild(s);
    }
    if(!document.getElementById('admin-legacy-navigation-loader')){
      var compat=document.createElement('script');
      compat.id='admin-legacy-navigation-loader';
      compat.src='admin-legacy-navigation.js?v=2';
      compat.async=false;
      document.head.appendChild(compat);
    }
    installLegacyNavigation();
    setInterval(installLegacyNavigation,100);
    var area=document.getElementById('areaAdmin');
    if(area){
      var observer=new MutationObserver(installLegacyNavigation);
      observer.observe(area,{childList:true,subtree:true});
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',load); else load();
})();
