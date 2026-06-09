"use strict";

function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
function lerp(a,b,t){ return a+(b-a)*t; }
function mix(c1,c2,t){ return [Math.round(c1[0]+(c2[0]-c1[0])*t),Math.round(c1[1]+(c2[1]-c1[1])*t),Math.round(c1[2]+(c2[2]-c1[2])*t)]; }
function rgb(c){ return "rgb("+c[0]+","+c[1]+","+c[2]+")"; }
function hex2rgb(h){ h=h.replace("#",""); return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
function mixHex(a,b,t){ return rgb(mix(hex2rgb(a),hex2rgb(b),t)); }

function render(){
  const tt=performance.now()/1000;
  const L=gLight;
  const wind = Math.sin(tt*0.5)*0.7 + Math.sin(tt*1.27+1.6)*0.35 + Math.sin(tt*0.13)*0.6;
  const top = mix([7,11,28],[27,58,82], L);
  const midC= mix([12,20,50],[61,111,143], L);
  let bot = mix([24,34,66],[127,180,201], L);
  bot = mix(bot,[236,150,86], gTwi*0.55);
  let sky=ctx.createLinearGradient(0,0,0,horizon);
  sky.addColorStop(0,rgb(top)); sky.addColorStop(.6,rgb(midC)); sky.addColorStop(1,rgb(bot));
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,horizon);

  if(gNight>0.02){
    for(const s of STARS){
      const a=gNight*(0.4+0.6*Math.abs(Math.sin(tt*1.5+s.tw)));
      ctx.globalAlpha=a; ctx.fillStyle="#eaf3ff";
      ctx.beginPath(); ctx.arc(s.x*W, s.y*horizon, s.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  drawSky(tt);
  drawClouds(tt, L);

  const mtn = mix([16,24,44],[58,86,104], L);
  ctx.fillStyle=rgb(mtn);
  ctx.beginPath(); ctx.moveTo(0,horizon);
  for(let x=0;x<=W;x+=60){ ctx.lineTo(x, horizon-26-Math.sin(x*0.004+1)*22-Math.sin(x*0.011)*12); }
  ctx.lineTo(W,horizon); ctx.fill();
  const mtn2 = mix([20,30,52],[70,100,118], L);
  ctx.fillStyle=rgb(mtn2);
  ctx.beginPath(); ctx.moveTo(0,horizon);
  for(let x=0;x<=W;x+=50){ ctx.lineTo(x, horizon-10-Math.sin(x*0.006+4)*16-Math.sin(x*0.02)*7); }
  ctx.lineTo(W,horizon); ctx.fill();

  ctx.globalAlpha=(0.10+gTwi*0.16)*(0.4+L*0.6);
  let mist=ctx.createLinearGradient(0,horizon-26,0,horizon+6);
  mist.addColorStop(0,"rgba(220,232,240,0)"); mist.addColorStop(.6,"rgba(220,232,240,1)"); mist.addColorStop(1,"rgba(220,232,240,0)");
  ctx.fillStyle=mist; ctx.fillRect(0,horizon-26,W,32); ctx.globalAlpha=1;

  drawTrees(tt,L,wind);

  drawHotel(W*0.22, horizon, tt);

  ctx.fillStyle=rgb(mix([16,30,38],[35,64,78], L));
  ctx.beginPath(); ctx.moveTo(0,horizon);
  for(let x=0;x<=W;x+=40){ ctx.lineTo(x, horizon-5-Math.sin(x*0.01)*5-Math.sin(x*0.003)*6); }
  ctx.lineTo(W,horizon); ctx.fill();

  const wTop=mix([10,22,40],[46,98,110], L);
  const wMid=mix([7,16,32],[28,74,88], L);
  const wBot=mix([4,10,20],[12,40,52], L);
  let wat=ctx.createLinearGradient(0,horizon,0,H);
  wat.addColorStop(0,rgb(wTop)); wat.addColorStop(.4,rgb(wMid)); wat.addColorStop(1,rgb(wBot));
  ctx.fillStyle=wat; ctx.fillRect(0,horizon,W,H-horizon);

  drawNeonReflection(W*0.22, horizon, tt);
  drawSunGlitter(tt, L);

  ctx.globalAlpha=(.08+L*0.06); ctx.fillStyle="#bfe9ff";
  for(let i=0;i<26;i++){
    const yy=horizon+10+i*((H-horizon)/26);
    const ww=20+i*4;
    const xx=(W/2)+Math.sin(tt*0.6+i*0.7)*(60+i*8);
    ctx.fillRect(xx-ww/2, yy, ww, 2);
    ctx.fillRect(W-xx-ww/2, yy+ (H-horizon)/52, ww*0.7, 2);
  }
  ctx.globalAlpha=1;

  ctx.globalAlpha=0.05+L*0.05; ctx.strokeStyle="#dff2ff"; ctx.lineWidth=1.2;
  for(let i=0;i<9;i++){
    const yy=horizon+18+i*((H-horizon)/10);
    const sp=(9+i*7)*(0.45+Math.abs(wind)*0.55);
    for(let k=0;k<3;k++){
      let xx=((tt*sp + i*131 + k*(W/3+47)) % (W+160)) - 80;
      if(wind<0) xx=W-xx;
      ctx.beginPath(); ctx.arc(xx, yy, 10+i*1.6, Math.PI*1.12, Math.PI*1.88); ctx.stroke();
    }
  }
  ctx.globalAlpha=1;

  drawLilies(L,tt);

  if(state==="waiting"){
    for(const sf of shadowFish) drawShadowFish(sf);
  }

  for(const b of bubbles){
    const a = b.t<0.25 ? b.t/0.25 : (b.t>b.life-0.6 ? (b.life-b.t)/0.6 : 1);
    drawBubble(b.x, b.y, b.text, Math.max(0,a));
  }

  for(const r of ripples){
    ctx.strokeStyle="rgba(200,235,255,"+(r.a*0.6)+")"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(r.x,r.y,r.r,r.r*0.4,0,0,7); ctx.stroke();
  }

  if(state==="charging"){
    const minY=horizon+20, maxY=H*0.82;
    const ty = maxY-(maxY-minY)*(0.25+0.75*power/100);
    const tx=Math.min(W-40,Math.max(40,mouse.x));
    ctx.strokeStyle="rgba(255,255,255,.5)"; ctx.lineWidth=2; ctx.setLineDash([6,6]);
    ctx.beginPath(); ctx.ellipse(tx,ty,18,8,0,0,7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx-24,ty); ctx.lineTo(tx+24,ty);
    ctx.moveTo(tx,ty-12); ctx.lineTo(tx,ty+12); ctx.stroke();
    ctx.setLineDash([]);
  }

  const rodTip={x:W*0.985, y:H*0.30};
  if(["casting","waiting","bite","fighting"].includes(state)){
    ctx.strokeStyle="rgba(235,245,255,.55)"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(rodTip.x,rodTip.y);
    const midx=(rodTip.x+bob.x)/2, midy=Math.max(rodTip.y,bob.y)-Math.min(40,Math.abs(rodTip.x-bob.x)*0.1)+30;
    ctx.quadraticCurveTo(midx,midy,bob.x,bob.y); ctx.stroke();
    drawBobber(bob.x,bob.y, state==="bite");
  }

  for(const s of splashes){
    const p=s.t/0.6; const rad=(s.big?60:30)*p;
    ctx.strokeStyle="rgba(220,245,255,"+((1-p)*0.8)+")"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(s.x,s.y,rad,rad*0.4,0,0,7); ctx.stroke();
  }

  drawReeds(L,tt,wind);
  drawMonkey();
  drawRod(rodTip);
  drawVignette();
}

function drawPine(cx,base,th,sw){
  ctx.beginPath();
  ctx.moveTo(cx-10,base);
  ctx.lineTo(cx-5+sw*0.35,base-th*0.55); ctx.lineTo(cx-8+sw*0.35,base-th*0.55);
  ctx.lineTo(cx+sw,base-th); ctx.lineTo(cx+8+sw*0.35,base-th*0.55);
  ctx.lineTo(cx+5+sw*0.35,base-th*0.55); ctx.lineTo(cx+10,base);
  ctx.closePath(); ctx.fill();
}
function drawTrees(tt,L,wind){
  ctx.fillStyle=rgb(mix([12,22,32],[32,62,58], L));
  for(let x=-26;x<W;x+=34){
    const th=13+((x*5)%18)+Math.sin(x*0.5)*4;
    const sw=(wind+Math.sin(tt*1.1+x*0.07)*0.4)*th*0.07;
    drawPine(x+9,horizon,th,sw);
  }
  ctx.fillStyle=rgb(mix([8,18,26],[22,52,46], L));
  for(let x=-20;x<W;x+=40){
    const th=22+((x*7)%30)+Math.sin(x*0.7)*6;
    const sw=(wind+Math.sin(tt*1.3+x*0.05)*0.5)*th*0.1;
    drawPine(x+10,horizon,th,sw);
  }
}
function drawClouds(tt,L){
  if(L<0.12) return;
  ctx.globalAlpha=0.20*L;
  ctx.fillStyle="#eef6fb";
  for(const c of CLOUDS){
    const cx=c.x*W, cy=c.y*horizon, r=24*c.sc;
    ctx.beginPath();
    ctx.ellipse(cx,cy,r*1.7,r,0,0,7);
    ctx.ellipse(cx-r*1.1,cy+r*0.25,r,r*0.8,0,0,7);
    ctx.ellipse(cx+r*1.1,cy+r*0.2,r*1.1,r*0.82,0,0,7);
    ctx.ellipse(cx+r*0.3,cy-r*0.45,r*0.95,r*0.8,0,0,7);
    ctx.fill();
  }
  ctx.globalAlpha=1;
}

function drawLilies(L,tt){
  const pad=mix([10,26,18],[34,72,44], L);
  const padC=rgb(pad), padD=rgb(mix(pad,[0,0,0],0.35));
  const pads=[[0.10,0.93,46,true],[0.24,0.86,30,false],[0.74,0.9,38,false]];
  for(const p of pads){
    const px=p[0]*W, py=p[1]*H + Math.sin(tt*0.9+p[0]*9)*2.2, r=p[2];
    ctx.fillStyle=padD; ctx.beginPath(); ctx.ellipse(px+2,py+3,r,r*0.42,0,0,7); ctx.fill();
    ctx.fillStyle=padC; ctx.beginPath(); ctx.ellipse(px,py,r,r*0.42,0,0,7); ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.10)"; ctx.lineWidth=1;
    for(let a=-1.1;a<=1.1;a+=0.55){ ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+Math.cos(a)*r*0.92, py+Math.sin(a)*r*0.4); ctx.stroke(); }
    ctx.fillStyle="rgba(0,0,0,.22)"; ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px-r*0.95,py-r*0.16); ctx.lineTo(px-r*0.95,py+r*0.16); ctx.closePath(); ctx.fill();
    if(p[3]){
      const fx=px+r*0.3, fy=py-r*0.18;
      ctx.fillStyle="#f7b8d6";
      for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; ctx.beginPath(); ctx.ellipse(fx+Math.cos(a)*5,fy+Math.sin(a)*3,5,3,a,0,7); ctx.fill(); }
      ctx.fillStyle="#ffe27a"; ctx.beginPath(); ctx.arc(fx,fy,3.2,0,7); ctx.fill();
    }
  }
}

