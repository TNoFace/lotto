document.querySelector('.tabs').insertAdjacentHTML('afterend',`
<section id="extraPanel" hidden>
 <div class="advanced-heading"><div><span class="eyebrow">BINGO & DIGIT GAMES</span><h2>星數、位數，都各就各位。</h2><p class="body-note">賓果 1～10 星、超級獎號、大小單雙；三／四星彩定位與組彩。選號和圖片皆在本機處理。</p></div><span class="small-tag">共用清單 · QR 分批下載</span></div>
 <div class="advanced-layout"><div class="panel advanced-editor extra-editor">
 <div class="advanced-fields"><label>新增彩種<select id="extraGame"><option value="bingo">BINGO賓果</option><option value="star3">三星彩</option><option value="star4">四星彩</option></select></label><label>本次倍數<input id="extraMultiplier" type="number" value="1" min="1" max="99" step="1"></label></div>
 <p class="tiny" id="extraMultiplierNote">賓果使用兩位倍數欄位。可輸入範圍屬格式容量，官方可用範圍待驗證。</p>
 <div id="bingoFields">
  <div class="advanced-fields"><label>賓果玩法<select id="bingoKind"><option value="normal">一般星數選號</option><option value="super">超級獎號</option><option value="special">猜大小／猜單雙</option></select></label><label id="bingoStarField">星數<select id="bingoStars"></select></label></div>
  <div id="bingoNormalFields"><label class="field-label" for="bingoMethod">賓果組合方式</label><select id="bingoMethod"><option value="basic">一般選號（恰選指定星數）</option><option value="chain">連碰包牌</option><option value="columns">立柱／主支立柱</option><option value="smart">聰明包牌</option><option value="custom">自選包牌</option><option value="system">系統包牌（全部組合）</option><option value="banker">膽拖（固定主支）</option><option value="branch">主支全餐</option></select></div>
  <p id="bingoRule" class="rule-note"></p>
  <div id="bingoPoolFields"><label class="field-label" for="bingoPool">賓果號碼／號碼池（01～80）</label><textarea id="bingoPool" rows="3">01 02 03</textarea><div class="pool-tools"><span class="tiny" id="bingoPoolCount"></span><div><button id="bingoAll" class="text-btn">全選80碼</button><button id="bingoClear" class="text-btn muted">清除</button></div></div><details class="bingo-grid-details"><summary>開啟 80 碼選號盤</summary><div id="bingoGrid" class="number-grid"></div></details></div>
  <div id="bingoFixedFields" hidden><label class="field-label" for="bingoFixed">固定主支／膽碼</label><input id="bingoFixed" placeholder="例如：01 02" type="text"></div>
  <div id="bingoCustomFields" hidden><label class="field-label" for="bingoCount">自選包牌組數</label><input id="bingoCount" type="number" value="10" min="1" max="10000"></div>
  <div id="bingoSmartFields" hidden><label class="field-label" for="bingoSmart">輪盤參數</label><select id="bingoSmart"></select><p class="tiny">沿用原軟體資料表；中N保M是條件覆蓋標示，全表覆蓋性未逐一驗證，不是中獎保證。</p></div>
  <div id="bingoColumnFields" hidden><div class="column-header"><span class="field-label">賓果立柱</span><button id="bingoAddColumn" class="text-btn">新增賓果立柱 ＋</button></div><div id="bingoColumnRows"></div><p class="tiny">不同柱不可重複號碼，主支柱必須取用。各柱合計需湊成指定星數。</p></div>
  <fieldset id="bingoSpecialFields" class="addons" hidden><legend>選擇大小單雙</legend><label><input type="checkbox" value="big"> 猜大</label><label><input type="checkbox" value="small"> 猜小</label><label><input type="checkbox" value="odd"> 猜單</label><label><input type="checkbox" value="even"> 猜雙</label></fieldset>
 </div>
 <div id="starFields" hidden><label class="field-label" for="starMethod">星彩組合方式</label><select id="starMethod"><option value="positions">定位選號／複式（各位數直接配對）</option><option value="permutations">組彩（包含重複數字的所有不同排列）</option><option value="positionPermute">位置選號組彩（各位數配對後再排列）</option></select><p id="starRule" class="rule-note"></p><div id="starPositionFields"></div><div id="starPermutationFields" hidden><label class="field-label" for="starDigits">組彩數字（可重複，保留前導零）</label><input id="starDigits" type="text" inputmode="numeric" value="011" placeholder="例如：011"><p class="tiny">例如 011 會產生 011、101、110 三個不同排列；不會誤去除重複數字。</p></div></div>
 <button id="extraQuick" type="button" class="console-quick">快選</button>
 <button id="extraGenerate" class="primary wide">產生選號並預覽 <span>↗</span></button><div id="extraMessage" class="combo-message" role="status"></div>
 <div id="extraPreview" hidden><div class="preview-heading"><strong id="extraPreviewTitle"></strong><button id="extraAdd" class="primary">加入共用清單 ＋</button></div><p id="extraPreviewMeta" class="tiny"></p><div id="extraPreviewRows" class="ticket-list"></div></div>
 </div><div id="extraCartSlot"></div></div>
</section>`);
let extraPreviewTickets=[],extraPreviewName='',extraRevision=0;
const sharedCart=document.querySelector('.advanced-cart');
function restoreSharedCart(){document.querySelector('#advancedPanel .advanced-layout').append(sharedCart);}
function showExtra(){mode(false);$('choosePanel').hidden=true;$('extraPanel').hidden=false;$('extraCartSlot').append(sharedCart);$('chooseTab').classList.remove('active');$('chooseTab').setAttribute('aria-selected','false');$('extraTab').classList.add('active');$('extraTab').setAttribute('aria-selected','true');extraHeader();}
$('extraTab').onclick=showExtra;
function extraHeader(){const game=$('extraGame').value,g=ComboEngine.GAMES[game];document.querySelector('.version').firstChild.textContent=g.name+' ';document.querySelector('.version b').textContent=game==='bingo'?($('bingoKind').value==='normal'?`${$('bingoStars').value} ★`:$('bingoKind').value==='super'?'超級':'特別'):String(g.size)+' 位';document.querySelector('.intro').textContent='保留每一個位置，整理每一種選法。';}
function clearExtraPreview(){extraRevision++;extraPreviewTickets=[];$('extraPreview').hidden=true;$('extraMessage').textContent='';$('extraAdd').disabled=false;}
function fillBingoWheels(){let pool=[];try{pool=ComboEngine.validate(parsePool($('bingoPool').value),80);}catch{}
 const star=Number($('bingoStars').value),old=$('bingoSmart').value;$('bingoSmart').replaceChildren();
 const keys=Object.keys(LOTTO_WHEELS).filter(k=>k.startsWith(`${pool.length}_${star}_`));for(const key of keys){const a=key.split('_'),o=document.createElement('option');o.value=key;o.textContent=`選${a[0]}碼，中${a[2]}保${a[3]} · ${LOTTO_WHEELS[key].length}組`;$('bingoSmart').append(o);}if(keys.includes(old))$('bingoSmart').value=old;
 if(!keys.length){const o=document.createElement('option');o.value='';o.textContent='此星數與號碼池沒有原始組合表';$('bingoSmart').append(o);}$('bingoSmart').disabled=!keys.length;
 $('bingoPoolCount').textContent=pool.length?($('bingoKind').value==='super'?`${pool.length} 個超級獎號 · ${pool.length} 注`:`${pool.length} 碼 · 全組合 ${ComboEngine.choose(pool.length,star).toLocaleString()} 注`):'請輸入不同的 01～80 號碼';
 document.querySelectorAll('#bingoGrid button').forEach(b=>b.setAttribute('aria-pressed',String(pool.includes(Number(b.dataset.number)))));
}
function extraFields(){const game=$('extraGame').value,isBingo=game==='bingo',kind=$('bingoKind').value,method=$('bingoMethod').value;
 $('bingoFields').hidden=!isBingo;$('starFields').hidden=isBingo;$('extraMultiplier').max=isBingo?'99':'999';$('extraMultiplierNote').textContent=isBingo?'賓果使用兩位倍數欄位；格式容量為 1～99 倍，官方可用範圍待驗證。':'星彩使用三位倍數欄位；格式容量為 1～999 倍，官方可用範圍待驗證。';
 const normal=kind==='normal';for(const [id,show]of [['bingoStarField',normal],['bingoNormalFields',normal],['bingoPoolFields',kind==='super'||normal&&!['columns','branch'].includes(method)],['bingoFixedFields',normal&&['banker','branch'].includes(method)],['bingoCustomFields',normal&&method==='custom'],['bingoSmartFields',normal&&method==='smart'],['bingoColumnFields',normal&&method==='columns'],['bingoSpecialFields',kind==='special']])$(id).hidden=!show;
 const notes={basic:'一般選號需恰好等於星數；輸入更多號碼時，請選連碰、系統或自選包牌。',chain:'從號碼池取出指定星數的全部組合。最多10,000注，不會自動截斷。',columns:'每柱取指定數量，主支柱必須使用；最後合計為指定星數。',smart:'依號碼池大小及星數選擇原軟體輪盤參數。',custom:'指定不重複組數，盡量平衡使用號碼；不保證中獎。',system:'把指定星數的所有組合展開為一般選號單注。',banker:'每注包含固定膽碼，其餘從號碼池選配。',branch:'固定主支放進每注，配遍其餘01～80號；不是全部組合。'};
 $('bingoRule').textContent=kind==='normal'?notes[method]:kind==='super'?'每個超級獎號分別計一注；同批使用相同倍數，重複加入的號碼會分批保留。':'每種玩法分開保留與編碼。相反玩法也可各自加入，不會用較大倍數覆蓋另一筆。';
 const starMethod=$('starMethod').value;$('starPositionFields').hidden=starMethod==='permutations';$('starPermutationFields').hidden=starMethod!=='permutations';
 $('starRule').textContent=starMethod==='positions'?'每個位置可選一或多個0～9數字，依千／百／十／個位順序直接配對，展開為定位單注。':starMethod==='permutations'?'保留重複數字與前導零，產生所有不同排列，再展開為定位單注。':'先把各位置的選號直接配對，再將每組數字做組彩排列；相同結果只保留一次。';
 if(!$('extraPanel').hidden)extraHeader();clearExtraPreview();fillBingoWheels();
}
function parseDigits(value){const compact=value.replace(/[\s,，、;；]/g,'');if(!/^\d+$/.test(compact))throw Error('星彩請輸入0～9數字。');return [...compact].map(Number);}
function buildPositions(){const k=$('extraGame').value==='star4'?4:3,names=k===4?['千位','百位','十位','個位']:['百位','十位','個位'];$('starPositionFields').replaceChildren();
 names.forEach((name,i)=>{const row=document.createElement('div');row.className='digit-position';const label=document.createElement('label');label.textContent=name;const input=document.createElement('input');input.id='starPosition'+i;input.className='star-position-input';input.type='text';input.inputMode='numeric';input.value=String(i);label.htmlFor=input.id;row.append(label,input);const keys=document.createElement('div');keys.className='digit-keys';
  for(let n=0;n<10;n++){const b=document.createElement('button');b.textContent=n;b.className='digit-key';b.setAttribute('aria-label',name+'數字 '+n);b.setAttribute('aria-pressed',String(n===i));b.onclick=()=>{let values;try{values=parseDigits(input.value);}catch{values=[];}const set=new Set(values);set.has(n)?set.delete(n):set.add(n);input.value=[...set].sort((a,b)=>a-b).join(' ');sync();clearExtraPreview();};keys.append(b);}
  function sync(){let values=[];try{values=parseDigits(input.value);}catch{}keys.querySelectorAll('button').forEach((b,n)=>b.setAttribute('aria-pressed',String(values.includes(n))));}input.oninput=()=>{sync();clearExtraPreview();};row.append(keys);$('starPositionFields').append(row);});
 $('starDigits').value=k===4?'0011':'011';
}
for(let i=1;i<=10;i++){const o=document.createElement('option');o.value=i;o.textContent=i+' 星';$('bingoStars').append(o);}$('bingoStars').value='3';
for(let n=1;n<=80;n++){const b=document.createElement('button');b.className='number';b.dataset.number=n;b.textContent=pad(n);b.setAttribute('aria-label','賓果號碼 '+pad(n));b.onclick=()=>{let pool;try{pool=parsePool($('bingoPool').value);}catch{pool=[];}const set=new Set(pool);set.has(n)?set.delete(n):set.add(n);$('bingoPool').value=[...set].sort((a,b)=>a-b).map(pad).join(' ');clearExtraPreview();fillBingoWheels();};$('bingoGrid').append(b);}
function addBingoColumn(numbers='',take=1){if($('bingoColumnRows').children.length>=10){toast('最多十柱');return;}const row=document.createElement('div');row.className='column-row';const label=document.createElement('label');label.textContent='賓果本柱號碼';const input=document.createElement('input');input.type='text';input.className='bingo-column-numbers';input.value=numbers;label.append(input);const countLabel=document.createElement('label');countLabel.textContent='取幾碼';const count=document.createElement('input');count.type='number';count.min='1';count.max='10';count.value=take;count.className='bingo-column-take';countLabel.append(count);const main=document.createElement('label');main.className='column-main';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.className='bingo-column-required';main.append(checkbox,document.createTextNode('主支'));const remove=document.createElement('button');remove.className='text-btn muted';remove.textContent='移除';remove.onclick=()=>{row.remove();clearExtraPreview();};row.append(label,countLabel,main,remove);row.oninput=clearExtraPreview;$('bingoColumnRows').append(row);clearExtraPreview();}
$('bingoAddColumn').onclick=()=>addBingoColumn();addBingoColumn('01 02 03 04',2);addBingoColumn('05 06 07 08',1);
$('extraGame').onchange=()=>{buildPositions();extraFields();};for(const id of ['bingoKind','bingoStars','bingoMethod','starMethod'])$(id).onchange=extraFields;
for(const id of ['extraMultiplier','bingoFixed','bingoCount','bingoSmart','starDigits'])$(id).oninput=clearExtraPreview;
$('bingoSpecialFields').onchange=clearExtraPreview;$('bingoPool').oninput=()=>{clearExtraPreview();fillBingoWheels();};
$('extraQuick').onclick=()=>{
 const game=$('extraGame').value;
 if(game==='bingo'){
  const kind=$('bingoKind').value;
  if(kind==='special'){
   const picked=ComboEngine.sample([0,1,2,3],1)[0];
   $('bingoSpecialFields').querySelectorAll('input').forEach((input,i)=>{input.checked=i===picked;});
   $('bingoSpecialFields').dispatchEvent(new Event('change',{bubbles:true}));
  }else{
   if(kind==='normal'){$('bingoMethod').value='basic';$('bingoMethod').dispatchEvent(new Event('change',{bubbles:true}));}
   $('bingoPool').value=ComboEngine.sample(Array.from({length:80},(_,i)=>i+1),kind==='super'?1:Number($('bingoStars').value)).map(pad).join(' ');
   $('bingoPool').dispatchEvent(new Event('input',{bubbles:true}));
  }
 }else{
  const digits=ExtraGames.randomDigits(game);
  $('starMethod').value='positions';$('starMethod').dispatchEvent(new Event('change',{bubbles:true}));
  [...$('starPositionFields').querySelectorAll('input')].forEach((input,i)=>{input.value=String(digits[i]);input.dispatchEvent(new Event('input',{bubbles:true}));});
 }
 $('extraMessage').textContent='已快選一組號碼，可手動調整後點「產生選號並預覽」。';
};
$('bingoAll').onclick=()=>{$('bingoPool').value=Array.from({length:80},(_,i)=>pad(i+1)).join(' ');clearExtraPreview();fillBingoWheels();};$('bingoClear').onclick=()=>{$('bingoPool').value='';clearExtraPreview();fillBingoWheels();};
$('extraGenerate').onclick=async()=>{const revision=extraRevision;const button=$('extraGenerate');button.disabled=true;$('extraMessage').textContent='正在產生選號…';await new Promise(r=>setTimeout(r,0));
 try{const game=$('extraGame').value,multiplier=Number($('extraMultiplier').value);let tickets;
  if(game==='bingo'){
   const kind=$('bingoKind').value,method=$('bingoMethod').value;const pool=kind==='special'||kind==='normal'&&['columns','branch'].includes(method)?[]:parsePool($('bingoPool').value);
   tickets=ExtraGames.bingo({kind,method,pool,star:Number($('bingoStars').value),multiplier,fixed:['branch','banker'].includes(method)?parsePool($('bingoFixed').value):[],count:Number($('bingoCount').value),smartKey:$('bingoSmart').value,specials:[...$('bingoSpecialFields').querySelectorAll('input:checked')].map(i=>i.value),columns:[...$('bingoColumnRows').children].map(row=>({numbers:parsePool(row.querySelector('.bingo-column-numbers').value),take:Number(row.querySelector('.bingo-column-take').value),required:row.querySelector('.bingo-column-required').checked}))});
   extraPreviewName='BINGO賓果 · '+(kind==='normal'?$('bingoStars').value+'星 · '+$('bingoMethod').selectedOptions[0].textContent:kind==='super'?'超級獎號':'大小單雙');
  }else {const method=$('starMethod').value;tickets=ExtraGames.stars({game,method,multiplier,digits:method==='permutations'?parseDigits($('starDigits').value,true):[],positions:method==='permutations'?[]:[...$('starPositionFields').querySelectorAll('input')].map(i=>parseDigits(i.value))});extraPreviewName=ComboEngine.GAMES[game].name+' · '+$('starMethod').selectedOptions[0].textContent;}
  if(revision!==extraRevision)return;extraPreviewTickets=tickets;$('extraPreviewTitle').textContent=`共 ${tickets.length.toLocaleString()} 注`;$('extraPreviewMeta').textContent=`單期參考 ${money(ComboEngine.amount(tickets))}（已含倍數） · ${ComboEngine.batches(tickets).length} 張QR`;
  ticketRows(tickets,$('extraPreviewRows'));$('extraPreview').hidden=false;$('extraAdd').disabled=false;$('extraMessage').textContent='請核對號碼、位置與倍數後加入共用清單。';
 }catch(e){extraPreviewTickets=[];$('extraPreview').hidden=true;$('extraMessage').textContent=e.message;}finally{button.disabled=false;}
};
$('extraAdd').onclick=()=>{if(!extraPreviewTickets.length)return;if(cartTickets().length+extraPreviewTickets.length>ComboEngine.MAX){toast('共用清單最多10,000注，請先移除部分方案。');return;}comboCart.push({name:extraPreviewName,tickets:extraPreviewTickets.map(t=>({...t,numbers:[...t.numbers]}))});invalidateBatches();renderComboCart();$('extraAdd').disabled=true;toast('已加入右側共用清單');};
buildPositions();extraFields();
