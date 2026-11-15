import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas=document.querySelector('#game');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x91c8df);
scene.fog=new THREE.Fog(0x91c8df,45,190);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,350);
camera.position.set(0,6.8,12.5); camera.lookAt(0,0,-12);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
scene.add(new THREE.HemisphereLight(0xd9f3ff,0x6c5944,2.1));
const sun=new THREE.DirectionalLight(0xffefcf,2.5);sun.position.set(-15,28,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);

const mat=(color,rough=.8)=>new THREE.MeshStandardMaterial({color,roughness:rough});
const asphalt=mat(0x30343a),sand=mat(0xbca47b),white=mat(0xf1eee3),black=mat(0x171b20),yellow=mat(0xe5b53d),green=mat(0x427b56);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),sand);ground.rotation.x=-Math.PI/2;ground.position.y=-.12;ground.receiveShadow=true;scene.add(ground);
const road=new THREE.Mesh(new THREE.PlaneGeometry(13,260),asphalt);road.rotation.x=-Math.PI/2;road.position.set(0,0,-95);road.receiveShadow=true;scene.add(road);
for(let x of [-6.6,6.6]){let edge=new THREE.Mesh(new THREE.BoxGeometry(.18,.12,260),white);edge.position.set(x,.05,-95);scene.add(edge)}
const laneMarks=[];
for(let z=-220;z<20;z+=10){for(let x of [-2.15,2.15]){let m=new THREE.Mesh(new THREE.BoxGeometry(.13,.025,4.8),white);m.position.set(x,.04,z);scene.add(m);laneMarks.push(m)}}
const sideObjects=[];
function building(x,z,w,h,color){let b=new THREE.Mesh(new THREE.BoxGeometry(w,h,5),mat(color));b.position.set(x,h/2-.1,z);b.castShadow=true;scene.add(b);for(let y=1.1;y<h-.5;y+=1.4)for(let xx=-w/2+.7;xx<w/2-.3;xx+=1.2){let win=new THREE.Mesh(new THREE.PlaneGeometry(.55,.65),mat(0x8bc2d0,.3));win.position.set(x+xx,y,z-2.51);scene.add(win)}sideObjects.push(b)}
for(let i=0;i<24;i++){let z=-i*11-8;building(-11-Math.random()*3,z,4+Math.random()*4,4+Math.random()*8,[0xd2b28a,0xc8c1ad,0xb0a28f][i%3]);if(i%2===0)building(11+Math.random()*3,z-4,4,4+Math.random()*7,[0xd4c3a4,0xb5b7aa][i%2])}
function palm(x,z){let trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,3.8,7),mat(0x79553b));trunk.position.set(x,1.8,z);scene.add(trunk);for(let i=0;i<7;i++){let leaf=new THREE.Mesh(new THREE.ConeGeometry(.22,3.5,5),mat(0x34784b));leaf.position.set(x+Math.cos(i)*1.2,3.8,z+Math.sin(i)*1.2);leaf.rotation.z=Math.PI/2.8;leaf.rotation.y=i;scene.add(leaf)}}
for(let z=-10;z>-230;z-=19){palm(-8.7,z);if(z%2===0)palm(8.7,z-8)}