function drawVignette(){
  let g=ctx.createRadialGradient(W/2,H*0.52,Math.min(W,H)*0.32,W/2,H*0.55,Math.max(W,H)*0.72);
  g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(1,"rgba(0,0,0,0.26)");
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
}

function drawSky(tt){
  if(gCycleT<0.54){
    const p=clamp(gCycleT/0.5,0,1);
    const x=p*W, y=(horizon-20)-Math.sin(p*Math.PI)*(horizon*0.72);
    const a=clamp((gSunSin+0.12)*4,0,1);
    if(a>0){
      ctx.globalAlpha=a;
      let g=ctx.createRadialGradient(x,y,4,x,y,80);
      const warm = mix([255,236,150],[255,150,70], gTwi);
      g.addColorStop(0,rgb(warm)); g.addColorStop(.25,"rgba(255,210,120,.5)"); g.addColorStop(1,"rgba(255,200,120,0)");
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,80,0,7); ctx.fill();
      ctx.fillStyle=rgb(warm); ctx.beginPath(); ctx.arc(x,y,24,0,7); ctx.fill();
      ctx.globalAlpha=1;
    }
  }
  if(gCycleT>0.46){
    const p=clamp((gCycleT-0.5)/0.5,0,1);
    const x=p*W, y=(horizon-20)-Math.sin(p*Math.PI)*(horizon*0.72);
    const a=clamp((-gSunSin+0.12)*4,0,1);
    if(a>0){
      ctx.globalAlpha=a;
      let g=ctx.createRadialGradient(x,y,6,x,y,60);
      g.addColorStop(0,"rgba(220,232,255,.5)"); g.addColorStop(1,"rgba(200,220,255,0)");
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,60,0,7); ctx.fill();
      ctx.fillStyle="#e9f0ff"; ctx.beginPath(); ctx.arc(x,y,20,0,7); ctx.fill();
      ctx.fillStyle="rgba(180,196,224,.7)";
      ctx.beginPath(); ctx.arc(x-6,y-5,4,0,7); ctx.fill();
      ctx.beginPath(); ctx.arc(x+7,y+3,5,0,7); ctx.fill();
      ctx.beginPath(); ctx.arc(x+2,y-8,2.5,0,7); ctx.fill();
      ctx.globalAlpha=1;
    }
  }
  if(gLight>0.5){
    ctx.globalAlpha=(gLight-0.5)*2*0.5; ctx.strokeStyle="#243038"; ctx.lineWidth=2;
    for(const b of BIRDS){
      const x=b.x*W, y=b.y*horizon, w=6+Math.sin(b.ph)*1.5;
      ctx.beginPath();
      ctx.moveTo(x-w,y); ctx.quadraticCurveTo(x,y-w*0.7,x,y); ctx.quadraticCurveTo(x,y-w*0.7,x+w,y); ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
}

function drawSunGlitter(tt,L){
  if(L<0.15) return;
  const p=clamp(gCycleT/0.5,0,1); const sx=p*W;
  ctx.globalAlpha=0.12*L; ctx.fillStyle="#fff4cf";
  for(let i=0;i<16;i++){
    const yy=horizon+12+i*((H-horizon)/16);
    const ww=14+i*5+Math.sin(tt*2+i)*6;
    ctx.fillRect(sx-ww/2+Math.sin(tt+i)*8, yy, ww, 2);
  }
  ctx.globalAlpha=1;
}

function drawReeds(L,tt,wind){
  const col=rgb(mix([6,12,14],[18,40,30], L));
  const headC=rgb(mix([20,12,8],[60,40,22], L));
  function stalk(x,base,h,bend,ph){
    const sway = wind*9 + Math.sin(tt*1.7+ph)*3.5 + Math.sin(tt*3.1+ph*2)*1.5;
    const tipX = x+bend+sway;
    ctx.strokeStyle=col; ctx.lineWidth=4; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(x,base); ctx.quadraticCurveTo(x+(bend+sway)*0.45,base-h*0.6,tipX,base-h); ctx.stroke();
    ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x,base-h*0.5); ctx.quadraticCurveTo(x-16,base-h*0.5,x-22+sway*0.5,base-h*0.75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+(bend+sway)*0.6,base-h*0.7); ctx.quadraticCurveTo(x+24,base-h*0.7,x+30+sway*0.7,base-h*0.95); ctx.stroke();
    ctx.fillStyle=headC;
    ctx.save(); ctx.translate(tipX,base-h); ctx.rotate(sway*0.03);
    ctx.beginPath(); ctx.ellipse(0,0,4,11,0,0,7); ctx.fill(); ctx.restore();
  }
  stalk(W*0.05, H*1.02, H*0.42, 14, 0.4);
  stalk(W*0.11, H*1.02, H*0.33, -10, 2.1);
  stalk(W*0.02, H*1.02, H*0.30, 20, 4.4);
  stalk(W*0.97, H*1.05, H*0.30, -16, 1.3);
}

function drawShadowFish(sf){
  const x=sf.x,y=sf.y,s=sf.size;
  ctx.save();
  ctx.translate(x,y); ctx.rotate(Math.sin(sf.ph)*0.18);
  ctx.globalAlpha=0.78;
  ctx.fillStyle=sf.colD;
  ctx.beginPath(); ctx.moveTo(-s*0.95,0); ctx.lineTo(-s*1.7,-s*0.55); ctx.lineTo(-s*1.4,0); ctx.lineTo(-s*1.7,s*0.55); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-s*0.25,-s*0.4); ctx.quadraticCurveTo(s*0.05,-s*0.95,s*0.35,-s*0.38); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-s*0.1,s*0.38); ctx.quadraticCurveTo(s*0.05,s*0.75,s*0.3,s*0.36); ctx.closePath(); ctx.fill();
  let g=ctx.createLinearGradient(0,-s*0.5,0,s*0.5);
  g.addColorStop(0,sf.colD); g.addColorStop(0.55,sf.colL); g.addColorStop(1,sf.colD);
  ctx.fillStyle=g;
  ctx.beginPath(); ctx.ellipse(0,0,s,s*0.46,0,0,7); ctx.fill();
  ctx.globalAlpha=0.25; ctx.fillStyle="#ffffff";
  ctx.beginPath(); ctx.ellipse(-s*0.1,-s*0.12,s*0.6,s*0.1,0,0,7); ctx.fill();
  ctx.globalAlpha=0.78;
  ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(s*0.62,-s*0.08,s*0.13,0,7); ctx.fill();
  ctx.fillStyle="#10141a"; ctx.beginPath(); ctx.arc(s*0.65,-s*0.08,s*0.07,0,7); ctx.fill();
  ctx.restore(); ctx.globalAlpha=1;
}

