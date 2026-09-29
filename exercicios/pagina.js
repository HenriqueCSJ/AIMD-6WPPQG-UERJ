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
