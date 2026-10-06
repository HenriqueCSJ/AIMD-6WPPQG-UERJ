/* Exact recorded dihedral orientations; no interpolation or angular transform. */
(function(root,factory){
  'use strict';
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.DihedralCircleChart=factory().DihedralCircleChart;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const NS='http://www.w3.org/2000/svg',CX=120,CY=100,R=65;
  const svgNode=(tag,attrs={},text)=>{const node=document.createElementNS(NS,tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));if(text!==undefined)node.textContent=text;return node;};
  const htmlNode=(tag,className,text)=>{const node=document.createElement(tag);node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const angleText=value=>Number.isFinite(value)?`${Object.is(value,-0)?'-0':String(value).replace('.',',')}°`:'indefinido';
  const compactAngle=value=>Number.isFinite(value)?`${new Intl.NumberFormat('pt-BR',{maximumFractionDigits:3}).format(value)}°`:'indefinido';
  const position=value=>{const radians=value*Math.PI/180;return {x:CX+R*Math.cos(radians),y:CY-R*Math.sin(radians)};};
  const adjacent=(previous,current)=>previous&&current&&Number.isFinite(previous.y)&&Number.isFinite(current.y)&&Number.isFinite(previous.x)&&Number.isFinite(current.x)&&current.x>previous.x&&previous.sourceSegment===current.sourceSegment&&previous.sourceKey===current.sourceKey&&!current.gapBefore&&!current.breakBefore;

  class DihedralCircleChart{
    constructor(host,options={}){
      this.host=host;this.series=options.series||[];this.cards=[];
      host.replaceChildren();
      if(host.classList)host.classList.add('dihedral-circle-grid');else host.className=`${host.className||''} dihedral-circle-grid`.trim();
      for(const series of this.series){
        const name=series.name||'Diedro',color=series.color||'#006e66',card=htmlNode('figure','dihedral-circle-card');
        const heading=htmlNode('figcaption','dihedral-circle-name',name);
        const svg=svgNode('svg',{class:'dihedral-circle-svg',viewBox:'0 0 240 200',role:'img'}),title=svgNode('title');
        svg.append(title,svgNode('circle',{class:'dihedral-circle-ring',cx:CX,cy:CY,r:R,fill:'none',stroke:'#aabdb7','stroke-width':1.5}));
        for(const [angle,label,tx,ty,anchor] of [[0,'0°',198,104,'start'],[90,'+90°',120,22,'middle'],[180,'±180°',3,104,'start'],[-90,'−90°',120,188,'middle']]){
          const p=position(angle);
          svg.append(svgNode('line',{class:'dihedral-circle-tick',x1:CX+(p.x-CX)*.95,y1:CY+(p.y-CY)*.95,x2:CX+(p.x-CX)*1.05,y2:CY+(p.y-CY)*1.05,stroke:'#536975'}));
          svg.append(svgNode('text',{class:'dihedral-circle-tick-label',x:tx,y:ty,'text-anchor':anchor,fill:'#536975','font-size':12,'font-family':'inherit'},label));
        }
        const needle=svgNode('line',{class:'dihedral-circle-needle',x1:CX,y1:CY,x2:CX,y2:CY,stroke:color,'stroke-width':2,visibility:'hidden'});
        const previous=svgNode('circle',{class:'dihedral-circle-previous-marker',cx:CX,cy:CY,r:6,fill:'white',stroke:color,'stroke-width':2,visibility:'hidden'});
        const current=svgNode('circle',{class:'dihedral-circle-current-marker',cx:CX,cy:CY,r:4,fill:color,stroke:'white','stroke-width':1,visibility:'hidden'});
        svg.append(needle,previous,current);
        const value=htmlNode('p','dihedral-circle-value'),previousValue=htmlNode('p','dihedral-circle-previous');
        card.append(heading,svg,value,previousValue);host.append(card);
        this.cards.push({series,name,svg,title,needle,previous,current,value,previousValue});
      }
      this.setIndex(options.index??0);
    }
    setIndex(index){
      this.index=Number.isInteger(index)&&index>=0?index:null;
      for(const card of this.cards){
        const sample=this.index===null?null:card.series.points?.[this.index],before=this.index>0?card.series.points?.[this.index-1]:null;
        const valid=Number.isFinite(sample?.y),hasPrevious=valid&&adjacent(before,sample);
        card.value.textContent=`Atual: ${compactAngle(sample?.y)}`;
        card.value.setAttribute('title',angleText(sample?.y));
        card.previousValue.textContent=hasPrevious?`Anterior: ${compactAngle(before.y)}`:'Anterior: sem amostra adjacente válida';
        card.previousValue.setAttribute('title',hasPrevious?angleText(before.y):'');
        card.current.setAttribute('visibility',valid?'visible':'hidden');card.needle.setAttribute('visibility',valid?'visible':'hidden');card.previous.setAttribute('visibility',hasPrevious?'visible':'hidden');
        if(valid){const p=position(sample.y);card.current.setAttribute('cx',p.x);card.current.setAttribute('cy',p.y);card.needle.setAttribute('x2',p.x);card.needle.setAttribute('y2',p.y);}
        if(hasPrevious){const p=position(before.y);card.previous.setAttribute('cx',p.x);card.previous.setAttribute('cy',p.y);}
        const description=`${card.name}. Amostra original ${this.index===null?'indisponível':this.index+1}. Diedro assinado ${angleText(sample?.y)}. ${hasPrevious?`Amostra anterior ${angleText(before.y)}.`:'Sem comparação com amostra anterior.'} 0° à direita, +90° acima, ±180° à esquerda, −90° abaixo. Marcador cheio: atual; marcador vazio: anterior. Orientações de amostras registradas, sem interpolação.`;
        card.title.textContent=description;card.svg.setAttribute('aria-label',description);
      }
    }
  }
  return {DihedralCircleChart};
});
