/* Responsive map and local orientation without browser-only dependencies. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../../exercicios/pagina.js'),'utf8');

test('mobile map collapses while desktop map remains open, including resizing',()=>{
  const map={open:true},media={matches:true,addEventListener(event,callback){assert.equal(event,'change');this.change=callback;}};
  const document={querySelector:()=>map,querySelectorAll:()=>[]};
  vm.runInNewContext(source,{document,window:{matchMedia(query){assert.equal(query,'(max-width:850px)');return media;}}});
  assert.equal(map.open,false);
  media.matches=false;media.change();assert.equal(map.open,true);
  media.matches=true;media.change();assert.equal(map.open,false);
});

test('a stable handwritten section anchor highlights its link and observes its heading',()=>{
  const attrs={},heading={tagName:'H2'},anchor={tagName:'A',textContent:'',nextElementSibling:null,parentElement:{nextElementSibling:heading}};
  const link={hash:'#parede-e-rigidez',removeAttribute(key){delete attrs[key];},setAttribute(key,value){attrs[key]=value;},addEventListener(event,callback){assert.equal(event,'click');this.click=callback;}};
  const document={querySelector:()=>null,querySelectorAll(selector){return selector.startsWith('.section-nav')?[link]:[];},getElementById(id){assert.equal(id,'parede-e-rigidez');return anchor;}};
  const observed=[];
  class Observer{constructor(callback){this.callback=callback;}observe(target){observed.push(target);this.callback([{target,isIntersecting:true,boundingClientRect:{top:100}}]);}}
  vm.runInNewContext(source,{document,window:{},IntersectionObserver:Observer});
  assert.deepEqual(observed,[heading]);assert.equal(attrs['aria-current'],'location');
  link.click();assert.equal(attrs['aria-current'],'location');
});