function plate(parent){let p=new THREE.Group();let base=new THREE.Mesh(new THREE.BoxGeometry(.78,.23,.045),mat(0xf1e9d2));p.add(base);let line=new THREE.Mesh(new THREE.BoxGeometry(.72,.035,.012),mat(0x1d2934));line.position.y=-.045;p.add(line);let side=new THREE.Mesh(new THREE.BoxGeometry(.13,.17,.02),mat(0x2677aa));side.position.x=-.31;p.add(side);p.position.set(0,.48,-.91);parent.add(p)}
function makeCar(color=0xc82b2b,type='sedan'){
 const g=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(type==='truck'?1.65:1.55,.62,type==='tuktuk'?1.65:2.7),mat(color,.35));body.position.y=.65;body.castShadow=true;g.add(body);
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(type==='truck'?1.48:.1+1.28,.62,type==='truck'?1.3:1.45),mat(type==='tuktuk'?0x1c9b76:0x9dbac5,.25));cabin.position.set(0,1.18,type==='truck'?.28:-.12);cabin.castShadow=true;g.add(cabin);
 if(type==='truck'){const cargo=new THREE.Mesh(new THREE.BoxGeometry(1.7,.8,1.3),mat(0xb7a17d));cargo.position.set(0,1.12,.95);g.add(cargo)}
 const wheels=[];for(let x of [-.83,.83])for(let z of [-.85,.85]){let w=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.19,12),black);w.rotation.z=Math.PI/2;w.position.set(x,.35,z);w.castShadow=true;g.add(w);wheels.push(w)}
 for(let x of [-.48,.48]){let l=new THREE.Mesh(new THREE.BoxGeometry(.3,.16,.05),mat(0xfff0c7));l.position.set(x,.7,-1.37);g.add(l)}
 plate(g);g.userData.wheels=wheels;g.userData.type=type;return g;
}
const player=makeCar(0xd52e2e);player.position.set(0,0,5);scene.add(player);
let traffic=[],distance=0,money=0,speed=24,playing=false,paused=false,earned=0,spawn=0,roadMode='highway';
const moneyEl=document.querySelector('#money'),distEl=document.querySelector('#distance');
const cars=[
 {name:'تاكسي أبيض',emoji:'🚕',type:'sedan',color:0xe8dfc7},
 {name:'نص نقل',emoji:'🚚',type:'truck',color:0x5e9a71},
 {name:'توك توك',emoji:'🛺',type:'tuktuk',color:0x169a78},
 {name:'ملاكي أزرق',emoji:'🚙',type:'sedan',color:0x286b9c},
 {name:'ميكروباص',emoji:'🚐',type:'van',color:0xd4a83b}
];
function spawnTraffic(){let spec=cars[Math.floor(Math.random()*cars.length)],lane=[-4.3,0,4.3][Math.floor(Math.random()*3)];let c=makeCar(spec.color,spec.type);c.position.set(lane,0,-125-Math.random()*20);c.userData.speed=12+Math.random()*13;scene.add(c);traffic.push(c)}
let keys={left:false,right:false,brake:false};
function steer(dir){if(!playing||paused)return;player.position.x=THREE.MathUtils.clamp(player.position.x+dir*1.45,-4.65,4.65)}
addEventListener('keydown',e=>{if(['ArrowLeft','a','A'].includes(e.key))keys.left=true;if(['ArrowRight','d','D'].includes(e.key))keys.right=true;if(e.code==='Space')keys.brake=true;if(e.key==='Escape')togglePause()});
addEventListener('keyup',e=>{if(['ArrowLeft','a','A'].includes(e.key))keys.left=false;if(['ArrowRight','d','D'].includes(e.key))keys.right=false;if(e.code==='Space')keys.brake=false});
document.querySelector('#leftBtn').onpointerdown=()=>steer(-1);document.querySelector('#rightBtn').onpointerdown=()=>steer(1);document.querySelector('#brakeBtn').onpointerdown=()=>keys.brake=true;document.querySelector('#brakeBtn').onpointerup=()=>keys.brake=false;
document.querySelector('#leftBtn').onpointerdown=e=>{e.preventDefault();steer(-1)};document.querySelector('#rightBtn').onpointerdown=e=>{e.preventDefault();steer(1)};
function update(dt){if(!playing||paused)return;let actual=keys.brake?10: speed;if(keys.left)player.position.x-=dt*7;if(keys.right)player.position.x+=dt*7;player.position.x=THREE.MathUtils.clamp(player.position.x,-4.7,4.7);
 distance+=actual*dt*.7;distEl.textContent=Math.floor(distance);spawn-=dt;if(spawn<=0){spawnTraffic();spawn=1.15+Math.random()*.65}
 laneMarks.forEach(m=>{m.position.z+=actual*dt;if(m.position.z>15)m.position.z=-230});
 traffic.forEach((c,i)=>{c.position.z+= (actual-c.userData.speed)*dt;if(c.position.z>16){scene.remove(c);traffic.splice(i,1);money+=3;earned+=3;moneyEl.textContent=money}});
 for(let c of traffic){if(Math.abs(c.position.z-player.position.z)<1.7&&Math.abs(c.position.x-player.position.x)<1.35){endGame();break}}
 camera.position.x+=(player.position.x*.18-camera.position.x)*dt*2;camera.lookAt(player.position.x*.12,.4,-14);
}
let last=performance.now();function animate(now){requestAnimationFrame(animate);let dt=Math.min((now-last)/1000,.05);last=now;update(dt);renderer.render(scene,camera)}requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
function start(){document.querySelector('#menu').classList.add('hidden');document.querySelector('#gameover').classList.add('hidden');playing=true;paused=false;distance=0;earned=0;spawn=0;traffic.forEach(c=>scene.remove(c));traffic=[];player.position.x=0;document.querySelector('#pause').classList.add('hidden')}
function endGame(){if(!playing)return;playing=false;money+=earned+Math.floor(distance/20);moneyEl.textContent=money;persist();document.querySelector('#finalDistance').textContent=Math.floor(distance);document.querySelector('#earned').textContent=earned+Math.floor(distance/20);document.querySelector('#gameover').classList.remove('hidden')}
function togglePause(){if(!playing)return;paused=!paused;document.querySelector('#pause').classList.toggle('hidden',!paused)}
document.querySelector('#startBtn').onclick=start;document.querySelector('#againBtn').onclick=start;document.querySelector('#pauseBtn').onclick=togglePause;document.querySelector('#resumeBtn').onclick=togglePause;document.querySelector('#quitBtn').onclick=()=>{playing=false;paused=false;document.querySelector('#pause').classList.add('hidden');document.querySelector('#menu').classList.remove('hidden')};document.querySelector('#homeBtn').onclick=()=>{document.querySelector('#gameover').classList.add('hidden');document.querySelector('#menu').classList.remove('hidden')};

