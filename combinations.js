/* Combination rules traced to combos.py and main.js in the supplied EXE. */
const ComboEngine=(()=>{
  const MAX=10000;
  const GAMES={649:{name:'大樂透',size:6,max:49,price:50,code:'05118'},539:{name:'今彩539',size:5,max:39,price:50,code:'05120'},638:{name:'威力彩',size:6,max:38,price:100,code:'05134'},49:{name:'49樂合彩',size:2,max:49,price:25,code:'01121'},39:{name:'39樂合彩',size:2,max:39,price:25,code:'01197'}};
  const sort=a=>[...a].sort((a,b)=>a-b),compare=(a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]-b[i];return 0;};
  function validate(numbers,max,min=1){if(!Array.isArray(numbers)||numbers.length<min||new Set(numbers).size!==numbers.length||numbers.some(n=>!Number.isInteger(n)||n<1||n>max))throw Error(`請輸入至少 ${min} 個不同的 01～${max} 號碼。`);return sort(numbers);}
  function choose(n,k){if(k<0||k>n)return 0;let c=1;for(let i=1;i<=Math.min(k,n-k);i++)c=c*(n-i+1)/i;return Math.round(c);}
  function combos(pool,k,limit=MAX){if(choose(pool.length,k)>limit)throw Error(`組合超過本版 ${limit.toLocaleString()} 注上限，請縮小選號範圍。`);const out=[];function run(start,a){if(a.length===k){out.push([...a]);return;}for(let i=start;i<=pool.length-(k-a.length);i++){a.push(pool[i]);run(i+1,a);a.pop();}}run(0,[]);return out;}
  function random(n){const cap=Math.floor(4294967296/n)*n;let v;do{v=crypto.getRandomValues(new Uint32Array(1))[0];}while(v>=cap);return v%n;}
  function sample(pool,k){const a=[...pool];for(let i=0;i<k;i++){const j=i+random(a.length-i);[a[i],a[j]]=[a[j],a[i]];}return sort(a.slice(0,k));}
  function unique(list){return [...new Map(list.map(a=>[sort(a).join(','),sort(a)])).values()].sort(compare);}
  function columns(rows,k,max){
    if(!rows.length||rows.length>10)throw Error('請設定 1 至 10 柱。');
    const all=rows.flatMap(r=>r.numbers);validate(all,max);
    const options=rows.map(r=>{validate(r.numbers,max);if(!Number.isInteger(r.take)||r.take<1||r.take>Math.min(k,r.numbers.length))throw Error('每柱取數必須介於 1 與該柱號碼數之間。');return combos(sort(r.numbers),r.take);});
    const out=[];function run(i,a){if(a.length>k)return;if(i===rows.length){if(a.length===k){out.push(sort(a));if(out.length>MAX)throw Error(`組合超過 ${MAX} 注上限。`);}return;}if(!rows[i].required)run(i+1,a);for(const part of options[i])if(a.length+part.length<=k)run(i+1,[...a,...part]);}run(0,[]);return unique(out);
  }
  function free(pool,k,count){
    if(!Number.isInteger(count)||count<1||count>Math.min(MAX,choose(pool.length,k)))throw Error('組數必須為正整數，且不能超過可用的不重複組合數或 10,000 注。');
    const out=[],seen=new Set(),usage=Array(pool.length).fill(0);let attempts=0;
    while(out.length<count&&attempts++<count*100+1000){
      let available=[...pool],a=[];
      for(let i=0;i<k;i++) {const min=Math.min(...usage);let candidates=pool.filter((n,j)=>usage[j]===min&&available.includes(n));if(!candidates.length)candidates=available;const n=candidates[random(candidates.length)];a.push(n);usage[pool.indexOf(n)]++;available=available.filter(x=>x!==n);}
      a=sort(a);const key=a.join(',');if(!seen.has(key)){seen.add(key);out.push(a);}
    }
    if(out.length<count&&choose(pool.length,k)<=MAX){for(const a of combos(pool,k)){const key=a.join(',');if(!seen.has(key)){out.push(a);seen.add(key);if(out.length===count)break;}}}
    if(out.length<count)throw Error('隨機組合重試已達上限，請減少組數或重新產生。');
    return out.sort(compare);
  }
  function branch(fixed,k,max){
    validate(fixed,max);if(fixed.length>=k)throw Error(`固定主支需為 1 至 ${k-1} 碼。`);
    const pool=Array.from({length:max},(_,i)=>i+1).filter(n=>!fixed.includes(n));let remaining=sample(pool,pool.length);const list=[],take=k-fixed.length;
    while(remaining.length){const fresh=remaining.splice(0,take);const fill=take-fresh.length;if(fill)fresh.push(...sample(pool.filter(n=>!fresh.includes(n)),fill));list.push(sort([...fixed,...fresh]));}
    return unique(list);
  }
  function smart(pool,k,key){
    const [n,m]=key.split('_').map(Number);if(n!==pool.length||m!==k||!LOTTO_WHEELS[key])throw Error('這組參數沒有原軟體的輪盤資料。');
    const list=LOTTO_WHEELS[key].map(row=>row.map(pos=>pool[pos-1]));
    if(list.length>MAX)throw Error('原始輪盤超過本版注數上限。');
    for(const a of list)validate(a,Math.max(...pool),k);
    return unique(list);
  }
  function tickets(game,list,second=[1],secondMode='cross',addons=[]){
    const config=GAMES[game];if(!config)throw Error('不支援的彩種。');const out=[];
    if(game==='638')validate(second,8);
    for(let i=0;i<list.length;i++){
      const numbers=validate(list[i],config.max,config.size);if(numbers.length!==config.size)throw Error('組合碼數不正確。');
      const seconds=game==='638'?(secondMode==='cycle'?[second[i%second.length]]:secondMode==='random'?[sample(second,1)[0]]:second):[null];
      for(const v of seconds)out.push({game,numbers,second:v,fun:null});
      if((game==='649'||game==='539')&&addons.length)for(const fun of addons){if(![2,3,4].includes(fun))throw Error('不支援的加購玩法。');for(const subset of combos(numbers,fun))out.push({game:game==='649'?'49':'39',numbers:subset,second:null,fun});}
      if(out.length>MAX)throw Error('包含第二區或加購後超過 10,000 注，請減少組合。');
    }
    return out;
  }
  function generate(params){
    const game=String(params.game),config=GAMES[game];if(!['649','539','638'].includes(game))throw Error('請選擇大樂透、今彩539或威力彩。');
    const k=config.size;let list;
    if(params.mode==='columns')list=columns(params.columns,k,config.max);
    else if(params.mode==='branch')list=branch(params.fixed,k,config.max);
    else {
      const pool=validate(params.pool,config.max,k);
      if(params.mode==='system'||params.mode==='chain')list=combos(pool,k);
      else if(params.mode==='custom')list=free(pool,k,params.count);
      else if(params.mode==='smart')list=smart(pool,k,params.smartKey);
      else if(params.mode==='banker'){const fixed=validate(params.fixed,config.max);if(fixed.length>=k||fixed.some(n=>!pool.includes(n)))throw Error('固定膽碼需包含於號碼池中，且少於每注碼數。');list=combos(pool.filter(n=>!fixed.includes(n)),k-fixed.length).map(a=>sort([...fixed,...a]));}
      else throw Error('未知組合方式。');
    }
    if(!list.length)throw Error('這些取數條件無法湊成完整一注，請調整每柱取數或主支設定。');
    return tickets(game,list,params.second,params.secondMode,params.addons||[]);
  }
  const PACKAGES=[
    {id:'649',game:'649',name:'幸運全餐',price:450,note:'全 49 碼，自選包牌 9 組六碼'},
    {id:'649_2',game:'649',name:'加二合',price:425,note:'1 注大樂透＋15 注49樂合彩二合'},
    {id:'649_2_3',game:'649',name:'加二三合',price:925,note:'1 注大樂透＋15 注二合＋20 注三合'},
    {id:'539',game:'539',name:'幸運全餐',price:400,note:'全 39 碼，自選包牌 8 組五碼'},
    {id:'539_2',game:'539',name:'加二合',price:300,note:'1 注539＋10 注39樂合彩二合'},
    {id:'539_2_3',game:'539',name:'加二三合',price:550,note:'1 注539＋10 注二合＋10 注三合'},
    {id:'638',game:'638',name:'幸運全餐',price:800,note:'第一區自選8組，第二區01～08依序配置'},
    {id:'638_2',game:'638',name:'超級全餐',price:5600,note:'第一區自選7組，每組配第二區01～08'},
    {id:'638_3',game:'638',name:'頭獎玩法',price:2100,note:'第一區隨機7碼全展開，配第二區隨機3碼'}
  ];
  function meal(id){const config=PACKAGES.find(p=>p.id===id);if(!config)throw Error('未知套餐。');const g=GAMES[config.game],pool=Array.from({length:g.max},(_,i)=>i+1);let out;
    if(id==='638_3')out=tickets('638',combos(sample(pool,7),6),sample([1,2,3,4,5,6,7,8],3));
    else if(config.game==='638')out=tickets('638',free(pool,6,id==='638'?8:7),[1,2,3,4,5,6,7,8],id==='638'?'cycle':'cross');
    else if(id.includes('_'))out=tickets(config.game,[sample(pool,g.size)],[1],'cross',id.endsWith('_2_3')?[2,3]:[2]);
    else out=tickets(config.game,free(pool,g.size,config.game==='649'?9:8));
    return out;
  }
  function batches(cart,size=10){const partitions=new Map();for(const t of cart){if(!partitions.has(t.game))partitions.set(t.game,[]);partitions.get(t.game).push(t);}const out=[];for(const [game,list] of partitions)for(let i=0;i<list.length;i+=size)out.push({game,tickets:list.slice(i,i+size)});return out;}
  function amount(cart,period=1){return cart.reduce((sum,t)=>sum+GAMES[t.game].price*period,0);}
  return {MAX,GAMES,PACKAGES,validate,choose,combos,columns,free,branch,smart,tickets,generate,meal,batches,amount,sample};
})();

