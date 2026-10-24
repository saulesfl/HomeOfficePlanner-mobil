const monthNames=["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
const isoLocal=date=>HOHolidays.iso(date);
function buildCalendarDates(year,month){const first=new Date(year,month-1,1,12),start=new Date(first);start.setDate(start.getDate()-((first.getDay()+6)%7));return Array.from({length:42},(_,index)=>{const date=new Date(start);date.setDate(start.getDate()+index);return date})}
const absenceLabel=code=>({CO:"CO",Bo:"Bo",Fp:"Fp",Lp:"Lp",R:"R"}[code]||code);