function drawBobber(x,y,active){
  ctx.fillStyle=active?"#ff3b3b":"#e23b3b";
  ctx.beginPath(); ctx.moveTo(x,y+18); ctx.lineTo(x-5,y); ctx.lineTo(x+5,y); ctx.closePath(); ctx.fill();
  ctx.fillStyle="#f4f4f4";
  ctx.beginPath(); ctx.arc(x,y-3,6,0,7); ctx.fill();
  ctx.fillStyle="#e23b3b";
  ctx.beginPath(); ctx.arc(x,y-3,6,Math.PI,0); ctx.fill();
  ctx.strokeStyle="#222"; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(x,y-9); ctx.lineTo(x,y-16); ctx.stroke();
  ctx.fillStyle="#ffcf3b"; ctx.beginPath(); ctx.arc(x,y-17,2,0,7); ctx.fill();
}

function roundRect(g,x,y,w,h,r){
  g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r);
  g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath();
}
function drawBubble(x,y,text,a){
  if(a<=0) return;
  const lines = text.split("\n");
  ctx.font="bold 12px 'Courier New',monospace";
  let bw=0; for(const l of lines) bw=Math.max(bw, ctx.measureText(l).width);
  bw+=14; const bh=8+lines.length*13;
  const bx=x, by=y-26-bh;
  ctx.globalAlpha=a;
  ctx.fillStyle="rgba(244,250,255,.94)";
  ctx.strokeStyle="rgba(80,150,200,.7)"; ctx.lineWidth=1.5;
  roundRect(ctx,bx-bw/2,by,bw,bh,7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x-5,by+bh-1); ctx.lineTo(x,y-16); ctx.lineTo(x+5,by+bh-1); ctx.closePath();
  ctx.fillStyle="rgba(244,250,255,.94)"; ctx.fill();
  ctx.fillStyle="#0c3a5c"; ctx.textAlign="center"; ctx.textBaseline="middle";
  lines.forEach((l,i)=> ctx.fillText(l, bx, by+9+i*13));
  ctx.textAlign="start"; ctx.textBaseline="alphabetic"; ctx.globalAlpha=1;
}

function bodyPath(g,x,y,len,hei,bR){
  g.beginPath();
  g.moveTo(x-len,y);
  g.bezierCurveTo(x-len*0.6,y-hei, x+len*0.4,y-hei, x+bR,y);
  g.bezierCurveTo(x+len*0.4,y+hei, x-len*0.6,y+hei, x-len,y);
  g.closePath();
}
function drawMarkings(g,x,y,len,hei,bR,spec){
  g.save(); bodyPath(g,x,y,len,hei,bR); g.clip();
  const m=spec.mark;
  if(m==="vstripes"){
    g.fillStyle=spec.stripeCol||"rgba(20,40,20,.5)";
    for(let i=0;i<6;i++){ const px=x-len*0.66+i*(len*0.3); g.fillRect(px,y-hei,len*0.08,hei*2); }
  } else if(m==="hstripe"){
    g.fillStyle=spec.hstripeCol||"rgba(150,170,185,.6)";
    g.fillRect(x-len, y-hei*0.1, bR+len, hei*0.16);
  } else if(m==="spots"){
    g.fillStyle=spec.spotCol||"rgba(40,50,30,.5)";
    const seed=[[-0.6,-0.3],[-0.3,0.2],[0.0,-0.2],[0.3,0.25],[0.55,-0.1],[-0.45,0.35],[0.18,0.05],[-0.1,-0.45],[0.45,0.3],[0.62,0.12]];
    for(const p of seed){ g.beginPath(); g.arc(x+len*p[0],y+hei*p[1],len*0.055,0,7); g.fill(); }
  } else if(m==="mottle"){
    g.fillStyle="rgba(30,30,20,.32)";
    const seed=[[-0.6,-0.1,0.3],[-0.2,0.2,0.6],[0.1,-0.2,0.2],[0.4,0.15,0.9],[-0.4,0.3,1.2],[0.5,-0.15,0.5]];
    for(const p of seed){ g.beginPath(); g.ellipse(x+len*p[0],y+hei*p[1],len*0.16,hei*0.18,p[2],0,7); g.fill(); }
  } else if(m==="scales"){
    g.strokeStyle="rgba(0,0,0,.12)"; g.lineWidth=1;
    for(let r=-2;r<3;r++) for(let cc=-2;cc<4;cc++){
      const sx=x+cc*len*0.25, sy=y+r*hei*0.3;
      g.beginPath(); g.arc(sx,sy,len*0.16,-0.6,0.6); g.stroke();
    }
  } else if(m==="scutes"){
    g.fillStyle="rgba(255,255,255,.25)";
    for(let i=0;i<6;i++){ const px=x-len*0.66+i*(len*0.3);
      g.beginPath(); g.moveTo(px,y-hei*0.86); g.lineTo(px+len*0.08,y-hei*1.0); g.lineTo(px+len*0.16,y-hei*0.86); g.closePath(); g.fill(); }
  }
  g.restore();
}
function drawCrown(g,x,y,s){
  g.fillStyle="#ffd23a"; g.strokeStyle="#b8860b"; g.lineWidth=1;
  g.beginPath();
  g.moveTo(x-s,y); g.lineTo(x-s,y-s*0.5); g.lineTo(x-s*0.5,y-s*0.1);
  g.lineTo(x,y-s*0.75); g.lineTo(x+s*0.5,y-s*0.1); g.lineTo(x+s,y-s*0.5); g.lineTo(x+s,y);
  g.closePath(); g.fill(); g.stroke();
  g.fillStyle="#ff5b5b"; g.beginPath(); g.arc(x,y-s*0.22,s*0.12,0,7); g.fill();
}

