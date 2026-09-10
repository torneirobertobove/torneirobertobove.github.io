(()=>{'use strict';
const openWhatsApp=()=>{if(typeof window.whatsappOverride==='function')return window.whatsappOverride();if(typeof window.whatsappFinal==='function')return window.whatsappFinal();alert('Gestore WhatsApp non disponibile.')};
const previousOpen=window.openAdminComPage;
window.openAdminComPage=p=>p==='whatsapp'?openWhatsApp():previousOpen?.(p);
function bind(){document.querySelectorAll('[data-com-page="whatsapp"]').forEach(b=>{if(b.dataset.waFinalBound)return;b.dataset.waFinalBound='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();document.getElementById('mobileOverlay')?.classList.remove('open');Promise.resolve(openWhatsApp()).catch(err=>{console.error(err);alert('Errore caricamento WhatsApp: '+(err?.message||err))})},true)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();