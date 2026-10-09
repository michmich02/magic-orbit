// ═══ SPELL CORE RENDERERS — Character-Based Magical Academia ═══
// All spells rendered with glowing ASCII / numeric characters.

const SPELL_CHARS = '0123456789.:+*oO';
const SPELL_CHARS2 = '·✦✧⋆+*oO01234567';

function _ch(i,t){return SPELL_CHARS[(i+Math.floor(t*0.002))%SPELL_CHARS.length];}
function _noise(x,y){const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);}

// Draw a single glowing character
const GLYPH_SCALE = 1.8; // global character size multiplier
function _drawGlyph(ctx,ch,x,y,sz,alpha,gold,purple,glow){
  if(alpha<0.02)return;
  const fsz = sz * GLYPH_SCALE;
  const g = (glow||6) * 2.5;
  ctx.save();
  ctx.globalAlpha=Math.min(1, alpha * 1.4);
  if(purple){
    ctx.fillStyle='rgba(160,120,240,1)';
    ctx.shadowColor='rgba(140,100,220,0.9)';
  } else if(gold){
    ctx.fillStyle='rgba(255,225,140,1)';
    ctx.shadowColor='rgba(240,200,100,0.9)';
  } else {
    ctx.fillStyle='rgba(240,220,180,1)';
    ctx.shadowColor='rgba(230,200,130,0.8)';
  }
  ctx.shadowBlur=g;
  ctx.font=`bold ${fsz}px 'Courier New',monospace`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(ch,x,y);
  // Second pass for extra glow
  ctx.globalAlpha=Math.min(1, alpha * 0.5);
  ctx.shadowBlur=g*1.5;
  ctx.fillText(ch,x,y);
  ctx.restore();
}

/* ──────────────────────────────────────
   1. FLAME — living fire of glowing digits
   ────────────────────────────────────── */
function drawFlameCore(ctx,x,y,sz,t,a,spd){
  if(a<0.01)return;
  spd=spd||0;
  const T=t*0.001, mm=1+spd*2;
  const H=sz*2.2, W=sz*0.65;
  const flickY=Math.sin(T*6)*3*mm+Math.sin(T*9.3)*2*mm;
  const flickX=Math.sin(T*3.7)*4*mm;
  ctx.save();ctx.translate(x+flickX,y+flickY);ctx.globalAlpha=a;

  // Main flame body — dense character particles
  for(let i=0;i<180;i++){
    const s=i/180;
    const drift=(T*40+i*7)%H;
    const dS=drift/H;
    const envW=W*Math.sin(dS*Math.PI)*(1-dS*0.5);
    const nx=_noise(i*0.1,T*2)*2-1;
    const px=nx*envW+Math.sin(T*3+dS*8)*envW*0.3;
    const py=-dS*H;
    const core=1-Math.min(1,Math.abs(px)/(envW+1));
    const fade=1-dS;
    const al=core*fade*(0.5+0.3*Math.sin(T*5+i));
    if(al<0.06)continue;
    const ch=_ch(i,t+drift*100);
    const fsz=Math.max(5,6+core*8*(1-dS));
    const isPurple=i%7===0;
    _drawGlyph(ctx,ch,px,py,fsz,al*0.7,!isPurple,isPurple,6+core*8);
  }

  // Rising ember characters — float upward
  for(let i=0;i<16;i++){
    const life=(T*0.8+i*0.31)%2.5;
    const lf=life/2.5;
    const ex=Math.sin(T*2+i*2.7)*W*0.4+Math.sin(life*3)*8;
    const ey=-lf*H*1.1-10;
    const ea=Math.max(0,(1-lf)*0.5*(0.5+0.5*Math.sin(T*8+i)));
    if(ea<0.03)continue;
    const ch=SPELL_CHARS[i%SPELL_CHARS.length];
    _drawGlyph(ctx,ch,ex,ey,5+2*(1-lf),ea*0.6,true,false,4);
  }

  // Faint outline characters along flame edge
  ctx.shadowBlur=8;
  for(let side=-1;side<=1;side+=2){
    for(let s=0;s<1;s+=0.06){
      const envW=W*Math.sin(s*Math.PI)*(1-s*0.5);
      const sway=Math.sin(T*4+s*5+side)*envW*0.3;
      const px=side*envW+sway;
      const py=-s*H;
      const oa=0.15+0.1*Math.sin(T*3+s*7);
      const ch=_ch(Math.floor(s*16),t);
      _drawGlyph(ctx,ch,px,py,5,oa,true,false,4);
    }
  }

  // Base glow ring — character-based
  for(let i=0;i<12;i++){
    const ba=i/12*Math.PI*2;
    const br=W*0.7;
    const bx=Math.cos(ba)*br, by=Math.sin(ba)*6+5;
    const bal=0.2+0.1*Math.sin(T*4+i);
    _drawGlyph(ctx,_ch(i,t),bx,by,5,bal,false,true,8);
  }
  ctx.restore();
}

