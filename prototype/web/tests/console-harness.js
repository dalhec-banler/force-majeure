const fs=require('node:fs'), vm=require('node:vm'), path=require('node:path');
function consoleGame(mode,home){
  const noop=()=>{};
  const drawing=new Proxy({}, {get:(_,k)=>k==='measureText'?()=>({width:100}):k==='createRadialGradient'||k==='createLinearGradient'?()=>({addColorStop:noop}):noop});
  function element(){return new Proxy({style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},value:'',textContent:'',innerHTML:''},
    {get:(o,k)=>k in o?o[k]:k==='getContext'?()=>drawing:k==='querySelectorAll'?()=>[]:k==='children'?[]:k==='parentElement'?element():k==='getBoundingClientRect'?()=>({width:800,height:600,left:0,top:0}):k==='clientWidth'||k==='clientHeight'?100:noop});}
  const els=new Map(), storage=new Map(mode?[["fm.mode",mode]]:[]), errors=[];
  const context=vm.createContext({console:{log:noop,error:(...x)=>errors.push(x.join(' '))},
    document:{getElementById:id=>{if(!els.has(id))els.set(id,element());return els.get(id)},createElement:element,body:element(),addEventListener:noop},
    addEventListener:noop,matchMedia:()=>({matches:true}),devicePixelRatio:1,requestAnimationFrame:noop,
    setInterval:noop,setTimeout:noop,clearTimeout:noop,Image:class{set src(v){}},performance:{now:()=>1000},
    getComputedStyle:()=>({getPropertyValue:()=> 'monospace'}),location:{reload:noop},
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    sessionStorage:{getItem:()=>null,removeItem:noop}});
  if(home) storage.set("fm.homeland",home);
  context.window=context;
  const script=fs.readFileSync(path.join(__dirname,'../console.html'),'utf8').match(/<script>([\s\S]*)<\/script>/)[1];
  vm.runInContext(script,context);
  return {errors,run:code=>vm.runInContext(code,context),json:code=>JSON.parse(vm.runInContext(`JSON.stringify(${code})`,context))};
}

module.exports={consoleGame};
