const { app } = require('@azure/functions');

const OWNER = 'RootandBrass';
const REPO = 'Root';
const BRANCH = 'main';
const API_VERSION = '2022-11-28';

const definitions = {
  journal: { dir: 'journal/entries', dated: true, bodyField: 'body', required: ['date'] },
  moon: { dir: 'grimoire/moon/entries', datedTitle: true, required: ['title', 'date', 'phase'] },
  kitchen: { dir: 'kitchen/entries', titleOnly: true, bodyField: 'recipe', required: ['title', 'category', 'recipe'] },
  apothecary: { dir: 'grimoire/apothecary/entries', titleOnly: true, required: ['title'] },
  crystals: { dir: 'grimoire/crystals/entries', titleOnly: true, required: ['title'] },
  tarot: { dir: 'grimoire/tarot/entries', datedTitle: true, required: ['title', 'date'] },
  dreams: { dir: 'grimoire/dreams/entries', datedTitle: true, required: ['title', 'date'], bodyField: 'body' },
  spells: { dir: 'grimoire/spells/entries', datedTitle: true, required: ['title', 'date'] },
  grimoireRecipes: { dir: 'grimoire/recipes/entries', datedTitle: true, required: ['title', 'date', 'category'] },
  signs: { dir: 'grimoire/signs-symbols/entries', titleOnly: true, required: ['title', 'category'] },
  seasonal: { dir: 'garden/seasonal/entries', datedTitle: true, required: ['title', 'date', 'season'], bodyField: 'body' },
  projects: { dir: 'garden/projects/entries', datedTitle: true, required: ['title', 'date', 'year', 'category'], bodyField: 'body' },
  harvest: { dir: 'garden/harvest/entries', datedTitle: true, required: ['title', 'date', 'category'], bodyField: 'body' }
};

const plantDirs = {
  treesandshrubs: 'garden/plants/treesandshrubs',
  flowers: 'garden/plants/flowers',
  climbers: 'garden/plants/climbers',
  edibles: 'garden/plants/edibles'
};