/* ──────────────────────────────────────
   2. RUNE CIRCLE — concentric character rings
   ────────────────────────────────────── */
function drawRuneCircle(ctx,x,y,sz,t,a,spd){
  if(a<0.01)return;
  spd=spd||0;
  const rotMul=1+spd*3;
  const R=sz*1.8, T=t*0.001;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=a;
  const bob=Math.sin(T*1.5)*3;
  ctx.translate(0,bob);

  // Dark halo backdrop
  const hG=ctx.createRadialGradient(0,0,R*0.2,0,0,R*1.25);
  hG.addColorStop(0,'rgba(18,11,24,0.32)');
  hG.addColorStop(0.5,'rgba(22,16,31,0.18)');
  hG.addColorStop(1,'rgba(13,8,18,0)');
  ctx.fillStyle=hG;ctx.beginPath();ctx.arc(0,0,R*1.25,0,Math.PI*2);ctx.fill();

  // Outer ring — characters arranged in circle
  const outerRot=T*0.3*rotMul;
  for(let i=0;i<36;i++){
    const ang=i/36*Math.PI*2+outerRot;
    const cx2=Math.cos(ang)*R, cy2=Math.sin(ang)*R;
    const pulse=0.4+0.3*Math.sin(T*3+i*0.5);
    const ch=_ch(i,t);
    const fsz=i%3===0?10:7;
    _drawGlyph(ctx,ch,cx2,cy2,fsz,pulse,true,i%5===0,10);
  }

  // Thin supporting outer ring line
  ctx.save();ctx.rotate(outerRot);
  ctx.strokeStyle='rgba(212,175,106,0.15)';ctx.lineWidth=0.5;
  ctx.shadowColor='rgba(143,109,219,0.3)';ctx.shadowBlur=8;
  ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.stroke();
  ctx.restore();

  // Middle ring — characters, counter-rotating
  const midRot=-T*0.6*rotMul;
  for(let i=0;i<24;i++){
    const ang=i/24*Math.PI*2+midRot;
    const mr=R*0.68;
    const cx2=Math.cos(ang)*mr, cy2=Math.sin(ang)*mr;
    const pulse=0.35+0.25*Math.sin(T*4+i*0.7);
    const ch=SPELL_CHARS[(i*3+Math.floor(T*2))%SPELL_CHARS.length];
    _drawGlyph(ctx,ch,cx2,cy2,8,pulse,i%4!==0,i%4===0,8);
  }

  // Inner ring — faster rotating digits
  const innerRot=T*1.2*rotMul;
  for(let i=0;i<16;i++){
    const ang=i/16*Math.PI*2+innerRot;
    const ir=R*0.42;
    const cx2=Math.cos(ang)*ir, cy2=Math.sin(ang)*ir;
    const pulse=0.45+0.3*Math.sin(T*5+i);
    const ch=_ch(i*2,t);
    _drawGlyph(ctx,ch,cx2,cy2,9,pulse,true,false,12);
  }

  // Cross-link characters between rings
  for(let i=0;i<6;i++){
    const ang=i/6*Math.PI*2+T*0.08;
    for(let r=0.3;r<0.95;r+=0.15){
      const cr=R*r;
      const cx2=Math.cos(ang)*cr, cy2=Math.sin(ang)*cr;
      const la=0.15+0.1*Math.sin(T*2+r*8+i);
      _drawGlyph(ctx,_ch(Math.floor(r*10)+i,t),cx2,cy2,5,la,false,true,4);
    }
  }

  // Center core — dense bright characters
  for(let i=0;i<8;i++){
    const ca=i/8*Math.PI*2+T*2;
    const cr=R*0.12+Math.sin(T*3+i)*3;
    const cx2=Math.cos(ca)*cr, cy2=Math.sin(ca)*cr;
    const coreA=0.6+0.3*Math.sin(T*5+i*2);
    _drawGlyph(ctx,_ch(i,t),cx2,cy2,10,coreA,true,false,15);
  }
  // Center bright point
  _drawGlyph(ctx,'O',0,0,12,0.7+0.3*Math.sin(T*2),true,false,20);

  ctx.restore();
}

