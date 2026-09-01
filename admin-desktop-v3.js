/* Compatibility loader: active admin fixes live in admin-desktop-v4.js. */
(function(){
  function load(){
    if(document.getElementById('admin-desktop-v4-loader')) return;
    var s=document.createElement('script');
    s.id='admin-desktop-v4-loader';
    s.src='admin-desktop-v4.js?v=2';
    s.async=false;
    document.head.appendChild(s);
    var compat=document.createElement('script');
    compat.id='admin-legacy-navigation-loader';
    compat.src='admin-legacy-navigation.js?v=1';
    compat.async=false;
    document.head.appendChild(compat);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',load); else load();
})();
