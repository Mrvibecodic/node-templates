"use strict";

let S = loadSave();
function defaultSave(){
  return { coins:0, rod:"bamboo", bait:"worm",
    ownedRods:["bamboo"], ownedBaits:["worm"],
    rodDur:{}, baitCharges:{}, seenFish:{},
    log:[], totalCaught:0, totalWeight:0, best:null };
}
function loadSave(){
  let d=null;
  try{ d=JSON.parse(localStorage.getItem(SAVE_KEY)); }catch(e){}
  const s = (d&&d.ownedRods) ? Object.assign(defaultSave(),d) : defaultSave();
  if(!s.rodDur) s.rodDur={};
  if(!s.baitCharges) s.baitCharges={};
  if(!s.seenFish) s.seenFish={};
  if(!RODS.find(r=>r.id===s.rod)) s.rod="bamboo";
  const eb=BAITS.find(b=>b.id===s.bait);
  if(!eb || (!eb.inf && (s.baitCharges[s.bait]||0)<=0)) s.bait="worm";
  return s;
}
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }catch(e){} }

const rod = ()=>RODS.find(r=>r.id===S.rod);
const bait= ()=>BAITS.find(b=>b.id===S.bait);
function rodDurPct(){ const ro=rod(); if(!ro.dur) return 1; return clamp((S.rodDur[ro.id]??ro.dur)/ro.dur,0,1); }
function rodIndex(){ return RODS.findIndex(r=>r.id===S.rod); }

const SPRITES={};
function spriteReady(slug){ const im=SPRITES[slug]; return (im && im._ok && im.complete && im.naturalWidth>0) ? im : null; }
function loadSprites(){
  if(typeof Image==="undefined") return;
  for(const n of SPRITE_NAMES){
    const img=new Image();
    img._ok=false;
    img.onload=()=>{ img._ok=true; };
    img.onerror=()=>{ img._ok=false; };
    img.src=SPRITE_BASE+n+".png";
    SPRITES[n]=img;
  }
}
function drawSpriteFit(g, im, cw, ch, pad){
  const r=Math.min(cw/im.naturalWidth, ch/im.naturalHeight)*(pad||0.9);
  const w=im.naturalWidth*r, h=im.naturalHeight*r;
  g.drawImage(im, (cw-w)/2, (ch-h)/2, w, h);
}

const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
let W=0,H=0, horizon=0;
function resize(){ W=cv.width=innerWidth; H=cv.height=innerHeight; horizon=H*0.42; }
addEventListener("resize", resize); resize();

let mouse={x:W/2,y:H*0.6}, mouseDown=false;
cv.addEventListener("mousemove", e=>{ mouse.x=e.clientX; mouse.y=e.clientY; });

let gCycleT=0, gLight=1, gNight=0, gSunSin=0, gTwi=0;
const STARS=[]; for(let i=0;i<80;i++) STARS.push({x:Math.random(), y:Math.random()*0.45, r:Math.random()*1.3+0.3, tw:Math.random()*6});
const BIRDS=[]; for(let i=0;i<3;i++) BIRDS.push({x:Math.random(), y:0.12+Math.random()*0.18, sp:0.01+Math.random()*0.015, ph:Math.random()*6});
const CLOUDS=[]; for(let i=0;i<5;i++) CLOUDS.push({x:Math.random()*1.2-0.1, y:0.08+Math.random()*0.2, sc:0.7+Math.random()*0.9, sp:0.004+Math.random()*0.006});
const startTime=performance.now();

let state="idle";
let power=0, powerDir=1;
let bob={x:W/2,y:H*0.6,tx:W/2,ty:H*0.6,t:0};
let castFrom={x:0,y:0};
let biteTimer=0, biteWindow=0, hooked=null;
let tension=0, dist=100, struggle=0, fishWeightFactor=1, maxTenRatio=0;
let ripples=[], splashes=[], shadowFish=[], bubbles=[];
let approachT=0;

