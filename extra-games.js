/* Static port of reviewed bingo.py / lotto3star.py / lotto4star.py routines. */
const ExtraGames=(()=>{
 const pad=(n,w=2)=>String(n).padStart(w,'0'),MAX=ComboEngine.MAX;
 const specialNames={big:'猜大',small:'猜小',odd:'猜單',even:'猜雙'};
 Object.assign(ComboEngine.GAMES,{bingo:{name:'BINGO賓果',size:1,max:80,price:25,code:'01102'},star3:{name:'三星彩',size:3,max:9,price:25,code:'02108'},star4:{name:'四星彩',size:4,max:9,price:25,code:'02109'}});
 const isExtra=game=>['bingo','star3','star4'].includes(game);
 function multiple(n,game){const max=game==='bingo'?99:999;if(!Number.isInteger(n)||n<1||n>max)throw Error(`倍數需為 1～${max} 的整數（格式容量，非已驗證的官方範圍）。`);return n;}
 function digitPool(a){if(!Array.isArray(a)||!a.length||new Set(a).size!==a.length||a.some(n=>!Number.isInteger(n)||n<0||n>9))throw Error('每個位置請選擇不同的 0～9 數字。');return [...a].sort((a,b)=>a-b);}
 function positions(rows){if(![3,4].includes(rows.length))throw Error('星彩需設定三或四個位置。');rows=rows.map(digitPool);if(rows.reduce((n,a)=>n*a.length,1)>MAX)throw Error('定位組合超過 10,000 注。');let out=[[]];for(const row of rows)out=out.flatMap(a=>row.map(n=>[...a,n]));return out;}
 function permutations(numbers){if(![3,4].includes(numbers.length)||numbers.some(n=>!Number.isInteger(n)||n<0||n>9))throw Error('組彩需輸入三或四個 0～9 數字，可重複。');const seen=new Map();function run(a,rest){if(!rest.length){seen.set(a.join(''),a);return;}for(let i=0;i<rest.length;i++)run([...a,rest[i]],[...rest.slice(0,i),...rest.slice(i+1)]);}run([],numbers);return [...seen.values()].sort((a,b)=>a.join('').localeCompare(b.join('')));}
 function randomDigits(game){if(!['star3','star4'].includes(game))throw Error('電腦選號僅支援三星彩與四星彩。');const pool=Array.from({length:10},(_,i)=>i);return Array.from({length:game==='star3'?3:4},()=>ComboEngine.sample(pool,1)[0]);}
 function stars(params){const game=params.game;if(!['star3','star4'].includes(game))throw Error('星彩彩種不正確。');const k=game==='star3'?3:4;multiple(params.multiplier,game);let list;
  if(params.method==='permutations'){if(params.digits.length!==k)throw Error(`請輸入 ${k} 個組彩數字。`);list=permutations(params.digits);}
  else {if(params.positions.length!==k)throw Error(`請輸入 ${k} 個位置。`);list=positions(params.positions);if(params.method==='positionPermute'){const seen=new Map();for(const a of list)for(const b of permutations(a))seen.set(b.join(''),b);list=[...seen.values()].sort((a,b)=>a.join('').localeCompare(b.join('')));}else if(params.method!=='positions')throw Error('未知星彩玩法。');}
  if(list.length>MAX)throw Error('組彩結果超過 10,000 注。');return list.map(numbers=>({game,numbers,multiplier:params.multiplier}));
 }
 function bingo(params){
  const multiplier=multiple(params.multiplier,'bingo');
  if(params.kind==='super'){const pool=ComboEngine.validate(params.pool,80);return pool.map(n=>({game:'bingo',numbers:[n],kind:'super',multiplier}));}
  if(params.kind==='special'){if(!params.specials.length||params.specials.some(k=>!specialNames[k])||new Set(params.specials).size!==params.specials.length)throw Error('請選擇至少一種大小單雙玩法。');return params.specials.map(kind=>({game:'bingo',numbers:[],kind,multiplier}));}
  if(params.kind!=='normal')throw Error('未知賓果玩法。');
  const k=params.star;if(!Number.isInteger(k)||k<1||k>10)throw Error('賓果星數需為 1～10 星。');let list;
  if(params.method==='columns')list=ComboEngine.columns(params.columns,k,80);
  else if(params.method==='branch')list=ComboEngine.branch(params.fixed,k,80);
  else {const pool=ComboEngine.validate(params.pool,80,k);
   if(params.method==='basic'){if(pool.length!==k)throw Error(`一般選號需恰好 ${k} 碼；多碼請改用連碰或系統包牌。`);list=[pool];}
   else if(['chain','system'].includes(params.method))list=ComboEngine.combos(pool,k);
   else if(params.method==='custom')list=ComboEngine.free(pool,k,params.count);
   else if(params.method==='smart')list=ComboEngine.smart(pool,k,params.smartKey);
   else if(params.method==='banker'){const fixed=ComboEngine.validate(params.fixed,80);if(fixed.length>=k||fixed.some(n=>!pool.includes(n)))throw Error('主支膽碼需包含在號碼池，且少於星數。');list=ComboEngine.combos(pool.filter(n=>!fixed.includes(n)),k-fixed.length).map(a=>[...fixed,...a].sort((a,b)=>a-b));}
   else throw Error('未知賓果組合方式。');
  }
  if(!list.length)throw Error('立柱條件無法湊成指定星數。');return list.map(numbers=>({game:'bingo',numbers,kind:'normal',multiplier}));
 }
 function build(game,tickets,period){
  if(!isExtra(game)||!Number.isInteger(period)||period<1||period>10)throw Error('彩種或期數不正確；本版提供 1～10 期。');
  if(!tickets.length||tickets.some(t=>t.game!==game))throw Error('每張 QR 必須有選號且不可混合彩種。');
  let s=ComboEngine.GAMES[game].code+pad(period)+'00'+'10000000000';
  if(game!=='bingo'){
   if(tickets.length>10)throw Error('星彩每張 QR 最多十筆。');const k=game==='star3'?3:4;
   for(const t of tickets){multiple(t.multiplier,game);if(t.numbers.length!==k||t.numbers.some(n=>!Number.isInteger(n)||n<0||n>9))throw Error('星彩位數或數字不正確。');s+=t.numbers.map(n=>'01'+n).join('')+'01'+pad(t.multiplier,3);}
  }else{
   const normal=tickets.filter(t=>t.kind==='normal'),superList=tickets.filter(t=>t.kind==='super'),special=tickets.filter(t=>specialNames[t.kind]);
   if(normal.length+superList.length+special.length!==tickets.length||normal.length>10||superList.length>20||special.length>4)throw Error('賓果每張 QR 的類型或筆數不正確。');
   if(new Set(special.map(t=>t.kind)).size!==special.length)throw Error('同一張 QR 不可重複同一大小單雙玩法。');
   for(const t of tickets)multiple(t.multiplier,'bingo');if(special.some(t=>t.numbers.length))throw Error('大小單雙不應包含號碼。');s+='1823';
   for(const pair of [['big','small'],['odd','even']]){const entries=pair.map(k=>special.find(t=>t.kind===k));const mult=entries.filter(Boolean).map(t=>t.multiplier);if(new Set(mult).size>1)throw Error('同類大小或單雙不同倍數必須分批。');s+=entries.map(t=>t?'1':'0').join('')+'0'+pad(mult[0]||1);}
   if(superList.length){const numbers=superList.map(t=>t.numbers[0]);if(superList.some(t=>t.numbers.length!==1)||new Set(superList.map(t=>t.multiplier)).size!==1)throw Error('超級獎號需單碼且同批倍數相同。');ComboEngine.validate(numbers,80);s+='1'+numbers.sort((a,b)=>a-b).map(n=>pad(n)).join('').padStart(40,'0')+'0'+pad(superList[0].multiplier);}
   else s+='0'+'0'.repeat(40)+'0'+'01';
   for(const t of normal){const numbers=ComboEngine.validate(t.numbers,80);if(numbers.length>10)throw Error('賓果一般選號最多十星。');s+=pad(numbers.length)+numbers.map(n=>pad(n)).join('').padEnd(20,'0')+'0'+pad(t.multiplier);}
   if(!normal.length)s+='00';
  }
  return s+'0'.repeat((10-s.length%10)%10);
 }
 function decode(payload){const s=LottoCodec.decodePlain(payload),game=Object.keys(ComboEngine.GAMES).find(k=>ComboEngine.GAMES[k].code===s.slice(0,5));if(!isExtra(game))throw Error('不是賓果或星彩格式。');const period=Number(s.slice(5,7));if(s.slice(7,20)!=='0010000000000')throw Error('尚未支援此延遲或標頭設定。');
  if(!Number.isInteger(period)||period<1||period>10)throw Error('此期數超出本版 1～10 期範圍。');
  let tickets=[],cursor=20;
  if(game!=='bingo'){
   const k=game==='star3'?3:4;let records=0;
   while(cursor<s.length&&!/^0*$/.test(s.slice(cursor))){if(++records>10)throw Error('星彩筆數超出本版支援範圍。');const pools=[];
    for(let i=0;i<k;i++){const n=Number(s.slice(cursor,cursor+2));cursor+=2;if(n<1||n>10||cursor+n>s.length)throw Error('星彩位置長度不正確。');const row=[...s.slice(cursor,cursor+n)].map(Number);cursor+=n;digitPool(row);if(row.join('')!==[...row].sort((a,b)=>a-b).join(''))throw Error('星彩位置順序不正確。');pools.push(row);}
    if(s.slice(cursor,cursor+2)!=='01')throw Error('未知星彩結尾標記。');cursor+=2;const multiplier=multiple(Number(s.slice(cursor,cursor+3)),game);cursor+=3;
    tickets.push(...positions(pools).map(numbers=>({game,numbers,multiplier})));if(tickets.length>MAX)throw Error('複式展開超過 10,000 注。');
   }
   if(!tickets.length||s.slice(cursor)!=='0'.repeat((10-cursor%10)%10))throw Error('星彩內容或補零不完整。');
  }else{
   if(s.slice(20,24)!=='1823')throw Error('未知賓果固定欄位。');
   for(const [start,pair]of [[24,['big','small']],[29,['odd','even']]]){if(!/^[01]{2}0\d{2}$/.test(s.slice(start,start+5)))throw Error('賓果大小單雙欄位錯誤。');const mult=multiple(Number(s.slice(start+3,start+5)),'bingo');for(let i=0;i<2;i++)if(s[start+i]==='1')tickets.push({game,numbers:[],kind:pair[i],multiplier:mult});}
   if(!['0','1'].includes(s[34])||s[75]!=='0')throw Error('未知賓果超級獎號標記。');const superMult=multiple(Number(s.slice(76,78)),'bingo');
   if(s[34]==='1'){const raw=s.slice(35,75),numbers=[];let begun=false;for(let i=0;i<40;i+=2){const n=Number(raw.slice(i,i+2));if(n===0&&!begun)continue;begun=true;numbers.push(n);}ComboEngine.validate(numbers,80);for(const n of numbers)tickets.push({game,numbers:[n],kind:'super',multiplier:superMult});}
   else if(s.slice(35,75)!=='0'.repeat(40)||superMult!==1)throw Error('空白超級獎號內容不正確。');
   cursor=78;let normal=0;
   if(s.slice(cursor,cursor+2)==='00')cursor+=2;
   else while(cursor<s.length&&!/^0*$/.test(s.slice(cursor))){const count=Number(s.slice(cursor,cursor+2));if(count<1||count>10||++normal>10||cursor+25>s.length)throw Error('賓果星數或一般選號長度不正確。');const block=s.slice(cursor,cursor+25);if(block[22]!=='0')throw Error('未知賓果快選標記。');const numbers=Array.from({length:count},(_,i)=>Number(block.slice(2+2*i,4+2*i)));const multiplier=multiple(Number(block.slice(23,25)),'bingo');tickets.push({game,numbers,kind:'normal',multiplier});cursor+=25;}
   if(build(game,tickets,period)!==s)throw Error('賓果補零、選號順序或倍數設定不符合目前版本。');
  }
  return {game,tickets,period,payload,plaintext:s};
 }
 const oldBuild=MultiCodec.build,oldEncode=MultiCodec.encode,oldDecode=MultiCodec.decode;
 MultiCodec.build=(g,t,p)=>isExtra(g)?build(g,t,p):oldBuild(g,t,p);
 MultiCodec.encode=(g,t,p)=>isExtra(g)?LottoCodec.encodePlain(build(g,t,p)):oldEncode(g,t,p);
 MultiCodec.decode=payload=>{const s=LottoCodec.decodePlain(payload);return ['01102','02108','02109'].includes(s.slice(0,5))?decode(payload):oldDecode(payload);};
 const oldBatches=ComboEngine.batches;
 ComboEngine.batches=(cart,size=10)=>{
  const old=cart.filter(t=>!isExtra(t.game)),extra=cart.filter(t=>isExtra(t.game)),out=oldBatches(old,size),partitions=new Map();
  for(const t of extra){const key=t.game==='bingo'?`bingo:${t.kind}:${t.kind==='normal'?'mixed':t.multiplier}`:t.game;if(!partitions.has(key))partitions.set(key,[]);partitions.get(key).push(t);}
  for(const list of partitions.values()){let current=[];for(const t of list){if(current.length&&(current.length>=size||t.game==='bingo'&&(specialNames[t.kind]||t.kind==='super'&&current.some(x=>x.numbers[0]===t.numbers[0])))){out.push({game:current[0].game,tickets:current});current=[];}current.push(t);}if(current.length)out.push({game:current[0].game,tickets:current});}return out;
 };
 function unitAmount(t){return ComboEngine.GAMES[t.game].price*(isExtra(t.game)?multiple(t.multiplier,t.game):1);}
 ComboEngine.amount=(cart,period=1)=>cart.reduce((n,t)=>n+unitAmount(t)*period,0);
 function label(t){if(t.game==='bingo')return `BINGO賓果 ${t.kind==='normal'?t.numbers.length+'星':t.kind==='super'?'超級獎號':specialNames[t.kind]}｜${t.numbers.map(n=>pad(n)).join('、')} · ${t.multiplier} 倍`;
  return `${ComboEngine.GAMES[t.game].name}｜${t.numbers.join('')} · ${t.multiplier} 倍`;
 }
 return {isExtra,multiple,positions,permutations,randomDigits,stars,bingo,build,decode,unitAmount,label,specialNames};
})();