function drawSpecies(g,x,y,s,spec){
  spec=spec||FISHART._default;
  if(spec.special==="octopus"){ drawOctopus(g,x,y,s); return; }
  if(spec.special==="goldfish"){ drawGoldfish(g,x,y,s); return; }
  if(spec.special==="nessie"){ drawNessie(g,x,y,s); return; }
  if(spec.special==="poseidon"){ drawPoseidon(g,x,y,s); return; }
  if(spec.special==="leviathan"){ drawLeviathan(g,x,y,s); return; }
  if(spec.special==="trashbag"){ drawTrashBag(g,x,y,s); return; }
  const len=s, hei=s*spec.hei;
  const bR=len*(spec.snout==="long"?1.32: spec.snout==="point"?1.16:1.02);
  g.lineJoin="round"; g.lineCap="round";

  g.fillStyle=spec.fin;
  g.beginPath();
  g.moveTo(x-len*0.86,y);
  g.lineTo(x-len*1.5,y-hei*0.85);
  g.quadraticCurveTo(x-len*1.16,y, x-len*1.5,y+hei*0.85);
  g.closePath(); g.fill();

  if(spec.dspiky){
    g.beginPath(); g.moveTo(x-len*0.42,y-hei*0.8);
    const teeth=5, span=len*0.84, x0=x-len*0.42;
    for(let i=0;i<teeth;i++){
      g.lineTo(x0+span*((i+0.5)/teeth), y-hei*1.16);
      g.lineTo(x0+span*((i+1)/teeth), y-hei*0.8);
    }
    g.closePath(); g.fill();
  } else {
    g.beginPath();
    g.moveTo(x-len*0.42,y-hei*0.74);
    g.quadraticCurveTo(x, y-hei*1.18, x+len*0.42,y-hei*0.72);
    g.quadraticCurveTo(x, y-hei*0.84, x-len*0.42,y-hei*0.74);
    g.closePath(); g.fill();
  }
  g.beginPath();
  g.moveTo(x-len*0.12,y+hei*0.7);
  g.quadraticCurveTo(x+len*0.04,y+hei*1.06, x+len*0.34,y+hei*0.66);
  g.quadraticCurveTo(x+len*0.08,y+hei*0.78, x-len*0.12,y+hei*0.7);
  g.closePath(); g.fill();

  const grad=g.createLinearGradient(x,y-hei,x,y+hei);
  grad.addColorStop(0,spec.top); grad.addColorStop(0.52,spec.bot); grad.addColorStop(1,mixHex(spec.top,spec.bot,0.35));
  g.fillStyle=grad;
  bodyPath(g,x,y,len,hei,bR); g.fill();

  g.save(); bodyPath(g,x,y,len,hei,bR); g.clip();
  let sh=g.createLinearGradient(x,y-hei,x,y); sh.addColorStop(0,"rgba(0,0,0,.16)"); sh.addColorStop(1,"rgba(0,0,0,0)");
  g.fillStyle=sh; g.fillRect(x-len*1.2,y-hei,bR+len*1.4,hei);
  g.restore();

  g.globalAlpha=0.22; g.fillStyle="#ffffff";
  g.beginPath(); g.ellipse(x-len*0.05,y+hei*0.34,len*0.62,hei*0.16,0,0,7); g.fill();
  g.globalAlpha=1;

  drawMarkings(g,x,y,len,hei,bR,spec);

  g.fillStyle=spec.fin; g.globalAlpha=0.92;
  g.beginPath(); g.moveTo(x+bR*0.32,y+hei*0.12);
  g.quadraticCurveTo(x+bR*0.16,y+hei*0.72, x+bR*0.5,y+hei*0.5);
  g.quadraticCurveTo(x+bR*0.42,y+hei*0.3, x+bR*0.32,y+hei*0.12);
  g.closePath(); g.fill(); g.globalAlpha=1;

  g.strokeStyle="rgba(0,0,0,.2)"; g.lineWidth=Math.max(1,s*0.03);
  g.beginPath(); g.arc(x+bR*0.52,y,hei*0.9,-1.0,1.0); g.stroke();

  g.lineWidth=Math.max(1,s*0.04); g.strokeStyle="rgba(0,0,0,.4)";
  g.beginPath(); g.moveTo(x+bR,y+hei*0.02); g.lineTo(x+bR-len*0.14,y+hei*0.12); g.stroke();

  if(spec.barbel){
    g.lineWidth=Math.max(1,s*0.025); g.strokeStyle="rgba(0,0,0,.45)";
    g.beginPath(); g.moveTo(x+bR-len*0.04,y+hei*0.08); g.quadraticCurveTo(x+bR+len*0.18,y+hei*0.25, x+bR+len*0.04,y+hei*0.5); g.stroke();
    g.beginPath(); g.moveTo(x+bR-len*0.04,y); g.quadraticCurveTo(x+bR+len*0.22,y+hei*0.05, x+bR+len*0.12,y+hei*0.32); g.stroke();
  }

  const ex=x+bR*0.64, ey=y-hei*0.26;
  g.fillStyle="#fff"; g.beginPath(); g.arc(ex,ey,Math.max(2,s*0.1),0,7); g.fill();
  g.fillStyle="#10141a"; g.beginPath(); g.arc(ex+s*0.015,ey,Math.max(1.2,s*0.055),0,7); g.fill();
  g.fillStyle="#fff"; g.globalAlpha=0.85; g.beginPath(); g.arc(ex-s*0.02,ey-s*0.02,Math.max(0.6,s*0.02),0,7); g.fill(); g.globalAlpha=1;

  if(spec.crown) drawCrown(g, x+bR*0.18, y-hei*0.92, s*0.5);
}
function makeFishCanvas(name, cw, ch, s){
  const c=document.createElement("canvas"); c.width=cw; c.height=ch;
  const g=c.getContext("2d");
  const slug=FISH_SLUG[name];
  const im= slug ? spriteReady(slug) : null;
  if(im){ drawSpriteFit(g, im, cw, ch, 0.92); return c; }
  drawSpecies(g, cw*0.5, ch*0.5, s, FISHART[name]||FISHART._default);
  try{
    const d=g.getImageData(0,0,cw,ch).data;
    let minX=cw,minY=ch,maxX=0,maxY=0,found=false;
    for(let py=0;py<ch;py++){ const rowo=py*cw; for(let px=0;px<cw;px++){ if(d[(rowo+px)*4+3]>8){ found=true; if(px<minX)minX=px; if(px>maxX)maxX=px; if(py<minY)minY=py; if(py>maxY)maxY=py; } } }
    if(found){
      const dx=Math.round((cw-(minX+maxX))/2), dy=Math.round((ch-(minY+maxY))/2);
      if(dx||dy){ const img=g.getImageData(0,0,cw,ch); g.clearRect(0,0,cw,ch); g.putImageData(img,dx,dy); }
    }
  }catch(e){}
  return c;
}