let monkey={active:false, phase:"gone", x:0, y:0, baseY:0, peekY:0, size:90, timer:0, watchDur:3, text:"", showText:true, tilt:0};
let monkeyDay=-1, monkeyTimes=[];
function scheduleMonkey(dayId){
  monkeyDay=dayId;
  const n=2+Math.floor(Math.random()*5);
  monkeyTimes=[];
  for(let i=0;i<n;i++){ const frac=0.07+Math.random()*0.36; monkeyTimes.push({v:(dayId+frac)*CYCLE, done:false}); }
  monkeyTimes.sort((a,b)=>a.v-b.v);
}
function spawnMonkey(){
  const m=monkey;
  m.size=Math.max(72, Math.min(120, H*0.16));
  m.x = W*(0.12+Math.random()*0.33);
  m.baseY = H + m.size*0.8;
  m.peekY = H - m.size*0.42;
  m.y = m.baseY;
  m.phase="rising"; m.timer=0;
  m.watchDur=2.8+Math.random()*2.4;
  m.showText = Math.random()<0.78;
  m.text = MONKEY_LINES[(Math.random()*MONKEY_LINES.length)|0];
  m.tilt = (Math.random()-0.5)*0.16;
  m.active=true;
  beep(520,0.05);
}
function updateMonkey(dt){
  const m=monkey; m.timer+=dt;
  if(m.phase==="rising"){
    m.y += (m.peekY-m.y)*Math.min(1,dt*5);
    if(Math.abs(m.y-m.peekY)<2){ m.y=m.peekY; m.phase="watch"; m.timer=0; }
  } else if(m.phase==="watch"){
    m.tilt=Math.sin(m.timer*2.2)*0.07;
    if(m.timer>m.watchDur){ m.phase="leaving"; m.timer=0; }
  } else if(m.phase==="leaving"){
    m.y += (m.baseY-m.y)*Math.min(1,dt*4);
    if(m.y>m.baseY-3){ m.active=false; m.phase="gone"; }
  }
}

let specialDay=-1, todaySpecial=null;
function pickSpecial(dayId){
  specialDay=dayId;
  todaySpecial=SPECIALS[(Math.random()*SPECIALS.length)|0];
  const el=document.getElementById("special");
  el.style.display="block";
  el.innerHTML="🌟 Сегодня клюёт особая рыба: <b>"+todaySpecial.n+"</b> — нужна крепкая снасть (карбон+, лучше 🔱 эпик)!";
}

let HOTEL=null;
function buildHotel(){
  const cols=5, rows=6, pat=[];
  for(let r=0;r<rows;r++){ const row=[];
    for(let c=0;c<cols;c++){ const v=Math.random();
      row.push(v<0.18?"lit":(v<0.42?"broken":"dark")); }
    pat.push(row); }
  HOTEL={cols,rows,pat};
}
buildHotel();

function setHint(t){ document.getElementById("hint").innerHTML=t; }
function avgW(f){ return (f.w[0]+f.w[1])/2; }

let toastT=null;
function toast(msg){
  const el=document.getElementById("toast");
  el.textContent=msg; el.classList.add("show");
  clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove("show"),2600);
}