function slugify(value='') {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90) || 'entry';
}
function yamlValue(value) {
  if (value === null || value === undefined) return '""';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  const text = String(value).replace(/\r\n/g,'\n');
  if (text.includes('\n')) return '|-\n' + text.split('\n').map(line => `  ${line}`).join('\n');
  return JSON.stringify(text);
}
function frontMatter(fields, bodyField) {
  const lines = ['---'];
  for (const [key,value] of Object.entries(fields)) {
    if (key === bodyField || key === 'plant_group' || value === '' || value === null || value === undefined) continue;
    if (!/^[a-zA-Z0-9_]+$/.test(key)) continue;
    lines.push(`${key}: ${yamlValue(value)}`);
  }
  lines.push('---','');
  if (bodyField && fields[bodyField]) lines.push(String(fields[bodyField]).trim(),'');
  return lines.join('\n');
}
function parseFrontMatter(content, bodyField) {
  const fields = {};
  const text = String(content || '').replace(/\r\n/g,'\n');
  if (!text.startsWith('---\n')) { if (bodyField) fields[bodyField] = text.trim(); return fields; }
  const end = text.indexOf('\n---',4); if (end < 0) return fields;
  const fm = text.slice(4,end).split('\n');
  for (let i=0;i<fm.length;i++) {
    const m = fm[i].match(/^([A-Za-z0-9_]+):\s*(.*)$/); if (!m) continue;
    const key = m[1], raw = m[2];
    if (raw === '|-' || raw === '|') { const vals=[]; while (i+1<fm.length && /^\s+/.test(fm[i+1])) vals.push(fm[++i].replace(/^  /,'')); fields[key]=vals.join('\n'); }
    else { try { fields[key]=JSON.parse(raw); } catch { fields[key]=raw.replace(/^['"]|['"]$/g,''); } }
  }
  const body=text.slice(end+4).trim(); if(bodyField&&body)fields[bodyField]=body; return fields;
}
function clientPrincipal(request){const raw=request.headers.get('x-ms-client-principal');if(!raw)return null;try{return JSON.parse(Buffer.from(raw,'base64').toString('utf8'))}catch{return null}}
function authorized(request){const p=clientPrincipal(request);return p&&Array.isArray(p.userRoles)&&p.userRoles.includes('crone')?p:null}
async function githubRequest(path,token,options={}){const r=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURI(path)}${options.query||''}`,{method:options.method||'GET',headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':API_VERSION,'User-Agent':'Root-and-Brass-Crone'},body:options.body});if(!r.ok){const detail=await r.text();throw new Error(`GitHub ${r.status}: ${detail.slice(0,500)}`)}return r.json()}
async function githubPut(path,bytes,token,message,sha){return githubRequest(path,token,{method:'PUT',body:JSON.stringify({message,content:Buffer.from(bytes).toString('base64'),branch:BRANCH,...(sha?{sha}:{})})})}
function chooseDefinition(type,fields={}){if(type==='plant'){const group=fields.plant_group,dir=plantDirs[group];if(!dir)throw new Error('Choose a plant group.');return{dir,titleOnly:true,extension:'.html',required:['title','plant_type','bloom','light','water']}}const def=definitions[type];if(!def)throw new Error('Unknown entry type.');return{extension:'.md',...def}}
function makeFilename(def,fields){const date=fields.date||new Date().toISOString().slice(0,10),title=fields.title||date;if(def.dated)return`${date}${def.extension}`;if(def.datedTitle)return`${date}-${slugify(title)}${def.extension}`;return`${slugify(title)}${def.extension}`}
function typeDirs(type){if(type==='plant')return Object.entries(plantDirs);const def=definitions[type];if(!def)throw new Error('Unknown entry type.');return[[null,def.dir]]}
function labelFromFile(name){return name.replace(/\.(md|html)$/,'').replace(/^\d{4}-\d{2}-\d{2}-?/,'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())||name}
function typeForPath(path){for(const[type,def]of Object.entries(definitions))if(path.startsWith(def.dir+'/'))return type;for(const[,dir]of Object.entries(plantDirs))if(path.startsWith(dir+'/'))return'plant';return null}
function typeLabel(type){return({journal:'Journal',moon:'Moon Journal',kitchen:'Kitchen',apothecary:'Apothecary',crystals:'Crystals',tarot:'Tarot',dreams:'Dreams',spells:'Spells',grimoireRecipes:'Grimoire Recipes',signs:'Signs & Symbols',plant:'Plant Journal',seasonal:'Seasonal Garden',projects:'Garden Projects',harvest:'Harvest & Use'})[type]||type}
function snippetFor(text,query){const compact=String(text||'').replace(/---[\s\S]*?---/,' ').replace(/\s+/g,' ').trim(),lower=compact.toLowerCase(),q=query.toLowerCase(),i=lower.indexOf(q);if(i<0)return compact.slice(0,130);const start=Math.max(0,i-45),end=Math.min(compact.length,i+q.length+85);return(start?'…':'')+compact.slice(start,end)+(end<compact.length?'…':'')}

app.http('croneEntries',{route:'crone/entries',methods:['GET'],authLevel:'anonymous',handler:async(request)=>{const principal=authorized(request);if(!principal)return{status:403,jsonBody:{ok:false,error:'Crone role required.'}};const token=process.env.CRONE_GITHUB_TOKEN;if(!token)return{status:503,jsonBody:{ok:false,error:'GitHub write key is not connected.'}};try{const type=request.query.get('type'),items=[];for(const[group,dir]of typeDirs(type)){let list=[];try{list=await githubRequest(dir,token,{query:`?ref=${BRANCH}`})}catch(error){if(String(error.message).includes('GitHub 404'))continue;throw error}for(const f of list)if(f.type==='file'&&/\.(md|html)$/i.test(f.name))items.push({path:f.path,name:f.name,label:labelFromFile(f.name),sha:f.sha,plant_group:group})}items.sort((a,b)=>b.name.localeCompare(a.name));return{jsonBody:{ok:true,items}}}catch{return{status:500,jsonBody:{ok:false,error:'Crone could not load existing entries.'}}}}});

app.http('croneExistingEntry',{route:'crone/existing',methods:['GET'],authLevel:'anonymous',handler:async(request)=>{const principal=authorized(request);if(!principal)return{status:403,jsonBody:{ok:false,error:'Crone role required.'}};const token=process.env.CRONE_GITHUB_TOKEN;if(!token)return{status:503,jsonBody:{ok:false,error:'GitHub write key is not connected.'}};try{const type=request.query.get('type'),path=request.query.get('path');if(!path||!typeDirs(type).some(([,d])=>path.startsWith(d+'/')))return{status:400,jsonBody:{ok:false,error:'Invalid entry path.'}};const data=await githubRequest(path,token,{query:`?ref=${BRANCH}`});const group=type==='plant'?Object.entries(plantDirs).find(([,d])=>path.startsWith(d+'/'))?.[0]:null;const def=type==='plant'?chooseDefinition(type,{plant_group:group}):chooseDefinition(type);const content=Buffer.from(data.content||'','base64').toString('utf8'),fields=parseFrontMatter(content,def.bodyField||'body');if(group)fields.plant_group=group;return{jsonBody:{ok:true,path,sha:data.sha,fields}}}catch{return{status:500,jsonBody:{ok:false,error:'Crone could not open this entry.'}}}}});

app.http('croneSearch',{route:'crone/search',methods:['GET'],authLevel:'anonymous',handler:async(request)=>{const principal=authorized(request);if(!principal)return{status:403,jsonBody:{ok:false,error:'Crone role required.'}};const token=process.env.CRONE_GITHUB_TOKEN;if(!token)return{status:503,jsonBody:{ok:false,error:'GitHub write key is not connected.'}};const q=(request.query.get('q')||'').trim();if(q.length<2)return{jsonBody:{ok:true,items:[]}};try{const dirs=[...Object.values(definitions).map(d=>d.dir),...Object.values(plantDirs)],listings=await Promise.all(dirs.map(async dir=>{try{return{dir,list:await githubRequest(dir,token,{query:`?ref=${BRANCH}`})}}catch(error){if(String(error.message).includes('GitHub 404'))return{dir,list:[]};throw error}})),files=[];for(const{list}of listings)for(const f of list)if(f.type==='file'&&/\.(md|html)$/i.test(f.name))files.push(f);const query=q.toLowerCase(),results=[],filenameHits=files.filter(f=>f.name.toLowerCase().includes(query)),rest=files.filter(f=>!f.name.toLowerCase().includes(query)),ordered=[...filenameHits,...rest].slice(0,180),batchSize=10;for(let i=0;i<ordered.length&&results.length<24;i+=batchSize){const batch=ordered.slice(i,i+batchSize),loaded=await Promise.all(batch.map(async f=>{try{const data=await githubRequest(f.path,token,{query:`?ref=${BRANCH}`});return{f,text:Buffer.from(data.content||'','base64').toString('utf8')}}catch{return null}}));for(const item of loaded){if(!item)continue;const hay=(item.f.name+'\n'+item.text).toLowerCase();if(!hay.includes(query))continue;const type=typeForPath(item.f.path);if(!type)continue;let label=labelFromFile(item.f.name);const def=type==='plant'?null:definitions[type],fields=parseFrontMatter(item.text,(def&&def.bodyField)||'body');if(fields.title)label=String(fields.title);else if(type==='journal'&&fields.date)label=String(fields.date);results.push({type,typeLabel:typeLabel(type),path:item.f.path,label,snippet:snippetFor(item.text,q)});if(results.length>=24)break}}return{jsonBody:{ok:true,items:results}}}catch{return{status:500,jsonBody:{ok:false,error:'Crone could not search Root & Brass.'}}}}});

app.http('croneEntry',{route:'crone/entry',methods:['POST'],authLevel:'anonymous',handler:async(request,context)=>{const principal=authorized(request);if(!principal)return{status:403,jsonBody:{ok:false,error:'Crone role required.'}};const token=process.env.CRONE_GITHUB_TOKEN;if(!token)return{status:503,jsonBody:{ok:false,error:'Crone is locked but not yet connected to its GitHub write key.'}};try{const payload=await request.json(),type=payload.type,fields={...(payload.fields||{})},def=chooseDefinition(type,fields);for(const key of def.required||[])if(!fields[key])return{status:400,jsonBody:{ok:false,error:`${key} is required.`}};if(payload.image&&payload.image.data){const rawName=payload.image.name||'photo.jpg',m=rawName.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/),ext=m?`.${m[1]}`:'.jpg',stem=slugify((fields.title||type)+'-'+Date.now()),imagePath=`images/uploads/${stem}${ext}`,imageBytes=Buffer.from(String(payload.image.data).replace(/^data:[^;]+;base64,/,''),'base64');if(imageBytes.length>8*1024*1024)return{status:413,jsonBody:{ok:false,error:'Photo is too large. Keep uploads under 8 MB.'}};await githubPut(imagePath,imageBytes,token,`Crone: upload ${fields.title||type} photo`);if(type==='plant'||type==='kitchen')fields.photo=`/${imagePath}`;else fields.image=`/${imagePath}`}const editing=!!(payload.existingPath&&payload.existingSha),filename=makeFilename(def,fields);let path=editing?payload.existingPath:`${def.dir}/${filename}`;if(editing&&!path.startsWith(def.dir+'/'))return{status:400,jsonBody:{ok:false,error:'Entry location changed. Save it as a new entry instead.'}};const content=frontMatter(fields,def.bodyField||'body'),result=await githubPut(path,Buffer.from(content,'utf8'),token,`Crone: ${editing?'edit':'add'} ${fields.title||type}`,editing?payload.existingSha:null);context.log(`Crone ${editing?'updated':'created'} ${path}`);return{status:editing?200:201,jsonBody:{ok:true,path,commit:result.commit&&result.commit.sha,message:editing?'Changes saved to Root & Brass.':'Saved to Root & Brass.'}}}catch(error){context.error(error);const conflict=String(error.message||'').includes('GitHub 422')||String(error.message||'').includes('GitHub 409');return{status:conflict?409:500,jsonBody:{ok:false,error:conflict?'This entry changed since Crone opened it. Reload it and try again.':'Crone could not save this entry.'}}}}});

app.http('croneStatus',{route:'crone/status',methods:['GET'],authLevel:'anonymous',handler:async(request)=>{const principal=authorized(request),permitted=!!principal;return{status:permitted?200:403,jsonBody:{ok:permitted,connected:permitted&&!!process.env.CRONE_GITHUB_TOKEN,user:permitted?principal.userDetails:null}}}});