/* ──────────────────────────────────────
   3. CRYSTAL — faceted shape of digit clusters
   ────────────────────────────────────── */
function drawCrystalCore(ctx,x,y,sz,t,a,spd){
  if(a<0.01)return;
  spd=spd||0;
  const T=t*0.001;
  const floatY=Math.sin(T*1.2)*5, floatX=Math.sin(T*0.8)*2;
  const tilt=Math.sin(T*0.6)*0.03;
  ctx.save();ctx.translate(x+floatX,y+floatY);ctx.rotate(tilt);
  ctx.globalAlpha=a;

  const rot=T*0.3;
  const sides=6, topH=sz*1.6, botH=sz*0.8, midR=sz*0.5;
  const pts=[];
  for(let i=0;i<sides;i++){
    const a2=i/sides*Math.PI*2+rot;
    pts.push({x:Math.cos(a2)*midR,y:Math.sin(a2)*midR*0.35});
  }

  // Fill crystal faces with characters
  for(let i=0;i<sides;i++){
    const p1=pts[i], p2=pts[(i+1)%sides];
    // Upper face: top → p1 → p2
    for(let s=0;s<8;s++){
      const f=s/8;
      const f2=(s+0.5)/8;
      // Interpolate along face
      const ax2=p1.x*f, ay2=-topH*(1-f)+p1.y*f;
      const bx2=(p1.x+p2.x)*0.5*f2, by2=-topH*(1-f2)+(p1.y+p2.y)*0.5*f2;
      const ca=0.15+0.2*f+0.1*Math.sin(T*3+s+i);
      _drawGlyph(ctx,_ch(s+i*8,t),ax2,ay2,5+f*4,ca,true,s%4===0,5+f*6);
      if(s%2===0)_drawGlyph(ctx,_ch(s+i*8+1,t),bx2,by2,4+f*3,ca*0.7,false,true,4);
    }
    // Lower face: bottom → p1 → p2
    for(let s=0;s<5;s++){
      const f=s/5;
      const ax2=p1.x*f, ay2=botH*(1-f)+p1.y*f;
      const ca=0.12+0.15*f+0.1*Math.sin(T*2+s+i*2);
      _drawGlyph(ctx,_ch(s+i*5+48,t),ax2,ay2,5+f*3,ca,true,false,4+f*4);
    }
  }

  // Edge lines — character chains along edges
  for(let i=0;i<sides;i++){
    const p=pts[i];
    // Top edge
    for(let s=0;s<=6;s++){
      const f=s/6;
      const ex=p.x*f, ey=-topH*(1-f)+p.y*f;
      const ea=0.3+0.2*Math.sin(T*4+s+i);
      _drawGlyph(ctx,_ch(s+i,t),ex,ey,7,ea,true,false,8);
    }
    // Bottom edge
    for(let s=0;s<=4;s++){
      const f=s/4;
      const ex=p.x*f, ey=botH*(1-f)+p.y*f;
      _drawGlyph(ctx,_ch(s+i+30,t),ex,ey,6,0.25+0.15*Math.sin(T*3+s),true,false,6);
    }
    // Mid ring edge
    const p2=pts[(i+1)%sides];
    for(let s=0;s<=4;s++){
      const f=s/4;
      const ex=p.x+(p2.x-p.x)*f, ey=p.y+(p2.y-p.y)*f;
      _drawGlyph(ctx,_ch(s+i*4+60,t),ex,ey,7,0.35+0.2*Math.sin(T*3+s+i),true,false,8);
    }
  }

  // Vertices — bright anchor characters
  _drawGlyph(ctx,'0',0,-topH,11,0.7+0.2*Math.sin(T*2),true,false,14);
  _drawGlyph(ctx,'0',0,botH,10,0.6+0.2*Math.sin(T*2.5),true,false,12);
  for(const p of pts){
    _drawGlyph(ctx,'*',p.x,p.y,9,0.5+0.2*Math.sin(T*3),true,false,10);
  }

  // Orbiting fragments — small character clusters
  const orbitMul=1+spd*1.5;
  for(let i=0;i<5;i++){
    const oa=T*(0.8+i*0.3)*orbitMul+i*Math.PI*2/5;
    const or2=sz*0.8+i*8;
    const ox=Math.cos(oa)*or2, oy=Math.sin(oa)*or2*0.3;
    for(let j=0;j<3;j++){
      const off=(j-1)*5;
      const fa=0.2+0.15*Math.sin(T*3+i*1.7+j);
      _drawGlyph(ctx,_ch(i*3+j,t),ox+off,oy,5+j,fa,j!==1,j===1,5);
    }
  }
  ctx.restore();
}

