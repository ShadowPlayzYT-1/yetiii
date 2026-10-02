const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let id=1;const out=[];
const add=(category,group,name,pm,specs,extra={})=>out.push({id:id++,slug:slug(category+'-'+group+'-'+name),category,group,name,price_month:pm,price_year:pm?pm*10:null,stock:true,featured:false,specs,...extra});
exports.seed=()=>{
 const T=['Dirt','Stone','Coal','Iron','Redstone','Lapis','Gold','Diamond','Netherite'],
 R=[2,4,8,12,16,24,32,48,64],S=[10,20,40,60,80,120,160,240,320],N=[1,2,3,4,5,6,7,8,10],P=[40,80,160,240,320,480,640,960,1280];
 ['Power','Budget'].forEach(g=>T.forEach((t,i)=>add('minecraft',g,t,g=='Power'?P[i]:P[i]/2,{RAM:R[i]+'GB DDR4',CPU:(i+1)*100+'% vCPU',Storage:S[i]+'GB NVMe',Databases:N[i],Backups:N[i],Ports:N[i],Location:g=='Power'?'Germany → India':'Germany',Processor:'AMD EPYC',Network:'10 Gbps'},{featured:i==2&&g=='Power'})));
 [['Dirt',2,100,10,1,99],['Stone',4,150,20,2,199],['Iron',8,250,40,3,299],['Diamond',12,350,60,4,399],['Netherite',16,500,80,5,499]]
 .forEach(([n,r,c,s,d,p])=>add('bot-hosting','Standard',n,p,{RAM:r+'GB DDR4',CPU:c+'% vCPU',Storage:s+'GB NVMe',Databases:d,Backups:d,Location:'Germany → India',Processor:'AMD EPYC','Bot types':'Discord • Telegram • Node.js • Python',Network:'10 Gbps'}));
 [['Starter',299,8,60,3],['Basic',349,12,80,4],['Advanced',449,16,100,4],['Pro',549,20,160,6],['Elite',799,32,200,8],['Ultra',1099,64,400,16],['Ultimate',2399,180,1000,32]]
 .forEach(([n,p,r,s,c])=>add('vps','Ryzen 7',n,p,{CPU:'AMD Ryzen 7',RAM:r+'GB',Storage:(s>=1000?'1TB':s+'GB')+' NVMe',vCores:c,Access:'Full root',IPv4:'Private IPv4','DDoS':'Protected',Panel:'Pterodactyl supported',Setup:'Instant'}));
 [[16,780],[32,1299],[64,1999],[184,2799],[400,6799],[900,12499]].forEach(([r,p])=>add('vps','Ryzen 9',r+'GB',p,{CPU:'AMD Ryzen 9',RAM:r+'GB',Storage:'High-speed NVMe',Access:'Full root',IPv4:'Private IPv4','DDoS':'Protected',Panel:'Pterodactyl supported',Setup:'Instant'}));
 add('vps','Intel','Intel VPS',null,{Status:'Out of stock'},{stock:false});
 ['Website Development','Discord Bot Development','Custom Software'].forEach(n=>add('development','Services',n,null,{Pricing:'Custom quote',Order:'Open a ticket on Discord'}));
 const cats=[['minecraft','Minecraft Hosting','Power and Budget Minecraft servers on AMD EPYC.'],['vps','VPS Hosting','AMD Ryzen 7 & 9 VPS with full root access.'],['bot-hosting','Bot Hosting','Discord, Telegram, Node.js and Python bots.'],['domains','Domains','Live pricing straight from the registrar.'],['development','Development','Websites, bots and custom builds.'],['web-hosting','Web Hosting','Coming soon.']]
 .map(([slug,name,desc],i)=>({slug,name,desc,status:slug=='web-hosting'?'soon':'active',order:i}));
 return {cats,products:out};
};
