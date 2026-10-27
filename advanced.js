'use strict';
let comboCart=[],comboPreviewTickets=[],comboPreviewName='',comboBatches=[],batchIndex=0,selectedMeal='649',previewRevision=0,zipBusy=false;
const modeNames={chain:'連碰包牌',columns:'立柱／主支立柱',smart:'聰明包牌',custom:'自選包牌',system:'系統包牌',banker:'膽拖',branch:'主支全餐',meal:'套餐'};
const descriptions={chain:'從號碼池取出每一種完整單注；例如大樂透 8 碼連碰，會展開為 28 注。',columns:'每柱設定要取的碼數，可指定必須用到的主支柱。合計足夠碼數時產生一注。',smart:'依所提供軟體的輪盤表縮減組合。中 N 保 M 只描述「選定號碼池命中 N 個時」的覆蓋條件，不保證開獎會命中號碼池。',custom:'指定想要的組數，盡量平均使用號碼池中的號碼，組合不重複。結果含隨機性。',system:'取號碼池所有完整單注，與單一號碼池連碰相同；產生前會檢查注數上限。',banker:'每注保留全部膽碼，其餘從號碼池取出；膽碼必須包含在號碼池中。',branch:'固定主支加入每一注，從其餘完整號碼範圍分配配號，讓其餘各號碼至少出現一次。結果含隨機性，不是全組合或中獎保證。',meal:'按原軟體的套餐參數產生選號；加二合／加二三合會另外展開對應的樂合彩。'};
const money=n=>'NT$ '+n.toLocaleString('zh-TW');
function parsePool(value){if(!value.trim())return [];if(!/^[\d\s,，、;；]+$/.test(value))throw Error('號碼請使用數字，以空格、逗號或頓號分隔。');return value.trim().split(/[\s,，、;；]+/).map(Number);}
function updateAdvancedHeader(){const g=ComboEngine.GAMES[$('comboGame').value],version=document.querySelector('.version');version.firstChild.textContent=g.name+' ';version.querySelector('b').textContent=`${g.size} / ${g.max}`;document.querySelector('.intro').textContent='挑選組合方式，將方案整理成清單與 QR。';}
function comboMode(){mode(false);$('choosePanel').hidden=true;$('advancedPanel').hidden=false;for(const id of ['chooseTab','readTab']){$(id).classList.remove('active');$(id).setAttribute('aria-selected','false');}$('advancedTab').classList.add('active');$('advancedTab').setAttribute('aria-selected','true');updateAdvancedHeader();}
$('advancedTab').onclick=comboMode;
function invalidatePreview(){previewRevision++;comboPreviewTickets=[];$('comboPreview').hidden=true;$('comboMessage').textContent='';$('comboAdd').disabled=false;}
function invalidateBatches(){comboBatches=[];$('batchOutput').hidden=true;$('batchQrImage').replaceChildren();}
function updateWheels(){const previous=$('smartChoice').value;const select=$('smartChoice');select.replaceChildren();let pool;try{pool=parsePool($('comboPool').value);ComboEngine.validate(pool,ComboEngine.GAMES[$('comboGame').value].max);}catch{pool=[];}
 const n=pool.length,k=ComboEngine.GAMES[$('comboGame').value].size;const keys=Object.keys(LOTTO_WHEELS).filter(key=>key.startsWith(`${n}_${k}_`));
 for(const key of keys){const parts=key.split('_');const option=document.createElement('option');option.value=key;option.textContent=`選 ${n} 碼，中 ${parts[2]} 保 ${parts[3]} · ${LOTTO_WHEELS[key].length.toLocaleString()} 組`;select.append(option);}
 if(keys.includes(previous))select.value=previous;select.disabled=!keys.length;
 $('smartNote').textContent=keys.length?'參數取自原軟體組合表；全表覆蓋性未逐一驗證，不代表中獎保證。':'此號碼池數量沒有可用組合表，請調整號碼池。';
 $('poolCount').textContent=pool.length?`${n} 個號碼 · 全組合 ${ComboEngine.choose(n,k).toLocaleString()} 注`:'尚未輸入有效號碼池';
}
function renderMeals(){const game=$('comboGame').value,available=ComboEngine.PACKAGES.filter(p=>p.game===game);if(!available.some(p=>p.id===selectedMeal))selectedMeal=available[0].id;$('mealCards').replaceChildren();
 for(const p of available){const button=document.createElement('button');button.className='meal-card';button.setAttribute('aria-pressed',String(p.id===selectedMeal));const title=document.createElement('strong');title.textContent=p.name;const price=document.createElement('b');price.textContent=money(p.price);const note=document.createElement('span');note.textContent=p.note;button.append(title,price,note);button.onclick=()=>{selectedMeal=p.id;invalidatePreview();renderMeals();};$('mealCards').append(button);}}