function drawTrashBag(g,x,y,s){
  const r=s*0.75;
  g.lineJoin="round"; g.lineCap="round";
  let grad=g.createLinearGradient(x-r,y-r,x+r,y+r);
  grad.addColorStop(0,"#3c4248"); grad.addColorStop(0.55,"#23282d"); grad.addColorStop(1,"#15181c");
  g.fillStyle=grad;
  g.beginPath();
  g.moveTo(x-r*0.2,y-r*0.95);
  g.bezierCurveTo(x+r*0.7,y-r*1.05, x+r*1.15,y-r*0.3, x+r*0.95,y+r*0.45);
  g.bezierCurveTo(x+r*0.8,y+r*1.05, x-r*0.7,y+r*1.1, x-r*0.95,y+r*0.5);
  g.bezierCurveTo(x-r*1.15,y-r*0.1, x-r*0.85,y-r*0.8, x-r*0.2,y-r*0.95);
  g.closePath(); g.fill();
  g.fillStyle="#2c3237";
  g.beginPath(); g.ellipse(x-r*0.1,y-r*0.95,r*0.18,r*0.13,0.2,0,7); g.fill();
  g.strokeStyle="#2c3237"; g.lineWidth=Math.max(2,s*0.1);
  g.beginPath(); g.moveTo(x-r*0.2,y-r*1.0); g.quadraticCurveTo(x-r*0.55,y-r*1.45, x-r*0.7,y-r*1.2); g.stroke();
  g.beginPath(); g.moveTo(x,y-r*1.0); g.quadraticCurveTo(x+r*0.35,y-r*1.5, x+r*0.5,y-r*1.22); g.stroke();
  g.strokeStyle="rgba(0,0,0,.4)"; g.lineWidth=Math.max(1,s*0.035);
  g.beginPath(); g.moveTo(x-r*0.5,y-r*0.4); g.quadraticCurveTo(x-r*0.1,y+r*0.1, x-r*0.4,y+r*0.7); g.stroke();
  g.beginPath(); g.moveTo(x+r*0.25,y-r*0.6); g.quadraticCurveTo(x+r*0.5,y, x+r*0.25,y+r*0.6); g.stroke();
  g.fillStyle="rgba(255,255,255,.16)";
  g.beginPath(); g.ellipse(x-r*0.35,y-r*0.45,r*0.3,r*0.13,-0.5,0,7); g.fill();
  g.beginPath(); g.ellipse(x+r*0.4,y+r*0.15,r*0.18,r*0.08,0.7,0,7); g.fill();
  g.strokeStyle="#cfd6da"; g.lineWidth=Math.max(1,s*0.04);
  g.beginPath(); g.moveTo(x+r*0.8,y+r*0.5); g.lineTo(x+r*1.15,y+r*0.7); g.stroke();
  g.beginPath(); g.moveTo(x+r*1.15,y+r*0.7); g.lineTo(x+r*1.3,y+r*0.55); g.moveTo(x+r*1.15,y+r*0.7); g.lineTo(x+r*1.3,y+r*0.85); g.stroke();
  g.fillStyle="#fff"; g.beginPath(); g.arc(x-r*0.22,y-r*0.15,r*0.1,0,7); g.fill();
  g.beginPath(); g.arc(x+r*0.18,y-r*0.15,r*0.1,0,7); g.fill();
  g.fillStyle="#10141a"; g.beginPath(); g.arc(x-r*0.2,y-r*0.12,r*0.05,0,7); g.fill();
  g.beginPath(); g.arc(x+r*0.2,y-r*0.12,r*0.05,0,7); g.fill();
  g.strokeStyle="rgba(255,255,255,.5)"; g.lineWidth=Math.max(1,s*0.035);
  g.beginPath(); g.arc(x,y+r*0.35,r*0.16,Math.PI*1.15,Math.PI*1.85); g.stroke();
}
function drawGoldfish(g,x,y,s){
  const len=s, hei=s*0.5;
  g.fillStyle="#ff7a1e"; g.lineJoin="round";
  g.beginPath();
  g.moveTo(x-len*0.7,y);
  g.bezierCurveTo(x-len*1.7,y-hei*1.5, x-len*1.5,y-hei*0.2, x-len*1.0,y);
  g.bezierCurveTo(x-len*1.5,y+hei*0.2, x-len*1.7,y+hei*1.5, x-len*0.7,y);
  g.closePath(); g.fill();
  g.beginPath(); g.moveTo(x-len*0.4,y-hei*0.7); g.quadraticCurveTo(x,y-hei*1.5, x+len*0.5,y-hei*0.55); g.closePath(); g.fill();
  const grad=g.createLinearGradient(x,y-hei,x,y+hei);
  grad.addColorStop(0,"#ff9a3a"); grad.addColorStop(0.5,"#ffd27a"); grad.addColorStop(1,"#ff8a2a");
  g.fillStyle=grad;
  g.beginPath(); g.ellipse(x,y,len,hei,0,0,7); g.fill();
  g.fillStyle="#ffae4a";
  g.beginPath(); g.moveTo(x-len*0.2,y+hei*0.7); g.quadraticCurveTo(x,y+hei*1.3,x+len*0.3,y+hei*0.6); g.closePath(); g.fill();
  g.globalAlpha=0.3; g.fillStyle="#fff";
  g.beginPath(); g.ellipse(x-len*0.1,y-hei*0.25,len*0.55,hei*0.18,0,0,7); g.fill(); g.globalAlpha=1;
  g.fillStyle="#fff"; g.beginPath(); g.arc(x+len*0.6,y-hei*0.2,s*0.14,0,7); g.fill();
  g.fillStyle="#10141a"; g.beginPath(); g.arc(x+len*0.63,y-hei*0.2,s*0.07,0,7); g.fill();
  g.strokeStyle="rgba(0,0,0,.3)"; g.lineWidth=Math.max(1,s*0.04);
  g.beginPath(); g.arc(x+len*0.95,y+hei*0.12,s*0.08,-0.5,1.2); g.stroke();
}
function drawOctopus(g,x,y,s){
  const r=s*0.78;
  g.lineCap="round"; g.strokeStyle="#6f4596";
  for(let i=0;i<8;i++){
    const off=(i-3.5)/3.5, tx=x+off*r*1.05, curl=(i%2?1:-1);
    g.lineWidth=Math.max(2,s*0.15*(1-Math.abs(off)*0.25));
    g.beginPath(); g.moveTo(x+off*r*0.55, y+r*0.3);
    g.quadraticCurveTo(tx+curl*r*0.4, y+r*1.0, tx+curl*r*0.12, y+r*1.5);
    g.stroke();
  }
  g.fillStyle="#caa0e0";
  for(let i=0;i<8;i++){ const off=(i-3.5)/3.5, tx=x+off*r*0.82;
    for(let k=0;k<3;k++){ g.beginPath(); g.arc(tx, y+r*(0.72+k*0.26), r*0.045, 0,7); g.fill(); } }
  const grad=g.createRadialGradient(x-r*0.25,y-r*0.5,r*0.2,x,y-r*0.1,r*1.25);
  grad.addColorStop(0,"#c193e2"); grad.addColorStop(0.65,"#8a5bb0"); grad.addColorStop(1,"#5e3a82");
  g.fillStyle=grad;
  g.beginPath();
  g.moveTo(x-r*0.92,y+r*0.25);
  g.bezierCurveTo(x-r*1.02,y-r*1.15, x+r*1.02,y-r*1.15, x+r*0.92,y+r*0.25);
  g.bezierCurveTo(x+r*0.5,y+r*0.5, x-r*0.5,y+r*0.5, x-r*0.92,y+r*0.25);
  g.closePath(); g.fill();
  g.fillStyle="rgba(255,255,255,.13)";
  for(const p of [[-0.4,-0.55],[0.12,-0.72],[0.46,-0.45],[-0.08,-0.32]]){ g.beginPath(); g.arc(x+r*p[0],y+r*p[1],r*0.08,0,7); g.fill(); }
  g.fillStyle="#6f4596"; g.beginPath(); g.ellipse(x,y-r*0.02,r*0.8,r*0.34,0,Math.PI,0); g.fill();
  g.fillStyle="#fff";
  g.beginPath(); g.ellipse(x-r*0.35,y,r*0.27,r*0.32,0,0,7); g.fill();
  g.beginPath(); g.ellipse(x+r*0.35,y,r*0.27,r*0.32,0,0,7); g.fill();
  g.fillStyle="#1a1020";
  g.beginPath(); g.arc(x-r*0.32,y+r*0.04,r*0.14,0,7); g.fill();
  g.beginPath(); g.arc(x+r*0.38,y+r*0.04,r*0.14,0,7); g.fill();
  g.fillStyle="#fff"; g.globalAlpha=0.9;
  g.beginPath(); g.arc(x-r*0.38,y-r*0.03,r*0.05,0,7); g.fill();
  g.beginPath(); g.arc(x+r*0.32,y-r*0.03,r*0.05,0,7); g.fill(); g.globalAlpha=1;
  g.fillStyle="#2a1830";
  g.beginPath(); g.moveTo(x,y+r*0.3); g.lineTo(x-r*0.1,y+r*0.48); g.lineTo(x+r*0.1,y+r*0.48); g.closePath(); g.fill();
}
function drawNessie(g,x,y,s){
  const c1="#2f6b4a", c2="#5fa67a", belly="#bfe0c4", ridge="#1e4633";
  g.lineJoin="round"; g.lineCap="round";
  g.strokeStyle="rgba(150,210,230,.45)"; g.lineWidth=2;
  g.beginPath(); g.moveTo(x-s*1.45,y+s*0.55); g.lineTo(x+s*1.05,y+s*0.55); g.stroke();
  g.fillStyle=c1;
  g.beginPath();
  g.moveTo(x-s*1.35,y+s*0.55);
  g.quadraticCurveTo(x-s*1.0,y-s*0.12, x-s*0.6,y+s*0.42);
  g.quadraticCurveTo(x-s*0.25,y-s*0.14, x+s*0.1,y+s*0.45);
  g.quadraticCurveTo(x+s*0.4,y+s*0.04, x+s*0.6,y+s*0.5);
  g.lineTo(x-s*1.35,y+s*0.55); g.closePath(); g.fill();
  g.fillStyle=belly; g.globalAlpha=0.4;
  g.beginPath(); g.ellipse(x-s*0.5,y+s*0.46,s*0.72,s*0.1,0,0,7); g.fill(); g.globalAlpha=1;
  g.fillStyle=c1;
  g.beginPath();
  g.moveTo(x+s*0.32,y+s*0.4);
  g.quadraticCurveTo(x+s*0.95,y-s*0.1, x+s*0.76,y-s*0.92);
  g.lineTo(x+s*1.02,y-s*0.92);
  g.quadraticCurveTo(x+s*1.22,y-s*0.02, x+s*0.66,y+s*0.42);
  g.closePath(); g.fill();
  g.fillStyle=c2;
  g.beginPath(); g.ellipse(x+s*0.92,y-s*0.98,s*0.32,s*0.24,-0.35,0,7); g.fill();
  g.beginPath(); g.ellipse(x+s*1.16,y-s*0.92,s*0.17,s*0.12,-0.2,0,7); g.fill();
  g.fillStyle="#1e4633"; g.beginPath(); g.arc(x+s*1.22,y-s*0.94,s*0.03,0,7); g.fill();
  g.fillStyle="#fff"; g.beginPath(); g.arc(x+s*0.95,y-s*1.05,s*0.07,0,7); g.fill();
  g.fillStyle="#10141a"; g.beginPath(); g.arc(x+s*0.96,y-s*1.05,s*0.034,0,7); g.fill();
  g.fillStyle=ridge;
  for(const hx of [-0.95,-0.25,0.4]){ g.beginPath(); g.moveTo(x+s*hx,y+s*0.04); g.lineTo(x+s*(hx+0.07),y-s*0.2); g.lineTo(x+s*(hx+0.15),y+s*0.06); g.closePath(); g.fill(); }
  g.fillStyle=c2; g.globalAlpha=0.85;
  g.beginPath(); g.ellipse(x-s*0.3,y+s*0.6,s*0.24,s*0.12,0.35,0,7); g.fill(); g.globalAlpha=1;
}
function drawPoseidon(g,x,y,s){
  const skin="#bcd6d0", skinD="#93b3ab", hair="#eef4f6", hairSh="#c7d6da", gold="#ffd23a", goldD="#c79a18";
  g.lineCap="round"; g.lineJoin="round";
  g.fillStyle=skinD;
  g.beginPath(); g.moveTo(x-s*0.85,y+s*1.45); g.quadraticCurveTo(x-s*0.65,y+s*0.72, x,y+s*0.72); g.quadraticCurveTo(x+s*0.65,y+s*0.72, x+s*0.85,y+s*1.45); g.closePath(); g.fill();
  g.strokeStyle=gold; g.lineWidth=s*0.085;
  g.beginPath(); g.moveTo(x+s*0.98,y-s*0.9); g.lineTo(x+s*0.98,y+s*1.35); g.stroke();
  g.lineWidth=s*0.055;
  g.beginPath();
  g.moveTo(x+s*0.66,y-s*0.9); g.lineTo(x+s*0.66,y-s*1.4);
  g.moveTo(x+s*0.98,y-s*0.95); g.lineTo(x+s*0.98,y-s*1.46);
  g.moveTo(x+s*1.3,y-s*0.9); g.lineTo(x+s*1.3,y-s*1.4);
  g.moveTo(x+s*0.66,y-s*0.95); g.quadraticCurveTo(x+s*0.98,y-s*0.76,x+s*1.3,y-s*0.95);
  g.stroke();
  g.fillStyle=gold;
  for(const px of [0.66,0.98,1.3]){ g.beginPath(); g.moveTo(x+s*(px-0.05),y-s*1.4); g.lineTo(x+s*px,y-s*1.52); g.lineTo(x+s*(px+0.05),y-s*1.4); g.closePath(); g.fill(); }
  g.fillStyle=skin; g.beginPath(); g.ellipse(x,y-s*0.05,s*0.5,s*0.58,0,0,7); g.fill();
  g.fillStyle=skinD; g.beginPath(); g.ellipse(x+s*0.16,y-s*0.05,s*0.16,s*0.5,0,0,7); g.fill();
  g.fillStyle=hair;
  g.beginPath();
  g.moveTo(x-s*0.48,y-s*0.02);
  g.quadraticCurveTo(x-s*0.4,y+s*0.85, x-s*0.16,y+s*1.15);
  g.quadraticCurveTo(x,y+s*1.4, x+s*0.16,y+s*1.15);
  g.quadraticCurveTo(x+s*0.4,y+s*0.85, x+s*0.48,y-s*0.02);
  g.quadraticCurveTo(x+s*0.28,y+s*0.28,x,y+s*0.3);
  g.quadraticCurveTo(x-s*0.28,y+s*0.28,x-s*0.48,y-s*0.02);
  g.closePath(); g.fill();
  g.strokeStyle=hairSh; g.lineWidth=s*0.028;
  for(let k=-2;k<=2;k++){ g.beginPath(); g.moveTo(x+s*k*0.13,y+s*0.42); g.quadraticCurveTo(x+s*k*0.13+s*0.04,y+s*0.78,x+s*k*0.11,y+s*1.0); g.stroke(); }
  g.fillStyle=hair; g.beginPath(); g.ellipse(x,y-s*0.48,s*0.52,s*0.32,0,Math.PI,0); g.fill();
  g.fillStyle=gold; g.strokeStyle=goldD; g.lineWidth=s*0.022;
  g.beginPath(); g.moveTo(x-s*0.4,y-s*0.6); g.lineTo(x-s*0.4,y-s*0.82); g.lineTo(x-s*0.2,y-s*0.64); g.lineTo(x,y-s*0.92); g.lineTo(x+s*0.2,y-s*0.64); g.lineTo(x+s*0.4,y-s*0.82); g.lineTo(x+s*0.4,y-s*0.6); g.closePath(); g.fill(); g.stroke();
  g.fillStyle="#ff5b5b"; g.beginPath(); g.arc(x,y-s*0.7,s*0.055,0,7); g.fill();
  g.fillStyle="#5fd0ff"; g.beginPath(); g.arc(x-s*0.28,y-s*0.64,s*0.038,0,7); g.fill(); g.beginPath(); g.arc(x+s*0.28,y-s*0.64,s*0.038,0,7); g.fill();
  g.fillStyle="#fff"; g.beginPath(); g.ellipse(x-s*0.17,y-s*0.06,s*0.085,s*0.065,0,0,7); g.fill(); g.beginPath(); g.ellipse(x+s*0.17,y-s*0.06,s*0.085,s*0.065,0,0,7); g.fill();
  g.fillStyle="#10141a"; g.beginPath(); g.arc(x-s*0.16,y-s*0.05,s*0.038,0,7); g.fill(); g.beginPath(); g.arc(x+s*0.18,y-s*0.05,s*0.038,0,7); g.fill();
  g.strokeStyle=hairSh; g.lineWidth=s*0.035;
  g.beginPath(); g.moveTo(x-s*0.28,y-s*0.17); g.lineTo(x-s*0.06,y-s*0.12); g.moveTo(x+s*0.28,y-s*0.17); g.lineTo(x+s*0.06,y-s*0.12); g.stroke();
  g.strokeStyle=skinD; g.lineWidth=s*0.035; g.beginPath(); g.moveTo(x,y-s*0.04); g.lineTo(x-s*0.03,y+s*0.1); g.stroke();
}
function drawLeviathan(g,x,y,s){
  const c1="#26323a", c2="#41606b", spike="#0f161b";
  g.lineCap="round"; g.lineJoin="round";
  g.strokeStyle=c1; g.lineWidth=s*0.42;
  g.beginPath();
  g.moveTo(x-s*1.4,y+s*0.72);
  g.bezierCurveTo(x-s*0.7,y-s*0.52, x-s*0.2,y+s*0.88, x+s*0.5,y-s*0.05);
  g.bezierCurveTo(x+s*0.85,y-s*0.58, x+s*0.95,y-s*0.82, x+s*1.02,y-s*0.92);
  g.stroke();
  g.strokeStyle=c2; g.lineWidth=s*0.17; g.stroke();
  g.fillStyle=c2; g.globalAlpha=0.7;
  g.beginPath(); g.moveTo(x-s*0.92,y+s*0.42); g.quadraticCurveTo(x-s*1.12,y+s*0.92,x-s*0.72,y+s*0.72); g.closePath(); g.fill(); g.globalAlpha=1;
  g.fillStyle=spike;
  const pts=[[-1.12,0.32,0.32],[-0.6,-0.02,0.44],[-0.1,0.44,0.52],[0.34,0.04,0.44],[0.68,-0.46,0.36]];
  for(const p of pts){ g.beginPath(); g.moveTo(x+s*p[0],y+s*p[1]); g.lineTo(x+s*(p[0]+0.05),y+s*(p[1]-p[2])); g.lineTo(x+s*(p[0]+0.13),y+s*p[1]); g.closePath(); g.fill(); }
  let hg=g.createLinearGradient(x+s*0.7,y-s*1.2,x+s*1.3,y-s*0.7);
  hg.addColorStop(0,"#34474f"); hg.addColorStop(1,"#1a242a");
  g.fillStyle=hg; g.beginPath(); g.ellipse(x+s*1.0,y-s*0.92,s*0.4,s*0.27,-0.5,0,7); g.fill();
  g.fillStyle=spike; g.beginPath(); g.moveTo(x+s*0.86,y-s*1.1); g.lineTo(x+s*0.78,y-s*1.4); g.lineTo(x+s*0.98,y-s*1.14); g.closePath(); g.fill();
  g.fillStyle="#7a2330"; g.beginPath(); g.moveTo(x+s*0.96,y-s*0.88); g.lineTo(x+s*1.46,y-s*0.74); g.lineTo(x+s*1.18,y-s*0.6); g.closePath(); g.fill();
  g.fillStyle="#fff";
  for(let i=0;i<5;i++){ g.beginPath(); g.moveTo(x+s*(1.0+i*0.09),y-s*0.84); g.lineTo(x+s*(1.04+i*0.09),y-s*0.72); g.lineTo(x+s*(1.08+i*0.09),y-s*0.84); g.closePath(); g.fill(); }
  for(let i=0;i<4;i++){ g.beginPath(); g.moveTo(x+s*(1.04+i*0.09),y-s*0.64); g.lineTo(x+s*(1.08+i*0.09),y-s*0.74); g.lineTo(x+s*(1.12+i*0.09),y-s*0.64); g.closePath(); g.fill(); }
  g.fillStyle="#ffdf5a"; g.beginPath(); g.arc(x+s*0.95,y-s*0.98,s*0.09,0,7); g.fill();
  g.globalAlpha=0.45; g.fillStyle="#ff8c2a"; g.beginPath(); g.arc(x+s*0.95,y-s*0.98,s*0.15,0,7); g.fill(); g.globalAlpha=1;
  g.fillStyle="#10141a"; g.beginPath(); g.ellipse(x+s*0.95,y-s*0.98,s*0.03,s*0.07,0,0,7); g.fill();
}

