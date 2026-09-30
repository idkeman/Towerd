/* Towerd — dependency-free tower defense engine */
(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  const MAPS=[
    {name:"Crossroads",desc:"The original winding route.",path:[{x:-30,y:110},{x:180,y:110},{x:180,y:235},{x:410,y:235},{x:410,y:105},{x:650,y:105},{x:650,y:330},{x:930,y:330},{x:930,y:175},{x:1182,y:175}],spots:[[70,180],[70,290],[90,390],[120,500],[260,165],[270,305],[330,165],[330,320],[350,420],[480,165],[500,300],[500,420],[590,190],[590,420],[720,200],[720,420],[800,255],[800,450],[880,250],[880,450],[1000,250],[1000,420],[1080,260],[1080,420],[1120,320],[420,50],[760,80],[950,90]]},
    {name:"Switchback",desc:"A long zig-zag route.",path:[{x:-30,y:90},{x:220,y:90},{x:220,y:210},{x:520,y:210},{x:520,y:350},{x:220,y:350},{x:220,y:500},{x:560,y:500},{x:560,y:430},{x:1182,y:430}],spots:[[80,165],[80,300],[80,430],[320,125],[320,285],[320,420],[450,125],[450,285],[450,420],[650,350],[650,500],[760,350],[760,500],[870,350],[870,500],[980,350],[980,500],[1090,350],[1090,500],[600,90],[760,90],[900,250],[1080,250]]},
    {name:"Spiral",desc:"A coiling route around the center.",path:[{x:-30,y:90},{x:250,y:90},{x:250,y:540},{x:850,y:540},{x:850,y:120},{x:450,y:120},{x:450,y:400},{x:1050,y:400},{x:1050,y:250},{x:1182,y:250}],spots:[[100,180],[100,350],[100,500],[350,260],[350,500],[430,260],[430,500],[650,60],[650,260],[650,470],[780,260],[780,470],[950,180],[950,330],[950,500],[1100,330],[1100,180],[1100,500],[300,60],[500,60],[800,70],[1000,70]]},
    {name:"Four Corners",desc:"Four sweeping corners and long lanes.",path:[{x:-30,y:160},{x:160,y:160},{x:160,y:80},{x:1000,y:80},{x:1000,y:560},{x:160,y:560},{x:160,y:330},{x:1182,y:330}],spots:[[70,250],[70,430],[250,250],[250,430],[350,160],[350,330],[350,500],[500,160],[500,330],[500,500],[700,160],[700,330],[700,500],[850,160],[850,330],[850,500],[1080,250],[1080,430],[1100,520],[120,80],[350,70],[650,70],[850,70]]},
    {name:"Twin Rivers",desc:"Two parallel lanes and crossings.",path:[{x:-30,y:120},{x:300,y:120},{x:300,y:300},{x:850,y:300},{x:850,y:120},{x:1182,y:120}],spots:[[100,210],[100,390],[220,210],[220,390],[430,190],[430,410],[560,190],[560,410],[700,190],[700,410],[930,210],[930,390],[1040,210],[1040,390],[1130,210],[1130,390],[420,80],[560,80],[700,80],[980,80]]},
    {name:"The Gauntlet",desc:"A dense maze of narrow lanes.",path:[{x:-30,y:70},{x:140,y:70},{x:140,y:540},{x:350,y:540},{x:350,y:110},{x:560,y:110},{x:560,y:540},{x:770,y:540},{x:770,y:110},{x:1182,y:110}],spots:[[70,300],[70,450],[230,170],[230,300],[230,420],[450,300],[450,450],[450,570],[650,210],[650,330],[650,450],[650,570],[860,300],[860,450],[950,200],[950,320],[950,450],[1080,200],[1080,320],[1080,450],[300,60],[500,60],[700,60],[900,60],[1120,60]]}
  ];
  let currentMap=0;
  let path=MAPS[0].path;
  let buildSpots=MAPS[0].spots;

  const TYPES = {
    dart:{name:"Dart",cost:75,range:145,damage:16,rate:0.37,projectile:520,color:"#67e8f9",desc:"Fast precision fire"},
    cannon:{name:"Cannon",cost:150,range:125,damage:50,rate:1.46,projectile:350,splash:55,color:"#fb923c",desc:"Heavy splash damage"},
    frost:{name:"Frost",cost:125,range:135,damage:6,rate:0.86,projectile:430,slow:.56,slowTime:1.7,color:"#a5b4fc",desc:"Slows enemies"},
    sniper:{name:"Sniper",cost:190,range:310,damage:95,rate:1.94,projectile:850,color:"#f8fafc",desc:"Extreme range and damage"},
    machine:{name:"Machine Gun",cost:170,range:135,damage:10,rate:0.119,projectile:680,color:"#94a3b8",desc:"Very rapid fire"},
    flame:{name:"Flame",cost:205,range:105,damage:12,rate:0.238,projectile:300,splash:36,color:"#fb7185",desc:"Close-range area damage"},
    tesla:{name:"Tesla",cost:235,range:155,damage:31,rate:0.89,projectile:900,color:"#c084fc",desc:"High-power electric shots"},
    poison:{name:"Venom",cost:155,range:145,damage:22,rate:0.76,projectile:430,color:"#a3e635",desc:"Reliable damage"},
    missile:{name:"Missile",cost:260,range:220,damage:81,rate:2.38,projectile:260,splash:78,color:"#f97316",desc:"Huge explosive radius"},
    railgun:{name:"Railgun",cost:345,range:360,damage:162,rate:3.46,projectile:1100,color:"#38bdf8",desc:"Long-range heavy hitter"},
    mortar:{name:"Mortar",cost:230,range:285,damage:65,rate:2.59,projectile:300,splash:65,color:"#d97706",desc:"Long-range artillery"},
    boomerang:{name:"Boomerang",cost:145,range:165,damage:25,rate:0.81,projectile:460,splash:17,color:"#fbbf24",desc:"Cluster sweeper"},
    laser:{name:"Laser",cost:300,range:235,damage:38,rate:0.54,projectile:1000,color:"#f43f5e",desc:"Focused beam"},
    plasma:{name:"Plasma",cost:325,range:190,damage:61,rate:1.14,projectile:620,splash:28,color:"#22d3ee",desc:"Energy blasts"},
    crystal:{name:"Crystal",cost:250,range:175,damage:40,rate:1.19,projectile:520,splash:24,slow:.75,slowTime:1.15,color:"#e879f9",desc:"Slowing bursts"},
    shockwave:{name:"Shockwave",cost:290,range:120,damage:27,rate:1.73,projectile:360,slow:.46,slowTime:1.15,color:"#60a5fa",desc:"Disrupts movement"},
    drone:{name:"Drone",cost:245,range:205,damage:23,rate:0.45,projectile:580,color:"#818cf8",desc:"Fast autonomous fire"},
    bunker:{name:"Bunker",cost:275,range:105,damage:43,rate:0.76,projectile:430,splash:19,color:"#64748b",desc:"Short-range powerhouse"},
    chrono:{name:"Chrono",cost:325,range:175,damage:21,rate:1.51,projectile:500,slow:.42,slowTime:2.65,color:"#f0abfc",desc:"Severe slow"},
    gravity:{name:"Gravity",cost:350,range:145,damage:16,rate:1.84,projectile:360,splash:65,slow:.53,slowTime:1.9,color:"#7c3aed",desc:"Group control"},
    meteor:{name:"Meteor",cost:440,range:330,damage:130,rate:4.1,projectile:240,splash:100,color:"#ef4444",desc:"Endgame artillery"},
    bank:{name:"Gold Mine",cost:225,range:0,damage:0,rate:5,projectile:0,income:20,color:"#fbbf24",desc:"Passively generates gold"},trap:{name:"Spike Trap",cost:210,range:135,damage:72,rate:2.8,projectile:0,trapLife:18,slow:.7,slowTime:1.6,color:"#fb7185",desc:"Plants ground spikes near the tower"},
    trap:{name:"Spike Trap",cost:210,range:135,damage:72,rate:2.8,projectile:0,trapLife:18,slow:.7,slowTime:1.6,color:"#fb7185",desc:"Plants ground spikes that trigger on enemies"}
  };
  const ENEMY = {
    grunt:{hp:75,speed:56,reward:8,r:11,color:"#ef4444"},
    runner:{hp:48,speed:105,reward:10,r:9,color:"#f59e0b"},
    tank:{hp:280,speed:30,reward:25,r:16,color:"#a855f7"},
    shield:{hp:145,speed:46,reward:16,r:13,color:"#38bdf8"},
    boss:{hp:1800,speed:24,reward:140,r:25,color:"#f43f5e"}
  };

  const SAVE_KEY="towerd-save-v1";
  const PROFILE_KEY="towerd-profile-v1";
  let state;
  let saveTimer=0;
  let profile={level:1,xp:0,totalXp:0};
  let offlineReport=null;

  function xpNeeded(level){return 100+(level-1)*75;}
  function profileOfflineCap(){return Math.min(12*60*60,(2+profile.level*.5)*60*60);}
  function startingGold(){return 250+(profile.level-1)*10;}
  function startingLives(){return 20+Math.floor((profile.level-1)/3);}
  function loadProfile(){
    try{
      const raw=localStorage.getItem(PROFILE_KEY);
      if(raw){
        const p=JSON.parse(raw);
        profile={level:Math.max(1,Number(p.level)||1),xp:Math.max(0,Number(p.xp)||0),totalXp:Math.max(0,Number(p.totalXp)||0)};
      }
    }catch(error){console.warn("Towerd profile load failed:",error);}
  }
  function saveProfile(){
    try{localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));}catch(error){console.warn("Towerd profile save failed:",error);}
  }
  function addXP(amount){
    amount=Math.max(0,Math.floor(amount||0));
    if(!amount)return;
    profile.xp+=amount;profile.totalXp+=amount;
    let leveled=false;
    while(profile.xp>=xpNeeded(profile.level)){
      profile.xp-=xpNeeded(profile.level);
      profile.level++;
      leveled=true;
    }
    saveProfile();
    updateProgressionUI();
    if(leveled)toast("COMMAND RANK "+profile.level+"  +PERMANENT BONUS");
  }
  function updateProgressionUI(){
    const level=document.getElementById("profileLevel");
    const bar=document.getElementById("profileProgressBar");
    const xp=document.getElementById("profileXp");
    const perks=document.getElementById("profilePerks");
    if(level)level.textContent=profile.level;
    if(xp)xp.textContent=profile.xp+" / "+xpNeeded(profile.level)+" XP";
    if(bar)bar.style.width=Math.min(100,profile.xp/xpNeeded(profile.level)*100)+"%";
    if(perks)perks.textContent="+"+(profile.level-1)*10+" starting gold · +"+Math.floor((profile.level-1)/3)+" lives · "+Math.round((1+(profile.level-1)*.05)*100)+"% offline income";
  }
  function applyOfflineProgress(savedAt){
    if(!savedAt)return;
    const away=Math.max(0,Math.floor((Date.now()-Number(savedAt))/1000));
    if(away<10)return;
    const seconds=Math.min(away,profileOfflineCap());
    const mineCount=state.towers.filter(t=>t.type==="bank").length;
    const mineGold=state.towers.filter(t=>t.type==="bank").reduce((sum,t)=>{
      const def=TYPES.bank;
      const level=Math.max(1,Number(t.level)||1);
      return sum+(seconds/def.rate)*def.income*(1+(level-1)*.25);
    },0);
    const passive=seconds/90;
    const income=Math.floor((mineGold+passive)*(1+(profile.level-1)*.05));
    const xp=Math.floor(seconds/30)+Math.floor(income/20);
    let simulatedWaves=0;
    if(state.autoWave&&!state.gameOver&&!state.won){
      simulatedWaves=Math.min(Math.floor(seconds/45),Math.max(0,100-state.wave));
      state.wave=Math.min(100,state.wave+simulatedWaves);
      if(simulatedWaves)state.gold+=simulatedWaves*30;
      if(state.wave>=100)state.won=true;
    }
    if(income>0)state.gold+=income;
    addXP(xp);
    offlineReport={seconds,income,xp,simulatedWaves,mineCount};
  }

  function saveGame(showMessage=false){
    try{
      if(!state||!state.started)return false;
      const snapshot={
        version:2,
        savedAt:Date.now(),
        map:currentMap,
        wave:state.wave,
        gold:state.gold,
        lives:state.lives,
        started:state.started,
        gameOver:state.gameOver,
        won:state.won,
        waveActive:state.waveActive,
        spawnLeft:state.spawnLeft,
        spawnTimer:state.spawnTimer,
        spawnTotal:state.spawnTotal,
        speed:state.speed,
        autoWave:state.autoWave,
        betweenTimer:state.betweenTimer,
        time:state.time,
        selectedBuild:state.selectedBuild,
        towers:state.towers.map(t=>({
          type:t.type,x:t.x,y:t.y,level:t.level,cooldown:t.cooldown,
          totalSpent:t.totalSpent,kills:t.kills,targetMode:t.targetMode||"furthest"
        })),
        traps:state.traps.filter(t=>!t.dead).map(t=>({
          x:t.x,y:t.y,damage:t.damage,life:t.life,slow:t.slow,slowTime:t.slowTime,towerType:t.towerType
        })),
        enemies:state.enemies.filter(e=>!e.dead).map(e=>({
          type:e.type,x:e.x,y:e.y,distance:e.distance,hp:e.hp,maxHp:e.maxHp,
          speed:e.speed,slow:e.slow,slowUntil:e.slowUntil,progress:e.progress
        }))
      };
      localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot));
      if(showMessage)toast("GAME SAVED");
      return true;
    }catch(error){
      console.warn("Towerd save failed:",error);
      if(showMessage)toast("SAVE FAILED");
      return false;
    }
  }

  function hasSavedGame(){
    try{return !!localStorage.getItem(SAVE_KEY);}catch{return false;}
  }

  function loadGame(showMessage=true){
    try{
      const raw=localStorage.getItem(SAVE_KEY);
      if(!raw)return false;
      const save=JSON.parse(raw);
      if(!save||!([1,2].includes(save.version)))return false;

      currentMap=Math.max(0,Math.min(MAPS.length-1,Number(save.map)||0));
      path=MAPS[currentMap].path;
      buildSpots=MAPS[currentMap].spots;

      state={
        started:!!save.started,gameOver:!!save.gameOver,won:!!save.won,
        wave:Number(save.wave)||0,gold:Number(save.gold)||250,lives:Number(save.lives)||20,
        towers:Array.isArray(save.towers)?save.towers:[],
        enemies:Array.isArray(save.enemies)?save.enemies:[],
        shots:[],particles:[],texts:[],selectedTower:null,
        selectedBuild:save.selectedBuild||"dart",
        traps:Array.isArray(save.traps)?save.traps:[],
        waveActive:!!save.waveActive,spawnLeft:Number(save.spawnLeft)||0,
        spawnTimer:Number(save.spawnTimer)||0,spawnTotal:Number(save.spawnTotal)||0,
        speed:Number(save.speed)||1,autoWave:!!save.autoWave,
        betweenTimer:Number(save.betweenTimer)||0,time:Number(save.time)||0,shake:0
      };

      state.towers=state.towers.filter(t=>TYPES[t.type]).map(t=>({
        type:t.type,x:Number(t.x),y:Number(t.y),level:Math.max(1,Math.min(5,Number(t.level)||1)),
        cooldown:Number(t.cooldown)||0,totalSpent:Number(t.totalSpent)||TYPES[t.type].cost,
        kills:Number(t.kills)||0,targetMode:t.targetMode||"furthest"
      }));
      state.traps=state.traps.filter(t=>Number.isFinite(Number(t.x))&&Number.isFinite(Number(t.y))).map(t=>({
        x:Number(t.x),y:Number(t.y),damage:Number(t.damage)||TYPES.trap.damage,life:Number(t.life)||TYPES.trap.trapLife,
        slow:Number(t.slow)||TYPES.trap.slow,slowTime:Number(t.slowTime)||TYPES.trap.slowTime,towerType:t.towerType||"trap",dead:false
      }));
      state.enemies=state.enemies.filter(e=>ENEMY[e.type]).map(e=>({
        type:e.type,x:Number(e.x),y:Number(e.y),distance:Number(e.distance)||0,
        hp:Number(e.hp),maxHp:Number(e.maxHp)||ENEMY[e.type].hp,
        speed:Number(e.speed)||ENEMY[e.type].speed,slow:Number(e.slow)||1,
        slowUntil:Number(e.slowUntil)||0,dead:false,progress:Number(e.progress)||0
      }));

      document.querySelectorAll(".map-card").forEach((b,i)=>b.classList.toggle("selected",i===currentMap));
      const label=document.getElementById("mapName");
      if(label)label.textContent=MAPS[currentMap].name;
      document.querySelectorAll(".tower-card").forEach(b=>b.classList.toggle("selected",b.dataset.tower===state.selectedBuild));
      const overlay=document.getElementById("startOverlay");
      if(overlay)overlay.classList.add("hidden");
      applyOfflineProgress(save.savedAt);
      updateUI();
      updateProgressionUI();
      if(offlineReport){
        const r=offlineReport;
        toast("AWAY PROGRESS  +$"+r.income+"  +"+r.xp+" XP"+(r.simulatedWaves?"  +"+r.simulatedWaves+" WAVES":""));
        offlineReport=null;
      }
      if(showMessage)toast("GAME LOADED");
      return true;
    }catch(error){
      console.warn("Towerd load failed:",error);
      return false;
    }
  }

  function clearSave(){
    try{
      localStorage.removeItem(SAVE_KEY);
      toast("SAVE DELETED");
      updateSaveButtons();
    }catch(error){console.warn("Towerd save delete failed:",error);}
  }

  function updateSaveButtons(){
    const load=document.getElementById("loadButton");
    const clear=document.getElementById("clearSaveButton");
    const exists=hasSavedGame();
    if(load)load.disabled=!exists;
    if(clear)clear.disabled=!exists;
  }

  function reset(){
    state={started:false,gameOver:false,won:false,wave:0,gold:startingGold(),lives:startingLives(),
      towers:[],traps:[],enemies:[],shots:[],particles:[],texts:[],selectedTower:null,
      selectedBuild:"dart",waveActive:false,spawnLeft:0,spawnTimer:0,spawnTotal:0,
      speed:1,autoWave:false,betweenTimer:0,time:0,shake:0};
    updateUI();
    updateSaveButtons();
  }
  reset();

  function selectMap(index){
    currentMap=Math.max(0,Math.min(MAPS.length-1,index));
    path=MAPS[currentMap].path;
    buildSpots=MAPS[currentMap].spots;
    reset();
    updateSaveButtons();
    document.querySelectorAll(".map-card").forEach((b,i)=>b.classList.toggle("selected",i===currentMap));
  }

  function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
  function lerp(a,b,t){return a+(b-a)*t;}
  function pointOnPath(distance){
    let left=distance;
    for(let i=0;i<path.length-1;i++){
      const a=path[i],b=path[i+1],len=dist(a,b);
      if(left<=len){const t=len?left/len:0;return{x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t)};}
      left-=len;
    }
    return {...path[path.length-1]};
  }
  function getPathLength(){return path.slice(1).reduce((s,p,i)=>s+dist(path[i],p),0);}

  function wavePlan(n){
    const total=8+Math.floor(n*2.3)+(n%5===0?1:0);
    const pool=["grunt","grunt","grunt","runner"];
    if(n>=3) pool.push("shield");
    if(n>=5) pool.push("tank");
    return {total,delay:Math.max(.24,.72-n*.012),pool};
  }
  function chooseEnemy(n){
    const plan=wavePlan(n), roll=Math.random();
    if(n%5===0 && state.spawnLeft===state.spawnTotal)return"boss";
    if(n>=8 && roll<.11)return"tank";
    if(n>=3 && roll<.27)return"shield";
    if(roll<.48)return"runner";
    return"grunt";
  }

  function startGame(){
    if(state.started&&!state.gameOver&&!state.won)return;
    state.started=true;
    state.gameOver=false;
    state.won=false;
    const overlay=document.getElementById("startOverlay");
    if(overlay)overlay.classList.add("hidden");
    startWave();
  }

  // Expose startup immediately so the HTML button still works even if a later
  // optional binding fails or the page is served from a cached copy.
  window.towerdStart=startGame;
  function startWave(){
    if(!state.started||state.gameOver||state.won||state.waveActive)return;
    if(state.wave>=100){win();return;}
    state.wave++;
    const p=wavePlan(state.wave);
    state.waveActive=true;state.spawnLeft=p.total;state.spawnTotal=p.total;state.spawnTimer=0;
    toast("WAVE "+state.wave);
    updateUI();
  }

  function spawnEnemy(){
    const type=chooseEnemy(state.wave), e=ENEMY[type];
    state.enemies.push({type,x:path[0].x,y:path[0].y,distance:0,hp:e.hp,maxHp:e.hp,
      speed:e.speed*(1+Math.min(.55,state.wave*.012)),slow:1,slowUntil:0,dead:false,progress:0});
  }

  function placeTower(x,y){
    if(!state.started||state.gameOver||state.won)return;
    const type=TYPES[state.selectedBuild];
    if(state.gold<type.cost){toast("NOT ENOUGH GOLD");return;}
    if(!isBuildable(x,y))return;
    const t={type:state.selectedBuild,x,y,level:1,cooldown:0,totalSpent:type.cost,kills:0,targetMode:"furthest"};
    state.gold-=type.cost;state.towers.push(t);state.selectedTower=t;
    burst(x,y,type.color,12);updateUI();
  }
  function isBuildable(x,y){
    if(x<28||y<28||x>W-28||y>H-28)return false;
    if(state.towers.some(t=>Math.hypot(x-t.x,y-t.y)<42))return false;
    for(let i=0;i<path.length-1;i++){
      const a=path[i],b=path[i+1];
      const dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy;
      const q=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/den));
      if(Math.hypot(x-(a.x+q*dx),y-(a.y+q*dy))<43)return false;
    }
    return true;
  }

  function nearestTarget(t){
    const def=TYPES[t.type];
    const levelScale=1+(t.level-1)*0.05;
    const mode=t.targetMode||"furthest";
    let best=null,bestScore=(mode==="weakest"||mode==="closest")?Infinity:-Infinity;
    for(const e of state.enemies){
      if(e.dead||dist(t,e)>def.range*levelScale)continue;
      let score;
      if(mode==="strongest")score=ENEMY[e.type].hp;
      else if(mode==="weakest")score=e.hp;
      else if(mode==="closest")score=dist(t,e);
      else score=e.progress;
      if((mode==="weakest"||mode==="closest")?score<bestScore:score>bestScore){best=e;bestScore=score;}
    }
    return best;
  }
  function nearestPathPoint(x,y){
    let best=null,bestD=Infinity;
    for(let i=0;i<path.length-1;i++){
      const a=path[i],b=path[i+1],dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy;
      const q=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/den));
      const p={x:a.x+q*dx,y:a.y+q*dy};
      const d=Math.hypot(x-p.x,y-p.y);
      if(d<bestD){bestD=d;best=p;}
    }
    return best;
  }
  function placeTrap(t){
    const def=TYPES.trap;
    const p=nearestPathPoint(t.x,t.y);
    if(!p||Math.hypot(t.x-p.x,t.y-p.y)>def.range)return false;
    if(state.traps.some(tr=>!tr.dead&&Math.hypot(tr.x-p.x,tr.y-p.y)<28))return false;
    state.traps.push({x:p.x,y:p.y,damage:def.damage*(1+(t.level-1)*.25),life:def.trapLife*(1+(t.level-1)*.15),slow:def.slow,slowTime:def.slowTime,towerType:"trap",dead:false});
    t.cooldown=def.rate*Math.pow(.94,t.level-1);
    burst(p.x,p.y,def.color,7);
    return true;
  }
  function updateTraps(dt){
    for(const trap of state.traps){
      if(trap.dead)continue;
      trap.life-=dt;
      if(trap.life<=0){trap.dead=true;continue;}
      for(const e of state.enemies){
        if(e.dead)continue;
        if(Math.hypot(e.x-trap.x,e.y-trap.y)<22){
          e.hp-=trap.damage;
          e.slow=trap.slow;e.slowUntil=state.time+trap.slowTime;
          trap.dead=true;
          burst(trap.x,trap.y,TYPES.trap.color,16);
          floatText(trap.x,trap.y-16,"SPIKE -"+Math.floor(trap.damage));
          if(e.hp<=0)killEnemy(e,null);
          break;
        }
      }
    }
    state.traps=state.traps.filter(t=>!t.dead);
  }

  function shoot(t,target){
    const def=TYPES[t.type];
    if(!def.damage||t.type==="trap")return;
    t.cooldown=def.rate*Math.pow(0.94,t.level-1);
    state.shots.push({x:t.x,y:t.y,target,tx:target.x,ty:target.y,speed:def.projectile,
      damage:def.damage*(1+(t.level-1)*0.25),tower:t,type:t.type,color:def.color,splash:def.splash||0,slow:def.slow||1,slowTime:def.slowTime||0});
    burst(t.x,t.y,def.color,2);
  }

  function hitShot(s){
    if(!s.target||s.target.dead)return;
    const e=s.target;
    e.hp-=s.damage;
    if(s.slow<1){e.slow=s.slow;e.slowUntil=state.time+s.slowTime;}
    if(s.splash){
      for(const other of state.enemies){
        if(other!==e&&!other.dead&&Math.hypot(other.x-e.x,other.y-e.y)<=s.splash){
          other.hp-=Math.floor(s.damage*.42);
          if(other.hp<=0)killEnemy(other,null);
        }
      }
      burst(e.x,e.y,s.color,14);state.shake=Math.max(state.shake,4);
    }else burst(e.x,e.y,s.color,4);
    if(e.hp<=0)killEnemy(e,s.tower);
  }

  function killEnemy(e,tower){
    if(e.dead)return;
    e.dead=true;state.gold+=ENEMY[e.type].reward;
    if(tower)tower.kills++;
    addXP(Math.max(1,Math.floor(ENEMY[e.type].reward*.75)));
    burst(e.x,e.y,ENEMY[e.type].color,10);
    floatText(e.x,e.y-18,"+$"+ENEMY[e.type].reward);
  }

  function update(dt){
    if(!state.started||state.gameOver||state.won)return;
    dt*=state.speed;state.time+=dt;
    if(state.betweenTimer>0){
      state.betweenTimer-=dt;
      if(state.betweenTimer<=0&&state.autoWave&&!state.waveActive&&!state.gameOver&&!state.won)startWave();
    }
    if(state.shake>0)state.shake=Math.max(0,state.shake-dt*15);

    if(state.waveActive){
      const p=wavePlan(state.wave);
      state.spawnTimer-=dt;
      if(state.spawnLeft>0&&state.spawnTimer<=0){spawnEnemy();state.spawnLeft--;state.spawnTimer=p.delay;}
    }

    for(const e of state.enemies){
      if(e.dead)continue;
      if(e.slowUntil<=state.time)e.slow=1;
      e.distance+=e.speed*e.slow*dt;e.progress=e.distance/getPathLength();
      const pos=pointOnPath(e.distance);e.x=pos.x;e.y=pos.y;
      if(e.distance>=getPathLength()){
        e.dead=true;state.lives--;state.shake=8;burst(e.x,e.y,"#ef4444",18);floatText(e.x,e.y,"-1 LIFE");
        if(state.lives<=0){lose();return;}
      }
    }

    for(const t of state.towers){
      t.cooldown=Math.max(0,t.cooldown-dt);
      const def=TYPES[t.type];
      if(def.income){
        if(t.cooldown<=0){
          const amount=Math.floor(def.income*(1+(t.level-1)*.25));
          state.gold+=amount;
          t.cooldown=def.rate*Math.pow(.94,t.level-1);
          floatText(t.x,t.y-24,"+$"+amount);
          burst(t.x,t.y,def.color,5);
        }
      }else if(t.type==="trap"){
        if(t.cooldown<=0)placeTrap(t);
      }else if(t.cooldown<=0){
        const target=nearestTarget(t);
        if(target)shoot(t,target);
      }
    }
    updateTraps(dt);

    for(const s of state.shots){
      if(!s.target||s.target.dead){s.dead=true;continue;}
      s.tx=s.target.x;s.ty=s.target.y;
      const d=Math.hypot(s.tx-s.x,s.ty-s.y),step=s.speed*dt;
      if(d<=step){s.x=s.tx;s.y=s.ty;hitShot(s);s.dead=true;}
      else{s.x+=(s.tx-s.x)*step/d;s.y+=(s.ty-s.y)*step/d;}
    }
    state.shots=state.shots.filter(s=>!s.dead);
    state.enemies=state.enemies.filter(e=>!e.dead);
    updateParticles(dt);updateTexts(dt);

    if(state.waveActive&&state.spawnLeft===0&&state.enemies.length===0){
      state.waveActive=false;
      const bonus=25+state.wave*3;state.gold+=bonus;
      addXP(20+state.wave*2);
      toast("WAVE CLEAR  +$"+bonus+"  +"+(20+state.wave*2)+" XP");
      if(state.wave>=100)win();
      else if(state.autoWave)state.betweenTimer=1.5;
    }
    updateUI();
  }

  function draw(){
    ctx.save();
    if(state.shake>0)ctx.translate((Math.random()-.5)*state.shake,(Math.random()-.5)*state.shake);
    drawMap();drawTraps();drawTowers();drawEnemies();drawShots();drawParticles();drawTexts();ctx.restore();
  }
  function drawMap(){
    ctx.fillStyle="#09111d";ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="rgba(148,163,184,.055)";ctx.lineWidth=1;
    for(let x=0;x<W;x+=36){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=36){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    ctx.lineCap="round";ctx.lineJoin="round";
    ctx.beginPath();ctx.moveTo(path[0].x,path[0].y);for(let i=1;i<path.length;i++)ctx.lineTo(path[i].x,path[i].y);
    ctx.strokeStyle="#172437";ctx.lineWidth=76;ctx.stroke();
    ctx.strokeStyle="#27364b";ctx.lineWidth=68;ctx.stroke();
    ctx.strokeStyle="#34455c";ctx.lineWidth=4;ctx.stroke();
    const start=path[0],end=path[path.length-1];
    ctx.fillStyle="#22c55e";ctx.beginPath();ctx.arc(start.x+30,start.y,13,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#ef4444";ctx.beginPath();ctx.arc(end.x-30,end.y,16,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff";ctx.font="700 10px system-ui";ctx.textAlign="center";ctx.fillText("IN",start.x+30,start.y+4);ctx.fillText("BASE",end.x-30,end.y+4);
  }
  function drawBuildSpots(){
    for(const [x,y] of buildSpots){
      if(state.towers.some(t=>Math.hypot(t.x-x,t.y-y)<25))continue;
      ctx.fillStyle="rgba(103,232,249,.09)";ctx.strokeStyle="rgba(103,232,249,.24)";
      ctx.beginPath();ctx.arc(x,y,21,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle="rgba(148,163,184,.55)";ctx.fillRect(x-3,y-3,6,6);
    }
  }
  const TOWER_LOGOS={
    dart:"•",cannon:"◆",frost:"❄",sniper:"⌁",machine:"≡",flame:"♨",tesla:"ϟ",poison:"☠",
    missile:"▲",railgun:"╋",mortar:"●",boomerang:"◖",laser:"—",plasma:"✦",crystal:"◇",
    shockwave:"◎",drone:"◆",bunker:"▣",chrono:"◷",gravity:"◉",meteor:"☄",bank:"$",trap:"✹"
  };

  function drawTowerLogo(t,d){
    const logo=TOWER_LOGOS[t.type]||"•";
    ctx.save();
    ctx.translate(t.x,t.y);
    ctx.fillStyle=d.color;
    ctx.strokeStyle=d.color;
    ctx.lineWidth=2.5;
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.font=t.type==="bank"?"900 17px system-ui":"900 16px system-ui";

    if(t.type==="dart"||t.type==="sniper"||t.type==="machine"||t.type==="railgun"||t.type==="laser"){
      ctx.lineWidth=t.type==="laser"?3:2.5;
      ctx.beginPath();ctx.moveTo(-8,7);ctx.lineTo(8,-7);ctx.stroke();
      ctx.beginPath();ctx.moveTo(8,-7);ctx.lineTo(2,-7);ctx.moveTo(8,-7);ctx.lineTo(8,-1);ctx.stroke();
      if(t.type==="machine"){ctx.beginPath();ctx.moveTo(-8,2);ctx.lineTo(5,-5);ctx.stroke();}
    }else if(t.type==="cannon"||t.type==="mortar"||t.type==="missile"||t.type==="meteor"){
      ctx.fillText(logo,0,0);
    }else if(t.type==="frost"||t.type==="crystal"||t.type==="plasma"||t.type==="tesla"||t.type==="chrono"||t.type==="gravity"||t.type==="shockwave"){
      ctx.fillText(logo,0,0);
    }else if(t.type==="flame"||t.type==="poison"||t.type==="boomerang"||t.type==="drone"||t.type==="bunker"||t.type==="bank"){
      ctx.fillText(logo,0,0);
    }else{
      ctx.fillText(logo,0,0);
    }
    ctx.restore();
  }

  function drawTraps(){
    for(const tr of state.traps){
      const alpha=Math.max(.18,Math.min(1,tr.life/(TYPES.trap.trapLife*1.5)));
      ctx.save();
      ctx.globalAlpha=alpha;
      ctx.translate(tr.x,tr.y);
      ctx.strokeStyle=TYPES.trap.color;
      ctx.fillStyle="#18212e";
      ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();ctx.stroke();
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4;
        ctx.beginPath();ctx.moveTo(Math.cos(a)*5,Math.sin(a)*5);ctx.lineTo(Math.cos(a)*13,Math.sin(a)*13);ctx.stroke();
      }
      ctx.restore();
    }
  }
  function drawTowers(){
    for(const t of state.towers){
      const d=TYPES[t.type],selected=t===state.selectedTower;
      if(selected){
        ctx.strokeStyle="rgba(103,232,249,.25)";ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(t.x,t.y,d.range,0,Math.PI*2);ctx.stroke();
      }

      ctx.fillStyle="#0f172a";ctx.strokeStyle=d.color;ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(t.x,t.y,20,0,Math.PI*2);ctx.fill();ctx.stroke();

      drawTowerLogo(t,d);

      const target=nearestTarget(t);
      if(target&&d.damage>0){
        ctx.strokeStyle=d.color;ctx.lineWidth=t.type==="laser"?4:3;
        ctx.lineCap="round";ctx.beginPath();
        ctx.moveTo(t.x,t.y);
        ctx.lineTo(t.x+(target.x-t.x)*.36,t.y+(target.y-t.y)*.36);
        ctx.stroke();
      }

      for(let i=0;i<t.level;i++){
        ctx.fillStyle=d.color;ctx.fillRect(t.x-10+i*7,t.y+24,5,3);
      }
    }
  }

  function drawEnemies(){
    for(const e of state.enemies){
      const d=ENEMY[e.type];
      ctx.fillStyle="rgba(0,0,0,.25)";ctx.beginPath();ctx.ellipse(e.x,e.y+10,d.r*1.1,5,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=d.color;ctx.beginPath();ctx.arc(e.x,e.y,d.r,0,Math.PI*2);ctx.fill();
      if(e.type==="tank"){ctx.strokeStyle="#e9d5ff";ctx.lineWidth=2;ctx.stroke();}
      if(e.type==="shield"){ctx.strokeStyle="#e0f2fe";ctx.lineWidth=3;ctx.stroke();}
      if(e.type==="boss"){ctx.strokeStyle="#fecdd3";ctx.lineWidth=4;ctx.stroke();ctx.fillStyle="#fff";ctx.font="700 9px system-ui";ctx.textAlign="center";ctx.fillText("BOSS",e.x,e.y+3);}
      const barW=d.r*2.5;
      ctx.fillStyle="rgba(0,0,0,.5)";ctx.fillRect(e.x-barW/2,e.y-d.r-9,barW,4);
      ctx.fillStyle=e.hp/e.maxHp>.5?"#4ade80":e.hp/e.maxHp>.25?"#facc15":"#f87171";
      ctx.fillRect(e.x-barW/2,e.y-d.r-9,barW*Math.max(0,e.hp/e.maxHp),4);
      if(e.slow<1){ctx.strokeStyle="rgba(165,180,252,.8)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,d.r+4,0,Math.PI*2);ctx.stroke();}
    }
  }
  function drawShots(){
    for(const s of state.shots){ctx.fillStyle=s.color;ctx.shadowBlur=10;ctx.shadowColor=s.color;ctx.beginPath();ctx.arc(s.x,s.y,s.type==="cannon"?5:3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  }
  function burst(x,y,color,n){
    for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=30+Math.random()*100;state.particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.35+Math.random()*.45,max:.8,color,size:2+Math.random()*3});}
  }
  function updateParticles(dt){for(const p of state.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97;p.life-=dt;}state.particles=state.particles.filter(p=>p.life>0);}
  function drawParticles(){for(const p of state.particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);}ctx.globalAlpha=1;}
  function floatText(x,y,text){state.texts.push({x,y,text,life:.9});}
  function updateTexts(dt){for(const t of state.texts){t.y-=20*dt;t.life-=dt;}state.texts=state.texts.filter(t=>t.life>0);}
  function drawTexts(){ctx.textAlign="center";ctx.font="700 13px system-ui";for(const t of state.texts){ctx.globalAlpha=t.life;ctx.fillStyle="#fff";ctx.fillText(t.text,t.x,t.y);}ctx.globalAlpha=1;}

  function canvasPos(ev){const r=canvas.getBoundingClientRect();return{x:(ev.clientX-r.left)*W/r.width,y:(ev.clientY-r.top)*H/r.height};}
  canvas.addEventListener("click",e=>{
    const p=canvasPos(e);
    const tower=[...state.towers].reverse().find(t=>Math.hypot(t.x-p.x,t.y-p.y)<24);
    if(tower){state.selectedTower=tower;updateUI();return;}
    if(state.selectedTower){state.selectedTower=null;updateUI();}
    placeTower(p.x,p.y);
  });
  canvas.addEventListener("mousemove",e=>{const p=canvasPos(e);canvas.style.cursor=state.towers.some(t=>Math.hypot(t.x-p.x,t.y-p.y)<24)?"pointer":(isBuildable(p.x,p.y)?"crosshair":"not-allowed");});

  document.querySelectorAll(".map-card").forEach(btn=>btn.addEventListener("click",()=>{
    selectMap(Number(btn.dataset.map));
    const label=document.getElementById("mapName");
    if(label)label.textContent=MAPS[currentMap].name;
  }));
  document.querySelectorAll(".tower-card").forEach(btn=>btn.addEventListener("click",()=>{
    state.selectedBuild=btn.dataset.tower;document.querySelectorAll(".tower-card").forEach(b=>b.classList.toggle("selected",b===btn));state.selectedTower=null;updateUI();
  }));
  const startButton=document.getElementById("startButton");
  if(startButton)startButton.addEventListener("click",startGame);
  const saveButton=document.getElementById("saveButton");
  if(saveButton)saveButton.addEventListener("click",()=>saveGame(true));
  const loadButton=document.getElementById("loadButton");
  if(loadButton)loadButton.addEventListener("click",()=>loadGame(true));
  const clearSaveButton=document.getElementById("clearSaveButton");
  if(clearSaveButton)clearSaveButton.addEventListener("click",clearSave);
  updateSaveButtons();
  document.getElementById("waveButton").onclick=()=>state.started&&!state.waveActive?startWave():null;
  document.getElementById("upgradeButton").onclick=upgrade;
  document.getElementById("sellButton").onclick=sell;
  document.getElementById("targetMode").onchange=e=>{if(state.selectedTower&&TYPES[state.selectedTower.type].damage){state.selectedTower.targetMode=e.target.value;updateUI();}};
  document.getElementById("speedButton").onclick=()=>{state.speed=state.speed===1?2:state.speed===2?3:1;document.getElementById("speedButton").textContent=state.speed+"× SPEED";};
  document.getElementById("autoWaveButton").onclick=()=>{
    state.autoWave=!state.autoWave;
    document.getElementById("autoWaveButton").textContent=state.autoWave?"AUTO WAVES: ON":"AUTO WAVES: OFF";
    document.getElementById("autoWaveButton").classList.toggle("active",state.autoWave);
    if(state.autoWave&&!state.waveActive&&state.started&&state.wave<100)state.betweenTimer=.5;
  };
  window.addEventListener("keydown",e=>{
    if(e.key==="1")selectBuild("dart");if(e.key==="2")selectBuild("cannon");if(e.key==="3")selectBuild("frost");
    if(e.code==="Space"){e.preventDefault();if(!state.started)startGame();else if(!state.waveActive)startWave();}
    if(e.key==="Escape"){state.selectedTower=null;updateUI();}
    if(e.key.toLowerCase()==="r"&&state.gameOver){reset();startGame();}
  });
  function selectBuild(type){state.selectedBuild=type;document.querySelectorAll(".tower-card").forEach(b=>b.classList.toggle("selected",b.dataset.tower===type));}
  function upgrade(){
    const t=state.selectedTower;if(!t)return;const cost=Math.floor(TYPES[t.type].cost*(.72+t.level*.46));
    if(t.level>=5){toast("MAX LEVEL");return;}if(state.gold<cost){toast("NOT ENOUGH GOLD");return;}
    state.gold-=cost;t.level++;t.totalSpent+=cost;burst(t.x,t.y,TYPES[t.type].color,18);updateUI();
  }
  function sell(){
    const t=state.selectedTower;if(!t)return;const value=Math.floor(t.totalSpent*.68);state.gold+=value;state.towers=state.towers.filter(x=>x!==t);state.selectedTower=null;burst(t.x,t.y,"#fbbf24",12);updateUI();
  }

  function updateUI(){
    document.getElementById("waveValue").textContent=state.wave;
    document.getElementById("goldValue").textContent=state.gold;
    document.getElementById("livesValue").textContent=state.lives;
    const t=state.selectedTower,info=document.getElementById("towerInfo"),up=document.getElementById("upgradeButton"),sellBtn=document.getElementById("sellButton"),targetSelect=document.getElementById("targetMode");
    if(t){
      const d=TYPES[t.type],cost=Math.floor(d.cost*(.72+t.level*.46));
      info.innerHTML="<b>"+d.name+" · Lv."+t.level+"</b><span>"+d.desc+"<br>Damage "+(d.damage?Math.floor(d.damage*(1+(t.level-1)*.25)):"—")+" · Range "+Math.floor(d.range*(1+(t.level-1)*.05))+" · Kills "+t.kills+"</span>";
      targetSelect.disabled=!d.damage;targetSelect.value=t.targetMode||"furthest";
      up.disabled=t.level>=5||state.gold<cost;document.getElementById("upgradeCost").textContent=t.level>=5?"MAX":"$"+cost;
      sellBtn.disabled=false;document.getElementById("sellValue").textContent="$"+Math.floor(t.totalSpent*.68);
    }else{
      info.innerHTML="<b>No tower selected</b><span>Choose a build type, then click anywhere off the road to build.</span>";
      up.disabled=true;sellBtn.disabled=true;targetSelect.disabled=true;targetSelect.value="furthest";document.getElementById("upgradeCost").textContent="$—";document.getElementById("sellValue").textContent="$—";
    }
    const progress=state.spawnTotal?Math.min(1,1-(state.spawnLeft/state.spawnTotal)):(state.waveActive?0:1);
    document.getElementById("waveProgressBar").style.width=(progress*100)+"%";
    updateProgressionUI();
    const wb=document.getElementById("waveButton");wb.textContent=state.waveActive?"WAVE IN PROGRESS":state.wave>=100?"COMPLETE":"START WAVE";wb.disabled=state.waveActive||state.wave>=100;
  }

  let toastTimer=0;
  function toast(msg){const el=document.getElementById("message");el.textContent=msg;el.classList.remove("hidden");toastTimer=1.5;}
  function overlayResult(title,body,button){
    const o=document.getElementById("startOverlay");o.classList.remove("hidden");
    o.innerHTML='<div class="panel hero-panel"><div class="eyebrow">TOWERD</div><h1>'+title+'</h1><p>'+body+'</p><button id="resultButton" class="primary">'+button+'</button></div>';
    document.getElementById("resultButton").onclick=()=>{reset();startGame();};
  }
  function lose(){state.gameOver=true;state.waveActive=false;overlayResult("Defense breached.","Your base was overrun on wave "+state.wave+". Rebuild your defense and try again.","RESTART");}
  function win(){state.won=true;state.waveActive=false;overlayResult("You held the line.","One hundred waves defeated. The base is secure.","PLAY AGAIN");}

  let last=performance.now();
  function frame(now){
    const raw=Math.min(.05,(now-last)/1000);
    last=now;
    saveTimer+=raw;
    if(saveTimer>=2){
      saveTimer=0;
      if(state.started&&!state.gameOver&&!state.won)saveGame(false);
    }
    if(toastTimer>0){toastTimer-=raw;if(toastTimer<=0)document.getElementById("message").classList.add("hidden");}update(raw);draw();requestAnimationFrame(frame);}
  window.addEventListener("pagehide",()=>{if(state&&state.started&&!state.gameOver&&!state.won)saveGame(false);});
  requestAnimationFrame(frame);
})();