function startCharge(){
  if(state!=="idle") return;
  state="charging"; power=0; powerDir=1;
  document.getElementById("powerWrap").style.display="block";
}
function releaseCast(){
  if(state!=="charging") return;
  document.getElementById("powerWrap").style.display="none";
  consumeBait();
  const minY=horizon+20, maxY=H*0.82;
  let ty = maxY - (maxY-minY)*(0.25+0.75*power/100);
  let tx = Math.min(W-40, Math.max(40, mouse.x));
  castFrom={x:W*0.82, y:H*0.96};
  bob={x:castFrom.x, y:castFrom.y, tx:tx, ty:ty, t:0};
  state="casting";
}
function consumeBait(){
  const b=bait();
  if(b.inf) return;
  S.baitCharges[b.id]=(S.baitCharges[b.id]||0)-1;
  if(S.baitCharges[b.id]<=0){ S.baitCharges[b.id]=0; S.bait="worm"; toast("Приманка кончилась — поставил червяка 🪱"); }
  save(); updateHUD();
}
function wearRod(){
  const ro=rod();
  if(!ro.dur) return;
  const ratio=clamp(maxTenRatio,0,1);
  const wear=1.2+ratio*ratio*8.5;
  S.rodDur[ro.id]=Math.max(0,(S.rodDur[ro.id]??ro.dur)-wear);
  if(S.rodDur[ro.id]<=0){ S.rod="bamboo"; toast("🎣 "+ro.n+" сломалась! Взял бамбук."); }
  save(); updateHUD();
}
function startWaiting(){
  state="waiting";
  ripples.push({x:bob.x,y:bob.y,r:6,a:1});
  splashes.push({x:bob.x,y:bob.y,t:0});
  const base = 3.2 + Math.random()*5.5;
  biteTimer = base / rod().bite;
  approachT = 0;
  shadowFish=[]; bubbles=[];
  const n = 1+Math.floor(Math.random()*3);
  for(let i=0;i<n;i++){
    const col=FISH_SHADOW_COLS[(Math.random()*FISH_SHADOW_COLS.length)|0];
    shadowFish.push({ x:bob.x+(Math.random()-0.5)*170, y:bob.y+28+Math.random()*46,
      tx:bob.x, ty:bob.y, sp:0.4+Math.random()*0.5, ph:Math.random()*6, size:9+Math.random()*16,
      chat:0.8+Math.random()*2.5, colD:col[0], colL:col[1] });
  }
  setHint(gNight>0.6 ? "🌙 Ночь — ждём крупную рыбу… 🎣" : "Жди поклёвки… 🎣");
}
function triggerBite(){
  state="bite";
  hooked = rollFish();
  biteWindow = 1.15;
  bubbles=[];
  ripples.push({x:bob.x,y:bob.y,r:4,a:1});
  ripples.push({x:bob.x,y:bob.y,r:10,a:.8});
  setHint(hooked.isSpecial ? "<b>‼️ ОСОБАЯ ПОКЛЁВКА!</b> Подсекай! ⚡" : "<b>ПОКЛЁВКА!</b> Кликни — подсекай! ⚡");
  beep(hooked.isSpecial?520:660,0.08);
}
function tryHook(){
  if(state==="bite"){
    if(hooked.isSpecial && rodIndex()<2){
      showMiss();
      toast("🔱 "+hooked.fish.n+" мгновенно оборвал леску! Снасть слишком слабая");
      beep(150,0.28); setTimeout(()=>beep(110,0.3),120);
      resetToIdle(0.6);
      return;
    }
    state="fighting";
    tension=18; dist=100; maxTenRatio=0;
    fishWeightFactor = hooked.weight / (avgW(hooked.fish));
    if(hooked.isSpecial) fishWeightFactor = Math.min(fishWeightFactor, 1.1);
    struggle=0;
    document.getElementById("fight").style.display="block";
    setHint("Вываживай! Держи мышь, но следи за <b>натяжением</b>!");
  } else if(state==="waiting"){
    setHint("Рано! Рыба ещё не клюнула… ждём дальше 🐟");
  }
}
function missFish(){ showMiss(); beep(180,0.2); resetToIdle(0.4); }
function landFish(){
  const f=hooked;
  const pts = Math.round(f.fish.val * (0.6 + f.weight/avgW(f.fish)*0.7) * (1+f.fish.rar*0.05) * 1.2);
  S.coins += pts;
  S.totalCaught++; S.totalWeight += f.weight;
  S.seenFish[f.fish.n]=true;
  S.log.unshift({n:f.fish.n, w:+f.weight.toFixed(2), pts:pts, rar:f.fish.rar, t:Date.now()});
  if(S.log.length>100) S.log.pop();
  if(!S.best || f.weight>S.best.w) S.best={n:f.fish.n, w:+f.weight.toFixed(2)};
  save(); updateHUD();
  showCatch(f, pts);
  splashes.push({x:bob.x,y:bob.y,t:0,big:true});
  beep(880,0.08); setTimeout(()=>beep(1100,0.1),90);
  if(f.isSpecial){ setTimeout(()=>beep(1320,0.14),200); }
  resetToIdle(2.4);
}
function resetToIdle(delay){
  state="reset"; hooked=null;
  document.getElementById("fight").style.display="none";
  shadowFish=[]; bubbles=[];
  setTimeout(()=>{
    state="idle"; power=0;
    bob={x:castFrom.x||W*0.82,y:castFrom.y||H*0.96,tx:0,ty:0,t:0};
    setHint("Зажми <b>ЛКМ</b> и целься — отпусти, чтобы <b>забросить</b> 🎣");
  }, delay*1000);
}

