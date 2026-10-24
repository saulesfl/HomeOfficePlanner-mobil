let installPrompt=null;const installButton=document.getElementById("installButton");
window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();installPrompt=event;installButton.hidden=false});
installButton.addEventListener("click",async()=>{if(!installPrompt)return;await installPrompt.prompt();installPrompt=null;installButton.hidden=true});
window.addEventListener("appinstalled",()=>installButton.hidden=true);