function updateComboFields(){const m=$('comboMode').value,game=$('comboGame').value;
 $('comboGenerate').hidden=m==='meal';
 if(!$('advancedPanel').hidden)updateAdvancedHeader();
 $('comboDescription').textContent=descriptions[m];
 for(const [id,show] of [['poolFields',!['columns','branch','meal'].includes(m)],['fixedFields',['banker','branch'].includes(m)],['customFields',m==='custom'],['smartFields',m==='smart'],['columnFields',m==='columns'],['mealFields',m==='meal'],['secondFields',game==='638'&&m!=='meal'],['addonsFields',game!=='638'&&m!=='meal']])$(id).hidden=!show;
 $('comboPool').placeholder=`例如：${Array.from({length:8},(_,i)=>pad(i+1)).join('、')}`;
 invalidatePreview();updateWheels();renderMeals();
}
function addColumn(numbers='',take=1,required=false){if($('columnRows').children.length>=10){toast('最多設定十柱');return;}const row=document.createElement('div');row.className='column-row';
 const numLabel=document.createElement('label');numLabel.textContent='本柱號碼';const input=document.createElement('input');input.type='text';input.className='column-numbers';input.placeholder='01 02 03';input.value=numbers;numLabel.append(input);
 const takeLabel=document.createElement('label');takeLabel.textContent='取幾碼';const count=document.createElement('input');count.type='number';count.className='column-take';count.min='1';count.max='6';count.value=take;takeLabel.append(count);
 const main=document.createElement('label');main.className='column-main';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.className='column-required';checkbox.checked=required;main.append(checkbox,document.createTextNode('主支'));
 const remove=document.createElement('button');remove.className='text-btn muted';remove.textContent='移除';remove.setAttribute('aria-label','移除此柱');remove.onclick=()=>{row.remove();invalidatePreview();};
 row.append(numLabel,takeLabel,main,remove);row.oninput=invalidatePreview;$('columnRows').append(row);invalidatePreview();}