function rollFish(){
  const bt = bait().tier;
  const nb = gNight;
  if(todaySpecial){
    const chance = Math.min(0.04, 0.004*(1+bt*0.7)*(1+nb*0.8));
    if(Math.random()<chance){
      const c=todaySpecial;
      const w=c.w[0]+Math.random()*(c.w[1]-c.w[0]);
      return { fish:{n:c.n, val:c.val, rar:5, w:c.w, special:c.art}, weight:w, isSpecial:true };
    }
  }
  const weights = FISH.map(f=>{
    if(f.minBait > bt) return 0;
    let base = RAR_BASE[f.rar];
    const boost = Math.pow(1.9, bt + nb*1.4);
    if(f.rar>0) base *= (1 + (boost-1)*(f.rar/4));
    base *= (1 + (rod().reel-1)*0.15*f.rar);
    base *= (1 + nb*0.6*f.rar);
    return base;
  });
  const total = weights.reduce((a,b)=>a+b,0);
  let r=Math.random()*total, idx=0;
  for(let i=0;i<weights.length;i++){ r-=weights[i]; if(r<=0){ idx=i; break; } }
  const f=FISH[idx];
  let lo=f.w[0], hi=f.w[1];
  let w = lo + Math.random()*Math.random()*(hi-lo);
  w *= (1 + bt*0.04 + nb*0.07 + (rod().reel-1)*0.05);
  w = Math.min(hi*1.05, w);
  return { fish:f, weight:w };
}

let last=performance.now();
function loop(now){
  const dt=Math.min(0.05,(now-last)/1000); last=now;
  update(dt); render(); requestAnimationFrame(loop);
}
function update(dt){
  const clock=(performance.now()-startTime)/1000;
  gCycleT=(clock % CYCLE)/CYCLE;
  gSunSin=Math.sin(gCycleT*Math.PI*2);
  gLight=clamp(gSunSin*1.25+0.22,0,1);
  gNight=clamp(-gSunSin*1.3+0.05,0,1);
  gTwi=clamp(1-Math.abs(gSunSin)/0.42,0,1);
  updateTod();

  const dayId=Math.floor(clock/CYCLE);
  if(dayId!==monkeyDay) scheduleMonkey(dayId);
  if(dayId!==specialDay) pickSpecial(dayId);
  if(!monkey.active && gLight>0.45){
    for(const mt of monkeyTimes){ if(!mt.done && clock>=mt.v){ mt.done=true; spawnMonkey(); break; } }
  }
  if(monkey.active) updateMonkey(dt);

  if(state==="charging"){
    power += powerDir*120*dt;
    if(power>=100){power=100;powerDir=-1;} if(power<=0){power=0;powerDir=1;}
    document.getElementById("powerBar").style.width=power+"%";
  }
  if(state==="casting"){
    bob.t += dt*1.6;
    const t=Math.min(1,bob.t);
    bob.x = lerp(castFrom.x,bob.tx,t);
    bob.y = lerp(castFrom.y,bob.ty,t) - Math.sin(t*Math.PI)*120;
    if(t>=1){ bob.x=bob.tx; bob.y=bob.ty; startWaiting(); }
  }
  if(state==="waiting"){
    biteTimer -= dt;
    approachT += dt;
    for(const sf of shadowFish){
      sf.ph += dt;
      sf.x += (bob.x - sf.x)*0.4*dt*sf.sp;
      sf.y += (bob.y+18 - sf.y)*0.4*dt*sf.sp;
      sf.x += Math.sin(sf.ph*1.5)*8*dt;
      sf.chat -= dt;
      if(sf.chat<=0){
        sf.chat = 2.6+Math.random()*3.6;
        if(bubbles.length<2){
          let sx=sf.x+(Math.random()-0.5)*70;
          if(Math.abs(sx-bob.x)<72){ sx = bob.x + (sx<bob.x?-1:1)*(72+Math.random()*46); }
          const ok=bubbles.every(b=>Math.abs(b.x-sx)>90 || Math.abs(b.y-sf.y)>46);
          if(ok) bubbles.push({ x:sx, y:sf.y, text:FP_WORDS[(Math.random()*FP_WORDS.length)|0], t:0, life:3.0 });
        }
      }
    }
    bob.y = bob.ty + Math.sin(approachT*2)*1.5;
    if(biteTimer<=0) triggerBite();
  }
  if(state==="bite"){
    biteWindow -= dt;
    bob.y = bob.ty + 14 + Math.sin(performance.now()/40)*6;
    if(biteWindow<=0) missFish();
  }
  if(state==="fighting") updateFight(dt);

  for(const b of bubbles){ b.t+=dt; b.y-=10*dt; }
  bubbles=bubbles.filter(b=>b.t<b.life);
  for(const r of ripples){ r.r+=40*dt; r.a-=dt*0.9; }
  ripples=ripples.filter(r=>r.a>0);
  for(const s of splashes){ s.t+=dt; }
  splashes=splashes.filter(s=>s.t<0.6);
  for(const b of BIRDS){ b.x+=b.sp*dt; b.ph+=dt*4; if(b.x>1.1) b.x=-0.1; }
  for(const c of CLOUDS){ c.x+=c.sp*dt; if(c.x>1.25) c.x=-0.25; }
}
let lastTod="";
function updateTod(){
  let tod;
  if(gLight>0.62) tod="☀️ День";
  else if(gNight>0.62) tod="🌙 Ночь · крупняк клюёт!";
  else tod=(gCycleT<0.25||gCycleT>0.75)?"🌅 Рассвет":"🌇 Закат";
  if(tod!==lastTod){ document.getElementById("tod").textContent=tod; lastTod=tod; }
}

