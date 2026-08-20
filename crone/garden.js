(()=>{
  if(typeof schemas==='undefined') return;

  schemas.seasonal={label:'Seasonal Garden',icon:'❋',desc:'Seasonal observations & garden moments',fields:[
    ['title','Entry Title','text',true,''],
    ['date','Date','date',true,today()],
    ['season','Season','select',true,'',[['spring','Spring'],['summer','Summer'],['autumn','Autumn'],['winter','Winter']]],
    ['image','Photo','file',false,''],
    ['plant_link','Related Plant Link','text',false,''],
    ['body','Seasonal Notes','textarea',true,'']
  ]};
  schemas.projects={label:'Garden Projects',icon:'⌂',desc:'Projects, goals & garden journal',fields:[
    ['title','Entry Title','text',true,''],
    ['date','Date','date',true,today()],
    ['year','Garden Year','text',true,String(new Date().getFullYear())],
    ['category','Entry Type','select',true,'',[['project','What I Did / Project'],['goal','Goal'],['journal','Garden Journal']]],
    ['status','Status','select',false,'',[['planned','Planned'],['in-progress','In Progress'],['complete','Complete']]],
    ['image','Photo','file',false,''],
    ['body','Notes','textarea',true,'']
  ]};
  schemas.harvest={label:'Harvest & Use',icon:'♧',desc:'Harvests, preserving & garden use',fields:[
    ['title','Entry Title','text',true,''],
    ['date','Date','date',true,today()],
    ['category','Entry Type','select',true,'',[['harvest','Harvest'],['preservation','Preservation'],['use','Use / Preparation']]],
    ['plant','Plant','text',false,''],
    ['method','Method','text',false,''],
    ['image','Photo','file',false,''],
    ['body','Notes','textarea',true,'']
  ]};

  const root=document.getElementById('rootCards');
  if(!root) return;
  ['seasonal','projects','harvest'].forEach(key=>{
    if([...root.querySelectorAll('strong')].some(x=>x.textContent===schemas[key].label))return;
    root.appendChild(cardFor(key));
  });
})();
