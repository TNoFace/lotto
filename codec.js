/* Reproduces the supplied software's six-number 649 format. */
const LottoCodec = (() => {
  const pad = (n,w=2) => String(n).padStart(w,'0');
  function crc(s) {
    let c=0xffff;
    for (const ch of s) { c ^= ch.charCodeAt(0)<<8; for(let i=0;i<8;i++) c=((c<<1)^((c&0x8000)?0x1021:0))&0xffff; }
    return c;
  }
  function head(c,s) { const v=pad(c,5)+s.slice(0,5); let a=0,b=0; [...v].forEach((x,i)=>i%2?b+=+x:a+=+x); return pad((17*a+23*b)%100); }
  function build(groups,period) {
    if(!Number.isInteger(period)||period<1||period>10) throw Error('請選擇 1 至 10 期。');
    if(!Array.isArray(groups)||groups.length<1||groups.length>10) throw Error('每張 QR 請加入 1 至 10 組號碼。');
    let s='05118'+pad(period)+'00'+'10000000000';
    for(const group of groups) {
      if(!Array.isArray(group)||group.length!==6||new Set(group).size!==6||group.some(n=>!Number.isInteger(n)||n<1||n>49)) throw Error('每組需要 6 個不同的號碼，範圍為 01 至 49。');
      s += [...group].sort((a,b)=>a-b).map(n=>pad(n)).join('').padEnd(32,'0')+'0';
    }
    return s+'0'.repeat((10-s.length%10)%10);
  }
  function encode(groups,period) {
    return encodePlain(build(groups,period));
  }
  function encodePlain(s) {
    if(!/^\d+$/.test(s)||s.length%10)throw Error('明文需要完整十位數字區塊。');
    const c=crc(s), k=c%256||256, row=LOTTO_MAPPING[k-1]; let body='';
    for(let start=0;start<s.length;start+=10) {const block=Array(10).fill('0'); [...s.slice(start,start+10)].forEach((ch,i)=>block[row[i]]=k%2?String(9-Number(ch)):ch); body+=block.join('');}
    return '#V003#'+head(c,s)+pad(c,5)+body;
  }
  function decodePlain(payload) {
    payload=payload.trim();
    if(!/^#V003#\d+$/.test(payload)) throw Error('這不是支援的 #V003# QR 字串。');
    const b=payload.slice(6);
    if(b.length<17||(b.length-7)%10) throw Error('QR 字串長度不完整。');
    const c=Number(b.slice(2,7)),k=c%256||256,row=LOTTO_MAPPING[k-1];let s='';
    for(let start=7;start<b.length;start+=10) for(const pos of row) s+=k%2?String(9-Number(b[start+pos])):b[start+pos];
    if(crc(s)!==c||head(c,s)!==b.slice(0,2)) throw Error('校驗失敗，字串可能不完整或不符合這個版本。');
    return s;
  }
  function decode(payload) {
    const s=decodePlain(payload),c=crc(s);
    if(s.slice(0,5)!=='05118'||s.slice(7,20)!=='0010000000000') throw Error('校驗通過，但不是目前支援的大樂透格式。');
    const count=Array.from({length:10},(_,i)=>i+1).find(n=>Math.ceil((20+33*n)/10)*10===s.length);
    if(!count) throw Error('組數超出目前支援範圍。');
    const groups=[];
    for(let i=0;i<count;i++) {const block=s.slice(20+33*i,53+33*i); if(block.slice(12)!=='0'.repeat(21))throw Error('目前只支援每組六碼的選號。'); groups.push(Array.from({length:6},(_,j)=>Number(block.slice(2*j,2*j+2))));}
    const period=Number(s.slice(5,7));
    if(build(groups,period)!==s) throw Error('號碼順序或補零格式不符合目前版本。');
    return {groups,period,payload,plaintext:s,crc:c};
  }
  return {build,encode,decode,crc,encodePlain,decodePlain};
})();