function updateFight(dt){
  const ro=rod();
  struggle -= dt;
  if(struggle<=0){ struggle = 0.6+Math.random()*1.4; }
  const struggling = struggle>0.5;
  const fishPull = (8 + hooked.fish.rar*6) * fishWeightFactor;
  if(mouseDown){
    tension += (14 + fishPull*0.5)*dt;
    dist -= (16*ro.reel - fishPull*0.4)*dt;
  } else {
    tension -= 26*dt;
    dist += fishPull*0.25*dt;
  }
  if(struggling) tension += fishPull*0.6*dt;
  tension=Math.max(0,tension);
  dist=Math.max(0,Math.min(100,dist));
  maxTenRatio=Math.max(maxTenRatio, tension/ro.line);
  document.getElementById("tensionBar").style.width = Math.min(100,tension/ro.line*100)+"%";
  document.getElementById("distBar").style.width = dist+"%";
  bob.x = bob.tx + Math.sin(performance.now()/60)*(struggling?7:3);
  bob.y = bob.ty + Math.cos(performance.now()/50)*(struggling?5:2);
  if(tension>=ro.line){ wearRod(); missFish(); }
  else if(dist<=0){ wearRod(); landFish(); }
}

cv.addEventListener("mousedown", e=>{
  if(e.button!==0) return; mouseDown=true;
  if(state==="idle") startCharge();
  else if(state==="bite"||state==="waiting") tryHook();
});
addEventListener("mouseup", e=>{
  if(e.button!==0) return; mouseDown=false;
  if(state==="charging") releaseCast();
});

function touchPt(e){ const t=e.touches[0]||e.changedTouches[0]; if(t){ mouse.x=t.clientX; mouse.y=t.clientY; } }
cv.addEventListener("touchstart", e=>{
  e.preventDefault(); touchPt(e); mouseDown=true;
  if(state==="idle") startCharge();
  else if(state==="bite"||state==="waiting") tryHook();
}, {passive:false});
cv.addEventListener("touchmove", e=>{ e.preventDefault(); touchPt(e); }, {passive:false});
addEventListener("touchend", e=>{
  mouseDown=false;
  if(state==="charging") releaseCast();
}, {passive:false});
addEventListener("touchcancel", ()=>{ mouseDown=false; });

