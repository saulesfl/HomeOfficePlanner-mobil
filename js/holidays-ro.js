(function(root){
  const FIXED={"01-01":"Anul Nou","01-02":"A doua zi de Anul Nou","01-06":"Boboteaza","01-07":"Sfântul Ioan Botezătorul","01-24":"Ziua Unirii Principatelor Române","05-01":"Ziua Muncii","06-01":"Ziua Copilului","08-15":"Adormirea Maicii Domnului","11-30":"Sfântul Andrei","12-01":"Ziua Națională a României","12-25":"Crăciunul","12-26":"A doua zi de Crăciun"};
  const pad=n=>String(n).padStart(2,"0");
  const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const addDays=(date,n)=>new Date(date.getFullYear(),date.getMonth(),date.getDate()+n,12);
  function orthodoxEaster(year){const a=year%4,b=year%7,c=year%19,d=(19*c+15)%30,e=(2*a+4*b-d+34)%7,m=Math.floor((d+e+114)/31),day=(d+e+114)%31+1;return addDays(new Date(year,m-1,day,12),13)}
  function romanianHolidays(year){const result={};Object.entries(FIXED).forEach(([md,name])=>result[`${year}-${md}`]=name);const easter=orthodoxEaster(year);[[-2,"Vinerea Mare"],[0,"Paștele Ortodox"],[1,"A doua zi de Paște"],[49,"Prima zi de Rusalii"],[50,"A doua zi de Rusalii"]].forEach(([offset,name])=>result[iso(addDays(easter,offset))]=name);return result}
  root.HOHolidays={romanianHolidays,orthodoxEaster,iso};if(typeof module!=="undefined")module.exports=root.HOHolidays;
})(typeof globalThis!=="undefined"?globalThis:this);
