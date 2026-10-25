let installPrompt=null;
const installButton=document.getElementById("installButton");
const iosInstallDialog=document.getElementById("iosInstallDialog");
const isIos=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const isIosSafari=isIos&&/Safari/i.test(navigator.userAgent)&&!/CriOS|FxiOS|EdgiOS|OPiOS/i.test(navigator.userAgent);
const isStandalone=()=>window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;
function hideInstallButton(){installButton.hidden=true}
function showIosInstructions(){
  document.getElementById("iosBrowserHint").hidden=isIosSafari;
  iosInstallDialog.hidden=false;
  document.getElementById("closeIosInstall").focus();
}
function closeIosInstructions(){iosInstallDialog.hidden=true;installButton.focus()}
if(isStandalone())hideInstallButton();
else if(isIos){installButton.textContent="Instalare iOS";installButton.setAttribute("aria-label","Instrucțiuni de instalare pe iPhone sau iPad");installButton.hidden=false}
window.addEventListener("beforeinstallprompt",event=>{if(isStandalone())return;event.preventDefault();installPrompt=event;installButton.textContent="Instalează";installButton.hidden=false});
installButton.addEventListener("click",async()=>{
  if(isStandalone()){hideInstallButton();return}
  if(isIos){showIosInstructions();return}
  if(!installPrompt)return;
  await installPrompt.prompt();
  const choice=await installPrompt.userChoice;
  if(choice.outcome==="accepted")hideInstallButton();
  installPrompt=null;
});
document.getElementById("closeIosInstall").addEventListener("click",closeIosInstructions);
document.getElementById("closeIosInstallX").addEventListener("click",closeIosInstructions);
iosInstallDialog.addEventListener("click",event=>{if(event.target===iosInstallDialog)closeIosInstructions()});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!iosInstallDialog.hidden)closeIosInstructions()});
window.addEventListener("appinstalled",hideInstallButton);
window.matchMedia("(display-mode: standalone)").addEventListener?.("change",event=>{if(event.matches)hideInstallButton()});
