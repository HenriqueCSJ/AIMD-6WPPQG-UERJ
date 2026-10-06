/* Responsive SVG plots: real numeric axes, unconnected gaps, exact hover values. */
(function(root){
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  function el(tag,attrs={},text){const node=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));if(text!==undefined)node.textContent=text;return node;}
  function number(n,precision=5){if(!Number.isFinite(n))return '—';if(n===0)return '0';if(Math.abs(n)<.001||Math.abs(n)>=1e7)return n.toExponential(Math.min(precision-1,8)).replace(/(\.\d*?[1-9])0+e/,'$1e').replace(/\.0+e/,'e').replace('e-','e−');return new Intl.NumberFormat('pt-BR',{maximumSignificantDigits:precision}).format(n);}
  function ticks(min,max,count){if(min===max)return [min];const rough=(max-min)/count,power=10**Math.floor(Math.log10(rough)),ratio=rough/power,step=(ratio<=1?1:ratio<=2?2:ratio<=5?5:10)*power;const result=[];for(let t=Math.ceil(min/step)*step;t<=max+step*1e-8;t+=step)result.push(Math.abs(t)<step*1e-9?0:t);return result;}
  // Index timestamps once. XYZ and energy files may use different dump strides;
  // an array offset is never a physical-time correspondence.
  function timeIndex(samples,valid=()=>true,equivalentFields=[]){
    const entries=samples.map((sample,index)=>({sample,index,time:sample.time})).filter(e=>Number.isFinite(e.time)).sort((a,b)=>a.time-b.time||a.index-b.index);
    const lower=time=>{let lo=0,hi=entries.length;while(lo<hi){const mid=(lo+hi)>>>1;if(entries[mid].time<time)lo=mid+1;else hi=mid;}return lo;};
    const matches=time=>{if(!Number.isFinite(time))return [];const tolerance=1e-7,found=[];for(let i=lower(time-tolerance);i<entries.length&&entries[i].time<=time+tolerance;i++)found.push(entries[i]);return found;};
    const byStep=new Map();for(const entry of entries)if(Number.isFinite(entry.sample.step)){if(!byStep.has(entry.sample.step))byStep.set(entry.sample.step,[]);byStep.get(entry.sample.step).push(entry);}
    const bySourceStep=new Map();for(const entry of entries)if(entry.sample.sourceKey&&Number.isFinite(entry.sample.sourceStep)){if(!bySourceStep.has(entry.sample.sourceStep))bySourceStep.set(entry.sample.sourceStep,[]);bySourceStep.get(entry.sample.sourceStep).push(entry);}
    const exact=(time,context={})=>{
      let found=matches(time);
      if(context.sourceKey)found=found.filter(e=>e.sample.sourceKey===context.sourceKey);
      if(found.length>1&&Number.isFinite(context.step))found=found.filter(e=>e.sample.step===context.step);
      // ORCA may round its CSV clock to one decimal while the XYZ retains
      // quarter-fs times. Only the same recorded step may bridge that rounding.
      if(!found.length&&Number.isFinite(time)&&Number.isFinite(context.step))found=(byStep.get(context.step)||[]).filter(e=>(!context.sourceKey||e.sample.sourceKey===context.sourceKey)&&Math.abs(e.time-time)<=.050001);
      if(!found.length&&Number.isFinite(time)&&context.sourceKey&&Number.isFinite(context.sourceStep))found=(bySourceStep.get(context.sourceStep)||[]).filter(e=>e.sample.sourceKey===context.sourceKey&&Math.abs(e.time-time)<=.050001);
      // Consecutive ORCA Run blocks can repeat their shared endpoint. Resolve
      // only the requested observables when time, step, source and every value
      // agree. Keep distinct restart states and the original rows untouched.
      if(found.length>1&&equivalentFields.length){
        const first=found[0].sample,identified=Number.isFinite(first.step)||(first.sourceKey&&Number.isFinite(first.sourceStep));
        if(identified&&equivalentFields.some(key=>Number.isFinite(first[key]))&&found.every(({sample})=>valid(sample)&&['time','step','sourceKey','sourceStep',...equivalentFields].every(key=>sample[key]===first[key])))return first;
      }
      return found.length===1&&valid(found[0].sample)?found[0].sample:null;
    };
    const inRange=time=>Number.isFinite(time)&&entries.length>0&&time>=entries[0].time-1e-7&&time<=entries.at(-1).time+1e-7;
    return {
      entries,
      exact,
      covers(time,context={}){if(exact(time,context))return true;if(!inRange(time))return false;const same=matches(time).filter(e=>!context.sourceKey||e.sample.sourceKey===context.sourceKey);if(same.length)return same.some(e=>valid(e.sample));const i=lower(time),a=entries[i-1],b=entries[i];return !!a&&!!b&&(!context.sourceKey||(a.sample.sourceKey===context.sourceKey&&b.sample.sourceKey===context.sourceKey))&&a.sample.segment===b.sample.segment&&valid(a.sample)&&valid(b.sample);},
      nearest(time,preferredIndex=0){
        if(!inRange(time))return null;const i=lower(time),candidates=[entries[i-1],entries[i]].filter(Boolean);if(!candidates.length)return null;
        const nearest=candidates.reduce((a,b)=>Math.abs(b.time-time)<Math.abs(a.time-time)?b:a);
        return matches(nearest.time).reduce((a,b)=>Math.abs(b.index-preferredIndex)<Math.abs(a.index-preferredIndex)?b:a).index;
      }
    };
  }
  class ScientificChart{
    constructor(container,options){this.host=container;this.options=options;this.currentTime=null;this.draw();}
    setCursorX(value){
      this.currentTime=Number.isFinite(value)?value:null;const plot=this.plot;
      if(!plot)return;const visible=this.currentTime!==null&&value>=plot.min&&value<=plot.max;
      plot.cursor.setAttribute('visibility',visible?'visible':'hidden');
      if(visible){const px=plot.x(value);plot.cursor.setAttribute('x1',px);plot.cursor.setAttribute('x2',px);}
    }
    draw(){
      const o=this.options,host=this.host;host.replaceChildren();this.plot=null;
      const series=o.series||[],all=series.flatMap(s=>s.points.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
      if(!all.length){const p=document.createElement('p');p.className='empty';p.textContent='Sem valores disponíveis para esta seleção.';host.append(p);return;}
      const legend=document.createElement('div');legend.className='chart-legend';
      series.forEach(s=>{const key=document.createElement('span');key.className='legend-key';const line=el('svg',{width:28,height:8,viewBox:'0 0 28 8','aria-hidden':true});line.style.width='28px';line.style.flexShrink='0';line.append(el('line',{x1:0,x2:28,y1:4,y2:4,stroke:s.color,'stroke-width':2,'stroke-dasharray':s.dash||''}));const text=document.createElement('span');text.textContent=s.name;key.append(line,text);legend.append(key);});host.append(legend);
      const width=Math.max(240,host.clientWidth||800),height=o.height||250,small=width<440,margin={l:small?58:76,r:18,t:34,b:48},w=width-margin.l-margin.r,h=height-margin.t-margin.b;
      let xmin=Infinity,xmax=-Infinity,ymin=Infinity,ymax=-Infinity;
      all.forEach(p=>{xmin=Math.min(xmin,p.x);xmax=Math.max(xmax,p.x);ymin=Math.min(ymin,p.y);ymax=Math.max(ymax,p.y);});
      if(o.xDomain){xmin=o.xDomain[0];xmax=o.xDomain[1];}
      (o.references||[]).forEach(r=>{ymin=Math.min(ymin,r.value);ymax=Math.max(ymax,r.value);});
      if(xmin===xmax)xmax=xmin+1;
      const pad=(ymax-ymin||Math.max(Math.abs(ymax)*.01,.001))*.09;ymin-=pad;ymax+=pad;
      const x=v=>margin.l+(v-xmin)/(xmax-xmin)*w,y=v=>margin.t+h-(v-ymin)/(ymax-ymin)*h;
      const svg=el('svg',{viewBox:`0 0 ${width} ${height}`,height,role:'img',tabindex:0,'aria-label':`${o.title}. ${o.yLabel}. ${o.xLabel}. Use as setas esquerda e direita para consultar os pontos.${o.onSeek?' Enter seleciona o quadro mais próximo.':''}`});
      svg.append(el('title',{},o.title));svg.append(el('text',{x:0,y:17,fill:'#536975','font-size':12,'font-family':'inherit'},o.yLabel));
      const yDigits=Math.min(10,Math.max(3,Math.ceil(Math.log10(Math.max(Math.abs(ymin),Math.abs(ymax),1)))-Math.floor(Math.log10(ymax-ymin))+2));
      ticks(ymin,ymax,4).forEach(t=>{svg.append(el('line',{x1:margin.l,x2:width-margin.r,y1:y(t),y2:y(t),stroke:Math.abs(t)<1e-12?'#a9bcb7':'#e4eae8','stroke-width':1}));svg.append(el('text',{x:margin.l-9,y:y(t)+4,'text-anchor':'end',fill:'#536975','font-size':12,'font-family':'inherit'},number(t,yDigits)));});
      const xt=[xmin,...ticks(xmin,xmax,small?3:5).filter(t=>t>xmin+(xmax-xmin)*.12&&t<xmax-(xmax-xmin)*.12),xmax];
      xt.forEach(t=>{svg.append(el('line',{x1:x(t),x2:x(t),y1:margin.t+h,y2:margin.t+h+4,stroke:'#9bafaa'}));svg.append(el('text',{x:x(t),y:margin.t+h+19,'text-anchor':t===xmin?'start':t===xmax?'end':'middle',fill:'#536975','font-size':12,'font-family':'inherit'},number(t)));});
      svg.append(el('line',{x1:margin.l,x2:width-margin.r,y1:margin.t+h,y2:margin.t+h,stroke:'#b9c9c4'}));svg.append(el('text',{x:margin.l+w/2,y:height-6,'text-anchor':'middle',fill:'#536975','font-size':12,'font-family':'inherit'},o.xLabel));
      (o.references||[]).forEach(r=>{svg.append(el('line',{x1:margin.l,x2:width-margin.r,y1:y(r.value),y2:y(r.value),stroke:'#61726b','stroke-dasharray':'3 5','stroke-width':1}));});
      series.forEach(s=>{let path='',prev=null;for(const p of s.points){if(!Number.isFinite(p.x)||!Number.isFinite(p.y)){prev=null;continue;}const move=!prev||prev.segment!==p.segment;path+=`${move?'M':'L'}${x(p.x).toFixed(2)},${y(p.y).toFixed(2)} `;if(move)svg.append(el('circle',{cx:x(p.x),cy:y(p.y),r:2,fill:s.color}));prev=p;}svg.append(el('path',{d:path,fill:'none',stroke:s.color,'stroke-width':1.75,'stroke-dasharray':s.dash||'','vector-effect':'non-scaling-stroke'}));});
      const playbackCursor=el('line',{class:'playback-cursor',x1:0,x2:0,y1:margin.t,y2:margin.t+h,stroke:'#172f40','stroke-width':2,visibility:'hidden','pointer-events':'none'});svg.append(playbackCursor);
      this.plot={cursor:playbackCursor,x,min:xmin,max:xmax};this.setCursorX(this.currentTime);
      const cursor=el('line',{x1:0,x2:0,y1:margin.t,y2:margin.t+h,stroke:'#526d63','stroke-dasharray':'2 3',visibility:'hidden'});svg.append(cursor);
      const hit=el('rect',{x:margin.l,y:margin.t,width:w,height:h,fill:'transparent'});svg.append(hit);host.append(svg);
      if(o.onSeek)hit.style.cursor='crosshair';
      const tip=document.createElement('div');tip.className='chart-tip';tip.hidden=true;tip.setAttribute('aria-live','polite');host.append(tip);
      const values=[...new Set(all.map(p=>p.x))].sort((a,b)=>a-b);let index=0;
      const show=(target,clientY)=>{const nearest=values.reduce((a,b)=>Math.abs(b-target)<Math.abs(a-target)?b:a);index=values.indexOf(nearest);cursor.setAttribute('x1',x(nearest));cursor.setAttribute('x2',x(nearest));cursor.setAttribute('visibility','visible');tip.replaceChildren();const heading=document.createElement('strong');heading.textContent=`${number(nearest,8)} ${o.xUnit}`;tip.append(heading);
        series.forEach(s=>{const exact=s.points.filter(p=>p.x===nearest&&Number.isFinite(p.y));for(const p of exact){const line=document.createElement('div');line.textContent=`${s.name}: ${number(p.y,9)} ${o.yUnit}`;tip.append(line);}});
        tip.hidden=false;tip.style.left=`${Math.max(0,Math.min(width-260,x(nearest)+12))}px`;tip.style.top=`${legend.offsetHeight+Math.min(height-80,Math.max(27,(clientY||60)-35))}px`;
        if(o.onCursor)o.onCursor(nearest);
      };
      hit.addEventListener('pointermove',event=>{const rect=svg.getBoundingClientRect(),px=(event.clientX-rect.left)*width/rect.width;show(xmin+(px-margin.l)/w*(xmax-xmin),(event.clientY-rect.top)*height/rect.height);});
      if(o.onSeek)hit.addEventListener('click',event=>{const rect=svg.getBoundingClientRect(),px=(event.clientX-rect.left)*width/rect.width;o.onSeek(Math.max(xmin,Math.min(xmax,xmin+(px-margin.l)/w*(xmax-xmin))));});
      hit.addEventListener('pointerleave',()=>{tip.hidden=true;cursor.setAttribute('visibility','hidden');});
      svg.addEventListener('focus',()=>show(values[index]));svg.addEventListener('blur',()=>{tip.hidden=true;cursor.setAttribute('visibility','hidden');});
      svg.addEventListener('keydown',event=>{if(o.onSeek&&(event.key==='Enter'||event.key===' ')){event.preventDefault();o.onSeek(values[index]);return;}if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();index=event.key==='Home'?0:event.key==='End'?values.length-1:Math.max(0,Math.min(values.length-1,index+(event.key==='ArrowRight'?1:-1)));show(values[index]);});
    }
  }
  root.ScientificChart=ScientificChart;root.chartNumber=number;root.TrajectoryTime={index:timeIndex};
  if(typeof module==='object'&&module.exports)module.exports={ScientificChart,timeIndex};
})(globalThis);