const MultiCodec=(()=>{
 const pad=(n,w=2)=>String(n).padStart(w,'0');
 function build(game,tickets,period){
   game=String(game);const g=ComboEngine.GAMES[game];if(!g||!Number.isInteger(period)||period<1||period>10)throw Error('彩種或期數不正確。');
   if(!tickets.length||tickets.length>10)throw Error('每張 QR 支援 1 至 10 注。');
   let s=g.code+pad(period)+'00'+'10000000000';
   for(const t of tickets){if(t.game!==game)throw Error('一張 QR 不能混合彩種。');const n=ComboEngine.validate(t.numbers,g.max,g.size);
     if(['39','49'].includes(game)){if(![2,3,4].includes(t.fun)||n.length!==t.fun)throw Error('樂合彩碼數錯誤。');s+=pad(t.fun)+n.map(x=>pad(x)).join('').padEnd(20,'0')+'0'+'01';}
     else {if(n.length!==g.size)throw Error('每注碼數錯誤。');s+=n.map(x=>pad(x)).join('').padEnd(32,'0');if(game==='638'){ComboEngine.validate([t.second],8);s+=pad(t.second).padStart(16,'0');}s+='0';}
   }return s+'0'.repeat((10-s.length%10)%10);
 }
 function encode(game,tickets,period){return LottoCodec.encodePlain(build(game,tickets,period));}
 function decode(payload){
   const s=LottoCodec.decodePlain(payload);const game=Object.keys(ComboEngine.GAMES).find(k=>ComboEngine.GAMES[k].code===s.slice(0,5));if(!game)throw Error('目前支援大樂透、539、威力彩與39／49樂合彩。');
   const g=ComboEngine.GAMES[game],width=game==='638'?49:['39','49'].includes(game)?25:33;
   const count=Array.from({length:10},(_,i)=>i+1).find(n=>Math.ceil((20+n*width)/10)*10===s.length);if(!count)throw Error('無法辨識注數。');
   const tickets=[];
   for(let i=0;i<count;i++){const block=s.slice(20+i*width,20+(i+1)*width);let numbers=[],second=null,fun=null;
     if(['39','49'].includes(game)){fun=+block.slice(0,2);if(![2,3,4].includes(fun)||block.slice(23,25)!=='01')throw Error('目前只支援標準單注、單倍樂合彩。');numbers=Array.from({length:fun},(_,j)=>+block.slice(2+2*j,4+2*j));}
     else {numbers=Array.from({length:g.size},(_,j)=>+block.slice(2*j,2*j+2));if(game==='638')second=+block.slice(46,48);}
     tickets.push({game,numbers,second,fun});
   }
   const period=+s.slice(5,7);if(build(game,tickets,period)!==s)throw Error('這是非標準單注、複式、倍數或其他尚未支援的格式。');
   return {game,tickets,period,payload,plaintext:s};
 }
 return {build,encode,decode};
})();