function updateHUD(){
  document.getElementById("coinsP").innerHTML = S.coins+' <small>очков</small>';
  const ro=rod(), b=bait();
  const durStr = ro.dur ? ' <span style="color:#9fc4dc">('+Math.round(rodDurPct()*100)+"%)</span>" : "";
  const chStr  = b.inf ? "" : ' <span style="color:#9fc4dc">×'+(S.baitCharges[b.id]||0)+"</span>";
  document.getElementById("gearP").innerHTML =
    "🎣 <b>"+ro.n+"</b>"+durStr+"<br>🪱 <b>"+b.n+"</b>"+chStr;
}
function showCatch(f,pts){
  const c=document.getElementById("catchCard");
  c.style.animation="none"; void c.offsetWidth; c.style.animation="pop .35s forwards";
  c.innerHTML="";
  const pic=makeFishCanvas(f.fish.n, 210, 140, f.isSpecial?46:56);
  pic.style.display="block"; pic.style.margin="0 auto";
  c.appendChild(pic);
  if(f.isSpecial){ const tag=document.createElement("div"); tag.className="pts"; tag.style.color="#ff7ae0"; tag.textContent="✦ ОСОБАЯ ДОБЫЧА ✦"; c.appendChild(tag); }
  const nm=document.createElement("div"); nm.className="nm "+RAR_CLASS[f.fish.rar]; nm.textContent=f.fish.n; c.appendChild(nm);
  const wt=document.createElement("div"); wt.className="wt";
  wt.innerHTML=f.weight.toFixed(2)+' кг · <span class="'+RAR_CLASS[f.fish.rar]+'">'+RAR_NAME[f.fish.rar]+"</span>"; c.appendChild(wt);
  const pt=document.createElement("div"); pt.className="pts"; pt.textContent="+"+pts+" очков 🪙"; c.appendChild(pt);
  const m=document.getElementById("catch"); m.style.display="flex";
  requestAnimationFrame(()=>{ m.style.opacity="1"; });
  clearTimeout(showCatch._t);
  showCatch._t=setTimeout(dismissCatch, f.isSpecial?7500:6000);
}
function dismissCatch(){
  const m=document.getElementById("catch");
  if(m.style.display==="none") return;
  clearTimeout(showCatch._t);
  m.style.opacity="0";
  setTimeout(()=>{ m.style.display="none"; }, 190);
}
function showMiss(){
  const m=document.getElementById("miss"); const d=m.firstElementChild;
  d.style.animation="none"; void d.offsetWidth; d.style.animation="pop .3s forwards";
  m.style.display="flex"; setTimeout(()=>m.style.display="none",5000);
}

