/* ADMIN DESKTOP V3 - compatibility/bootstrap loader V9 */
(function(){
  'use strict';

  var LINK_KEY='padel_admin_generated_link';

  function area(){ return document.getElementById('areaAdmin'); }
  function setLink(value){
    if(!value)return;
    var a=document.getElementById('linkBoveGenerato');
    var b=document.getElementById('linkBoveGeneratoMirror');
    if(a)a.value=value;
    if(b)b.value=value;
    try{localStorage.setItem(LINK_KEY,value);}catch(e){}
    try{sessionStorage.setItem(LINK_KEY,value);}catch(e){}
  }
  function tournamentId(){
    var st=window.adminState;
    if(st&&st.torneoSelezionato!=null)return st.torneoSelezionato;
    if(st&&Array.isArray(st.tornei)&&st.tornei.length)return st.tornei[0].id;
    return null;
  }
  function buildLink(id){
    return location.origin+location.pathname.replace(/[^/]*$/,'')+'Bove.html?idTorneo='+encodeURIComponent(String(id));
  }
  function ensureCompatPanels(){
    var a=area(); if(!a)return;
    var news=document.getElementById('newsPanel')||a.querySelector('#org-page-news');
    if(news)news.id='newsPanel';
    else if(!document.getElementById('newsPanel')){
      news=document.createElement('div');news.id='newsPanel';news.hidden=true;news.setAttribute('aria-hidden','true');a.appendChild(news);
    }
    var sponsor=document.getElementById('sponsorPanel')||a.querySelector('#org-page-sponsor');
    if(sponsor)sponsor.id='sponsorPanel';
    else if(!document.getElementById('sponsorPanel')){
      sponsor=document.createElement('div');sponsor.id='sponsorPanel';sponsor.hidden=true;sponsor.setAttribute('aria-hidden','true');a.appendChild(sponsor);
    }
  }
  function installGlobals(){
    window.__adminRefresh=function(){
      try{
        if(typeof window.renderAdmin==='function')window.renderAdmin();
        if(typeof window.__adminDesktopRender==='function')window.__adminDesktopRender();
        if(typeof window.caricaTorneiSupabase==='function')return window.caricaTorneiSupabase();
      }catch(e){console.error('[ADMIN] refresh',e)}
      return true;
    };
    window.generaLinkBoveMirror=function(){
      var id=tournamentId();
      if(id==null){alert('Seleziona prima un torneo');return false;}
      var ok=true;
      try{
        if(typeof window.generaLinkBove==='function')ok=window.generaLinkBove()!==false;
      }catch(e){ok=false;console.error(e)}
      setLink(buildLink(id));
      return ok;
    };
    window.__adminButtonAction=function(kind){
      var names={
        generate:['generaCoppieAdmin','generaCoppie','generaCoppieAutomatiche','generaSfide'],
        random:['accoppiaACaso','accoppiaCasualmente','generaCoppieCasuali','creaCoppieCasuali']
      };
      var list=names[kind]||[];
      for(var i=0;i<list.length;i++)if(typeof window[list[i]]==='function')return window[list[i]]();
      if(typeof window.openAdminPage==='function')return window.openAdminPage('coppie');
      return true;
    };
  }
  function installInlineHandlers(){
    var a=area(); if(!a)return;
    ensureCompatPanels();
    installGlobals();

    var refresh=document.getElementById('btnAggiorna');
    if(refresh)refresh.setAttribute('onclick','window.__adminRefresh()');

    a.querySelectorAll('button').forEach(function(b){
      var text=String(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      var old=b.getAttribute('onclick')||'';

      if(old.indexOf("generaLinkBove();document.getElementById('linkBoveGeneratoMirror')")>=0)
        b.setAttribute('onclick','window.generaLinkBoveMirror()');

      if(b.matches('[data-cal-id]')&&!b.getAttribute('onclick')){
        var id=b.getAttribute('data-cal-id');
        b.setAttribute('onclick',"window.selezionaTorneoAdmin&&window.selezionaTorneoAdmin("+JSON.stringify(id)+");window.openAdminPage&&window.openAdminPage('iscritti');");
      }
      if(!b.getAttribute('onclick')){
        if(text.indexOf('gestisci le richieste')>=0)
          b.setAttribute('onclick',"window.openAdminPage&&window.openAdminPage('iscritti')");
        else if(text.indexOf('genera le sfide')>=0)
          b.setAttribute('onclick',"window.__adminButtonAction('generate')");
        else if(text.indexOf('apri tabellone')>=0||text.indexOf('visualizza il torneo')>=0)
          b.setAttribute('onclick',"window.openAdminPage&&window.openAdminPage('tabellone')");
        else if(text.indexOf('accoppia a caso')>=0)
          b.setAttribute('onclick',"window.__adminButtonAction('random')");
      }
    });

    var id=tournamentId();
    if(id!=null){
      var value=buildLink(id);
      var current='';
      try{current=sessionStorage.getItem(LINK_KEY)||'';}catch(e){}
      try{if(!current)current=localStorage.getItem(LINK_KEY)||'';}catch(e){}
      if(!current)setLink(value);else setLink(current);
    }
  }
  function cleanDuplicateScripts(){
    var seen={};
    Array.prototype.slice.call(document.scripts||[]).forEach(function(s){
      var src=s.getAttribute('src')||'';
      var key=src.replace(/\?[^#]*/,'');
      if(/admin-desktop-v3\.js$/.test(key)||/admin-organization-v1\.js$/.test(key)){
        if(seen[key])s.remove();else seen[key]=s;
      }
    });
  }
  function clearStaticCacheMarkers(){
    Array.prototype.slice.call(document.scripts||[]).forEach(function(s){
      var src=s.getAttribute('src')||'';
      if(/^admin-(?:desktop-v3|organization-v1)\.js\?v=/.test(src))s.removeAttribute('src');
    });
  }
  function installNavigation(){
    var a=area();if(!a)return;
    a.querySelectorAll('.sidebar .nav button').forEach(function(b){
      var raw=String(b.dataset.orgPage||b.dataset.internalPage||b.dataset.page||'').toLowerCase().trim();
      var text=String(b.textContent||'').toLowerCase();
      var p=raw;
      if(raw==='configurazione'||raw==='config'||text.indexOf('impostazioni')>=0)p='config';
      if(raw==='link'||raw==='links'||text.indexOf('link pubblici')>=0)p='links';
      if(p==='config'||p==='links'){
        b.dataset.orgPage=p;b.dataset.internalPage=p;b.dataset.page=p==='config'?'configurazione':'link';b.dataset.legacyPage=p==='config'?'configurazione':'link';
      }
    });
  }
  function boot(){
    cleanDuplicateScripts();
    if(!document.getElementById('admin-desktop-v4-loader')){
      var s=document.createElement('script');s.id='admin-desktop-v4-loader';s.src='admin-desktop-v4.js?v=8';s.async=false;document.head.appendChild(s);
    }
    if(!document.getElementById('admin-legacy-navigation-loader')){
      var n=document.createElement('script');n.id='admin-legacy-navigation-loader';n.src='admin-legacy-navigation.js?v=8';n.async=false;document.head.appendChild(n);
    }
    if(!document.getElementById('admin-function-fixes-loader')){
      var f=document.createElement('script');f.id='admin-function-fixes-loader';f.src='admin-function-fixes-v1.js?v=8';f.async=false;document.head.appendChild(f);
    }
    installGlobals();installNavigation();installInlineHandlers();
    var root=document.body||document.documentElement;
    if(root&&!root.__adminV8Observer){
      root.__adminV8Observer=true;
      new MutationObserver(function(){installNavigation();installInlineHandlers();}).observe(root,{childList:true,subtree:true});
    }
    [100,300,800,1500,3000].forEach(function(ms){setTimeout(function(){cleanDuplicateScripts();installNavigation();installInlineHandlers();},ms)});
    setTimeout(clearStaticCacheMarkers,1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();