/* ──────────────────────────────────────
   4. PORTAL — rotating digit vortex
   ────────────────────────────────────── */
function drawPortalCore(ctx,x,y,sz,t,a,spd){
  if(a<0.01)return;
  spd=spd||0;
  const vMul=1+spd*2.5;
  const T=t*0.001, breath=1+Math.sin(T*2)*0.05;
  const R=sz*breath;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=a;

  // Outer ring — characters
  for(let i=0;i<32;i++){
    const ang=i/32*Math.PI*2+T*0.6*vMul;
    const cx2=Math.cos(ang)*R, cy2=Math.sin(ang)*R;
    const pulse=0.35+0.25*Math.sin(T*3+i*0.5);
    _drawGlyph(ctx,_ch(i,t),cx2,cy2,8,pulse,true,i%5===0,8);
  }

  // Inner ring
  for(let i=0;i<20;i++){
    const ang=i/20*Math.PI*2-T*1.2*vMul;
    const cx2=Math.cos(ang)*R*0.6, cy2=Math.sin(ang)*R*0.6;
    const pulse=0.3+0.2*Math.sin(T*4+i);
    _drawGlyph(ctx,_ch(i+32,t),cx2,cy2,7,pulse,false,true,6);
  }

  // Spiral vortex — characters spiraling inward
  for(let s=0;s<3;s++){
    for(let i=0;i<25;i++){
      const f=i/25;
      const r=(1-f)*R*0.85;
      const ang=f*Math.PI*4+T*2.5*vMul+s*Math.PI*2/3;
      const px=Math.cos(ang)*r, py=Math.sin(ang)*r;
      const sa=0.08+f*0.35;
      const ch=_ch(i+s*25,t);
      const fsz=5+f*5;
      _drawGlyph(ctx,ch,px,py,fsz,sa,f<0.5,f>=0.5,4+f*10);
    }
  }

  // Particles being pulled inward — character-based
  for(let i=0;i<24;i++){
    const life=(T*0.6+i*0.21)%2.0;
    const lf=life/2.0;
    const pullR=R*(1-lf*0.9);
    const spinA=lf*Math.PI*3+i*Math.PI*2/24+T*1.5;
    const px=Math.cos(spinA)*pullR, py=Math.sin(spinA)*pullR;
    const pA=lf*0.4*(0.5+0.5*Math.sin(T*5+i));
    if(pA<0.03)continue;
    _drawGlyph(ctx,_ch(i+75,t),px,py,5+lf*4,pA,i%3!==0,i%3===0,4+lf*8);
  }

  // Center core — dense bright characters
  for(let i=0;i<6;i++){
    const ca=i/6*Math.PI*2+T*3;
    const cr=6+Math.sin(T*4+i)*3;
    _drawGlyph(ctx,_ch(i+100,t),Math.cos(ca)*cr,Math.sin(ca)*cr,9,0.5+0.3*Math.sin(T*5+i),true,false,14);
  }
  _drawGlyph(ctx,'O',0,0,11,0.6+0.3*Math.sin(T*5),true,false,18);

  // Faint supporting ring lines
  ctx.save();ctx.rotate(T*0.6*vMul);
  ctx.strokeStyle='rgba(212,175,106,0.1)';ctx.lineWidth=0.4;
  ctx.shadowColor='rgba(143,109,219,0.2)';ctx.shadowBlur=6;
  ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.stroke();
  ctx.restore();
  ctx.save();ctx.rotate(-T*1.2*vMul);
  ctx.strokeStyle='rgba(143,109,219,0.08)';ctx.lineWidth=0.3;
  ctx.beginPath();ctx.arc(0,0,R*0.6,0,Math.PI*2);ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/* ──────────────────────────────────────
   5. LIGHTNING ORB — dense flickering digit core
   ────────────────────────────────────── */
function drawLightningOrb(ctx,x,y,sz,t,a,spd){
  if(a<0.01)return;
  spd=spd||0;
  const arcRate=1+spd*4;
  const T=t*0.001, R=sz*0.4;
  const flicker=Math.random()>0.85?1.5:1.0;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=a;

  // Core sphere — dense character ball
  for(let i=0;i<40;i++){
    const ang=i/40*Math.PI*2+T*2;
    const layerR=R*(0.3+0.7*_noise(i,Math.floor(T*3)));
    const cx2=Math.cos(ang)*layerR, cy2=Math.sin(ang)*layerR;
    const ca=(0.4+0.3*Math.sin(T*6+i))*flicker;
    const fsz=6+_noise(i+1,T*4)*5;
    _drawGlyph(ctx,_ch(i,t),cx2,cy2,fsz,Math.min(1,ca),true,i%6===0,10*flicker);
  }
  // Inner dense core
  for(let i=0;i<12;i++){
    const ang=i/12*Math.PI*2+T*4;
    const cr=R*0.3*_noise(i+50,T*5);
    _drawGlyph(ctx,_ch(i+40,t),Math.cos(ang)*cr,Math.sin(ang)*cr,8,0.6*flicker,true,false,14*flicker);
  }

  // Lightning arc chains — jagged character sequences
  const rng=(s)=>{const seed=Math.floor(T*8*arcRate+s*77);const n=Math.sin(s*9876.5+seed*12.3)*43758.5;return n-Math.floor(n);};
  const nBolts=5+(Math.random()>0.7?3:0)+Math.floor(spd*3);
  for(let b=0;b<nBolts;b++){
    const startA=b/nBolts*Math.PI*2+rng(b*100)*0.6;
    const bLen=sz*0.4+rng(b+1)*sz*0.6;
    const segs=4+Math.floor(rng(b+10)*5);
    const bAlpha=(0.3+rng(b+20)*0.5)*flicker;
    let bx=Math.cos(startA)*R, by=Math.sin(startA)*R;
    for(let s=1;s<=segs;s++){
      const f=s/segs;
      const tx=Math.cos(startA)*(R+bLen*f);
      const ty=Math.sin(startA)*(R+bLen*f);
      const jx=(rng(b*10+s)*2-1)*25;
      const jy=(rng(b*10+s+50)*2-1)*25;
      bx=tx+jx*(1-f*0.3); by=ty+jy*(1-f*0.3);
      const ch=_ch(b*segs+s,t);
      _drawGlyph(ctx,ch,bx,by,5+rng(b+s)*4,bAlpha*(1-f*0.3),false,true,8*flicker);
    }
  }

  // Spark mote characters — flash suddenly
  for(let i=0;i<10;i++){
    const sa=rng(i+T*3)*Math.PI*2;
    const sr=R*0.5+rng(i+50)*sz*0.6;
    const flash=Math.sin(T*12+i*7);
    const sp=flash>0.6?0.5:flash>0.3?0.15:0;
    if(sp<0.02)continue;
    _drawGlyph(ctx,_ch(i+60,t),Math.cos(sa)*sr,Math.sin(sa)*sr,6,sp*flicker,false,true,6);
  }

  // Containment ring characters
  for(let i=0;i<16;i++){
    const ang=i/16*Math.PI*2+T*0.5;
    const jr=R*1.3+Math.sin(T*20)*1;
    const cx2=Math.cos(ang)*jr, cy2=Math.sin(ang)*jr;
    const ra=0.15+0.1*Math.sin(T*4+i);
    _drawGlyph(ctx,_ch(i+70,t),cx2,cy2,5,ra,true,false,4);
  }

  // Center bright character
  _drawGlyph(ctx,'0',0,0,12,(0.5+0.3*Math.sin(T*6))*flicker,true,false,20*flicker);

  ctx.restore();
}

/*
 * renderSpell(cx, cy, alpha, t, speed, overrideType, chargeInfo)
 */
function renderSpell(cx, cy, alpha, t, speed, overrideType, chargeInfo) {
  speed = speed || 0;
  const idx = (overrideType !== undefined) ? overrideType : shapeType;
  let sz = SPELL_SZ;
  let spd = speed;
  if (chargeInfo && chargeInfo.mode === 'charging') {
    const c = Math.max(0.35, Math.min(1.0, chargeInfo.compression));
    sz = SPELL_SZ * (0.4 + c * 0.6);
    spd = speed + (1 - c) * 2;
    alpha = alpha * chargeInfo.chargeAlpha;
  } else if (chargeInfo && chargeInfo.mode === 'collapsing') {
    const cf = chargeInfo.collapseF || 0;
    sz = SPELL_SZ * Math.max(0.08, 0.4 * (1 - cf));
    spd = speed + 3;
  }
  const fns = [drawFlameCore, drawRuneCircle, drawCrystalCore, drawPortalCore, drawLightningOrb];
  fns[idx](ctx, cx, cy, sz, t, alpha, spd);
}
