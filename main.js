require('dotenv').config();
const express=require('express'),session=require('express-session'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {seed}=require('./seed'),pages=require('./pages');
const app=express(),E=process.env,DB=path.join(__dirname,'data','db.json');
const load=()=>{if(!fs.existsSync(DB))fs.writeFileSync(DB,JSON.stringify(seed(),null,2));return JSON.parse(fs.readFileSync(DB))};
const save=d=>fs.writeFileSync(DB,JSON.stringify(d,null,2));
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const inr=n=>'₹'+Number(n).toLocaleString('en-IN');

app.set('view engine','ejs');
app.use(express.urlencoded({extended:false}));
app.use(express.static('public'));
app.use(session({secret:E.SESSION_SECRET||'dev',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',maxAge:864e5}}));
app.use((req,res,next)=>{const d=load();res.locals={cats:d.cats.sort((a,b)=>a.order-b.order),site:E.SITE_NAME||'YetiNodes',discord:E.DISCORD_URL,inr,admin:!!req.session.admin,title:''};next()});

// ---- Hostinger domain pricing (cached 1h) ----
const HX='https://developers.hostinger.com/api',H={Authorization:'Bearer '+E.HOSTINGER_API_KEY,'Content-Type':'application/json'};
const sell=usd=>Math.round((usd+Number(E.MARKUP_USD||1))*Number(E.USD_INR||100));
let cache={t:0,d:null};
async function tlds(){
 if(cache.d&&Date.now()-cache.t<36e5)return cache.d;
 try{
  const r=await fetch(HX+'/billing/v1/catalog?category=DOMAIN',{headers:H});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const j=await r.json(),list=Array.isArray(j)?j:(j.data||[]),out={};
  for(const it of list){
   const m=String(it.name||it.id||'').match(/\.[a-z0-9]+/i);if(!m)continue;
   const p=(it.prices||[]).find(x=>(x.period||1)==1)||(it.prices||[])[0];if(!p)continue;
   const cents=p.first_period_price??p.price;out[m[0].toLowerCase()]=cents/100;
  }
  if(!Object.keys(out).length)throw new Error('empty catalog');
  cache={t:Date.now(),d:{list:out,live:true}};
 }catch(e){console.error('Hostinger catalog failed:',e.message);cache={t:Date.now()-33e5,d:{list:{'.com':11,'.xyz':2,'.site':3,'.online':3,'.shop':3,'.org':11,'.dev':13,'.ai':70},live:false}}}
 return cache.d;
}
const rows=d=>Object.entries(d.list).map(([tld,usd])=>({tld,price:sell(usd)})).sort((a,b)=>a.price-b.price).map((r,i)=>({...r,popular:i<3}));

// ---- public pages ----
app.get('/',(req,res)=>{const d=load();res.render('index',{featured:d.products.filter(p=>p.featured)})});
app.get('/domains',async(req,res)=>{res.render('domains',{title:'Domains',rows:rows(await tlds()),result:null,q:''})});
app.get('/domains/search',async(req,res)=>{
 const q=String(req.query.q||'').toLowerCase().replace(/\..*$/,'').replace(/[^a-z0-9-]/g,'').slice(0,60),t=await tlds(),r=rows(t);let result=[];
 if(q){try{
  const x=await fetch(HX+'/domains/v1/availability',{method:'POST',headers:H,body:JSON.stringify({domain:q,tlds:r.slice(0,12).map(a=>a.tld.slice(1)),with_alternatives:false})});
  const j=await x.json();result=(Array.isArray(j)?j:j.data||[]).map(a=>({domain:a.domain,ok:a.is_available,price:(r.find(z=>a.domain.endsWith(z.tld))||{}).price}));
 }catch(e){result=null}}
 res.render('domains',{title:'Domains',rows:r,result,q});
});
app.get('/c/:cat',(req,res,next)=>{
 if(req.params.cat=='domains')return res.redirect('/domains');
 const d=load(),cat=d.cats.find(c=>c.slug==req.params.cat);if(!cat)return next();
 const items=d.products.filter(p=>p.category==cat.slug),groups=[...new Set(items.map(p=>p.group))];
 res.render('category',{title:cat.name,cat,items,groups});
});
app.get('/p/:slug',(req,res,next)=>{
 const d=load(),p=d.products.find(x=>x.slug==req.params.slug);if(!p)return next();
 res.render('product',{title:p.name,p,cat:d.cats.find(c=>c.slug==p.category)});
});
Object.keys(pages).forEach(k=>app.get('/'+k,(req,res)=>res.render('page',{title:pages[k][0],body:pages[k][1].replace('{{DISCORD}}',E.DISCORD_URL)})));

// ---- admin ----
const eq=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length==y.length&&crypto.timingSafeEqual(x,y)};
const guard=(req,res,next)=>req.session.admin?next():res.redirect('/admin/login');
app.get('/admin/login',(req,res)=>res.render('admin/login',{title:'Admin login',err:0}));
app.post('/admin/login',(req,res)=>{
 if(eq(req.body.user,E.ADMIN_USER)&&eq(req.body.pass,E.ADMIN_PASS)){req.session.admin=true;return res.redirect('/admin')}
 res.status(401).render('admin/login',{title:'Admin login',err:1});
});
app.post('/admin/logout',(req,res)=>req.session.destroy(()=>res.redirect('/')));
app.get('/admin',guard,(req,res)=>{const d=load();res.render('admin/index',{title:'Admin',products:d.products})});
app.post('/admin/cat',guard,(req,res)=>{
 const d=load(),{action,slug:s,name,desc}=req.body;
 if(action=='add'&&name)d.cats.push({slug:slug(name),name,desc:desc||'',status:'active',order:d.cats.length});
 const c=d.cats.find(x=>x.slug==s);
 if(c&&action=='toggle')c.status=c.status=='active'?'soon':'active';
 if(c&&action=='delete')d.cats=d.cats.filter(x=>x!=c);
 save(d);res.redirect('/admin');
});
const form=(b,id)=>({id,name:b.name,category:b.category,group:b.group||'Standard',price_month:b.price_month?+b.price_month:null,price_year:b.price_year?+b.price_year:null,stock:!!b.stock,featured:!!b.featured,
 specs:Object.fromEntries(String(b.specs||'').split('\n').map(l=>l.split(/:(.*)/s).map(s=>s&&s.trim())).filter(a=>a[0]&&a[1]))});
app.get('/admin/product/new',guard,(req,res)=>res.render('admin/edit',{title:'New product',p:{specs:{},stock:true},isNew:true}));
app.get('/admin/product/:id',guard,(req,res,next)=>{const p=load().products.find(x=>x.id==req.params.id);p?res.render('admin/edit',{title:'Edit '+p.name,p,isNew:false}):next()});
app.post('/admin/product/save/:id?',guard,(req,res)=>{
 const d=load();let n;
 if(req.params.id){const i=d.products.findIndex(x=>x.id==req.params.id);n={...d.products[i],...form(req.body,d.products[i].id)};d.products[i]=n}
 else{const id=Math.max(0,...d.products.map(x=>x.id))+1;n=form(req.body,id);n.slug=slug(n.category+'-'+n.group+'-'+n.name);d.products.push(n)}
 save(d);res.redirect('/admin');
});
app.post('/admin/product/delete/:id',guard,(req,res)=>{const d=load();d.products=d.products.filter(x=>x.id!=req.params.id);save(d);res.redirect('/admin')});

app.use((req,res)=>res.status(404).render('page',{title:'404',body:'<p>Page not found.</p>'}));
app.listen(E.PORT||3000,()=>console.log('YetiNodes running on http://localhost:'+(E.PORT||3000)));
