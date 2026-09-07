import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('game surface boots, renders, starts, handles multitouch and pauses',async()=>{
 const html=readFileSync(new URL('../docs/index.html',import.meta.url),'utf8');
 let frames=[],draws=0;const listeners={};
 const context=new Proxy({}, {get:(target,key)=>{if(key==='createLinearGradient'||key==='createRadialGradient')return()=>({addColorStop(){}});if(key==='drawImage')return()=>draws++;return target[key]??(()=>{})},set:(t,k,v)=>(t[k]=v,true)});
 const element=()=>({style:{},children:[],textContent:'',innerHTML:'',classList:{toggle(){},add(){},remove(){}},setAttribute(){},setPointerCapture(){},getBoundingClientRect(){return{left:0,top:0,width:112,height:112}},focus(){},addEventListener(){},replaceChildren(...nodes){this.children=nodes},append(...nodes){this.children.push(...nodes)},get firstChild(){return this.children[0]},querySelectorAll(){return this.children},getContext(){return context},clientWidth:390,clientHeight:844});
 const elements=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],element()]));
 globalThis.innerWidth=390;globalThis.innerHeight=844;globalThis.devicePixelRatio=2;globalThis.window=globalThis;
 globalThis.localStorage={getItem(){return null},setItem(){}};
 globalThis.document={body:element(),createElement:element,getElementById(id){assert.ok(elements[id],`missing DOM element ${id}`);return elements[id]},addEventListener(name,fn){listeners[name]=fn}};
 globalThis.addEventListener=(name,fn)=>listeners[name]=fn;
 globalThis.requestAnimationFrame=fn=>frames.push(fn);
 await import('../docs/game.js');
 let now=performance.now();const step=()=>{now+=16;frames.shift()(now)};
 step();assert.ok(draws>0);
 elements.start.onclick();
 elements.joystick.onpointerdown({pointerId:7,clientX:95,clientY:56,preventDefault(){}});
 assert.match(elements.stick.style.transform,/translate/);
 // A second pointer presses dash while the first continues to hold the joystick.
 elements.dash.onpointerdown({pointerId:8,preventDefault(){}});
 for(let i=0;i<10;i++)step();
 assert.equal(elements.dashCd.style.display,'flex');
 assert.equal(elements.healthText.textContent,'100 / 100');
 elements.joystick.onpointercancel({pointerId:7});
 assert.equal(elements.stick.style.transform,'translate(0px,0px)');
 elements.pause.onclick();assert.equal(elements.modalTitle.textContent,'Между двумя вдохами');
 let time=elements.timer.textContent;for(let i=0;i<120;i++)step();assert.equal(elements.timer.textContent,time);
 elements.modalAction.onclick();for(let i=0;i<120;i++)step();assert.notEqual(elements.timer.textContent,time);
 assert.ok(draws>200);
});
