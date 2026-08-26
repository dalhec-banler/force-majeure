function sfxChime(){ tone(660,0.1,"sine",0.05); tone(880,0.14,"sine",0.05,0.11); }

/* diegetic instrument audio — synthesized, no assets */
let AC=null, sndMuted=false;
function audioInit(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } }
function tone(f,dur,type,gain,when,slide){
  if(!AC||sndMuted) return;
  const o=AC.createOscillator(), g=AC.createGain();
  o.type=type||"square"; o.frequency.value=f;
  const t0=AC.currentTime+(when||0);
  if(slide) o.frequency.exponentialRampToValueAtTime(slide,t0+dur);
  g.gain.value=gain||0.05;
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g); g.connect(AC.destination);
  o.start(t0); o.stop(t0+dur+0.05);
}
function sfxBoom(){ tone(64,0.5,"sine",0.24,0,28); tone(46,0.75,"triangle",0.16,0.04,22); }
function sfxKlaxon(){ for(let i=0;i<2;i++){ tone(870,0.16,"square",0.045,i*0.4);
  tone(640,0.16,"square",0.045,i*0.4+0.19); } }
function sfxAlert(){ tone(1250,0.08,"square",0.04); tone(1650,0.08,"square",0.032,0.1); }
function sfxClick(){ tone(340,0.035,"square",0.028); }
function sfxTeletype(){ for(let i=0;i<5;i++) tone(1850+(i%3)*160,0.018,"square",0.02,i*0.045); }

