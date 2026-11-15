import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91b9c0);
scene.fog = new THREE.Fog(0x91b9c0, 45, 190);
const camera = new THREE.PerspectiveCamera(62, innerWidth/innerHeight, .1, 350);
camera.position.set(0, 6.4, 11.5);
camera.lookAt(0, 1, -12);
const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
$('game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xe8f8ff,0x69705b,2.0));
const sun = new THREE.DirectionalLight(0xfff0d3,2.2); sun.position.set(-25,35,15); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);

const mat=(color,roughness=.85)=>new THREE.MeshStandardMaterial({color,roughness});
const asphalt=mat(0x343a3c), sand=mat(0xc4a16d), white=mat(0xf2ead5), dark=mat(0x18232a), glass= new THREE.MeshStandardMaterial({color:0x8bc3d1,roughness:.2,metalness:.15});
const road = new THREE.Mesh(new THREE.PlaneGeometry(16,260),asphalt); road.rotation.x=-Math.PI/2; road.position.set(0,-.08,-95); road.receiveShadow=true; scene.add(road);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(500,300),sand); ground.rotation.x=-Math.PI/2; ground.position.set(0,-.15,-100); scene.add(ground);\n// Corniche scenery: sea strip and promenade, hidden on the desert highway.\nconst sea=new THREE.Mesh(new THREE.PlaneGeometry(65,300),new THREE.MeshStandardMaterial({color:0x168eae,roughness:.28,metalness:.08})); sea.rotation.x=-Math.PI/2; sea.position.set(-47,-.12,-100); sea.visible=false; scene.add(sea);\nconst promenade=new THREE.Mesh(new THREE.BoxGeometry(5,.18,300),mat(0xd8c7a1)); promenade.position.set(-13,-.02,-100); promenade.visible=false; scene.add(promenade);\nconst seaLine=new THREE.Mesh(new THREE.BoxGeometry(.35,.25,300),mat(0xf3eee0)); seaLine.position.set(-15.5,.08,-100); seaLine.visible=false; scene.add(seaLine);
const laneMarks=[];
for(let z=18;z>-230;z-=10){for(let x of [-2.65,2.65]){const m=new THREE.Mesh(new THREE.BoxGeometry(.13,.025,4.8),white);m.position.set(x,.01,z);scene.add(m);laneMarks.push(m)}}
for(let x of [-7.8,7.8]){const line=new THREE.Mesh(new THREE.BoxGeometry(.16,.03,260),white);line.position.set(x,.01,-95);scene.add(line)}
// Distant roadside desert, palms, signs and buildings.
const scenery=[];
function palm(x,z,scale=1){const g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12*scale,.2*scale,3.5*scale,7),mat(0x795638));trunk.position.y=1.75*scale;g.add(trunk);for(let i=0;i<7;i++){let leaf=new THREE.Mesh(new THREE.ConeGeometry(.22*scale,2.3*scale,5),mat(0x426b48));leaf.position.set(Math.sin(i*Math.PI/3.5)*.75*scale,3.3*scale,Math.cos(i*Math.PI/3.5)*.75*scale);leaf.rotation.z=Math.cos(i*Math.PI/3.5)*.8;leaf.rotation.x=Math.sin(i*Math.PI/3.5)*.8;g.add(leaf)}g.position.set(x,0,z);scene.add(g);scenery.push(g)}
for(let z=15;z>-230;z-=27){palm(-11,z,.8);palm(11,z-10,.9)}
function sign(x,z,label){const g=new THREE.Group();let pole=new THREE.Mesh(new THREE.BoxGeometry(.15,3,.15),dark);pole.position.y=1.5;g.add(pole);let board=new THREE.Mesh(new THREE.BoxGeometry(3.5,1.05,.16),mat(0x17634f));board.position.y=3.05;g.add(board);let canvas=document.createElement('canvas');canvas.width=512;canvas.height=150;let c=canvas.getContext('2d');c.fillStyle='#17634f';c.fillRect(0,0,512,150);c.fillStyle='white';c.font='bold 46px Arial';c.textAlign='center';c.fillText(label,256,92);let tex=new THREE.CanvasTexture(canvas);let face=new THREE.Mesh(new THREE.PlaneGeometry(3.35,.95),new THREE.MeshBasicMaterial({map:tex}));face.position.set(0,3.05,.09);g.add(face);g.position.set(x,0,z);scene.add(g);scenery.push(g)}
sign(-10,-36,'الإسكندرية ←');sign(10,-112,'طريق القاهرة');

