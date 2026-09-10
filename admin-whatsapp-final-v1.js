(()=>{'use strict';
function openWhatsApp(){
  if(typeof window.whatsappOverride==='function'){
    Promise.resolve(window.whatsappOverride()).catch(e=>{console.error(e);alert('Errore WhatsApp: '+(e?.message||e))});
    return;
  }
  alert('Gestore WhatsApp non disponibile.');
}
window.openAdminComPageWhatsApp=openWhatsApp;
const oldOpen=window.openAdminComPage;
window.openAdminComPage=function(page){
  if(page==='whatsapp')return openWhatsApp();
  if(typeof oldOpen==='function')return oldOpen.apply(this,arguments);
};
document.addEventListener('click',e=>{
  const b=e.target?.closest?.('[data-com-page="whatsapp"]');
  if(!b)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  document.getElementById('mobileOverlay')?.classList.remove('open');
  openWhatsApp();
},true);
})();