$('addColumn').onclick=()=>addColumn();addColumn('01 02 03 04',3);addColumn('05 06 07 08',3);
$('comboMode').onchange=updateComboFields;$('comboGame').onchange=updateComboFields;
$('comboPool').oninput=()=>{invalidatePreview();updateWheels();};
for(const id of ['comboFixed','comboCount','comboSecond','secondMode','smartChoice'])$(id).oninput=invalidatePreview;
$('addonsFields').onchange=invalidatePreview;
$('poolRandom').onclick=async()=>{
 if($('comboMode').value==='meal'){if($('comboGenerate').disabled)return;$('poolRandom').disabled=true;try{await $('comboGenerate').onclick();}finally{$('poolRandom').disabled=false;}return;}
 const game=$('comboGame').value,g=ComboEngine.GAMES[game];
 $('comboMode').value='chain';updateComboFields();
 $('comboPool').value=ComboEngine.sample(Array.from({length:g.max},(_,i)=>i+1),g.size).map(pad).join('、');
 if(game==='638'){$('comboSecond').value=String(ComboEngine.sample([1,2,3,4,5,6,7,8],1)[0]);$('secondMode').value='cross';}
 $('comboPool').dispatchEvent(new Event('input',{bubbles:true}));
 $('comboMode').dispatchEvent(new Event('change',{bubbles:true}));
 $('comboMessage').textContent='已快選一般單注號碼'+(game==='638'?'（含第二區）':'')+'，可調整後預覽；樂合彩依勾選項目加購。';
};
$('poolAll').onclick=()=>{$('comboPool').value=Array.from({length:ComboEngine.GAMES[$('comboGame').value].max},(_,i)=>pad(i+1)).join('、');invalidatePreview();updateWheels();};
function ticketText(t){if(ExtraGames.isExtra(t.game))return ExtraGames.label(t);const g=ComboEngine.GAMES[t.game];return `${g.name}${t.fun?` ${t.fun}合`:''}｜${t.numbers.map(pad).join('、')}${t.second?` ＋ 第二區 ${pad(t.second)}`:''}`;}
function ticketRows(tickets,box){box.replaceChildren();for(const [i,t]of tickets.slice(0,50).entries()){const row=document.createElement('div');row.className='ticket-row';const index=document.createElement('span');index.textContent=String(i+1).padStart(3,'0');const value=document.createElement('span');value.textContent=ticketText(t);row.append(index,value);box.append(row);}if(tickets.length>50){const note=document.createElement('p');note.className='tiny';note.textContent=`畫面僅列前 50 注，其餘 ${tickets.length-50} 注會一併加入、匯出與產生 QR。`;box.append(note);}}
$('comboGenerate').onclick=async()=>{
 const revision=previewRevision;const button=$('comboGenerate');button.disabled=true;$('comboMessage').textContent='正在計算組合…';
 await new Promise(resolve=>setTimeout(resolve,0));
 try{const game=$('comboGame').value,method=$('comboMode').value;let tickets;
  if(method==='meal'){tickets=ComboEngine.meal(selectedMeal);comboPreviewName=ComboEngine.GAMES[game].name+' · '+ComboEngine.PACKAGES.find(p=>p.id===selectedMeal).name;}
  else {const rows=[...$('columnRows').children].map(row=>({numbers:parsePool(row.querySelector('.column-numbers').value),take:Number(row.querySelector('.column-take').value),required:row.querySelector('.column-required').checked}));
   tickets=ComboEngine.generate({game,mode:method,pool:['columns','branch'].includes(method)?[]:parsePool($('comboPool').value),fixed:['banker','branch'].includes(method)?parsePool($('comboFixed').value):[],count:Number($('comboCount').value),columns:rows,smartKey:$('smartChoice').value,second:game==='638'?parsePool($('comboSecond').value):[1],secondMode:$('secondMode').value,addons:game==='638'?[]:[...$('addonsFields').querySelectorAll('input:checked')].map(i=>Number(i.value))});comboPreviewName=ComboEngine.GAMES[game].name+' · '+modeNames[method];}
  if(revision!==previewRevision)return;comboPreviewTickets=tickets;
  $('previewTitle').textContent=`共 ${tickets.length.toLocaleString()} 注`;$('previewMeta').textContent=`單期參考 ${money(ComboEngine.amount(tickets))} · 分成 ${ComboEngine.batches(tickets).length} 張 QR · ${comboPreviewName}`;
  ticketRows(tickets,$('previewRows'));$('comboPreview').hidden=false;$('comboAdd').disabled=false;$('comboMessage').textContent='組合已產生。請核對預覽後加入清單；尚未加入的預覽不會計入右側金額。';
 }catch(e){comboPreviewTickets=[];$('comboPreview').hidden=true;$('comboMessage').textContent=e.message;}
 finally{button.disabled=false;}
};
function cartTickets(){return comboCart.flatMap(e=>e.tickets);}
function renderComboCart(){const list=$('comboCartList');list.replaceChildren();
 if(!comboCart.length){const note=document.createElement('p');note.className='empty-group';note.textContent='清單是空的。從左側計算組合，或選擇一款套餐。';list.append(note);}
 for(const [i,entry]of comboCart.entries()){const row=document.createElement('div');row.className='cart-entry';const text=document.createElement('div');const name=document.createElement('strong');name.textContent=entry.name;const info=document.createElement('span');info.textContent=`${entry.tickets.length.toLocaleString()} 注 · 單期 ${money(ComboEngine.amount(entry.tickets))}`;text.append(name,info);const remove=document.createElement('button');remove.className='text-btn muted';remove.textContent='移除';remove.setAttribute('aria-label',`移除方案 ${i+1}`);remove.onclick=()=>{comboCart.splice(i,1);invalidateBatches();renderComboCart();};row.append(text,remove);list.append(row);}
 const all=cartTickets(),period=Number($('comboPeriod').value);$('cartTicketCount').textContent=`${all.length.toLocaleString()} 注`;$('comboAmount').textContent=money(ComboEngine.amount(all,period));for(const id of ['comboQr','comboCsv','comboPrint'])$(id).disabled=!all.length;
}
$('comboAdd').onclick=()=>{if(!comboPreviewTickets.length)return;if(cartTickets().length+comboPreviewTickets.length>ComboEngine.MAX){toast('清單最多保留 10,000 注，請先移除部分方案。');return;}comboCart.push({name:comboPreviewName,tickets:comboPreviewTickets.map(t=>({...t,numbers:[...t.numbers]}))});invalidateBatches();renderComboCart();$('comboAdd').disabled=true;toast('已加入包牌選號清單');};
for(let i=1;i<=10;i++){const o=document.createElement('option');o.value=i;o.textContent=`${i} 期`;$('comboPeriod').append(o);}
$('comboPeriod').onchange=()=>{invalidateBatches();renderComboCart();};$('clearComboCart').onclick=()=>{comboCart=[];invalidateBatches();renderComboCart();};
function renderBatch(){if(!comboBatches.length)return;const batch=comboBatches[batchIndex];const payload=MultiCodec.encode(batch.game,batch.tickets,Number($('comboPeriod').value));const decoded=MultiCodec.decode(payload);if(JSON.stringify(decoded.tickets)!==JSON.stringify(batch.tickets))throw Error('QR 資料核對失敗。');
 const url=makeQR(payload,10),img=document.createElement('img');img.src=url;img.alt=`${ComboEngine.GAMES[batch.game].name} 第${batchIndex+1}張 QR`;$('batchQrImage').replaceChildren(img);$('batchCaption').textContent=`${ComboEngine.GAMES[batch.game].name} · ${batch.tickets.length} 注 · ${$('comboPeriod').value} 期 · 共 ${comboBatches.length} 張`;
 $('batchSelect').value=batchIndex;$('prevBatch').disabled=batchIndex===0;$('nextBatch').disabled=batchIndex===comboBatches.length-1;$('batchOutput').hidden=false;
}
$('comboQr').onclick=()=>{try{comboBatches=ComboEngine.batches(cartTickets());batchIndex=0;$('batchSelect').replaceChildren();comboBatches.forEach((b,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${i+1} / ${comboBatches.length}`;$('batchSelect').append(o);});renderBatch();}catch(e){invalidateBatches();toast(e.message);}};
$('prevBatch').onclick=()=>{if(batchIndex>0){batchIndex--;renderBatch();}};$('nextBatch').onclick=()=>{if(batchIndex<comboBatches.length-1){batchIndex++;renderBatch();}};$('batchSelect').onchange=()=>{batchIndex=Number($('batchSelect').value);renderBatch();};
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('batchPng').onclick=()=>{const img=$('batchQrImage').querySelector('img');if(!img)return;const a=document.createElement('a');a.href=img.src;a.download=`QR_${String(batchIndex+1).padStart(3,'0')}_${ComboEngine.GAMES[comboBatches[batchIndex].game].name}.png`;a.click();};
$('batchZip').onclick=async()=>{if(zipBusy||!comboBatches.length)return;zipBusy=true;$('batchZip').disabled=true;const snapshot=comboBatches.map(b=>({game:b.game,tickets:b.tickets.map(t=>({...t,numbers:[...t.numbers]}))})),period=Number($('comboPeriod').value);
 try{const files={},manifest={period,status:'experimental_not_terminal_verified',batches:[]};for(const [i,b]of snapshot.entries()){
   const payload=MultiCodec.encode(b.game,b.tickets,period);const url=makeQR(payload,8);const bytes=Uint8Array.from(atob(url.split(',')[1]),c=>c.charCodeAt(0));const name=`QR_${String(i+1).padStart(3,'0')}_${b.game}.png`;files[name]=bytes;manifest.batches.push({...b,file:name,payload});
   if(i%5===0){$('zipStatus').textContent=`正在打包 ${i+1} / ${snapshot.length} 張…`;await new Promise(resolve=>setTimeout(resolve,0));}}
  files['selection.json']=fflate.strToU8(JSON.stringify(manifest,null,2));files['README.txt']=fflate.strToU8('QR，尚未通過台彩投注終端機相容性驗證。\n每張圖對應 selection.json 中的批次、號碼、彩種與期數。\n');const bytes=fflate.zipSync(files,{level:0});downloadBlob(new Blob([bytes],{type:'application/zip'}),`選號QR_${snapshot.length}張_${period}期.zip`);$('zipStatus').textContent=`已打包 ${snapshot.length} 張 QR 與完整選號紀錄。`;
 }catch(e){$('zipStatus').textContent='打包失敗：'+e.message;}finally{zipBusy=false;$('batchZip').disabled=false;}
};
$('comboCsv').onclick=()=>{const period=Number($('comboPeriod').value),rows=[['彩種','玩法','選號','第二區','倍數','期數','參考金額']];for(const t of cartTickets())rows.push([ComboEngine.GAMES[t.game].name,ExtraGames.isExtra(t.game)?(t.kind==='normal'?t.numbers.length+'星':t.kind==='super'?'超級獎號':ExtraGames.specialNames[t.kind]||'定位'):t.fun?`${t.fun}合`:'一般',t.game.startsWith('star')?t.numbers.join(''):t.numbers.map(pad).join(' '),t.second?pad(t.second):'',t.multiplier||1,period,ExtraGames.unitAmount(t)*period]);const csv='\ufeff'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),'共用選號清單.csv');};
$('comboPrint').onclick=()=>{const period=Number($('comboPeriod').value);let area=$('printSelections');if(!area){area=document.createElement('section');area.id='printSelections';document.body.append(area);}area.replaceChildren();const title=document.createElement('h1');title.textContent='共用選號清單';const info=document.createElement('p');info.textContent=`${cartTickets().length} 注 · ${period} 期 · 參考 ${money(ComboEngine.amount(cartTickets(),period))}。尚未通過投注終端機相容性驗證。`;area.append(title,info);cartTickets().forEach((t,i)=>{const p=document.createElement('p');p.textContent=`${i+1}. ${ticketText(t)}`;area.append(p);});document.body.classList.add('printing-selections');window.print();document.body.classList.remove('printing-selections');};
function showMultiDecoded(decoded){const header=document.querySelector('.version'),g=ComboEngine.GAMES[decoded.game];header.firstChild.textContent=g.name+' ';header.querySelector('b').textContent=decoded.game.startsWith('star')?g.size+' 位':decoded.game==='bingo'?'BINGO':g.size+' / '+g.max;lastDecoded=null;$('checkBadge').textContent='CRC 與標頭通過';const box=$('decodedResult');box.className='';box.replaceChildren();const title=document.createElement('div');title.className='decode-meta';title.textContent=`${ComboEngine.GAMES[decoded.game].name} · ${decoded.tickets.length} 注 · ${decoded.period} 期`;const rows=document.createElement('div');ticketRows(decoded.tickets,rows);const note=document.createElement('p');note.className='tiny';note.textContent='還原為標準單注資料。校驗通過不代表已接受投注。';const button=document.createElement('button');button.className='primary';button.textContent='加入共用選號清單 ↗';button.onclick=()=>{if(cartTickets().length+decoded.tickets.length>ComboEngine.MAX){toast('已超過清單注數上限');return;}
 if(comboCart.length&&Number($('comboPeriod').value)!==decoded.period){toast('清單期數不同，請先清空清單或調整為 '+decoded.period+' 期');return;}
 $('comboPeriod').value=decoded.period;comboCart.push({name:'QR 還原 · '+ComboEngine.GAMES[decoded.game].name,tickets:decoded.tickets.map(t=>({...t,numbers:[...t.numbers]}))});invalidateBatches();renderComboCart();comboMode();};box.append(title,rows,note,button);}
updateComboFields();renderComboCart();