// Local save, garage and in-game economy
let saved={};try{saved=JSON.parse(localStorage.getItem('egyptDriveSave')||'{}')}catch(e){}
let owned=saved.owned||['fiat'],selected=saved.selected||'fiat',ownedRoads=saved.ownedRoads||['highway'],carColor=saved.carColor||'#d92727';
money=saved.money||0;moneyEl.textContent=money;
function persist(){localStorage.setItem('egyptDriveSave',JSON.stringify({owned,selected,ownedRoads,carColor,money}))}

const catalog=[
 {id:'fiat',name:'فيات 128',emoji:'🚗',price:0,color:0xd52e2e},
 {id:'taxi',name:'تاكسي القاهرة',emoji:'🚕',price:350,color:0xe8dfc7},
 {id:'pickup',name:'نصف نقل',emoji:'🛻',price:650,color:0x4d946a},
 {id:'sport',name:'كوبيه رياضية',emoji:'🏎️',price:1200,color:0x286bba},
 {id:'suv',name:'دفع رباعي',emoji:'🚙',price:1800,color:0x353d49}
];
function openPanel(id){document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'));document.querySelector('#'+id).classList.remove('hidden')}
document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{openPanel(b.dataset.open);if(b.dataset.open==='shop')renderShop()});
document.querySelectorAll('.close').forEach(b=>b.onclick=()=>b.parentElement.classList.add('hidden'));
function renderShop(){document.querySelectorAll('.moneyInline').forEach(e=>e.textContent=money);let box=document.querySelector('#carShop');box.innerHTML='';catalog.forEach(c=>{let ownedCar=owned.includes(c.id),el=document.createElement('div');el.className='shopitem';el.innerHTML=`<span class="emoji">${c.emoji}</span><div class="info"><b>${c.name}</b><small>${ownedCar?'موجودة في الجراج':`السعر ${c.price} جنيه داخل اللعبة`}</small></div><button ${ownedCar||money<c.price?'disabled':''}>${ownedCar?'مملوكة':`شراء`}</button>`;el.querySelector('button').onclick=()=>{if(money>=c.price&&!ownedCar){money-=c.price;owned.push(c.id);moneyEl.textContent=money;persist();renderShop();renderGarage()}};box.append(el)});
let roads=[{id:'highway',name:'طريق القاهرة – إسكندرية',emoji:'🛣️',price:0},{id:'corniche',name:'كورنيش إسكندرية',emoji:'🌊',price:500}];let rb=document.querySelector('#roadShop');rb.innerHTML='';roads.forEach(r=>{let has=ownedRoads.includes(r.id),el=document.createElement('div');el.className='shopitem';el.innerHTML=`<span class="emoji">${r.emoji}</span><div class="info"><b>${r.name}</b><small>${has?'مفتوح':'السعر '+r.price+' جنيه داخل اللعبة'}</small></div><button ${has||money<r.price?'disabled':''}>${has?'مفتوح':'شراء'}</button>`;el.querySelector('button').onclick=()=>{if(money>=r.price&&!has){money-=r.price;ownedRoads.push(r.id);moneyEl.textContent=money;persist();renderShop()}};rb.append(el)})}
function renderGarage(){let sel=document.querySelector('#equippedCar');sel.innerHTML='';catalog.filter(c=>owned.includes(c.id)).forEach(c=>{let o=document.createElement('option');o.value=c.id;o.textContent=c.name;o.selected=c.id===selected;sel.append(o)});let spec=catalog.find(c=>c.id===selected)||catalog[0];document.querySelector('#selectedCarName').textContent=spec.name;document.querySelector('#garageCar').textContent=spec.emoji;document.querySelector('#carColor').value=carColor}
document.querySelector('#equippedCar').onchange=e=>{selected=e.target.value;let spec=catalog.find(c=>c.id===selected);player.children[0].material.color.set(spec.color);renderGarage();persist()};
document.querySelector('#carColor').oninput=e=>{carColor=e.target.value;player.children[0].material.color.set(carColor)};
document.querySelector('#tint').onchange=e=>{player.children[1].material.color.set(e.target.checked?0x18212a:0x9dbac5)};
document.querySelector('#saveCar').onclick=()=>{player.children[0].material.color.set(carColor);persist();document.querySelector('#garage').classList.add('hidden')};
document.querySelector('[data-open="garage"]').addEventListener('click',renderGarage);
renderGarage();
document.querySelector('#money').textContent=money;

