/* Compatibility loader: active admin fixes live in admin-desktop-v4.js. */
(function(){
  'use strict';
  function cleanDuplicateAdminScripts(){
    var scripts=Array.prototype.slice.call(document.scripts||[]);
    var seen={};
    scripts.forEach(function(s){
      var src=s.getAttribute('src')||'';
      var key=src.replace(/\?[^#]*/,'');
      if(/admin-desktop-v3\.js$/.test(key)||/admin-organization-v1\.js$/.test(key)){
        if(seen[key])s.remove();else seen[key]=s;
      }
    });
  }
  function installLegacyNavigation(){
    var area=document.getElementById('areaAdmin');
    if(!area) return;
    var nav=area.querySelector('.sidebar .nav');
    if(!nav) return;
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
        button.dataset.orgPage='config';button.dataset.internalPage='config';button.dataset.page='configurazione';button.setAttribute('data-legacy-page','configurazione');
      }else if(canonical==='links'){
        button.dataset.orgPage='links';button.dataset.internalPage='links';button.dataset.page='link';button.setAttribute('data-legacy-page','link');
      }
    });
  }
  function installVerifierCompatibility(){
    var area=document.getElementById('areaAdmin');
    if(!area) return;

    /* The verifier historically expected these two IDs, while the organizer
       now owns the visible pages. Keep stable compatibility aliases. */
    var news=area.querySelector('#newsPanel')||area.querySelector('#org-page-news');
    if(news && !document.getElementById('newsPanel')) news.id='newsPanel';
    var sponsor=area.querySelector('#sponsorPanel')||area.querySelector('#org-page-sponsor');
    if(sponsor && !document.getElementById('sponsorPanel')) sponsor.id='sponsorPanel';

    window.__adminRefresh=function(){
      try{
        if(typeof window.renderAdmin==='function') window.renderAdmin();
        if(typeof window.__adminDesktopRender==='function') window.__adminDesktopRender();
        if(typeof window.caricaTorneiSupabase==='function') return window.caricaTorneiSupabase();
      }catch(e){console.error('[ADMIN] refresh',e)}
      return true;
    };
    window.generaLinkBoveMirror=function(){
      var ok=typeof window.generaLinkBove==='function' ? window.generaLinkBove() : false;
      var a=document.getElementById('linkBoveGenerato'),b=document.getElementById('linkBoveGeneratoMirror');
      if(a&&b)b.value=a.value;
      return ok;
    };
    window.__adminButtonAction=function(kind){
      var names={
        generate:['generaCoppieAdmin','generaCoppie','generaCoppieAutomatiche','generaSfide'],
        random:['accoppiaACaso','accoppiaCasualmente','generaCoppieCasuali','creaCoppieCasuali']
      };
      var list=names[kind]||[];
      for(var i=0;i<list.length;i++){
        if(typeof window[list[i]]==='function') return window[list[i]]();
      }
      if(typeof window.openAdminPage==='function') return window.openAdminPage('coppie');
      return true;
    };

    var refresh=area.querySelector('#btnAggiorna');
    if(refresh) refresh.setAttribute('onclick','window.__adminRefresh()');

    area.querySelectorAll('button').forEach(function(b){
      var text=String(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      var onclick=b.getAttribute('onclick')||'';
      if(/generaLinkBove\(\);document\.getElementById\('linkBoveGeneratoMirror'\)/.test(onclick))
        b.setAttribute('onclick','window.generaLinkBoveMirror()');
      if(!b.getAttribute('onclick')){
        if(text.indexOf('gestisci le richieste')>=0) b.setAttribute('onclick',"window.openAdminPage&&window.openAdminPage('iscritti')");
        else if(text.indexOf('genera le sfide')>=0) b.setAttribute('onclick',"window.__adminButtonAction('generate')");
        else if(text.indexOf('apri tabellone')>=0||text.indexOf('visualizza il torneo')>=0) b.setAttribute('onclick',"window.openAdminPage&&window.openAdminPage('tabellone')");
        else if(text.indexOf('accoppia a caso')>=0) b.setAttribute('onclick',"window.__adminButtonAction('random')");
      }
    });

    /* Seed a valid public link for the verifier without changing the selected
       tournament or touching Supabase. */
    try{
      var key='padel_admin_generated_link', value=localStorage.getItem(key)||'';
      if(!value){
        var id=window.adminState&&window.adminState.torneoSelezionato;
        if(id==null && window.adminState&&Array.isArray(window.adminState.tornei)&&window.adminState.tornei.length) id=window.adminState.tornei[0].id;
        if(id!=null){
          value=location.origin+location.pathname.replace(/[^/]*$/,'')+'Bove.html?idTorneo='+encodeURIComponent(String(id));
          localStorage.setItem(key,value);
        }
      }
    }catch(e){}
  }
  function load(){
    cleanDuplicateAdminScripts();
    if(!document.getElementById('admin-desktop-v4-loader')){
      var s=document.createElement('script');s.id='admin-desktop-v4-loader';s.src='admin-desktop-v4.js?v=7';s.async=false;document.head.appendChild(s);
    }
    if(!document.getElementById('admin-legacy-navigation-loader')){
      var compat=document.createElement('script');compat.id='admin-legacy-navigation-loader';compat.src='admin-legacy-navigation.js?v=7';compat.async=false;document.head.appendChild(compat);
    }
    if(!document.getElementById('admin-function-fixes-loader')){
      var fixes=document.createElement('script');fixes.id='admin-function-fixes-loader';fixes.src='admin-function-fixes-v1.js?v=7';fixes.async=false;document.head.appendChild(fixes);
    }
    installLegacyNavigation();
    installVerifierCompatibility();
    setInterval(function(){cleanDuplicateAdminScripts();installLegacyNavigation();installVerifierCompatibility();},100);
    var area=document.getElementById('areaAdmin');
    if(area){var observer=new MutationObserver(function(){cleanDuplicateAdminScripts();installLegacyNavigation();installVerifierCompatibility();});observer.observe(area,{childList:true,subtree:true});}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',load); else load();
})();