function drawMonkey(){
  const m=monkey;
  if(m.phase==="gone") return;
  const mim=spriteReady("monkey");
  if(mim){
    const h=m.size*2.5, w=mim.naturalWidth/mim.naturalHeight*h;
    ctx.save(); ctx.translate(m.x,m.y); ctx.rotate(m.tilt);
    ctx.drawImage(mim, -w/2, -m.size*0.72, w, h);
    ctx.restore();
    if(m.showText && (m.phase==="watch"||m.phase==="leaving")){
      const a = m.phase==="leaving" ? clamp(1.2-m.timer,0,1) : clamp(m.timer*2,0,1);
      drawBubble(m.x, m.y - m.size*0.6, m.text, a);
    }
    return;
  }
  const s=m.size, x=m.x, y=m.y, r=s*0.5;
  const fur1="#7a5638", fur2="#5e4129", fur3="#4a3320", face="#d6ab7c", faceSh="#bb8c5e", nose="#5a3f29";
  ctx.save();
  ctx.translate(x,y); ctx.rotate(m.tilt);

  let bg=ctx.createLinearGradient(0,r*0.4,0,r*2.6);
  bg.addColorStop(0,fur1); bg.addColorStop(1,fur3);
  ctx.fillStyle=bg;
  ctx.beginPath(); ctx.ellipse(0, r*1.7, r*1.0, r*1.25, 0, 0, 7); ctx.fill();

  ctx.fillStyle=fur2;
  ctx.beginPath(); ctx.ellipse(-r*0.78,r*0.95,r*0.34,r*0.26,0.5,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(r*0.78,r*0.95,r*0.34,r*0.26,-0.5,0,7); ctx.fill();
  ctx.strokeStyle=fur3; ctx.lineWidth=Math.max(1,s*0.02); ctx.lineCap="round";
  for(let i=-1;i<2;i++){
    ctx.beginPath(); ctx.moveTo(-r*0.85+i*r*0.16,r*0.86); ctx.lineTo(-r*0.85+i*r*0.16,r*1.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r*0.7+i*r*0.16,r*0.86); ctx.lineTo(r*0.7+i*r*0.16,r*1.1); ctx.stroke();
  }

  ctx.fillStyle=fur2;
  ctx.beginPath(); ctx.ellipse(-r*0.92,-r*0.05,r*0.34,r*0.42,-0.2,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(r*0.92,-r*0.05,r*0.34,r*0.42,0.2,0,7); ctx.fill();
  ctx.fillStyle=faceSh;
  ctx.beginPath(); ctx.ellipse(-r*0.92,-r*0.02,r*0.18,r*0.24,-0.2,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(r*0.92,-r*0.02,r*0.18,r*0.24,0.2,0,7); ctx.fill();

  let hg=ctx.createRadialGradient(-r*0.2,-r*0.3,r*0.2,0,0,r*1.15);
  hg.addColorStop(0,fur1); hg.addColorStop(1,fur2);
  ctx.fillStyle=hg;
  ctx.beginPath(); ctx.ellipse(0,0,r*1.02,r*1.06,0,0,7); ctx.fill();

  ctx.fillStyle=face;
  ctx.beginPath();
  ctx.moveTo(0,-r*0.62);
  ctx.bezierCurveTo(r*0.7,-r*0.62, r*0.86,r*0.2, r*0.52,r*0.62);
  ctx.bezierCurveTo(r*0.28,r*0.92, -r*0.28,r*0.92, -r*0.52,r*0.62);
  ctx.bezierCurveTo(-r*0.86,r*0.2, -r*0.7,-r*0.62, 0,-r*0.62);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle=faceSh;
  ctx.beginPath(); ctx.ellipse(0,r*0.42,r*0.4,r*0.3,0,0,7); ctx.fill();
  ctx.fillStyle=face;
  ctx.beginPath(); ctx.ellipse(0,r*0.36,r*0.34,r*0.26,0,0,7); ctx.fill();

  ctx.strokeStyle="#3a2a1c"; ctx.lineWidth=Math.max(2,s*0.03);
  ctx.beginPath(); ctx.moveTo(-r*0.5,-r*0.28); ctx.quadraticCurveTo(-r*0.3,-r*0.36,-r*0.12,-r*0.26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(r*0.12,-r*0.32); ctx.quadraticCurveTo(r*0.34,-r*0.46,r*0.52,-r*0.34); ctx.stroke();

  ctx.fillStyle="#f3ead9";
  ctx.beginPath(); ctx.ellipse(-r*0.26,-r*0.06,r*0.19,r*0.2,0,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(r*0.26,-r*0.06,r*0.19,r*0.2,0,0,7); ctx.fill();
  ctx.fillStyle="#3a2415";
  ctx.beginPath(); ctx.arc(-r*0.18,-r*0.03,r*0.1,0,7); ctx.fill();
  ctx.beginPath(); ctx.arc(r*0.34,-r*0.03,r*0.1,0,7); ctx.fill();
  ctx.fillStyle="#fff"; ctx.globalAlpha=0.9;
  ctx.beginPath(); ctx.arc(-r*0.21,-r*0.07,r*0.03,0,7); ctx.fill();
  ctx.beginPath(); ctx.arc(r*0.31,-r*0.07,r*0.03,0,7); ctx.fill(); ctx.globalAlpha=1;
  ctx.fillStyle=face;
  ctx.beginPath(); ctx.moveTo(-r*0.46,-r*0.12); ctx.quadraticCurveTo(-r*0.26,-r*0.2,-r*0.06,-r*0.12); ctx.lineTo(-r*0.06,-r*0.16); ctx.quadraticCurveTo(-r*0.26,-r*0.24,-r*0.46,-r*0.16); ctx.closePath(); ctx.fill();

  ctx.fillStyle=nose;
  ctx.beginPath(); ctx.ellipse(-r*0.1,r*0.34,r*0.045,r*0.07,0.3,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(r*0.1,r*0.34,r*0.045,r*0.07,-0.3,0,7); ctx.fill();

  ctx.strokeStyle="#4a3320"; ctx.lineWidth=Math.max(2,s*0.038);
  ctx.beginPath(); ctx.moveTo(-r*0.28,r*0.58); ctx.quadraticCurveTo(0,r*0.74, r*0.36,r*0.5); ctx.stroke();

  ctx.fillStyle=fur1;
  ctx.beginPath(); ctx.ellipse(-r*0.86,r*0.62,r*0.26,r*0.2,0.5,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(r*0.86,r*0.62,r*0.26,r*0.2,-0.5,0,7); ctx.fill();
  ctx.fillStyle=faceSh;
  ctx.beginPath(); ctx.arc(-r*0.86,r*0.66,r*0.12,0,7); ctx.fill();
  ctx.beginPath(); ctx.arc(r*0.86,r*0.66,r*0.12,0,7); ctx.fill();

  ctx.restore();

  if(m.showText && (m.phase==="watch"||m.phase==="leaving")){
    const a = m.phase==="leaving" ? clamp(1.2-m.timer,0,1) : clamp(m.timer*2,0,1);
    drawBubble(x, y - r*1.0, m.text, a);
  }
}

function hotelBox(cx,baseY){
  const bw=Math.min(225, W*0.24), bh=Math.min(80, H*0.14);
  return {bw,bh,x0:cx-bw/2,y0:baseY-bh};
}
function signFlags(tt){
  const phase = tt % 16;
  const blackout = (phase>14.7 && phase<15.0);
  const subLit = ((tt*0.22)%2 > 0.45);
  return {blackout, subLit};
}
function drawHotel(cx, baseY, tt){
  const {bw,bh,x0,y0}=hotelBox(cx,baseY);
  const rooms=HOTEL.rooms, floors=HOTEL.floors, pat=HOTEL.pat;
  const fh=bh/floors, rw=bw/rooms;
  let g=ctx.createLinearGradient(0,y0,0,baseY);
  g.addColorStop(0,"#33414c"); g.addColorStop(1,"#19222b");
  ctx.fillStyle=g; ctx.fillRect(x0,y0,bw,bh);
  ctx.fillStyle="#10161c"; ctx.fillRect(x0-5,y0-5,bw+10,6);
  for(let f=0;f<floors;f++){
    const fy=y0+f*fh;
    for(let c=0;c<rooms;c++){
      const rx=x0+c*rw, st=pat[f][c];
      const dw=rw*0.28, dh=fh*0.6, dx=rx+rw*0.12, dy=fy+fh-dh-2;
      if(st==="lit"){
        const shimmer=0.72+0.13*Math.sin(tt*0.7+f*3+c);
        ctx.fillStyle="rgba(255,205,110,"+shimmer.toFixed(3)+")";
      } else ctx.fillStyle="#0b1014";
      ctx.fillRect(dx,dy,dw,dh);
      ctx.strokeStyle="rgba(140,160,175,.35)"; ctx.lineWidth=1;
      ctx.strokeRect(dx,dy,dw,dh);
      const ww=rw*0.34, wh=fh*0.38, wx=rx+rw*0.52, wy=fy+fh*0.26;
      if(st==="lit"){
        ctx.fillStyle="rgba(255,210,120,.85)"; ctx.fillRect(wx,wy,ww,wh);
      } else if(st==="broken"){
        ctx.fillStyle="#0a0e12"; ctx.fillRect(wx,wy,ww,wh);
        ctx.strokeStyle="rgba(120,140,150,.35)"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(wx,wy); ctx.lineTo(wx+ww*0.6,wy+wh);
        ctx.moveTo(wx+ww,wy+wh*0.3); ctx.lineTo(wx+ww*0.3,wy); ctx.stroke();
      } else { ctx.fillStyle="rgba(15,22,28,.9)"; ctx.fillRect(wx,wy,ww,wh); }
    }
  }
  const by=y0+fh;
  ctx.fillStyle="#0e141a"; ctx.fillRect(x0-4,by-2,bw+8,3);
  ctx.strokeStyle="rgba(140,160,175,.4)"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x0-4,by-9); ctx.lineTo(x0+bw+4,by-9); ctx.stroke();
  for(let k=0;k<=rooms*3;k++){ const px=x0-4+(bw+8)*k/(rooms*3);
    ctx.beginPath(); ctx.moveTo(px,by-9); ctx.lineTo(px,by-2); ctx.stroke(); }
  ctx.strokeStyle="#0e141a"; ctx.lineWidth=2;
  for(let c=0;c<=rooms;c+=2){ const px=x0+c*rw;
    ctx.beginPath(); ctx.moveTo(px,by); ctx.lineTo(px,baseY); ctx.stroke(); }
  const flags=signFlags(tt), blackout=flags.blackout, subLit=flags.subLit;
  const signH=40, signW=128, signTop=y0-9-signH, signY=signTop+19;
  ctx.strokeStyle="#0e141a"; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(cx-42,y0-4); ctx.lineTo(cx-42,signTop+4);
  ctx.moveTo(cx+42,y0-4); ctx.lineTo(cx+42,signTop+4); ctx.stroke();
  ctx.fillStyle="rgba(8,12,16,.92)";
  roundRect(ctx,cx-signW/2,signTop,signW,signH,5); ctx.fill();
  ctx.strokeStyle="rgba(120,150,170,.35)"; ctx.lineWidth=1.5;
  roundRect(ctx,cx-signW/2,signTop,signW,signH,5); ctx.stroke();
  if(!blackout){
    ctx.save(); ctx.strokeStyle="#ffd23a"; ctx.shadowColor="#ffd23a"; ctx.shadowBlur=8; ctx.lineWidth=2;
    const ax=cx-signW/2-9, ayT=signTop+5, ayB=signTop+signH+3;
    ctx.beginPath(); ctx.moveTo(ax,ayT); ctx.lineTo(ax,ayB-6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax-4,ayB-9); ctx.lineTo(ax,ayB); ctx.lineTo(ax+4,ayB-9); ctx.stroke();
    ctx.restore();
  }
  const word="MTProto";
  ctx.font="bold 17px 'Arial Black',Arial,sans-serif";
  const cw=ctx.measureText(word).width;
  let lx=cx-cw/2;
  for(let i=0;i<word.length;i++){
    const ch=word[i]; const chw=ctx.measureText(ch).width;
    const lit = !blackout && !(i===4 && (tt%5)<0.16);
    if(lit){
      ctx.save(); ctx.shadowColor="#39c9ff"; ctx.shadowBlur=12;
      ctx.fillStyle="#bff0ff"; ctx.fillText(ch,lx,signY);
      ctx.shadowBlur=4; ctx.fillStyle="#5fd6ff"; ctx.fillText(ch,lx,signY); ctx.restore();
    } else { ctx.fillStyle="rgba(60,90,110,.5)"; ctx.fillText(ch,lx,signY); }
    lx+=chw;
  }
  const sub="MOTEL · NO VACANCY";
  ctx.font="bold 10px 'Arial',sans-serif";
  const sw=ctx.measureText(sub).width;
  if(!blackout && subLit){
    ctx.save(); ctx.shadowColor="#ff3b3b"; ctx.shadowBlur=10;
    ctx.fillStyle="#ff8b8b"; ctx.fillText(sub, cx-sw/2, signY+15);
    ctx.shadowBlur=3; ctx.fillStyle="#ff5b5b"; ctx.fillText(sub, cx-sw/2, signY+15); ctx.restore();
  } else { ctx.fillStyle="rgba(90,40,40,.5)"; ctx.fillText(sub, cx-sw/2, signY+15); }
  ctx.font="14px sans-serif";
}
function drawNeonReflection(cx, baseY, tt){
  const flags=signFlags(tt), blackout=flags.blackout, subLit=flags.subLit;
  if(blackout) return;
  const wob=Math.sin(tt*3)*6;
  ctx.globalAlpha=0.16+Math.sin(tt*2)*0.03;
  let grad=ctx.createLinearGradient(0,baseY,0,baseY+70);
  grad.addColorStop(0,"#39c9ff"); grad.addColorStop(1,"rgba(57,201,255,0)");
  ctx.fillStyle=grad; ctx.fillRect(cx-46+wob, baseY+2, 92, 64);
  if(subLit){
    ctx.globalAlpha=0.12;
    let gr2=ctx.createLinearGradient(0,baseY,0,baseY+50);
    gr2.addColorStop(0,"#ff5b5b"); gr2.addColorStop(1,"rgba(255,91,91,0)");
    ctx.fillStyle=gr2; ctx.fillRect(cx-40-wob, baseY+2, 80, 44);
  }
  ctx.globalAlpha=1;
}

function drawRod(tip){
  const ro=rod();
  const baseX=W*0.99, baseY=H*1.04;
  let bend=0; if(state==="fighting") bend=(mouseDown?32:12)+Math.sin(performance.now()/80)*5;
  const cx=(baseX+tip.x)/2-72-bend, cy=(baseY+tip.y)/2-18;
  const N=18, wBase=15, wTip=2.5;
  function bez(t){ const mt=1-t; return {x:mt*mt*baseX+2*mt*t*cx+t*t*tip.x, y:mt*mt*baseY+2*mt*t*cy+t*t*tip.y}; }
  function nrm(t){ const dx=2*(1-t)*(cx-baseX)+2*t*(tip.x-cx); const dy=2*(1-t)*(cy-baseY)+2*t*(tip.y-cy); const l=Math.hypot(dx,dy)||1; return {x:-dy/l,y:dx/l}; }
  const left=[],right=[];
  for(let i=0;i<=N;i++){ const t=i/N,p=bez(t),n=nrm(t),w=(wBase+(wTip-wBase)*t)/2; left.push([p.x+n.x*w,p.y+n.y*w]); right.push([p.x-n.x*w,p.y-n.y*w]); }
  ctx.fillStyle="rgba(0,0,0,.28)";
  ctx.beginPath(); ctx.moveTo(left[0][0]+5,left[0][1]+5); for(const p of left)ctx.lineTo(p[0]+5,p[1]+5); for(let i=right.length-1;i>=0;i--)ctx.lineTo(right[i][0]+5,right[i][1]+5); ctx.closePath(); ctx.fill();
  const rodColors={bamboo:["#caa05a"],glass:["#5a7488"],carbon:["#343c46"],spin:["#7a3d3d"],premium:["#6a5aa0"],epic:["#5a3d8a"]};
  const c0=(rodColors[ro.id]||["#888"])[0];
  let grad=ctx.createLinearGradient(baseX,baseY,tip.x,tip.y); grad.addColorStop(0,c0); grad.addColorStop(1,"#cdd4da");
  ctx.fillStyle=grad;
  ctx.beginPath(); ctx.moveTo(left[0][0],left[0][1]); for(const p of left)ctx.lineTo(p[0],p[1]); for(let i=right.length-1;i>=0;i--)ctx.lineTo(right[i][0],right[i][1]); ctx.closePath(); ctx.fill();
  ctx.strokeStyle="rgba(255,255,255,.28)"; ctx.lineWidth=2;
  ctx.beginPath(); for(let i=0;i<=N;i++){ const p=bez(i/N); if(i===0)ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);} ctx.stroke();
  ctx.strokeStyle="#0e1217"; ctx.lineWidth=2;
  for(let i=4;i<N;i+=4){ const t=i/N,p=bez(t),n=nrm(t),w=(wBase+(wTip-wBase)*t)/2+3;
    ctx.beginPath(); ctx.ellipse(p.x+n.x*(w),p.y+n.y*(w),3,5,Math.atan2(n.y,n.x),0,7); ctx.stroke(); }
  const gp=bez(0.06);
  ctx.fillStyle="#c79a5e";
  ctx.beginPath(); ctx.moveTo(left[0][0],left[0][1]); ctx.lineTo(left[2][0],left[2][1]); ctx.lineTo(right[2][0],right[2][1]); ctx.lineTo(right[0][0],right[0][1]); ctx.closePath(); ctx.fill();
  ctx.strokeStyle="rgba(0,0,0,.25)"; ctx.lineWidth=1.5;
  for(let k=0;k<3;k++){ ctx.beginPath(); ctx.moveTo(lerp(left[0][0],left[2][0],k/3),lerp(left[0][1],left[2][1],k/3)); ctx.lineTo(lerp(right[0][0],right[2][0],k/3),lerp(right[0][1],right[2][1],k/3)); ctx.stroke(); }
  const rx=W*0.905, ry=H*0.78;
  ctx.fillStyle="#0e1318"; ctx.beginPath(); ctx.arc(rx,ry,22,0,7); ctx.fill();
  ctx.strokeStyle="#05080a"; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(rx,ry,22,0,7); ctx.stroke();
  let rg=ctx.createRadialGradient(rx-5,ry-5,3,rx,ry,16);
  rg.addColorStop(0,"#3a444d"); rg.addColorStop(1,"#1a2128");
  ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(rx,ry,14,0,7); ctx.fill();
  const ra=performance.now()/(state==="fighting"&&mouseDown?80:420);
  ctx.strokeStyle="#aab4bd"; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(rx,ry); ctx.lineTo(rx+Math.cos(ra)*16,ry+Math.sin(ra)*16); ctx.stroke();
  ctx.fillStyle="#cfd6dc"; ctx.beginPath(); ctx.arc(rx+Math.cos(ra)*16,ry+Math.sin(ra)*16,4,0,7); ctx.fill();
}