// Original generated electronic shaabi-style loop using Web Audio (no external copyrighted recording)
let audioCtx=null,master=null,beatTimer=null,beatStep=0;
function audioInit(){if(audioCtx)return;audioCtx=new (window.AudioContext||window.webkitAudioContext)();master=audioCtx.createGain();master.gain.value=Number(document.querySelector('#volume').value);master.connect(audioCtx.destination)}
function tone(freq,dur,type='sine',gain=.12){if(!audioCtx)return;let o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(gain,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);o.connect(g);g.connect(master);o.start();o.stop(audioCtx.currentTime+dur)}
function startBeat(){audioInit();if(beatTimer)return;beatTimer=setInterval(()=>{if(!document.querySelector('#musicToggle').checked||!playing)return;let s=beatStep++%8;if(s%4===0)tone(75,.13,'sine',.28);if(s===2||s===6)tone(180,.06,'triangle',.12);if(s%2===1)tone(850,.035,'square',.035);if(s===3||s===7)tone(420,.07,'sawtooth',.04)},170)}
document.querySelector('#musicToggle').onchange=()=>{if(document.querySelector('#musicToggle').checked)startBeat()};document.querySelector('#volume').oninput=e=>{if(master)master.gain.value=Number(e.target.value)};
document.querySelector('#startBtn').addEventListener('click',()=>{audioInit();startBeat()},{once:true});
document.querySelector('#againBtn').addEventListener('click',()=>{audioInit();startBeat()});
document.querySelector('#sfxToggle').onchange=()=>{};
document.querySelector('#loading').style.opacity='0';setTimeout(()=>document.querySelector('#loading').remove(),550);
