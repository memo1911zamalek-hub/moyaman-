// بيانات الكتالوج: الأسعار بالدولار الأمريكي وهي قيم مرجعية تقديرية قابلة للتعديل.
const products = [
  // RED BULL
  {id:1,brand:"Red Bull",name:"Red Bull Original",detail:"عبوة 250 مل",category:"مشروبات الطاقة",price:2.49,style:"red",symbol:"RED BULL"},
  {id:2,brand:"Red Bull",name:"Red Bull Sugarfree",detail:"بدون سكر • 250 مل",category:"مشروبات الطاقة",price:2.49,style:"red",symbol:"SUGARFREE"},
  {id:3,brand:"Red Bull",name:"Red Bull Zero",detail:"بدون سكر • 250 مل",category:"مشروبات الطاقة",price:2.49,style:"red",symbol:"ZERO"},
  {id:4,brand:"Red Bull",name:"Red Edition Watermelon",detail:"نكهة البطيخ • 250 مل",category:"إصدارات ونكهات",price:2.69,style:"red",symbol:"RED EDITION"},
  {id:5,brand:"Red Bull",name:"Blue Edition",detail:"نكهة التوت • 250 مل",category:"إصدارات ونكهات",price:2.69,style:"red",symbol:"BLUE EDITION"},
  {id:6,brand:"Red Bull",name:"Yellow Edition",detail:"نكهة الفواكه الاستوائية • 250 مل",category:"إصدارات ونكهات",price:2.69,style:"orange",symbol:"YELLOW"},
  {id:7,brand:"Red Bull",name:"Green Edition",detail:"نكهة فاكهة التنين • 250 مل",category:"إصدارات ونكهات",price:2.69,style:"green",symbol:"GREEN"},
  {id:8,brand:"Red Bull",name:"Red Bull 355 ml",detail:"العبوة الكبيرة • 355 مل",category:"أحجام مختلفة",price:3.49,style:"red",symbol:"RED BULL"},
  // RAUCH
  {id:9,brand:"Rauch",name:"Happy Day Orange",detail:"عصير برتقال • 1 لتر",category:"عصائر",price:3.25,style:"orange",symbol:"HAPPY DAY"},
  {id:10,brand:"Rauch",name:"Happy Day Apple",detail:"عصير تفاح • 1 لتر",category:"عصائر",price:3.25,style:"green",symbol:"HAPPY DAY"},
  {id:11,brand:"Rauch",name:"Happy Day Mango",detail:"عصير مانجو • 1 لتر",category:"عصائر",price:3.65,style:"orange",symbol:"HAPPY DAY"},
  {id:12,brand:"Rauch",name:"Happy Day Pineapple",detail:"عصير أناناس • 1 لتر",category:"عصائر",price:3.65,style:"orange",symbol:"HAPPY DAY"},
  {id:13,brand:"Rauch",name:"Happy Day Multivitamin",detail:"كوكتيل فواكه وفيتامينات • 1 لتر",category:"عصائر",price:3.65,style:"orange",symbol:"MULTI"},
  {id:14,brand:"Rauch",name:"Bravo Orange",detail:"مشروب فواكه • 1.5 لتر",category:"مشروبات فواكه",price:2.75,style:"orange",symbol:"BRAVO"},
  {id:15,brand:"Rauch",name:"Bravo Multivitamin",detail:"مشروب متعدد الفواكه • 1.5 لتر",category:"مشروبات فواكه",price:2.75,style:"orange",symbol:"BRAVO"},
  {id:16,brand:"Rauch",name:"Yippy Juice",detail:"مشروب فواكه للأطفال • 200 مل",category:"منتجات الأطفال",price:1.15,style:"green",symbol:"YIPPY"},
  {id:17,brand:"Rauch",name:"MyTea Peach",detail:"شاي مثلج بالخوخ • 500 مل",category:"شاي مثلج",price:1.85,style:"orange",symbol:"MY TEA"},
  {id:18,brand:"Rauch",name:"MyTea Lemon",detail:"شاي مثلج بالليمون • 500 مل",category:"شاي مثلج",price:1.85,style:"green",symbol:"MY TEA"},
  // NUTELLA
  {id:19,brand:"Nutella",name:"Nutella 200g",detail:"كريمة البندق والكاكاو",category:"أحجام مختلفة",price:3.49,style:"green",symbol:"nutella"},
  {id:20,brand:"Nutella",name:"Nutella 350g",detail:"كريمة البندق والكاكاو",category:"أحجام مختلفة",price:5.49,style:"green",symbol:"nutella"},
  {id:21,brand:"Nutella",name:"Nutella 400g",detail:"كريمة البندق والكاكاو",category:"أحجام مختلفة",price:5.99,style:"green",symbol:"nutella"},
  {id:22,brand:"Nutella",name:"Nutella 750g",detail:"العبوة العائلية",category:"أحجام مختلفة",price:9.49,style:"green",symbol:"nutella"},
  {id:23,brand:"Nutella",name:"Nutella B-Ready",detail:"ويفر محشو • عبوة فردية",category:"سناكس وويفر",price:1.25,style:"gold",symbol:"B-READY"},
  {id:24,brand:"Nutella",name:"Nutella Biscuits",detail:"بسكويت محشو • عبوة 304 جم",category:"سناكس وويفر",price:4.99,style:"gold",symbol:"BISCUITS"},
  // FERRERO ROCHER
  {id:25,brand:"Ferrero Rocher",name:"Ferrero Rocher 3 Pieces",detail:"عبوة 3 قطع",category:"عبوات الشوكولاتة",price:2.49,style:"gold",symbol:"FERRERO"},
  {id:26,brand:"Ferrero Rocher",name:"Ferrero Rocher 8 Pieces",detail:"علبة 8 قطع",category:"عبوات الشوكولاتة",price:5.49,style:"gold",symbol:"ROCHER"},
  {id:27,brand:"Ferrero Rocher",name:"Ferrero Rocher 16 Pieces",detail:"علبة 16 قطعة",category:"عبوات الشوكولاتة",price:10.97,style:"gold",symbol:"ROCHER"},
  {id:28,brand:"Ferrero Rocher",name:"Ferrero Rocher 24 Pieces",detail:"علبة 24 قطعة",category:"عبوات الشوكولاتة",price:14.49,style:"gold",symbol:"ROCHER"},
  {id:29,brand:"Ferrero Rocher",name:"Ferrero Rocher 42 Pieces",detail:"علبة 42 قطعة",category:"عبوات الشوكولاتة",price:19.98,style:"gold",symbol:"ROCHER"},
  {id:30,brand:"Ferrero Rocher",name:"Rocher Dark",detail:"شوكولاتة داكنة بالبندق",category:"إصدارات خاصة",price:7.49,style:"gold",symbol:"DARK"},
  {id:31,brand:"Ferrero Rocher",name:"Rocher Chocolate Bar",detail:"لوح شوكولاتة بالبندق • 90 جم",category:"ألواح الشوكولاتة",price:4.34,style:"gold",symbol:"ROCHER BAR"},
  // RAFFAELLO
  {id:32,brand:"Raffaello",name:"Raffaello 3 Pieces",detail:"عبوة 3 قطع",category:"عبوات جوز الهند",price:2.25,style:"cream",symbol:"RAFFAELLO"},
  {id:33,brand:"Raffaello",name:"Raffaello 6 Pieces",detail:"علبة 6 قطع",category:"عبوات جوز الهند",price:4.49,style:"cream",symbol:"RAFFAELLO"},
  {id:34,brand:"Raffaello",name:"Raffaello 15 Pieces",detail:"علبة 15 قطعة • 150 جم تقريباً",category:"عبوات جوز الهند",price:7.99,style:"cream",symbol:"RAFFAELLO"},
  {id:35,brand:"Raffaello",name:"Raffaello 24 Pieces",detail:"علبة هدايا 24 قطعة",category:"عبوات جوز الهند",price:12.99,style:"cream",symbol:"RAFFAELLO"}
];

