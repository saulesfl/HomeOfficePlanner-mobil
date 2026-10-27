const assert=require("assert");
global.HOHolidays=require("../js/holidays-ro.js");
const rules=require("../js/rules.js"),backup=require("../js/backup.js"),calendar=require("../js/calendar.js");
let passed=0;function test(name,fn){fn();passed++;console.log(`PASS ${passed}: ${name}`)}
const weekdays=rules.normalWorkdays(2026,10);
test("rotunjirea limitei de 50%",()=>{const abs=weekdays.slice(0,5);assert.strictEqual(rules.validateMonth(2026,10,[],abs).effective_workdays,17);assert.strictEqual(rules.validateMonth(2026,10,[],abs).maximum_ho,9)});
test("maximum două zile de luni",()=>assert.strictEqual(rules.validateMonth(2026,11,["2026-11-02","2026-11-09","2026-11-16"],{}).checks.mondays,false));
test("maximum două zile de vineri",()=>assert.strictEqual(rules.validateMonth(2026,10,["2026-10-02","2026-10-09","2026-10-16"],{}).checks.fridays,false));
test("maximum patru legături cu weekendul",()=>assert.strictEqual(rules.validateMonth(2026,10,["2026-10-02","2026-10-05","2026-10-09","2026-10-12","2026-10-19"],{}).checks.weekend_links,false));
test("blocarea combinației vineri-luni",()=>assert.strictEqual(rules.validateMonth(2026,10,["2026-10-23","2026-10-26"],{}).checks.sandwich,false));
test("vineri-luni între luni diferite",()=>assert.strictEqual(rules.validateMonth(2026,11,["2026-10-30","2026-11-02"],{}).checks.sandwich,false));
test("blocarea weekendurilor",()=>assert.strictEqual(rules.validateMonth(2026,10,["2026-10-10"],{}).checks.eligible_days,false));
test("blocarea sărbătorilor legale",()=>assert.strictEqual(rules.validateMonth(2026,12,["2026-12-25"],{}).checks.eligible_days,false));
test("calcularea Paștelui Ortodox",()=>{assert.strictEqual(HOHolidays.iso(HOHolidays.orthodoxEaster(2026)),"2026-04-12");assert.strictEqual(HOHolidays.iso(HOHolidays.orthodoxEaster(2030)),"2030-04-28")});
const desktop={homeoffice_plans:{2026:{10:["2026-10-06"]}},personal_holidays:{2026:["2026-10-07"]},special_holidays:{2026:{10:{"2026-10-08":"Bo","2026-10-09":"Fp","2026-10-12":"Lp","2026-10-13":"R"}}},holiday_allowance:{2026:26}};
const imported=backup.normalizeImportedBackup(desktop);
test("importul formatului desktop",()=>{assert.deepStrictEqual(imported.home_office_days,["2026-10-06"]);assert.strictEqual(imported.absences["2026-10-07"],"CO");assert.strictEqual(imported.allowance[2026],26)});
test("importul codurilor Bo, Fp, Lp și R",()=>assert.deepStrictEqual([imported.absences["2026-10-08"],imported.absences["2026-10-09"],imported.absences["2026-10-12"],imported.absences["2026-10-13"]],["Bo","Fp","Lp","R"]));
test("toate absențele reduc zilele efective",()=>{const abs={"2026-10-07":"CO","2026-10-14":"Bo","2026-10-21":"Fp","2026-10-22":"Lp","2026-10-28":"R"};assert.strictEqual(rules.validateMonth(2026,10,[],abs).effective_workdays,17)});
test("numai CO reduce soldul anual",()=>assert.strictEqual(rules.availableLeave(2026,{2026:26},{"2026-10-07":"CO","2026-10-08":"Bo"}),25));
test("Bo, Fp, Lp și R nu reduc soldul anual",()=>assert.strictEqual(rules.availableLeave(2026,{2026:26},{"2026-10-08":"Bo","2026-10-09":"Fp","2026-10-12":"Lp","2026-10-13":"R"}),26));
test("exportul și reimportul păstrează datele",()=>{const source={home_office_days:["2026-10-06"],absences:{"2026-10-07":"CO","2026-10-08":"Bo"},allowance:{2026:26},initialized:true};const roundtrip=backup.normalizeImportedBackup(backup.createNativeBackup(source));assert.deepStrictEqual(roundtrip.home_office_days,source.home_office_days);assert.deepStrictEqual(roundtrip.absences,source.absences);assert.deepStrictEqual(roundtrip.allowance,source.allowance)});

test("touch adaugă și elimină Home Office",()=>{const plan={home_office_days:[],absences:{}};assert.strictEqual(calendar.toggleHomeOfficeDay(plan,"2026-10-06").action,"added");assert.deepStrictEqual(plan.home_office_days,["2026-10-06"]);assert.strictEqual(calendar.toggleHomeOfficeDay(plan,"2026-10-06").action,"removed");assert.deepStrictEqual(plan.home_office_days,[])});
test("touch nu înlocuiește absența",()=>{const plan={home_office_days:[],absences:{"2026-10-07":"CO"}},result=calendar.toggleHomeOfficeDay(plan,"2026-10-07");assert.strictEqual(result.changed,false);assert.deepStrictEqual(plan.home_office_days,[]);assert.strictEqual(plan.absences["2026-10-07"],"CO")});
test("touch blochează weekendul și sărbătoarea",()=>{const plan={home_office_days:[],absences:{}};assert.strictEqual(calendar.toggleHomeOfficeDay(plan,"2026-10-10",{weekend:true}).changed,false);assert.strictEqual(calendar.toggleHomeOfficeDay(plan,"2026-12-25",{holiday:true}).changed,false);assert.deepStrictEqual(plan.home_office_days,[])});
console.log(`\n${passed} teste statice trecute.`);

const appSource=require("fs").readFileSync(require("path").join(__dirname,"../js/app.js"),"utf8");
test("persistAndRefresh este definit",()=>assert(appSource.includes("async function persistAndRefresh()")));

const indexSource=require("fs").readFileSync(require("path").join(__dirname,"../index.html"),"utf8");
test("bara conține CO și nu conține Ștergere",()=>{assert(indexSource.includes('data-mode="CO"'));assert(!indexSource.includes('data-mode="clear"'))});
test("atingerea unei zile marcate intră în fluxul de ștergere",()=>assert(appSource.includes('if(oldAction){')));

test("rezumatul și validarea sunt sub calendar",()=>{assert(indexSource.indexOf('id="calendarSwipeArea"')<indexSource.indexOf('class="summary-compact"'));assert(indexSource.indexOf('class="summary-compact"')<indexSource.indexOf('class="validation-card"'))});
test("depășirea limitei activează clasa over-limit",()=>assert(appSource.includes('classList.toggle("over-limit",result.selected_ho>result.maximum_ho)')));
