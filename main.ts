import{mkdirSync,readdirSync,readFileSync,writeFileSync}from'node:fs';
import{join}from'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
const IM=new Int8Array(256).fill(-1),PO=new Uint8Array(256),PU=new Uint8Array(256);
const st=(o,i,a,b)=>{IM[o]=i;PO[o]=a;PU[o]=b};
st(0,0,0,0);st(1,1,0,1);st(2,4,0,1);st(3,0,1,0);st(4,0,1,2);st(5,0,2,2);st(6,0,2,3);st(7,0,3,3);
for(let o=16;o<35;o++)if(o!==23&&o!==27&&o!==31)st(o,0,2,1);
st(23,0,1,1);st(27,0,1,1);st(48,2,0,0);st(49,2,1,0);st(50,2,1,0);st(51,2,0,0);st(52,0,0,0);
st(64,0,1,1);st(65,0,2,0);st(80,0,1,0);st(81,0,1,0);st(82,0,0,1);st(83,0,1,0);
const enc=new TextEncoder();
for(const id of readdirSync(I).sort()){
 const p=new Uint8Array(readFileSync(join(I,id,'program.bin'))),q=new Uint8Array(readFileSync(join(I,id,'input.bin'))),n=p.length;
 const D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536);
 let s=0,c=0,ol=0,ip=0,pc=0,t=0,e=0;
 outer:for(;;){
  if(t===1e6){e=10;break}
  if(pc<0||pc>=n){e=9;break}
  const op=p[pc],im=IM[op];
  if(im<0){e=5;break}
  if(pc+im>=n){e=9;break}
  t++;
  const nx=pc+1+im;
  if(s<PO[op]){e=2;break}
  if(s-PO[op]+PU[op]>256){e=3;break}
  pc=nx;
  if(op>=16&&op<35){
   if(op===23){D[s-1]=-D[s-1]|0;continue}
   if(op===27){D[s-1]=~D[s-1];continue}
   const b=D[s-1],a=D[s-2];let r=0;
   if(op===16)r=a+b|0;
   else if(op===17)r=a-b|0;
   else if(op===18)r=Math.imul(a,b);
   else if(op===19){if(!b){e=4;break outer}r=a===-2147483648&&b===-1?a:(a/b)|0}
   else if(op===20){if(!b){e=4;break outer}r=b===-1?0:a%b|0}
   else if(op===21){if(!b){e=4;break outer}r=Math.floor((a>>>0)/(b>>>0))|0}
   else if(op===22){if(!b){e=4;break outer}r=(a>>>0)%(b>>>0)|0}
   else if(op===24)r=a&b;
   else if(op===25)r=a|b;
   else if(op===26)r=a^b;
   else if(op===28)r=a<<(b&31);
   else if(op===29)r=a>>(b&31);
   else if(op===30)r=(a>>>(b&31))|0;
   else if(op===32)r=a===b?1:0;
   else if(op===33)r=a<b?1:0;
   else r=(a>>>0)<(b>>>0)?1:0;
   s-=2;D[s++]=r;
   continue;
  }
  switch(op){
   case 0:e=0;break outer;
   case 1:D[s++]=(p[nx-1]<<24)>>24;break;
   case 2:D[s++]=p[nx-4]|(p[nx-3]<<8)|(p[nx-2]<<16)|(p[nx-1]<<24);break;
   case 3:s--;break;
   case 4:D[s]=D[s-1];s++;break;
   case 5:{const x=D[s-1];D[s-1]=D[s-2];D[s-2]=x;break}
   case 6:D[s]=D[s-2];s++;break;
   case 7:{const a=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=a;break}
   case 48:case 49:case 50:{
    const rel=((p[nx-2]|(p[nx-1]<<8))<<16)>>16;
    let tk=op===48;
    if(op!==48){const v=D[--s];tk=op===49?v===0:v!==0}
    if(tk)pc=nx+rel;
    break}
   case 51:
    if(c===64){e=7;break outer}
    C[c++]=nx;pc=p[nx-2]|(p[nx-1]<<8);break;
   case 52:
    if(!c){e=8;break outer}
    pc=C[--c];break;
   case 64:{const a=D[s-1];if(a<0||a>255){e=6;break outer}D[s-1]=M[a];break}
   case 65:{const a=D[s-1],v=D[s-2];if(a<0||a>255){e=6;break outer}s-=2;M[a]=v;break}
   case 80:{const b=enc.encode(String(D[s-1]));if(ol+b.length>65536){e=11;break outer}s--;o.set(b,ol);ol+=b.length;break}
   case 81:
    if(ol+1>65536){e=11;break outer}
    o[ol++]=D[--s]&255;break;
   case 82:D[s++]=ip<q.length?q[ip++]:-1;break;
   case 83:e=D[--s]&255;break outer;
  }
 }
 mkdirSync(join(O,id),{recursive:true});
 writeFileSync(join(O,id,'stdout.bin'),o.slice(0,ol));
 writeFileSync(join(O,id,'exit.txt'),e+'\n');
}
