import{mkdirSync,readdirSync,readFileSync,writeFileSync}from'node:fs';
import{join}from'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
// Opcode table: immediate bytes, pops, pushes. Only the 37 bytes in vm.mjs's OPS table are set;
// every other byte keeps imm -1 and traps 5 (notably 0x08-0x0f, 0x1f, 0x23-0x2f, 0x35-0x3f, 0x42-0x4f, 0x54+).
const IM=new Int8Array(256).fill(-1),PO=new Uint8Array(256),PU=new Uint8Array(256);
const T=(o,i,a,b)=>{IM[o]=i;PO[o]=a;PU[o]=b};
T(0,0,0,0);T(1,1,0,1);T(2,4,0,1);T(3,0,1,0);T(4,0,1,2);T(5,0,2,2);T(6,0,2,3);T(7,0,3,3);
for(const o of[16,17,18,19,20,21,22,24,25,26,28,29,30,32,33,34])T(o,0,2,1);
T(23,0,1,1);T(27,0,1,1);
T(48,2,0,0);T(49,2,1,0);T(50,2,1,0);T(51,2,0,0);T(52,0,0,0);
T(64,0,1,1);T(65,0,2,0);T(80,0,1,0);T(81,0,1,0);T(82,0,0,1);T(83,0,1,0);
const enc=new TextEncoder();
for(const d of readdirSync(I,{withFileTypes:true}).sort((a,b)=>a.name<b.name?-1:1)){
 if(!d.isDirectory())continue; // stray files in /input must not kill the whole set
 const id=d.name;
 const p=readFileSync(join(I,id,'program.bin')),q=readFileSync(join(I,id,'input.bin')),n=p.length;
 const D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536);
 let s=0,c=0,ol=0,ip=0,pc=0,t=0,e=0;
 run:for(;;){
  if(t===1e6){e=10;break} // step limit first: a HALT as the 1,000,000th step still exits 0
  if(pc<0||pc>=n){e=9;break} // falling off the end, or a jump out of range
  const op=p[pc],im=IM[op];
  if(im<0){e=5;break} // unknown opcode
  if(pc+im>=n){e=9;break} // immediate cut off by the program's end
  t++;
  const nx=pc+1+im;
  if(s<PO[op]){e=2;break} // underflow before any effect
  if(s-PO[op]+PU[op]>256){e=3;break} // overflow before any effect
  pc=nx;
  switch(op){
   case 0:e=0;break run;
   case 1:D[s++]=(p[nx-1]<<24)>>24;break; // PUSH8 sign-extends
   case 2:D[s++]=p[nx-4]|p[nx-3]<<8|p[nx-2]<<16|p[nx-1]<<24;break;
   case 3:s--;break;
   case 4:D[s]=D[s-1];s++;break;
   case 5:{const x=D[s-1];D[s-1]=D[s-2];D[s-2]=x;break}
   case 6:D[s]=D[s-2];s++;break;
   case 7:{const a=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=a;break}
   case 23:D[s-1]=-D[s-1]|0;break; // NEG wraps INT_MIN
   case 27:D[s-1]=~D[s-1];break;
   case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 24:case 25:case 26:case 28:case 29:case 30:case 32:case 33:case 34:{
    const b=D[s-1],a=D[s-2];let r;
    switch(op){
     case 16:r=a+b|0;break;
     case 17:r=a-b|0;break;
     case 18:r=Math.imul(a,b);break; // low 32 bits of the exact product
     case 19:if(!b){e=4;break run}r=a===-2147483648&&b===-1?a:(a/b)|0;break; // INT_MIN/-1
     case 20:if(!b){e=4;break run}r=b===-1?0:a%b|0;break; // x%-1 is 0
     case 21:if(!b){e=4;break run}r=Math.floor((a>>>0)/(b>>>0))|0;break; // unsigned
     case 22:if(!b){e=4;break run}r=(a>>>0)%(b>>>0)|0;break; // unsigned
     case 24:r=a&b;break;
     case 25:r=a|b;break;
     case 26:r=a^b;break;
     case 28:r=a<<(b&31);break; // shift count: low 5 bits only
     case 29:r=a>>(b&31);break; // arithmetic
     case 30:r=(a>>>(b&31))|0;break; // logical, read back signed
     case 32:r=a===b?1:0;break;
     case 33:r=a<b?1:0;break;
     default:r=(a>>>0)<(b>>>0)?1:0; // LTU
    }
    s-=2;D[s++]=r;break}
   case 48:case 49:case 50:{
    const rel=(p[nx-2]|p[nx-1]<<8)<<16>>16; // signed 16-bit, relative to next instruction
    let tk=op===48;
    if(op!==48){const v=D[--s];tk=op===49?v===0:v!==0}
    if(tk)pc=nx+rel;break}
   case 51:if(c===64){e=7;break run}C[c++]=nx;pc=p[nx-2]|p[nx-1]<<8;break; // CALL: unsigned target
   case 52:if(!c){e=8;break run}pc=C[--c];break;
   case 64:{const a=D[s-1];if(a<0||a>255){e=6;break run}D[s-1]=M[a];break}
   case 65:{const a=D[s-1],v=D[s-2];if(a<0||a>255){e=6;break run}s-=2;M[a]=v;break}
   case 80:{const b=enc.encode(String(D[s-1]));if(ol+b.length>65536){e=11;break run}s--;o.set(b,ol);ol+=b.length;break} // PRINT writes nothing when it would exceed the limit
   case 81:if(ol+1>65536){e=11;break run}o[ol++]=D[--s]&255;break;
   case 82:D[s++]=ip<q.length?q[ip++]:-1;break; // IN: -1 after exhaustion
   case 83:e=D[--s]&255;break run; // EXIT: low byte
  }
 }
 mkdirSync(join(O,id),{recursive:true});
 writeFileSync(join(O,id,'stdout.bin'),o.slice(0,ol));
 writeFileSync(join(O,id,'exit.txt'),e+'\n');
}
