/* Touch console presentation. Original game and QR engines stay in control. */
(()=>{
 const rail=document.querySelector('.rail');
 rail.innerHTML=`<a class="console-brand" href="#" aria-label="選號工作台首頁">發財專線<span>選號工作台</span><b aria-hidden="true">福</b></a><nav class="game-menu" aria-label="彩種"><button data-game="meal" class="game-tile meal-logo">套餐 <span>全餐・組合</span></button><button data-game="bingo" class="game-tile bingo-logo"><i>BINGO</i><span>賓果</span></button><button data-game="539" class="game-tile today-logo"><small>今彩</small>539</button><button data-game="649" class="game-tile lotto-logo">大<span>樂透</span></button><button data-game="638" class="game-tile power-logo">威力<span>彩</span></button><button data-game="39" class="game-tile fun-logo"><b>39</b>樂合彩<small>加購</small></button><button data-game="49" class="game-tile fun-logo purple"><b>49</b>樂合彩<small>加購</small></button><button data-game="star3" class="game-tile star-logo"><b>3</b>星彩</button><button data-game="star4" class="game-tile star-logo"><b>4</b>星彩</button></nav>`;
 document.body.insertAdjacentHTML('afterbegin',`<div class="console-top"><div id="draftTabs" class="draft-tabs" role="group" aria-label="選號草稿頁"></div><strong>發財專線 <small>選號工作台</small></strong><div class="console-tools"><button id="consoleFull" title="切換全螢幕" aria-label="切換全螢幕">⛶</button></div></div>`);
 document.querySelector('.tabs').insertAdjacentHTML('afterend',`<div class="console-global-actions" role="group" aria-label="選號操作"><button id="consoleClearAll" type="button">全部清除</button><button id="consoleAuto" type="button" aria-pressed="false">自動清除 <span>關閉</span></button></div>`);
 const top=document.querySelector('.console-top');
 const basicEditor=document.querySelector('#choosePanel .editor');
 basicEditor.insertAdjacentHTML('afterbegin','<div class="console-page-line"><strong id="consolePageLabel">第 01 頁</strong><button id="consoleClear">清除</button></div>');
 const comboEditor=document.querySelector('#advancedPanel .advanced-editor');
 comboEditor.insertAdjacentHTML('afterbegin','<div class="console-page-line"><strong id="consoleComboTitle">大樂透選號</strong><button id="consolePoolClear">清除</button></div><div id="consolePoolGrid" class="console-number-grid" aria-label="包牌號碼盤"></div>');
 const extraEditor=document.querySelector('.extra-editor');
 extraEditor.insertAdjacentHTML('afterbegin','<div class="console-page-line"><strong id="consoleExtraTitle">賓果選號</strong><button id="consoleExtraClear">清除</button></div>');
 let activeGame='649',page=0,autoClear=false;
 const drafts=new Map();
 const dispatch=(el,type)=>el.dispatchEvent(new Event(type,{bubbles:true}));
 function isExtra(){return !$('extraPanel').hidden;}
 function isAdvanced(){return !$('advancedPanel').hidden;}
 function setValue(id,value){$(id).value=value;dispatch($(id),'change');}
 function key(){return (isExtra()?$('extraGame').value:isAdvanced()?$('comboGame').value:'649')+':'+(isAdvanced()?'pool':isExtra()?'extra':'basic')+':'+page;}
 function currentDraft(){
  if(activeGame==='649'&&!isAdvanced())return {type:'basic',values:[...selected]};
  if(isAdvanced())return {type:'pool',values:$('comboPool').value};
  if($('extraGame').value==='bingo')return {type:'bingo',values:$('bingoPool').value};
  return {type:'star',values:[...$('starPositionFields').querySelectorAll('input')].map(i=>i.value),digits:$('starDigits').value};
 }
 function saveDraft(){drafts.set(key(),currentDraft());}
 function applyDraft(d){
  if(activeGame==='649'&&!isAdvanced()){selected=new Set(d?.type==='basic'?d.values:[]);editing=null;renderSelection();}
  else if(isAdvanced()){$('comboPool').value=d?.type==='pool'?d.values:'';dispatch($('comboPool'),'input');}
  else if($('extraGame').value==='bingo'){$('bingoPool').value=d?.type==='bingo'?d.values:'';dispatch($('bingoPool'),'input');}
  else {document.querySelectorAll('.star-position-input').forEach((el,i)=>{el.value=d?.type==='star'?d.values[i]||'':'';dispatch(el,'input');});$('starDigits').value=d?.type==='star'?d.digits:'';dispatch($('starDigits'),'input');}
  sync();
 }
 function drawPages(){
  $('draftTabs').replaceChildren();
  for(let i=0;i<10;i++){const b=document.createElement('button');b.textContent=pad(i+1);b.className='draft-tab';b.setAttribute('aria-label','選號草稿第 '+(i+1)+' 頁');b.setAttribute('aria-pressed',String(page===i));b.onclick=()=>{saveDraft();page=i;applyDraft(drafts.get(key()));drawPages();};$('draftTabs').append(b);}
  $('consolePageLabel').textContent='第 '+pad(page+1)+' 頁';
 }
 function syncPoolGrid(){
  const grid=$('consolePoolGrid'),game=$('comboGame').value,max=ComboEngine.GAMES[game].max;
  const visible=!$('poolFields').hidden;
  grid.hidden=!visible;
  if(!visible)return;
  if(grid.children.length!==max){grid.replaceChildren();for(let n=1;n<=max;n++){const b=document.createElement('button');b.textContent=pad(n);b.className='console-number';b.dataset.number=n;b.setAttribute('aria-label','包牌號碼 '+pad(n));b.onclick=()=>{let values;try{values=parsePool($('comboPool').value);}catch{values=[];}const set=new Set(values);set.has(n)?set.delete(n):set.add(n);$('comboPool').value=[...set].sort((a,b)=>a-b).map(pad).join('、');dispatch($('comboPool'),'input');syncPoolGrid();};grid.append(b);}}
  let values=[];try{values=parsePool($('comboPool').value);}catch{}
  grid.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(values.includes(+b.dataset.number))));
 }
 function sync(){
  document.body.dataset.consoleMode=!$('readPanel').hidden?'read':isExtra()?'extra':isAdvanced()?'advanced':'basic';
  const game=!$('readPanel').hidden?null:isExtra()?$('extraGame').value:isAdvanced()?$('comboMode').value==='meal'?'meal':$('comboGame').value:'649';
  document.querySelectorAll('.game-tile').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.game===game||b.dataset.game===activeGame&&['39','49'].includes(activeGame))));
  $('consoleComboTitle').textContent=ComboEngine.GAMES[$('comboGame').value].name+' · '+pad(page+1)+'頁';
  $('consoleExtraTitle').textContent=ComboEngine.GAMES[$('extraGame').value].name+' · '+pad(page+1)+'頁';
  document.querySelector('.bingo-grid-details').open=true;
  document.querySelectorAll('#bingoGrid button').forEach(b=>b.disabled=false);
  if(isAdvanced())syncPoolGrid();
 }
 function selectGame(game){
  saveDraft();activeGame=game;
  if(game==='649')mode(false);
  else if(['bingo','star3','star4'].includes(game)){if($('extraGame').value!==game)setValue('extraGame',game);showExtra();}
  else {comboMode();const actual=['39','49'].includes(game)?game==='39'?'539':'649':game==='meal'?'649':game;setValue('comboGame',actual);setValue('comboMode',game==='meal'?'meal':'chain');
   if(['39','49'].includes(game)){document.querySelector('#addonsFields input[value="2"]').checked=true;dispatch($('addonsFields'),'change');toast('樂合彩沿用加購方式，會連同本彩種一起加入清單。');}}
  const saved=drafts.get(key());if(saved)applyDraft(saved);sync();drawPages();
 }
 document.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>selectGame(b.dataset.game));
 $('consoleClear').onclick=()=>{$('clearBtn').click();};
 $('consolePoolClear').onclick=()=>{$('comboPool').value='';dispatch($('comboPool'),'input');sync();};
 $('consoleExtraClear').onclick=()=>{if($('extraGame').value==='bingo')$('bingoClear').click();else applyDraft();sync();};
 $('consoleClearAll').onclick=()=>{groups=[];selected.clear();editing=null;invalidate();renderGroups();$('clearComboCart').click();drafts.clear();$('comboPool').value='';dispatch($('comboPool'),'input');applyDraft();toast('選號與清單已清除');};
 $('consoleAuto').onclick=()=>{autoClear=!autoClear;$('consoleAuto').setAttribute('aria-pressed',String(autoClear));$('consoleAuto').querySelector('span').textContent=autoClear?'開啟':'關閉';};
 $('consoleFull').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('此瀏覽器目前無法切換全螢幕');}};
 function stepper(id){const select=$(id),parent=select.parentElement;parent.classList.add('console-period');parent.querySelector('label').textContent='期';const minus=document.createElement('button'),plus=document.createElement('button');minus.textContent='−';plus.textContent='＋';minus.setAttribute('aria-label','減少一期');plus.setAttribute('aria-label','增加一期');minus.onclick=()=>{select.value=Math.max(1,Number(select.value)-1);dispatch(select,'change');};plus.onclick=()=>{select.value=Math.min(10,Number(select.value)+1);dispatch(select,'change');};select.before(minus);select.after(plus);}
 stepper('period');stepper('comboPeriod');
 $('randomBtn').textContent='快選';$('clearBtn').textContent='清除';$('generateBtn').firstChild.textContent='產生 QR Code ';$('comboQr').firstChild.textContent='產生 QR Code ';
 const basicAdd=$('addBtn').onclick;
 $('addBtn').onclick=()=>{const keep=[...selected];basicAdd();if(!autoClear&&keep.length===6){selected=new Set(keep);renderSelection();}};
 const basicQr=$('generateBtn').onclick;
 $('generateBtn').onclick=()=>{const keep=[...selected],sorted=[...keep].sort((a,b)=>a-b);const alreadyAdded=editing===null&&keep.length===6&&groups.some(g=>g.every((n,i)=>n===sorted[i]));if(alreadyAdded)selected.clear();try{basicQr();}finally{if(alreadyAdded){selected=new Set(keep);renderSelection();}}};
 for(const [id,clear]of [['comboAdd','consolePoolClear'],['extraAdd','consoleExtraClear']]){const add=$(id).onclick;$(id).onclick=()=>{const before=cartTickets().length;add();if(autoClear&&cartTickets().length>before)$(clear).click();};}
 document.querySelector('.editor-bottom').append($('randomBtn'));
 for(const [quickId,generateId] of [['poolRandom','comboGenerate'],['extraQuick','extraGenerate']]){const row=document.createElement('div');row.className='console-quick-actions';const quick=$(quickId),generate=$(generateId);quick.textContent='快選';quick.className='console-quick';quick.title=quickId==='poolRandom'?'快選一般單注；套餐依目前方案重新產生':'依目前彩種快選一般單注';generate.before(row);row.append(quick,generate);}
 document.querySelector('#choosePanel .panel-top').hidden=true;
 // Keep draft grids and the dock in sync with the original controls.
 document.addEventListener('change',sync);document.addEventListener('input',e=>{if(e.target.id==='comboPool')syncPoolGrid();});
 for(const id of ['chooseTab','advancedTab','extraTab','readTab'])$(id).addEventListener('click',()=>{activeGame=isExtra()?$('extraGame').value:isAdvanced()?$('comboGame').value:'649';sync();drawPages();});
 for(const id of ['poolRandom','poolAll','extraQuick','bingoAll','bingoClear','addBtn','comboAdd','extraAdd'])$(id).addEventListener('click',sync);
 document.querySelector('footer').firstElementChild.textContent='發財專線 · 選號工作台 · v2026.10.27.7';
 // Format completed edits without moving the cursor while the user is typing.
 document.addEventListener('focusout',e=>{
  const input=e.target;
  if(!input.matches('#comboPool,#comboFixed,#comboSecond,#bingoPool,#bingoFixed,.column-numbers,.bingo-column-numbers,.star-position-input'))return;
  if(!input.value.trim()||!/^[\d\s,，、;；]+$/.test(input.value))return;
  const numbers=input.value.trim().split(/[\s,，、;；]+/).filter(Boolean).map(Number);
  const max=input.matches('.star-position-input')?9:input.id==='comboSecond'?8:input.id.startsWith('bingo')||input.matches('.bingo-column-numbers')?80:ComboEngine.GAMES[$('comboGame').value].max;
  const min=input.matches('.star-position-input')?0:1;
  if(numbers.some(n=>!Number.isInteger(n)||n<min||n>max))return;
  const formatted=numbers.map(n=>input.matches('.star-position-input')?String(n):pad(n)).join('、');
  if(formatted!==input.value){input.value=formatted;dispatch(input,'input');}
 });
 sync();drawPages();
})();