const brandInfo = [
  {name:"Red Bull",desc:"مشروبات الطاقة",className:"red"},
  {name:"Rauch",desc:"العصائر والمشروبات",className:"orange"},
  {name:"Nutella",desc:"كريمة البندق والكاكاو",className:"green"},
  {name:"Ferrero Rocher",desc:"شوكولاتة فاخرة",className:"gold"},
  {name:"Raffaello",desc:"حلوى اللوز وجوز الهند",className:"cream"}
];
const $ = s => document.querySelector(s);
let activeBrand = "all", activeCategory = "all";
const cart = new Map();

function renderBrands(){
  $("#brandGrid").innerHTML = brandInfo.map(b=>`
    <button class="brand-card ${activeBrand===b.name?'active':''}" data-brand="${b.name}">
      <span class="brand-name">${b.name}</span><small>${b.desc}</small><span class="arrow">↙</span>
    </button>`).join("");
  $("#brandFilter").innerHTML = '<option value="all">كل الشركات</option>' + brandInfo.map(b=>`<option value="${b.name}">${b.name}</option>`).join("");
}
function filteredProducts(){
  const q=$("#searchInput").value.trim().toLowerCase();
  let list=products.filter(p=>(activeBrand==="all"||p.brand===activeBrand)&&
    (activeCategory==="all"||p.category===activeCategory)&&
    (!q||[p.name,p.brand,p.detail,p.category].join(" ").toLowerCase().includes(q)));
  const sort=$("#sortFilter").value;
  if(sort==="low") list.sort((a,b)=>a.price-b.price);
  if(sort==="high") list.sort((a,b)=>b.price-a.price);
  if(sort==="name") list.sort((a,b)=>a.name.localeCompare(b.name));
  return list;
}
function renderCategories(){
  const cats=[...new Set(products.filter(p=>activeBrand==="all"||p.brand===activeBrand).map(p=>p.category))];
  if(activeCategory!=="all"&&!cats.includes(activeCategory)) activeCategory="all";
  $("#categoryChips").innerHTML=['all',...cats].map(c=>`<button class="chip ${activeCategory===c?'active':''}" data-category="${c}">${c==="all"?"كل الأصناف":c}</button>`).join("");
}
function renderProducts(){
  const list=filteredProducts();
  $("#resultCount").textContent=`${list.length} صنف`;
  $("#productGrid").innerHTML=list.map(p=>`
    <article class="product-card">
      <div class="product-visual ${p.style}"><span class="product-tag">${p.brand}</span><span class="product-symbol">${p.symbol}</span></div>
      <div class="product-info"><span class="product-brand">${p.brand.toUpperCase()}</span><h3>${p.name}</h3><p>${p.detail}</p>
        <div class="product-bottom"><span class="price">$${p.price.toFixed(2)} <small>/ القطعة</small></span>
        <button class="add-button" data-add="${p.id}" aria-label="أضف ${p.name} إلى القائمة">+</button></div>
      </div>
    </article>`).join("");
  $("#emptyState").hidden=list.length!==0;
}
function refresh(){renderBrands();renderCategories();renderProducts();}
function renderCart(){
  const items=[...cart.entries()].map(([id,qty])=>({product:products.find(p=>p.id===id),qty})).filter(x=>x.product);
  $("#cartCount").textContent=items.reduce((s,x)=>s+x.qty,0);
  $("#cartItems").innerHTML=items.length?items.map(({product:p,qty})=>`
    <div class="cart-row"><div><b>${p.name}</b><small>$${p.price.toFixed(2)} × ${qty}</small></div>
    <div class="qty-controls"><button data-qty="${p.id}" data-delta="-1">−</button><span>${qty}</span><button data-qty="${p.id}" data-delta="1">+</button></div></div>`).join(""):'<p class="cart-empty">لم تضف أي منتجات بعد.</p>';
  const total=items.reduce((s,x)=>s+x.product.price*x.qty,0);
  $("#cartTotal").textContent=`$${total.toFixed(2)}`;
}
function openCart(open){$("#cartDrawer").classList.toggle("open",open);$("#scrim").classList.toggle("show",open);$("#cartDrawer").setAttribute("aria-hidden",String(!open));}
document.addEventListener("click",e=>{
  const brand=e.target.closest("[data-brand]");
  if(brand){activeBrand=brand.dataset.brand;activeCategory="all";$("#brandFilter").value=activeBrand;refresh();$("#catalog").scrollIntoView({behavior:"smooth"});}
  const chip=e.target.closest("[data-category]");
  if(chip){activeCategory=chip.dataset.category;renderCategories();renderProducts();}
  const add=e.target.closest("[data-add]");
  if(add){const id=Number(add.dataset.add);cart.set(id,(cart.get(id)||0)+1);renderCart();add.textContent="✓";setTimeout(()=>add.textContent="+",650);}
  const qty=e.target.closest("[data-qty]");
  if(qty){const id=Number(qty.dataset.qty),n=(cart.get(id)||0)+Number(qty.dataset.delta);if(n<=0)cart.delete(id);else cart.set(id,n);renderCart();}
});
$("#searchInput").addEventListener("input",renderProducts);
$("#sortFilter").addEventListener("change",renderProducts);
$("#brandFilter").addEventListener("change",e=>{activeBrand=e.target.value;activeCategory="all";refresh();});
$("#cartToggle").addEventListener("click",()=>openCart(true));
$("#cartClose").addEventListener("click",()=>openCart(false));
$("#scrim").addEventListener("click",()=>openCart(false));
$("#year").textContent=new Date().getFullYear();
refresh();renderCart();