let shopTab="rods";
function openShop(){ shopTab="rods"; renderShop(); document.getElementById("shopModal").classList.add("show"); }
function renderShop(){
  document.querySelectorAll("#shopModal .tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===shopTab));
  const list=document.getElementById("shopList"); list.innerHTML="";
  const items = shopTab==="rods"?RODS:BAITS;
  items.forEach(it=>{
    let stat, actions="";
    if(shopTab==="rods"){
      const owned=S.ownedRods.includes(it.id), isEq=S.rod===it.id;
      const cur=it.dur?(S.rodDur[it.id]??it.dur):0;
      stat = "Клёв ×"+it.bite.toFixed(2)+" · Леска "+it.line+" · Подсечка ×"+it.reel.toFixed(2)+
             (it.dur?(" · Прочность "+Math.round(cur/it.dur*100)+"%"):" · не ломается");
      if(!owned){ actions = S.coins>=it.cost
          ? '<button class="buy can" data-buy="'+it.id+'">Купить · '+it.cost+'🪙</button>'
          : '<button class="buy no">Купить · '+it.cost+'🪙</button>'; }
      else {
        actions = isEq ? '<button class="buy equipped">✓ Надето</button>'
                       : '<button class="buy equip" data-eq="'+it.id+'">Выбрать</button>';
        if(it.dur && cur < it.dur-0.5){
          const rc=Math.max(1,Math.ceil(it.cost*0.5*(1-cur/it.dur)));
          actions += S.coins>=rc ? '<button class="buy fix" data-fix="'+it.id+'">🔧 '+rc+'🪙</button>'
                                  : '<button class="buy no">🔧 '+rc+'🪙</button>';
        }
      }
    } else {
      const isEq=S.bait===it.id, ch=it.inf?Infinity:(S.baitCharges[it.id]||0);
      stat = "Уровень "+it.tier+" · крупнее и реже рыба"+(it.inf?" · ∞ зарядов":" · зарядов: "+ch);
      if(it.inf){
        actions = isEq ? '<button class="buy equipped">✓ Надето</button>'
                       : '<button class="buy equip" data-eq="'+it.id+'">Выбрать</button>';
      } else {
        actions = S.coins>=it.cost
          ? '<button class="buy can" data-buy="'+it.id+'">+'+it.pack+' · '+it.cost+'🪙</button>'
          : '<button class="buy no">+'+it.pack+' · '+it.cost+'🪙</button>';
        if(ch>0) actions += isEq ? '<button class="buy equipped">✓ Надето</button>'
                                  : '<button class="buy equip" data-eq="'+it.id+'">Выбрать</button>';
      }
    }
    const div=document.createElement("div"); div.className="shopItem";
    div.innerHTML='<div class="emoji">'+it.em+'</div>'+
      '<div class="info"><div class="nm">'+it.n+'</div><div class="ds">'+it.desc+'</div><div class="st">'+stat+'</div></div>'+
      '<div class="acts">'+actions+'</div>';
    list.appendChild(div);
    const sim=spriteReady(it.id);
    if(sim){ const e=div.querySelector(".emoji"); if(e){ e.textContent=""; const cc=document.createElement("canvas"); cc.width=46; cc.height=46; drawSpriteFit(cc.getContext("2d"), sim, 46, 46, 0.98); e.appendChild(cc); } }
  });
  list.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>buy(b.dataset.buy));
  list.querySelectorAll("[data-eq]").forEach(b=>b.onclick=()=>equip(b.dataset.eq));
  list.querySelectorAll("[data-fix]").forEach(b=>b.onclick=()=>fixRod(b.dataset.fix));
}
function buy(id){
  if(shopTab==="rods"){
    const it=RODS.find(x=>x.id===id); if(S.coins<it.cost) return;
    S.coins-=it.cost; if(!S.ownedRods.includes(id)) S.ownedRods.push(id);
    S.rodDur[id]=it.dur; S.rod=id;
  } else {
    const it=BAITS.find(x=>x.id===id); if(S.coins<it.cost) return;
    S.coins-=it.cost; if(!S.ownedBaits.includes(id)) S.ownedBaits.push(id);
    S.baitCharges[id]=(S.baitCharges[id]||0)+it.pack; S.bait=id;
  }
  beep(720,0.08); save(); updateHUD(); renderShop();
}
function fixRod(id){
  const it=RODS.find(x=>x.id===id); const cur=S.rodDur[id]??it.dur;
  const rc=Math.max(1,Math.ceil(it.cost*0.5*(1-cur/it.dur)));
  if(S.coins<rc) return;
  S.coins-=rc; S.rodDur[id]=it.dur;
  beep(640,0.07); save(); updateHUD(); renderShop();
}
function equip(id){
  if(shopTab==="rods") S.rod=id; else S.bait=id;
  beep(520,0.06); save(); updateHUD(); renderShop();
}

