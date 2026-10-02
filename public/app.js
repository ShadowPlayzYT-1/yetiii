document.addEventListener('DOMContentLoaded',()=>{
 const $=s=>[...document.querySelectorAll(s)],bar=document.body.appendChild(Object.assign(document.createElement('div'),{id:'bar'})),hd=document.querySelector('header');
 const on=()=>{const h=document.documentElement,s=h.scrollTop;bar.style.width=s/(h.scrollHeight-h.clientHeight||1)*100+'%';hd.classList.toggle('sm',s>20)};on();addEventListener('scroll',on,{passive:true});
 // hero word-by-word reveal
 const h1=document.querySelector('.hero h1');if(h1){let n=0;const wrap=node=>{[...node.childNodes].forEach(c=>{if(c.nodeType==3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t.trim())return f.append(t);const w=document.createElement('span');w.className='w';w.innerHTML='<i style="animation-delay:'+(1+n++*.09)+'s">'+t+'</i>';f.append(w)});c.replaceWith(f)}else if(c.nodeType==1&&c.tagName!='BR')wrap(c)})};wrap(h1)}
 // scroll reveal
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
 $('.card,.rv,table.list,.detail,.stats div').forEach((el,i)=>{el.classList.add('rv');el.style.transitionDelay=(i%4)*80+'ms';io.observe(el)});
 // counters (ease-out, on view)
 const co=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;co.unobserve(e.target);const el=e.target,n=+el.dataset.n,t0=performance.now();(function f(t){const p=Math.min((t-t0)/1400,1);el.textContent=Math.round(n*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(t0)}));$('[data-n]').forEach(el=>co.observe(el));
 // cursor spotlight on background grid
 addEventListener('mousemove',e=>{const b=document.querySelector('.bg');b.style.setProperty('--mx',e.clientX+'px');b.style.setProperty('--my',e.clientY+'px')},{passive:true});
 // 3D tilt + glow on cards, magnetic buttons
 $('a.card').forEach(c=>{c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;c.style.setProperty('--x',x+'px');c.style.setProperty('--y',y+'px');c.style.transform=`perspective(800px) rotateX(${(.5-y/r.height)*8}deg) rotateY(${(x/r.width-.5)*8}deg) translateY(-4px)`});c.addEventListener('mouseleave',()=>c.style.transform='')});
 $('.cta .btn,.banner .btn').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.2}px,${(e.clientY-r.top-r.height/2)*.3}px)`});b.addEventListener('mouseleave',()=>b.style.transform='')});
 $('.dd>a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();a.parentNode.classList.toggle('show')}));
});
