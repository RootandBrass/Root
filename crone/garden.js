(()=>{
  if(typeof schemas==='undefined') return;

  schemas.plant={label:'Plants',icon:'❦',desc:'Garden, harvest & apothecary in one record',fields:[
    ['plant_group','Plant Group','select',true,'',[['trees-shrubs','Trees & Shrubs'],['flowers','Perennials & Flowers'],['climbers','Vines & Climbers'],['edibles','Fruit & Edibles']]],
    ['title','Plant Name','text',true,''],
    ['scientific_name','Scientific Name','text',false,''],
    ['photo','Photo','file',false,''],
    ['plant_type','Type','text',true,''],
    ['bloom','Bloom / Seasonal Interest','text',true,''],
    ['light','Light','text',true,''],
    ['water','Water','text',true,''],
    ['garden_notes','Garden Notes','textarea',false,''],
    ['seasonal_record','Seasonal Record','textarea',false,''],

    ['show_harvest','Show in Harvest & Use','select',false,'false',[['false','No'],['true','Yes']]],
    ['harvest_season','Harvest Season','text',false,''],
    ['parts_used','Parts to Gather / Use','text',false,''],
    ['harvest','Harvesting Notes','textarea',false,''],
    ['harvest_uses','Harvest Uses','textarea',false,''],
    ['preserve_dry','Drying Notes','textarea',false,''],
    ['preserve_freeze','Freezing Notes','textarea',false,''],
    ['preserve_infuse','Infusing / Other Use Notes','textarea',false,''],
    ['preparation','Preparation & Preservation','textarea',false,''],

    ['show_apothecary','Show in Apothecary','select',false,'false',[['false','No'],['true','Yes']]],
    ['common_name','Common Name','text',false,''],
    ['habitat','Habitat & Growing Conditions','textarea',false,''],
    ['identification','Identification Notes','textarea',false,''],
    ['benefits','Benefits','textarea',false,''],
    ['medicinal_uses','Traditional Medicinal Uses','textarea',false,''],
    ['culinary_uses','Culinary Uses','textarea',false,''],
    ['magical_uses','Folklore & Magical Associations','textarea',false,''],
    ['cautions','Safety & Cautions','textarea',false,''],
    ['personal_notes','Apothecary Notes','textarea',false,''],
    ['sources','Sources & References','textarea',false,''],
    ['body','Additional Notes','textarea',false,'']
  ]};

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

  const plantCard=[...document.querySelectorAll('#rootCards .card')].find(card=>card.querySelector('strong')?.textContent==='Plant Journal');
  if(plantCard){
    const strong=plantCard.querySelector('strong');
    const small=plantCard.querySelector('small');
    if(strong) strong.textContent='Plants';
    if(small) small.textContent='Garden, harvest & apothecary in one record';
  }

  const apothecaryCard=[...document.querySelectorAll('#grimoireCards .card')].find(card=>card.querySelector('strong')?.textContent==='Apothecary');
  if(apothecaryCard) apothecaryCard.remove();

  const root=document.getElementById('rootCards');
  if(root){
    ['seasonal','projects'].forEach(key=>{
      if([...root.querySelectorAll('strong')].some(x=>x.textContent===schemas[key].label))return;
      root.appendChild(cardFor(key));
    });
  }

  const nativeFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(url.includes('/api/crone/entry')&&init&&typeof init.body==='string'){
      try{
        const payload=JSON.parse(init.body);
        if(payload&&payload.type==='plant'&&payload.fields){
          ['show_harvest','show_apothecary'].forEach(key=>{
            if(Object.prototype.hasOwnProperty.call(payload.fields,key)){
              payload.fields[key]=payload.fields[key]===true||payload.fields[key]==='true';
            }
          });
          init={...init,body:JSON.stringify(payload)};
        }
      }catch{}
    }
    return nativeFetch(input,init);
  };
})();