let player, playerColor=0xe84d35, tint=0.25, carIndex=0, currentMap='desert';
const owned=new Set([0]); let money=250, totalCoins=0, distance=0, speed=0, running=false, paused=false, crashed=false;
const cars=[
 {name:'فيات 128',emoji:'🚗',price:0,color:0xd94c3d,acc:1},
 {name:'لانسر',emoji:'🚙',price:350,color:0x265a87,acc:1.08},
 {name:'هيونداي إلنترا',emoji:'🚘',price:700,color:0xdddddc,acc:1.12},
 {name:'نص نقل',emoji:'🛻',price:950,color:0xdaa94c,acc:.94},
 {name:'كوبيه رياضية',emoji:'🏎️',price:1500,color:0x7a44a8,acc:1.3}
];
function makeCar(color=playerColor,type='sedan',isPlayer=false){
 const g=new THREE.Group(); const bodyMat=mat(color,.45), tireMat=mat(0x101316,.95), hub=mat(0xb7c4c7,.35);
 const body=new THREE.Mesh(new THREE.BoxGeometry(type==='pickup'?2.0:1.9,.65,type==='tuktuk'?2.1:3.4),bodyMat);body.position.y=.75;body.castShadow=true;g.add(body);
 if(type!=='tuktuk'){
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.55,.72,type==='pickup'?1.65:1.8),new THREE.MeshStandardMaterial({color:0x243c4b,roughness:.22,metalness:.1}));cabin.position.set(0,1.38,-.15);cabin.castShadow=true;g.add(cabin);
  const windshield=new THREE.Mesh(new THREE.BoxGeometry(1.42,.48,.035),new THREE.MeshStandardMaterial({color:0x8bbac7,roughness:.18,transparent:true,opacity:.48}));windshield.position.set(0,1.42,.78);g.add(windshield);
  if(type==='pickup'){const bed=new THREE.Mesh(new THREE.BoxGeometry(1.75,.25,1.25),mat(0x514b40));bed.position.set(0,1.1,-1.05);g.add(bed)}
 } else {const roof=new THREE.Mesh(new THREE.BoxGeometry(1.6,.12,1.2),mat(0x222b2c));roof.position.set(0,1.8,-.1);g.add(roof);const windshield=new THREE.Mesh(new THREE.BoxGeometry(1.4,.55,.04),glass);windshield.position.set(0,1.35,.55);g.add(windshield)}
 for(const x of [-.92,.92])for(const z of [-1.05,1.05]){let w=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.18,14),tireMat);w.rotation.z=Math.PI/2;w.position.set(x,.4,z);w.castShadow=true;g.add(w);let h=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.19,12),hub);h.rotation.z=Math.PI/2;h.position.copy(w.position);g.add(h)}
 // Egyptian-style white plate with Arabic numerals/letters, visual prop.
 const plate=new THREE.Mesh(new THREE.BoxGeometry(.75,.22,.035),mat(0xf5f2e8));plate.position.set(0,.72,1.73);g.add(plate);
 const pcan=document.createElement('canvas');pcan.width=256;pcan.height=72;const pctx=pcan.getContext('2d');pctx.fillStyle='#f8f7ed';pctx.fillRect(0,0,256,72);pctx.fillStyle='#142a42';pctx.font='bold 30px Arial';pctx.textAlign='center';pctx.fillText('مصر  ١٢٣٤',128,47);const pt=new THREE.CanvasTexture(pcan);const pn=new THREE.Mesh(new THREE.PlaneGeometry(.7,.18),new THREE.MeshBasicMaterial({map:pt}));pn.position.set(0,.72,1.752);g.add(pn);
 if(isPlayer){g.userData.bodyMaterial=bodyMat;g.userData.cabin=cabinRef(g);g.userData.tintMeshes=[];g.traverse(o=>{if(o.isMesh && o.material && o.material.color && o.material.color.getHex()===0x243c4b)g.userData.tintMeshes.push(o)})}
 return g;
}
function cabinRef(g){return g.children.find(o=>o.geometry?.type==='BoxGeometry'&&o.position.y>1.2)}
function makePlayer(){if(player)scene.remove(player);let type=carIndex===3?'pickup':'sedan';player=makeCar(cars[carIndex].color,type,true);player.position.set(0,0,4);scene.add(player);applyTint()}
makePlayer();
function applyTint(){if(!player)return;player.traverse(o=>{if(o.isMesh&&o.position.y>1.2&&o.material?.color){o.material.color.set(tint>.7?0x070b10:tint>.4?0x26313a:0x547987);o.material.transparent=tint>.35;o.material.opacity=1-tint*.38}})}
const traffic=[], coins=[];
function spawnTraffic(){const lane=[-5.3,-2.65,0,2.65,5.3][Math.floor(Math.random()*5)];let r=Math.random();let type=r<.22?'tuktuk':r<.45?'pickup':'sedan';let color=[0xd9d9d1,0x246b9b,0xc94d37,0xd4a63f,0x4d6652][Math.floor(Math.random()*5)];let v=makeCar(color,type);v.position.set(lane,0,-145);v.userData.type=type;v.userData.speed=type==='tuktuk'?10+Math.random()*5:13+Math.random()*10;scene.add(v);traffic.push(v)}
function spawnCoin(){let m=new THREE.Mesh(new THREE.TorusGeometry(.42,.13,8,16),mat(0xffd166,.3));m.position.set([-5.3,-2.65,0,2.65,5.3][Math.floor(Math.random()*5)],1,-145);m.rotation.x=Math.PI/2;m.userData.spin=true;scene.add(m);coins.push(m)}
let spawnTimer=0,coinTimer=0;
const keys={left:false,right:false};
function steer(dir){if(!running||paused)return;player.position.x=THREE.MathUtils.clamp(player.position.x+dir*1.1,-6.1,6.1);playBeep(210+dir*50,.045)}
addEventListener('keydown',e=>{if(['ArrowLeft','a','A'].includes(e.key))keys.left=true;if(['ArrowRight','d','D'].includes(e.key))keys.right=true;if(e.key==='Escape')togglePause()});
addEventListener('keyup',e=>{if(['ArrowLeft','a','A'].includes(e.key))keys.left=false;if(['ArrowRight','d','D'].includes(e.key))keys.right=false});
$('leftBtn').addEventListener('pointerdown',e=>{e.preventDefault();keys.left=true});$('leftBtn').addEventListener('pointerup',()=>keys.left=false);$('rightBtn').addEventListener('pointerdown',e=>{e.preventDefault();keys.right=true});$('rightBtn').addEventListener('pointerup',()=>keys.right=false);
let touchX=null;renderer.domElement.addEventListener('pointerdown',e=>touchX=e.clientX);renderer.domElement.addEventListener('pointerup',e=>{if(touchX!==null&&Math.abs(e.clientX-touchX)>22)steer(e.clientX>touchX?1:-1);touchX=null});
let audioCtx=null, soundOn=true;
function playBeep(freq=320,duration=.08){if(!soundOn)return;try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();let o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.045,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration)}catch(e){}}
function honk(){playBeep(390,.18);setTimeout(()=>playBeep(310,.16),100)}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),1800)}
function updateWallet(){$('money').textContent=money}
function start(){ $('startScreen').classList.add('hidden');running=true;paused=false;crashed=false;distance=0;speed=0;spawnTimer=0;coinTimer=0;last=performance.now();toast('يلا بينا… خليك مركز!');}
$('startBtn').onclick=()=>{start();audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();honk()};
function togglePause(){if(!running)return;paused=!paused;$('pauseScreen').classList.toggle('hidden',!paused)}
$('pauseBtn').onclick=togglePause;$('resumeBtn').onclick=()=>{paused=false;$('pauseScreen').classList.add('hidden')};
function endGame(){running=false;crashed=true;money+=Math.floor(distance/100);updateWallet();$('resultText').textContent=`قطعت ${(distance/1000).toFixed(1)} كم — مكافأة ${Math.floor(distance/100)} جنيه`; $('gameOver').classList.remove('hidden');honk()}
$('restartBtn').onclick=()=>{$('pauseScreen').classList.add('hidden');resetWorld();start()};
$('againBtn').onclick=()=>{$('gameOver').classList.add('hidden');resetWorld();start()};
function resetWorld(){traffic.forEach(o=>scene.remove(o));coins.forEach(o=>scene.remove(o));traffic.length=0;coins.length=0;player.position.set(0,0,4)}
function setMap(map){currentMap=map;const bySea=map==='corniche';sea.visible=bySea;promenade.visible=bySea;seaLine.visible=bySea;ground.material=bySea?mat(0xc9b18a):sand;scene.background.set(bySea?0x77b9ce:0x91b9c0);scene.fog.color.set(bySea?0x77b9ce:0x91b9c0);toast(bySea?'فتحت طريق كورنيش إسكندرية! 🌊':'رجعنا لطريق مصر–إسكندرية')}
function buildPanel(kind){
 const panel=$('menuPanel'),content=$('panelContent');panel.classList.remove('hidden');let title='';
 if(kind==='garage'){title='الجراج والتعديل';content.innerHTML=`<div class="custom-row"><label>لون العربية</label><input id="paint" type="color" value="#${cars[carIndex].color.toString(16).padStart(6,'0')}"></div><div class="custom-row"><label>تضليل الزجاج</label><input id="tint" type="range" min="0" max="100" value="${Math.round(tint*100)}"></div><div class="custom-row"><label>العربية الحالية</label><b>${cars[carIndex].name}</b></div><button class="action-btn" id="hornBtn">جرّب الكلاكس المصري 📢</button>`;setTimeout(()=>{$('paint').oninput=e=>{player.userData.bodyMaterial.color.set(e.target.value)};$('tint').oninput=e=>{tint=e.target.value/100;applyTint()};$('hornBtn').onclick=honk},0)}
 if(kind==='shop'){title='معرض العربيات';content.innerHTML='<div class="shop-grid">'+cars.map((c,i)=>`<div class="shop-item"><div class="car-icon">${c.emoji}</div><b>${c.name}</b><small>${c.price===0?'متاحة معاك':c.price+' جنيه'}</small><button data-car="${i}" ${owned.has(i)?'':' '}>${owned.has(i)?(carIndex===i?'مختارة':'اختارها'):'شراء'}</button></div>`).join('')+'</div>';setTimeout(()=>content.querySelectorAll('[data-car]').forEach(b=>b.onclick=()=>{let i=+b.dataset.car,c=cars[i];if(!owned.has(i)){if(money<c.price){toast('فلوسك مش كفاية… اجمع عملات أكتر');return}money-=c.price;owned.add(i);updateWallet();toast('مبروك! العربية بقت ملكك 🚘')}carIndex=i;playerColor=c.color;makePlayer();buildPanel('shop')}),0)}
 if(kind==='maps'){title='اختار الطريق';content.innerHTML=`<div class="map-option"><div><b>طريق مصر–إسكندرية الصحراوي</b><small>الطريق الأساسي — مجاني</small></div><button id="desertMap">العب</button></div><div class="map-option"><div><b>كورنيش إسكندرية 🌊</b><small>منظر البحر وممشى الكورنيش — 300 جنيه</small></div><button id="seaMap" ${currentMap==='corniche'?'disabled':''}>${currentMap==='corniche'?'مفتوح': 'افتح الطريق'}</button></div>`;setTimeout(()=>{$('desertMap').onclick=()=>{setMap('desert');panel.classList.add('hidden')};$('seaMap').onclick=()=>{if(money<300){toast('اجمع 300 جنيه عشان تفتح الكورنيش');return}money-=300;updateWallet();setMap('corniche');$('seaMap').disabled=true;$('seaMap').textContent='مفتوح'},0)}
 if(kind==='sound'){title='الصوت والمؤثرات';content.innerHTML=`<div class="custom-row"><label>المؤثرات الصوتية</label><button class="action-btn" id="soundToggle">${soundOn?'شغالة 🔊':'مقفولة 🔇'}</button></div><p style="font-size:12px;color:#bdcbd0;line-height:1.9">اللعبة فيها كلاكس وتنبيهات وأصوات إلكترونية مولّدة داخل المتصفح. أضف ملفات موسيقى تملك حق استخدامها داخل مجلد assets لو حابب تشغّل مهرجاناتك المفضلة.</p>`;setTimeout(()=>$('soundToggle').onclick=()=>{soundOn=!soundOn;$('soundToggle').textContent=soundOn?'شغالة 🔊':'مقفولة 🔇';playBeep()},0)}
 $('panelTitle').textContent=title;
}
document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>buildPanel(b.dataset.panel));
document.querySelector('[data-close]').onclick=()=>$('menuPanel').classList.add('hidden');

