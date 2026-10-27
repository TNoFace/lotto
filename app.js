'use strict';
const $=id=>document.getElementById(id);
let selected=new Set(),groups=[],editing=null,currentQR=null,lastDecoded=null,toastTimer,fileTicket=0;
const pad=n=>String(n).padStart(2,'0');
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3600);}
function balls(numbers){const wrap=document.createElement('div');wrap.className='balls';for(const n of numbers){const ball=document.createElement('span');ball.className='ball';ball.textContent=pad(n);wrap.append(ball);}return wrap;}
function invalidate(){currentQR=null;$('qrOutput').hidden=true;$('qrEmpty').hidden=false;$('qrImage').replaceChildren();$('payloadOutput').value='';}
function renderSelection(){
  $('selectedCount').textContent=selected.size;
  $('selectedStrip').replaceChildren();const nums=[...selected].sort((a,b)=>a-b);
  for(let i=0;i<6;i++){const b=document.createElement('span');b.className='ball'+(nums[i]?'':' placeholder');b.textContent=nums[i]?pad(nums[i]):'—';$('selectedStrip').append(b);}
  document.querySelectorAll('.number').forEach(b=>{const is=selected.has(+b.dataset.number);b.setAttribute('aria-pressed',String(is));b.disabled=!is&&selected.size===6;});
  $('selectionHint').textContent=selected.size===6?'六個號碼已就緒':`還需要選擇 ${6-selected.size} 個號碼`;
  $('addBtn').disabled=selected.size!==6||(groups.length>=10&&editing===null);
  $('addBtn').textContent=editing===null?'加入選號 ＋':'儲存這一組 ✓';
  $('editTitle').textContent=editing===null?'新增一組號碼':`編輯第 ${editing+1} 組`;
}
function groupCard(nums,index,editable=false){
  const card=document.createElement('div');card.className='group-item';
  const top=document.createElement('div');top.className='group-item-top';
  const title=document.createElement('span');title.textContent=`第 ${pad(index+1)} 組`;top.append(title);
  if(editable){const actions=document.createElement('div');for(const [label,fn] of [['編輯',()=>{editing=index;selected=new Set(groups[index]);renderSelection();$('editTitle').scrollIntoView({behavior:'smooth',block:'center'});}],['移除',()=>{groups.splice(index,1);if(editing===index){editing=null;selected.clear();}else if(editing!==null&&editing>index)editing--;invalidate();renderGroups();renderSelection();}]]){const b=document.createElement('button');b.textContent=label;b.setAttribute('aria-label',`${label}第 ${index+1} 組`);b.onclick=fn;actions.append(b);}top.append(actions);}
  card.append(top,balls(nums));return card;
}
function renderGroups(){
  const list=$('groupList');list.replaceChildren();
  if(!groups.length){const empty=document.createElement('div');empty.className='empty-group';const mark=document.createElement('b');mark.textContent='＋';const text=document.createElement('span');text.textContent='還沒有選號。選好六碼後，點「加入選號」。';empty.append(mark,text);list.append(empty);}
  groups.forEach((g,i)=>list.append(groupCard(g,i,true)));
  $('groupCount').textContent=`${groups.length} / 10 組`;
  $('generateBtn').disabled=!groups.length;
  $('amount').textContent='NT$ '+(groups.length*Number($('period').value)*50).toLocaleString('zh-TW');
  renderSelection();
}
function mode(read){if(typeof restoreSharedCart==='function')restoreSharedCart();if($('extraPanel'))$('extraPanel').hidden=true;$('extraTab').classList.remove('active');$('extraTab').setAttribute('aria-selected','false');$('choosePanel').hidden=read;$('readPanel').hidden=!read;$('advancedPanel').hidden=true;document.querySelector('.version').firstChild.textContent='大樂透 ';document.querySelector('.version b').textContent='6 / 49';document.querySelector('.intro').textContent=read?'讀取 QR，還原彩種、號碼與期數。':'選好六個號碼，讓每一組都有條有理。';$('advancedTab').classList.remove('active');$('advancedTab').setAttribute('aria-selected','false');for(const [id,active]of [['chooseTab',!read],['readTab',read]]){$(id).classList.toggle('active',active);$(id).setAttribute('aria-selected',String(active));}}
function randomBelow(limit){const bound=Math.floor(4294967296/limit)*limit;let n;do{n=crypto.getRandomValues(new Uint32Array(1))[0];}while(n>=bound);return n%limit;}
for(let n=1;n<=49;n++){const b=document.createElement('button');b.className='number';b.textContent=pad(n);b.dataset.number=n;b.setAttribute('aria-label',`號碼 ${pad(n)}`);b.setAttribute('aria-pressed','false');b.onclick=()=>{if(selected.has(n))selected.delete(n);else if(selected.size<6)selected.add(n);renderSelection();};$('numberGrid').append(b);}
for(let p=1;p<=10;p++){const option=document.createElement('option');option.value=p;option.textContent=`${p} 期`;$('period').append(option);}
$('chooseTab').onclick=()=>mode(false);$('readTab').onclick=()=>mode(true);
$('clearBtn').onclick=()=>{selected.clear();editing=null;renderSelection();};
$('randomBtn').onclick=()=>{const pool=Array.from({length:49},(_,i)=>i+1);for(let i=0;i<6;i++){const j=i+randomBelow(49-i);[pool[i],pool[j]]=[pool[j],pool[i]];}selected=new Set(pool.slice(0,6));renderSelection();};
$('addBtn').onclick=()=>{if(selected.size!==6)return;const nums=[...selected].sort((a,b)=>a-b);if(editing!==null)groups[editing]=nums;else if(groups.length<10)groups.push(nums);else return;selected.clear();editing=null;invalidate();renderGroups();toast('選號已加入清單');};
$('period').onchange=()=>{invalidate();renderGroups();};
$('bulkBtn').onclick=()=>{try{
  const raw=$('bulkInput').value.trim();if(!raw)throw Error('請先貼上每行一組的號碼。');
  const lines=raw.split(/\r?\n/).filter(s=>s.trim());
  const imported=lines.map((line,i)=>{if(!/^[\d\s,，、;；]+$/.test(line))throw Error(`第 ${i+1} 行含無法辨識的文字。`);return line.trim().split(/[\s,，、;；]+/).map(Number);});
  LottoCodec.build([...groups,...imported],Number($('period').value));
  groups.push(...imported.map(g=>g.sort((a,b)=>a-b)));$('bulkInput').value='';invalidate();renderGroups();toast(`已加入 ${imported.length} 組號碼`);
}catch(e){toast(e.message);}};
function makeQR(payload,scale=6){const qr=qrcode(0,'M');qr.addData(payload,'Byte');qr.make();const count=qr.getModuleCount(),border=4,canvas=document.createElement('canvas');canvas.width=canvas.height=(count+border*2)*scale;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#000';for(let r=0;r<count;r++)for(let c=0;c<count;c++)if(qr.isDark(r,c))ctx.fillRect((c+border)*scale,(r+border)*scale,scale,scale);return canvas.toDataURL('image/png');}
$('generateBtn').onclick=()=>{try{
  if(editing!==null||selected.size){toast('左側尚有未加入的號碼，請先加入或清除後再產生。');return;}
  const period=Number($('period').value),payload=LottoCodec.encode(groups,period);const checked=LottoCodec.decode(payload);
  if(JSON.stringify(checked.groups)!==JSON.stringify(groups))throw Error('選號核對失敗。');
  currentQR={payload,groups:groups.map(g=>[...g]),period,url:makeQR(payload,12)};
  const image=document.createElement('img');image.src=currentQR.url;image.alt=`大樂透 ${groups.length} 組 ${period} 期QR`;$('qrImage').replaceChildren(image);
  $('qrSummary').textContent=`${groups.length} 組・${period} 期`;$('payloadOutput').value=payload;$('qrOutput').hidden=false;$('qrEmpty').hidden=true;
}catch(e){toast(e.message);}};
$('downloadBtn').onclick=()=>{if(!currentQR)return;const a=document.createElement('a');a.href=currentQR.url;a.download=`大樂透_QR_${currentQR.groups.length}組_${currentQR.period}期.png`;a.click();};
$('enlargeBtn').onclick=()=>{if(!currentQR)return;const img=document.createElement('img');img.src=currentQR.url;img.alt='大樂透QR 放大圖';$('largeQr').replaceChildren(img);$('largeSummary').textContent=`${currentQR.groups.length} 組 · ${currentQR.period} 期`;$('qrDialog').showModal();};
$('copyPayload').onclick=async()=>{try{await navigator.clipboard.writeText($('payloadOutput').value);toast('已複製 QR 字串');}catch{ $('payloadOutput').focus();$('payloadOutput').select();toast('請使用複製功能複製已選取的字串');}};
function showDecoded(payload){try{
  const multi=MultiCodec.decode(payload);if(multi.game!=='649'){showMultiDecoded(multi);return;}
  lastDecoded=LottoCodec.decode(payload);$('checkBadge').textContent='CRC 與標頭通過';
  const box=$('decodedResult');box.className='';box.replaceChildren();
  const meta=document.createElement('div');meta.className='decode-meta';meta.textContent=`大樂透 · ${lastDecoded.groups.length} 組 · ${lastDecoded.period} 期`;
  box.append(meta);lastDecoded.groups.forEach((g,i)=>box.append(groupCard(g,i)));
  const note=document.createElement('p');note.className='tiny';note.textContent='以上為 QR 內的選號資料。校驗通過不代表終端機已接受投注。';
  const b=document.createElement('button');b.className='primary';b.textContent='將還原號碼帶入選號清單 ↗';b.onclick=()=>{groups=lastDecoded.groups.map(g=>[...g]);$('period').value=lastDecoded.period;selected.clear();editing=null;invalidate();renderGroups();mode(false);toast('已以還原結果更新清單');};box.append(note,b);
}catch(e){lastDecoded=null;$('checkBadge').textContent='無法還原';$('decodedResult').className='result-error';$('decodedResult').textContent=e.message;}}
$('decodeBtn').onclick=()=>showDecoded($('decodeInput').value);
$('exampleBtn').onclick=()=>{$('decodeInput').value='#V003#0825725984918898999999999993519885287996699999999999999999999999999';showDecoded($('decodeInput').value);};
$('imageInput').onchange=async e=>{
  const ticket=++fileTicket,file=e.target.files[0];if(!file)return;
  $('imageStatus').textContent='正在此裝置辨識圖片…';
  let url;
  try{
    if(file.size>25*1024*1024)throw Error('圖片超過 25 MB，請先縮小圖片。');
    url=URL.createObjectURL(file);const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('無法讀取這個圖片格式。'));image.src=url;});
    if(ticket!==fileTicket)return;
    const canvas=document.createElement('canvas'),factor=Math.min(1,2000/Math.max(image.naturalWidth,image.naturalHeight));canvas.width=Math.max(1,Math.round(image.naturalWidth*factor));canvas.height=Math.max(1,Math.round(image.naturalHeight*factor));const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),code=jsQR(pixels.data,pixels.width,pixels.height,{inversionAttempts:'attemptBoth'});
    if(!code)throw Error('沒有找到可讀取的 QR，請使用較清楚、包含完整四邊的圖片。');
    $('decodeInput').value=code.data;showDecoded(code.data);$('imageStatus').textContent=`已讀取：${file.name}（本機處理）`;
  }catch(error){if(ticket!==fileTicket)return;$('imageStatus').textContent=error.message;$('checkBadge').textContent='圖片讀取失敗';$('decodedResult').className='result-error';$('decodedResult').textContent=error.message;lastDecoded=null;}
  finally{if(url)URL.revokeObjectURL(url);}
};
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.dialog-close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});});
renderGroups();
