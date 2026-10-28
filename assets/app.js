const slug=location.pathname.split('/').filter(Boolean).pop();
const {default:c}=await import(`../${slug}/config.js`);
const $=s=>document.querySelector(s), money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
const key='task4-'+c.slug+'-v1'; let selected=null, bookings=[];let persistence=true;
const warning=t=>$('#storage-warning').textContent=t;
try {const raw=localStorage.getItem(key); if(raw){const data=JSON.parse(raw);if(!Array.isArray(data)||!data.every(b=>b&&typeof b.id==='string'&&c.objects.some(o=>o.id===b.objectId&&!o.occupied)&&Number.isInteger(b.guests)&&b.guests>=1&&b.guests<=c.objects.find(o=>o.id===b.objectId).capacity&&Number.isInteger(b.duration)&&b.duration>=1&&b.duration<=c.max&&b.total===c.objects.find(o=>o.id===b.objectId).price*b.duration)||new Set(data.map(b=>b.objectId)).size!==data.length)throw Error();bookings=data;}}
catch(e){warning('Не удалось прочитать сохранённые брони. Показана исходная схема; можно сбросить демо или продолжить.');}
function save(){try{localStorage.setItem(key,JSON.stringify(bookings));persistence=true;warning('');}catch{persistence=false;warning('Браузер запретил сохранение. Брони доступны до закрытия или обновления страницы.');}}
const busy=o=>o.occupied||bookings.some(b=>b.objectId===o.id);
function visible(){const cap=Number($('#capacity').value),v=$('#price').value,price=v===''?Infinity:Number(v);return c.objects.filter(o=>o.capacity>=cap&&o.price<=price);}
function state(o){return busy(o)?'× Занято':selected===o.id?'✓ Выбрано':'○ Свободно';}
function render(){const items=visible();if(selected&&!items.some(o=>o.id===selected)){selected=null;$('#status').textContent='Выбранный объект скрыт фильтрами. Выберите другой.';}
$('#results').textContent=`Найдено: ${items.length} / 8`;$('#empty').hidden=!!items.length;
$('#markers').innerHTML=items.map(o=>`<button class="marker ${busy(o)?'busy':''} ${selected===o.id?'selected':''}" style="--x:${o.x}%;--y:${o.y}%" data-id="${o.id}" ${busy(o)?'disabled':''} aria-label="${o.name}, ${state(o)}, ${money(o.price)} за ${c.unit}" aria-pressed="${selected===o.id}"><span class="building">${c.icon}</span><b>${String(o.id).padStart(2,'0')}</b><small>${state(o)}</small></button>`).join('');
$('#objects').innerHTML=items.map(o=>`<button class="object ${selected===o.id?'selected':''}" data-id="${o.id}" ${busy(o)?'disabled':''} aria-pressed="${selected===o.id}"><span class="object-id">${String(o.id).padStart(2,'0')}</span><span class="object-info"><b>${o.name}</b><small>${o.type} · до ${o.capacity} чел.</small><small class="availability">${state(o)}</small></span><span class="object-price">${money(o.price)}<small>/ ${c.unit}</small></span></button>`).join('');
const o=c.objects.find(o=>o.id===selected);
$('#detail').innerHTML=o?`<span class="detail-number">${c.icon} / ${String(o.id).padStart(2,'0')}</span><h3>${o.name}</h3><p>${o.description}</p><div class="detail-tags"><span>До ${o.capacity} чел.</span><span>${o.type}</span></div><p class="rate">${money(o.price)} <small>/ ${c.unit}</small></p>`:`<div class="placeholder-icon">${c.icon}</div><h3>Здесь начинается история</h3><p>Нажми на свободный объект на схеме или выбери его в списке.</p>`;
$('#guests').max=o?.capacity||8;updateTotal();renderBookings();}
function updateTotal(){const o=c.objects.find(o=>o.id===selected),n=Number($('#duration').value);$('#total').textContent=o&&Number.isInteger(n)&&n>=1&&n<=c.max?money(o.price*n):'—';}
function select(id){const o=c.objects.find(o=>o.id===id);if(!o||busy(o))return;selected=id;$('#guests').value=1;clearErrors();$('#status').textContent=`Выбрано: ${o.name}. Укажите участников и срок.`;render();}
function clearErrors(){['form-error','guests-error','duration-error'].forEach(id=>$('#'+id).textContent='');}
for(const area of ['markers','objects'])$('#'+area).addEventListener('click',e=>{const b=e.target.closest('button[data-id]');if(b)select(Number(b.dataset.id));});
$('#filters').addEventListener('input',render);$('#filters').addEventListener('reset',()=>{setTimeout(render,0);});
$('#duration').addEventListener('input',()=>{clearErrors();updateTotal();});$('#guests').addEventListener('input',clearErrors);
$('#reservation').addEventListener('submit',e=>{e.preventDefault();clearErrors();const o=c.objects.find(o=>o.id===selected);if(!o||busy(o)){$('#form-error').textContent='Сначала выберите свободный объект.';return;}
const guests=Number($('#guests').value),duration=Number($('#duration').value);let valid=true;
if(!Number.isInteger(guests)||guests<1||guests>o.capacity){$('#guests-error').textContent=`Целое число от 1 до ${o.capacity}.`;valid=false;}
if(!Number.isInteger(duration)||duration<1||duration>c.max){$('#duration-error').textContent=`Целое число от 1 до ${c.max}.`;valid=false;}if(!valid)return;
const id=Date.now().toString(36).toUpperCase()+'-'+o.id;bookings.push({id,objectId:o.id,guests,duration,total:o.price*duration});selected=null;save();render();$('#status').textContent=`Готово! Бронь ${id} на «${o.name}» добавлена в «Мои брони».${persistence?'':' Сохранение недоступно.'}`;});
function renderBookings(){$('#count').textContent=bookings.length;$('#booking-list').innerHTML=bookings.length?bookings.map(b=>{const o=c.objects.find(o=>o.id===b.objectId);return `<article class="booking"><div><span class="eyebrow">БРОНЬ № ${b.id}</span><h3>${o.name}</h3><p>${b.guests} чел. · ${c.plural}: ${b.duration} · ${money(o.price)} / ${c.unit}</p></div><strong>${money(b.total)}</strong><button class="cancel text-button" data-cancel="${b.id}" aria-label="Отменить бронь ${o.name}">Отменить ×</button></article>`;}).join(''):'<div class="empty-bookings"><span>↗</span><div><h3>Приключения ещё впереди</h3><p>Твои брони появятся здесь. Начни с выбора на схеме.</p></div><a href="#explore">Выбрать место ↑</a></div>';}
$('#booking-list').addEventListener('click',e=>{const b=e.target.closest('[data-cancel]');if(!b)return;const old=bookings.find(x=>x.id===b.dataset.cancel);if(!old)return;bookings=bookings.filter(x=>x.id!==old.id);save();render();$('#status').textContent='Бронь отменена. Объект снова доступен.';});
$('#reset').addEventListener('click',()=>{if(!confirm('Удалить все ваши учебные брони только на этом сайте?'))return;bookings=[];selected=null;save();clearErrors();render();$('#status').textContent='Демо сброшено. Исходно занятые объекты остаются занятыми.';});render();
