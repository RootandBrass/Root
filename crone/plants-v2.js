(()=>{
  if(typeof schemas==='undefined') return;

  schemas.plant={label:'Plants',icon:'❦',desc:'One record for garden and apothecary',fields:[
    ['plant_group','Plant Group','select',true,'',[['trees-shrubs','Trees & Shrubs'],['flowers','Perennials & Flowers'],['climbers','Vines & Climbers'],['edibles','Fruit & Edibles'],['weeds','Weeds']]],
    ['title','Plant Name','text',true,''],
    ['scientific_name','Scientific Name','text',false,''],
    ['common_name','Common Name','text',false,''],
    ['photo','Photo','file',false,''],
    ['plant_type','Type','text',true,''],
    ['bloom','Bloom / Seasonal Interest','text',true,''],
    ['light','Light','text',true,''],
    ['water','Water','text',true,''],
    ['garden_notes','Garden Notes','textarea',false,''],
    ['seasonal_record','Seasonal Record','textarea',false,''],

    ['show_apothecary','Show in Apothecary','select',false,'false',[['false','No'],['true','Yes']]],
    ['habitat','Habitat & Growing Conditions','textarea',false,''],
    ['identification','Identification Notes','textarea',false,''],
    ['benefits','Benefits','textarea',false,''],
    ['medicinal_uses','Traditional Medicinal Uses','textarea',false,''],
    ['culinary_uses','Culinary Uses','textarea',false,''],
    ['magical_uses','Folklore & Magical Associations','textarea',false,''],
    ['parts_used','Parts Used','text',false,''],
    ['harvest','Harvesting','textarea',false,''],
    ['preparation','Preparation & Preservation','textarea',false,''],
    ['cautions','Safety & Cautions','textarea',false,''],
    ['personal_notes','My Notes','textarea',false,''],
    ['sources','Sources & References','textarea',false,''],
    ['body','Additional Notes','textarea',false,'']
  ]};

  const removeLegacyApothecary=()=>{
    document.querySelectorAll('#grimoireCards .card').forEach(card=>{
      if(card.querySelector('strong')?.textContent==='Apothecary') card.remove();
    });
    const plantCard=[...document.querySelectorAll('#rootCards .card')].find(card=>{
      const t=card.querySelector('strong')?.textContent;
      return t==='Plant Journal'||t==='Plants';
    });
    if(plantCard){
      const strong=plantCard.querySelector('strong');
      const small=plantCard.querySelector('small');
      if(strong) strong.textContent='Plants';
      if(small) small.textContent='One record for garden and apothecary';
    }
  };

  const nativeFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(url.includes('/api/crone/entry')&&init&&typeof init.body==='string'){
      try{
        const payload=JSON.parse(init.body);
        if(payload?.type==='plant'&&payload.fields&&Object.prototype.hasOwnProperty.call(payload.fields,'show_apothecary')){
          payload.fields.show_apothecary=payload.fields.show_apothecary===true||payload.fields.show_apothecary==='true';
          delete payload.fields.show_harvest;
          delete payload.fields.harvest_season;
          delete payload.fields.harvest_uses;
          delete payload.fields.preserve_dry;
          delete payload.fields.preserve_freeze;
          delete payload.fields.preserve_infuse;
          init={...init,body:JSON.stringify(payload)};
        }
      }catch{}
    }
    return nativeFetch(input,init);
  };

  removeLegacyApothecary();
  document.addEventListener('DOMContentLoaded',removeLegacyApothecary);
  setTimeout(removeLegacyApothecary,0);
})();
