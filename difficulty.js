/* Towerd difficulty layer */
(() => {
  "use strict";
  const KEY="towerd-difficulty-v1";
  const DIFFICULTIES={
    easy:{name:"Easy",hp:1,speed:1,count:1,elite:0,description:"The current ruleset. A forgiving 100-wave campaign."},
    normal:{name:"Normal",hp:2,speed:1.12,count:1.10,elite:.18,description:"2× enemy health, faster enemies, and 10% more bodies."},
    hard:{name:"Hard",hp:4,speed:1.28,count:1.22,elite:.32,description:"4× enemy health, 28% more speed, and 22% more enemies."},
    extreme:{name:"Extreme",hp:8,speed:1.48,count:1.38,elite:.48,description:"8× enemy health, brutal speed, dense waves, heavier elites."},
    impossible:{name:"Impossible",hp:16,speed:1.72,count:1.55,elite:.65,description:"16× enemy health, extreme speed, and 55% more enemies."}
  };
  const enemyTypes=new Set(["grunt","runner","tank","shield","boss"]);
  let fractionalEnemies=0;

  function difficulty(){
    const key=localStorage.getItem(KEY)||"easy";
    return DIFFICULTIES[key]||DIFFICULTIES.easy;
  }

  function buildDifficultyPicker(){
    if(document.getElementById("difficultyPicker"))return;
    const hero=document.querySelector("#startOverlay .hero-panel");
    const mapPicker=hero&&hero.querySelector(".map-picker");
    if(!hero||!mapPicker)return;

    const wrap=document.createElement("div");
    wrap.id="difficultyPicker";
    wrap.className="difficulty-picker";

    const title=document.createElement("div");
    title.className="map-picker-title";
    title.innerHTML="<span>DIFFICULTY</span><b>CHOOSE YOUR PAIN</b>";

    const select=document.createElement("select");
    select.id="difficultySelect";
    select.className="difficulty-select";

    for(const [key,d] of Object.entries(DIFFICULTIES)){
      const option=document.createElement("option");
      option.value=key;
      option.textContent=d.name+" — "+d.hp+"× HP";
      select.appendChild(option);
    }

    const saved=localStorage.getItem(KEY)||"easy";
    select.value=DIFFICULTIES[saved]?saved:"easy";

    const note=document.createElement("small");
    note.id="difficultyNote";
    note.className="difficulty-note";

    const refresh=()=>{
      const d=DIFFICULTIES[select.value];
      note.textContent=d.description+" • HP ×"+d.hp+" • speed ×"+d.speed.toFixed(2)+" • enemies ×"+d.count.toFixed(2);
    };

    select.addEventListener("change",()=>{
      localStorage.setItem(KEY,select.value);
      fractionalEnemies=0;
      refresh();
    });

    wrap.append(title,select,note);
    hero.insertBefore(wrap,mapPicker);
    refresh();
  }

  const nativePush=Array.prototype.push;
  Array.prototype.push=function(...items){
    const d=difficulty();
    const processed=[];
    for(const item of items){
      if(item&&typeof item==="object"&&enemyTypes.has(item.type)&&Number.isFinite(item.hp)&&Number.isFinite(item.maxHp)&&Number.isFinite(item.speed)&&Number.isFinite(item.distance)&&Number.isFinite(item.progress)){
        item.hp=Math.max(1,Math.floor(item.hp*d.hp));
        item.maxHp=item.hp;
        item.speed*=d.speed;
        processed.push(item);

        fractionalEnemies+=d.count-1;
        const extraCount=Math.floor(fractionalEnemies);
        fractionalEnemies-=extraCount;

        for(let i=0;i<extraCount;i++){
          processed.push({...item,dead:false});
        }
      }else{
        processed.push(item);
      }
    }
    return nativePush.apply(this,processed);
  };

  const nativeRandom=Math.random;
  Math.random=function(){
    const value=nativeRandom();
    const d=difficulty();
    if(d.elite<=0)return value;
    const stack=new Error().stack||"";
    if(stack.includes("chooseEnemy"))return Math.pow(value,1+d.elite);
    return value;
  };

  const style=document.createElement("style");
  style.textContent=".difficulty-picker{margin:12px 0 14px;padding:11px;background:#0d131e;border:1px solid #222c3c;border-radius:9px}.difficulty-select{width:100%;padding:9px 10px;border:1px solid #34445c;border-radius:7px;background:#111a28;color:#f8fafc;font:800 12px system-ui;outline:none}.difficulty-select:focus{border-color:#67e8f9}.difficulty-note{display:block;margin-top:7px;color:#718096;font-size:9px;line-height:1.45}";
  document.head.appendChild(style);
  buildDifficultyPicker();
  if(!document.getElementById("difficultyPicker"))setTimeout(buildDifficultyPicker,0);
})();
