// Keep the full map available without placing it before every mobile lesson.
const courseMap=document.querySelector('.course-map');
if(courseMap&&typeof window.matchMedia==='function'){
  const mobile=window.matchMedia('(max-width:850px)');
  const adaptMap=()=>{courseMap.open=!mobile.matches;};
  adaptMap();
  mobile.addEventListener?.('change',adaptMap);
}

// Local section links work without JavaScript; highlighting adds orientation.
const sectionLinks=[...document.querySelectorAll('.section-nav a[href^="#"]')];
const sections=sectionLinks.map(link=>{
  let target=document.getElementById(decodeURIComponent(link.hash.slice(1)));
  if(target?.tagName==='A'&&!target.textContent.trim()){
    target=target.nextElementSibling||target.parentElement.nextElementSibling;
  }
  return {link,target};
}).filter(item=>item.target);
const markSection=link=>{
  sectionLinks.forEach(item=>item.removeAttribute('aria-current'));
  link.setAttribute('aria-current','location');
};
sectionLinks.forEach(link=>link.addEventListener('click',()=>markSection(link)));
if(sections.length&&typeof IntersectionObserver==='function'){
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
    const section=visible.length&&sections.find(item=>item.target===visible[0].target);
    if(section)markSection(section.link);
  },{rootMargin:'-5% 0px -65% 0px',threshold:0});
  sections.forEach(item=>observer.observe(item.target));
}

document.querySelectorAll('pre > code').forEach(code=>{
  const pre=code.parentElement,wrap=document.createElement('div'),button=document.createElement('button');
  wrap.className='code-wrap';pre.before(wrap);wrap.append(pre);button.className='copy';button.type='button';button.textContent='Copiar';
  button.setAttribute('aria-label','Copiar este bloco');button.setAttribute('aria-live','polite');wrap.append(button);
  button.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(code.textContent);button.textContent='Copiado!';}
    catch{const range=document.createRange();range.selectNodeContents(code);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);button.textContent='Selecionado: Ctrl+C';}
    setTimeout(()=>{button.textContent='Copiar';},2200);
  });
});