let last=performance.now(),accum=0;
function animate(now){requestAnimationFrame(animate);let dt=Math.min((now-last)/1000,.04);last=now;
 if(running&&!paused){
  speed=THREE.MathUtils.lerp(speed,92,.018);distance+=speed*dt/3.6*10;
  if(keys.left)player.position.x=Math.max(-6.1,player.position.x-8*dt);if(keys.right)player.position.x=Math.min(6.1,player.position.x+8*dt);
  player.rotation.z=THREE.MathUtils.lerp(player.rotation.z,keys.left?.12:keys.right?-.12:0,.12);
  accum+=dt*speed/11;
  laneMarks.forEach(m=>{m.position.z+=speed*dt*.55;if(m.position.z>22)m.position.z-=250});
  scenery.forEach(s=>{s.position.z+=speed*dt*.45;if(s.position.z>28)s.position.z-=255});
  spawnTimer+=dt;coinTimer+=dt;if(spawnTimer>1.05){spawnTraffic();spawnTimer=0}if(coinTimer>2.6){spawnCoin();coinTimer=0}
  traffic.forEach((o,i)=>{o.position.z+=o.userData.speed*dt*.55+speed*dt*.18;if(o.position.z>20){scene.remove(o);traffic.splice(i,1)}else if(Math.abs(o.position.x-player.position.x)<1.45&&Math.abs(o.position.z-player.position.z)<2.4){endGame()}});
  coins.forEach((o,i)=>{o.position.z+=speed*dt*.5;o.rotation.z+=dt*2;if(o.position.z>20){scene.remove(o);coins.splice(i,1)}else if(Math.abs(o.position.x-player.position.x)<1.3&&Math.abs(o.position.z-player.position.z)<2){scene.remove(o);coins.splice(i,1);money+=10;totalCoins+=10;updateWallet();playBeep(700,.12);toast('+10 جنيه 🪙')}});
  $('speed').textContent=Math.round(speed);$('distance').textContent=(distance/1000).toFixed(1)+' كم';
  if(Math.floor(distance/1000)>=1)$('mission').textContent='ممتاز! كمّل واجمع فلوس';
 }
 camera.position.x=THREE.MathUtils.lerp(camera.position.x,player.position.x*.22,.035);camera.lookAt(player.position.x*.12,1,-12);
 renderer.render(scene,camera);
}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))});
updateWallet();