function atlasPts(f){ return Math.round(f.val*(0.6+0.7)*(1+f.rar*0.05)*1.2); }
function openAtlas(){
  const list=document.getElementById("atlasList"); list.innerHTML="";
  document.getElementById("atlasStats").innerHTML =
    "Открыто видов: <b>"+Object.keys(S.seenFish).length+" / "+(FISH.length+SPECIALS.length)+"</b>";
  const rows=[];
  FISH.forEach(f=>rows.push({n:f.n, rar:f.rar, w:f.w, pts:atlasPts(f), special:false}));
  SPECIALS.forEach(c=>rows.push({n:c.n, rar:5, w:c.w, pts:Math.round(c.val*1.3*1.25*1.2), special:true}));
  rows.forEach(r=>{
    const seen=!!S.seenFish[r.n];
    const row=document.createElement("div"); row.className="atlasRow"+(r.special?" sp":"");
    const pic=makeFishCanvas(r.n, 76, 50, r.special?20:22);
    if(!seen) pic.style.filter="brightness(0) opacity(0.5)";
    pic.style.flexShrink="0";
    const info=document.createElement("div"); info.style.flex="1"; info.style.minWidth="0";
    info.innerHTML='<div class="anm '+RAR_CLASS[r.rar]+'">'+(seen?r.n:"? ? ?")+(r.special?' <span class="spbadge">особая</span>':'')+"</div>"+
      '<div class="ainfo">'+RAR_NAME[r.rar]+" · "+r.w[0]+"–"+r.w[1]+" кг"+(r.special?" · 🔱 крепкая снасть (карбон+)":"")+"</div>";
    const pts=document.createElement("div"); pts.className="apts"; pts.innerHTML="~"+r.pts+"🪙"+(seen?'<div class="seen">✓ поймана</div>':"");
    row.appendChild(pic); row.appendChild(info); row.appendChild(pts);
    list.appendChild(row);
  });
  document.getElementById("atlasModal").classList.add("show");
}

function openLog(){
  const stats=document.getElementById("logStats");
  stats.innerHTML = "Поймано: <b>"+S.totalCaught+"</b> · Общий вес: <b>"+S.totalWeight.toFixed(2)+" кг</b>"+
    (S.best?" · Рекорд: <b>"+S.best.n+" "+S.best.w+" кг</b>":"");
  const list=document.getElementById("logList"); list.innerHTML="";
  if(!S.log.length){
    list.innerHTML='<div class="empty">Пока пусто. Иди лови! 🎣</div>';
  } else {
    S.log.forEach(l=>{
      const row=document.createElement("div"); row.className="logRow";
      const left=document.createElement("span");
      left.style.display="flex"; left.style.alignItems="center"; left.style.gap="10px";
      const pic=makeFishCanvas(l.n, 50, 32, l.rar===5?12:13);
      left.appendChild(pic);
      const t=document.createElement("span");
      t.innerHTML='<b class="'+RAR_CLASS[l.rar]+'">'+l.n+"</b> · "+l.w+" кг";
      left.appendChild(t);
      const right=document.createElement("span"); right.className="r"; right.style.color="#ffe27a";
      right.textContent="+"+l.pts+"🪙";
      row.appendChild(left); row.appendChild(right); list.appendChild(row);
    });
  }
  document.getElementById("logModal").classList.add("show");
}

let actx=null;
function beep(freq,dur){
  try{
    if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)();
    const o=actx.createOscillator(), g=actx.createGain();
    o.frequency.value=freq; o.type="sine"; o.connect(g); g.connect(actx.destination);
    g.gain.setValueAtTime(0.12,actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,actx.currentTime+dur);
    o.start(); o.stop(actx.currentTime+dur);
  }catch(e){}
}

document.getElementById("shopBtn").onclick=openShop;
document.getElementById("logBtn").onclick=openLog;
document.getElementById("atlasBtn").onclick=openAtlas;
document.getElementById("catch").onclick=dismissCatch;
document.querySelectorAll("[data-close]").forEach(c=>c.onclick=e=>e.target.closest(".modal").classList.remove("show"));
document.querySelectorAll("#shopModal .tab").forEach(t=>t.onclick=()=>{shopTab=t.dataset.tab;renderShop();});
document.querySelectorAll(".modal").forEach(m=>m.onclick=e=>{ if(e.target===m) m.classList.remove("show"); });
document.getElementById("playBtn").onclick=()=>{
  document.getElementById("intro").style.display="none";
  try{ if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){}
  resetToIdle(0.05);
};

loadSprites();
updateHUD();
setHint("Нажми <b>НАЧАТЬ РЫБАЛКУ</b>");
requestAnimationFrame(loop);
