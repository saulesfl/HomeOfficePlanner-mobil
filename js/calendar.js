const monthNames=["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
const isoLocal=date=>HOHolidays.iso(date);
function buildCalendarDates(year,month){const first=new Date(year,month-1,1,12),start=new Date(first);start.setDate(start.getDate()-((first.getDay()+6)%7));return Array.from({length:42},(_,index)=>{const date=new Date(start);date.setDate(start.getDate()+index);return date})}
const absenceLabel=code=>({CO:"CO",Bo:"Bo",Fp:"Fp",Lp:"Lp",R:"R"}[code]||code);


function toggleHomeOfficeDay(plan,dateKey,{weekend=false,holiday=false}={}){
  if(plan.absences?.[dateKey])return {changed:false,action:"absence",message:"Ziua are deja o absență. Folosește acțiunile zilei pentru modificare."};
  if(weekend)return {changed:false,action:"blocked",message:"Home Office nu este permis în weekend."};
  if(holiday)return {changed:false,action:"blocked",message:"Home Office nu este permis într-o sărbătoare legală."};
  const days=new Set(plan.home_office_days||[]);
  const removing=days.has(dateKey);
  if(removing)days.delete(dateKey);else days.add(dateKey);
  plan.home_office_days=[...days].sort();
  return {changed:true,action:removing?"removed":"added",message:removing?"Home Office eliminat.":"Home Office adăugat."};
}

if(typeof module!=="undefined")module.exports={buildCalendarDates,absenceLabel,toggleHomeOfficeDay};
