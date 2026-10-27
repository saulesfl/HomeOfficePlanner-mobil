const today=new Date();
let currentYear=today.getFullYear(),currentMonth=today.getMonth()+1,holidays={},pendingImport=null,touchStartX=0,activeMode="ho",undoDelete=null;
let state={home_office_days:[],absences:{},allowance:{},initialized:false,schema_version:3,updated_at:null,last_backup_at:null};
const $=id=>document.getElementById(id);
function toast(text){const el=$("toast");el.textContent=text;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2200)}
async function initialize(){const saved=await loadState();if(saved)state={...state,...saved};bind();setMode("ho");showCorrectScreen();updateConnection();if(state.initialized)await refresh()}
function showCorrectScreen(){$("welcomeCard").hidden=state.initialized;$("planner").hidden=!state.initialized}
function closeMenu(){$("appMenu").hidden=true;$("menuButton").setAttribute("aria-expanded","false")}
function bind(){
  $("emptyPlanButton").onclick=async()=>{state.initialized=true;await persistAndRefresh();showCorrectScreen()};
  [$("importInput"),$("welcomeImportInput")].forEach(input=>input.onchange=event=>prepareImport(event,input));
  $("exportButton").onclick=()=>{closeMenu();exportCurrent()};
  $("menuButton").onclick=event=>{event.stopPropagation();const open=$("appMenu").hidden;$("appMenu").hidden=!open;$("menuButton").setAttribute("aria-expanded",String(open))};
  document.addEventListener("click",event=>{if(!event.target.closest(".header-tools"))closeMenu()});
  $("previousMonth").onclick=()=>changeMonth(-1);$("nextMonth").onclick=()=>changeMonth(1);
  $("todayButton").onclick=async()=>{currentYear=today.getFullYear();currentMonth=today.getMonth()+1;await refresh()};
    document.querySelectorAll("[data-mode]").forEach(button=>button.onclick=event=>{event.preventDefault();event.stopPropagation();setMode(button.dataset.mode)});
  $("calendarGrid").addEventListener("click",async event=>{const day=event.target.closest("button.day[data-date]");if(!day)return;event.preventDefault();await selectDay(day.dataset.date)});
  $("allowanceInput").onchange=async event=>{state.allowance[currentYear]=Math.max(0,Number(event.target.value)||0);await persistAndRefresh()};
  $("validationToggle").onclick=()=>{const list=$("validationList"),open=list.hidden;list.hidden=!open;$("validationToggle").textContent=open?"Ascunde regulile":"Vezi regulile";$("validationToggle").setAttribute("aria-expanded",String(open))};
  $("cancelImport").onclick=closeImport;$("confirmImport").onclick=confirmImport;$("downloadBeforeImport").onclick=()=>HOBackup.downloadBackup(state,"HomeOfficePlanner_before_import");
  const swipe=$("calendarSwipeArea");swipe.addEventListener("touchstart",e=>touchStartX=e.changedTouches[0].screenX,{passive:true});swipe.addEventListener("touchend",e=>{const dx=e.changedTouches[0].screenX-touchStartX;if(Math.abs(dx)>70)changeMonth(dx<0?1:-1)},{passive:true});
  window.addEventListener("online",updateConnection);window.addEventListener("offline",updateConnection);
}
async function exportCurrent(){state.last_backup_at=HOBackup.downloadBackup(state);state=await saveState(state);renderBackupStatus();toast("Backup exportat")}
async function prepareImport(event,input){const file=event.target.files[0];if(!file)return;closeMenu();try{pendingImport=await HOBackup.readBackup(file);const summary=HOBackup.importSummary(pendingImport),allowance=summary.years.map(year=>`<li>${year}: ${summary.allowance[year]??0} zile</li>`).join("");$("importSummary").innerHTML=`<ul><li>${summary.home_office} zile Home Office</li><li>${summary.co} concedii CO</li><li>${summary.special} absențe speciale</li><li>Ani: ${summary.years.join(", ")||"niciunul"}</li></ul><b>Sold anual</b><ul>${allowance||"<li>Nedefinit</li>"}</ul>`;$("downloadBeforeImport").hidden=!state.initialized;$("importDialog").hidden=false}catch(error){alert(`Fișier invalid: ${error.message}`)}finally{input.value=""}}
function closeImport(){pendingImport=null;$("importDialog").hidden=true}
async function confirmImport(){if(!pendingImport)return;setMode("ho");try{if(state.initialized)await saveSafetyCopy(state);state=await saveState(pendingImport);closeImport();showCorrectScreen();await refresh();const summary=HOBackup.importSummary(state);toast(`Import reușit: ${summary.home_office} HO, ${summary.co} CO`)}catch(error){alert(`Importul a eșuat: ${error.message}`)}}
async function changeMonth(delta){const date=new Date(currentYear,currentMonth-1+delta,1,12);currentYear=date.getFullYear();currentMonth=date.getMonth()+1;await refresh()}
async function persistAndRefresh(){state=await saveState(state);await refresh()}
async function refresh(){holidays=HOHolidays.romanianHolidays(currentYear);$("monthTitle").textContent=`${monthNames[currentMonth-1]} ${currentYear}`;$("todayButton").hidden=currentYear===today.getFullYear()&&currentMonth===today.getMonth()+1;$("allowanceInput").value=state.allowance[currentYear]??state.allowance[String(currentYear)]??0;renderCalendar();renderValidation();renderAvailableLeave();renderBackupStatus()}
function renderCalendar(){const grid=$("calendarGrid");grid.innerHTML="";for(const date of buildCalendarDates(currentYear,currentMonth)){const key=isoLocal(date),button=document.createElement("button");button.className="day";if(date.getMonth()+1!==currentMonth)button.classList.add("other");if([0,6].includes(date.getDay()))button.classList.add("weekend");if(holidays[key])button.classList.add("holiday");if(state.home_office_days.includes(key))button.classList.add("ho");if(state.absences[key]){button.classList.add("absence");button.classList.add(state.absences[key]==="CO"?"co":state.absences[key]==="Bo"?"bo":"other-absence")}if(key===isoLocal(today))button.classList.add("today");const label=state.home_office_days.includes(key)?"HO":absenceLabel(state.absences[key]||"");button.innerHTML=`<span class="day-number">${date.getDate()}</span>${label?`<span class="day-label">${label}</span>`:""}${holidays[key]?`<span class="holiday-name">${holidays[key]}</span>`:""}`;button.setAttribute("aria-label",`${date.toLocaleDateString("ro-RO")}${label?`, ${label}`:""}`);button.dataset.date=key;grid.appendChild(button)}}
async function selectDay(key){await applyCalendarAction(key,activeMode)}
function vibrate(pattern){if("vibrate" in navigator)navigator.vibrate(pattern)}
function actionLabel(mode){return {ho:"Home Office",CO:"CO",Bo:"BO",Fp:"FP",Lp:"LP",R:"R"}[mode]||"Home Office"}
function setMode(mode){
  activeMode=mode||"ho";
  document.querySelectorAll("[data-mode]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.mode===activeMode)));
  const bar=$("modeBar");bar.className=`mode-bar mode-${activeMode}`;
  $("modeMessage").innerHTML=`<strong>Acțiune activă:</strong> ${actionLabel(activeMode)}`;
  const summary=$("moreModesSummary");if(summary)summary.textContent=["CO","Bo","Fp","Lp","R"].includes(activeMode)?`Mai multe: ${actionLabel(activeMode)}`:"Mai multe";
  document.querySelectorAll(".more-modes").forEach(x=>x.open=false)
}
function existingAction(key){if(state.home_office_days.includes(key))return "ho";return state.absences[key]||null}
function formatDay(key){return new Date(`${key}T12:00:00`).toLocaleDateString("ro-RO",{day:"numeric",month:"long"})}
async function applyCalendarAction(key,action){
  const date=new Date(`${key}T12:00:00`),weekend=[0,6].includes(date.getDay()),holiday=Boolean(HOHolidays.romanianHolidays(date.getFullYear())[key]);
  const oldAction=existingAction(key);
  if(oldAction){
    const oldHo=oldAction==="ho",oldAbsence=oldHo?null:oldAction;
    state.home_office_days=state.home_office_days.filter(value=>value!==key);delete state.absences[key];undoDelete={key,oldHo,oldAbsence};
    await persistAndRefresh();vibrate([30,45,30]);toastUndo(`${formatDay(key)}: ${actionLabel(oldAction)} a fost șters.`);return
  }
  if(weekend||holiday){toast(weekend?"Planificarea nu este permisă în weekend.":"Planificarea nu este permisă într-o sărbătoare legală.");return}
  if(action==="ho")state.home_office_days.push(key);else state.absences[key]=action;
  state.home_office_days=[...new Set(state.home_office_days)].sort();await persistAndRefresh();vibrate(30);
  toast(`${formatDay(key)}: ${actionLabel(action)} a fost adăugat.`)
}
function toastUndo(text){const el=$("toast");el.innerHTML="";el.append(document.createTextNode(text));const button=document.createElement("button");button.className="toast-action";button.textContent="Anulează";button.onclick=undoLastDelete;el.append(button);el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>{el.classList.remove("show");undoDelete=null},5000)}
async function undoLastDelete(){if(!undoDelete)return;const {key,oldHo,oldAbsence}=undoDelete;if(oldHo)state.home_office_days.push(key);if(oldAbsence)state.absences[key]=oldAbsence;state.home_office_days=[...new Set(state.home_office_days)].sort();undoDelete=null;await persistAndRefresh();vibrate(30);toast("Ștergerea a fost anulată")}
function renderValidation(){const result=HORules.validateMonth(currentYear,currentMonth,state.home_office_days,state.absences);$("selectedHo").textContent=result.selected_ho;$("maximumHo").textContent=result.maximum_ho;$("weekLinks").textContent=`${result.mondays} / ${result.fridays}`;$("hoProgress").style.width=`${result.maximum_ho?Math.min(100,result.selected_ho/result.maximum_ho*100):0}%`;const summary=document.querySelector(".summary-compact");if(summary)summary.classList.toggle("over-limit",result.selected_ho>result.maximum_ho);const status=$("validationStatus");status.textContent=result.valid?`✓ Plan valid · ${result.selected_ho} zile Home Office`:`⚠ Planul necesită corecții`;status.className=`validation ${result.valid?"valid":"invalid"}`;const labels={percentage:`Maximum ${result.maximum_ho} zile HO din ${result.effective_workdays} zile lucrătoare efective`,mondays:"Maximum 2 zile de luni",fridays:"Maximum 2 zile de vineri",weekend_links:"Maximum 4 legături cu weekendul",sandwich:"Fără combinație vineri-luni, inclusiv între luni",eligible_days:"Doar zile lucrătoare eligibile"};const entries=Object.entries(labels);const visible=result.valid?entries:entries.filter(([key])=>!result.checks[key]);$("validationList").innerHTML=visible.map(([key,label])=>`<li>${result.checks[key]?"✓":"✗"} ${label}</li>`).join("");if(!result.valid){$("validationList").hidden=false;$("validationToggle").textContent="Ascunde detaliile";$("validationToggle").setAttribute("aria-expanded","true")}else if($("validationToggle").getAttribute("aria-expanded")!=="true"){$("validationList").hidden=true}}
function renderAvailableLeave(){$("availableLeave").textContent=HORules.availableLeave(currentYear,state.allowance,state.absences)}
function renderBackupStatus(){if(!state.updated_at){$("saveStatus").textContent="Salvare locală activă.";return}if(!state.last_backup_at){$("saveStatus").textContent="Salvat automat pe dispozitiv · recomandare: exportă un backup.";return}const age=(Date.now()-new Date(state.last_backup_at))/86400000;$("saveStatus").textContent=age>14?"Ultimul backup are peste 14 zile.":"Salvat automat pe dispozitiv."}
function updateConnection(){const el=$("connectionStatus");el.textContent=navigator.onLine?"Online · datele rămân locale":"Offline · aplicația funcționează local";el.className=navigator.onLine?"status-online":"status-offline"}
document.addEventListener("DOMContentLoaded",initialize);
