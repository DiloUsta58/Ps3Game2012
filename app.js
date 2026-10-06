(() => {
  'use strict';
  const regions=window.SSX_REGIONS, images=window.SSX_IMAGES, sources=window.SSX_SOURCES;
  const dropImages=window.SSX_DROP_IMAGES||{},mountainImages=window.SSX_MOUNTAIN_IMAGES||{};
  const $=id=>document.getElementById(id);
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘']/g,'').replace(/[-–]/g,' ').trim();
  const state={query:'',continent:'all',region:'all',mountain:'all',content:'all',favoritesOnly:false};
  const continents=['Nordamerika','Südamerika','Europa','Afrika','Asien','Ozeanien','Antarktika','Fiktiv'];
  const contentNames={base:'Hauptspiel',bonus:'PS3-Bonus',dlc:'DLC'};
  const levels=regions.flatMap(r=>Object.entries(r.mountains).flatMap(([mountain,names])=>names.map(name=>({name,mountain,region:r,id:`${r.id}-${normalize(name).replace(/[^a-z0-9]+/g,'-')}`}))));
  const storageKey='ssx-atlas.favorites.v1',recordStorageKey='ssx-atlas.records.v1';
  let records={};
  function readRecords(){try{const saved=JSON.parse(window.localStorage.getItem(recordStorageKey)||'{}');if(!saved||typeof saved!=='object'||Array.isArray(saved))throw new Error('invalid');records=Object.fromEntries(Object.entries(saved).filter(([id,ms])=>levels.some(l=>l.id===id)&&Number.isInteger(ms)&&ms>=0));}catch{records={};}}
  function formatTime(ms){const total=Math.floor(ms/1000),minutes=Math.floor(total/60),seconds=total%60,millis=ms%1000;return `${minutes}:${String(seconds).padStart(2,'0')},${String(millis).padStart(3,'0')}`;}
  function parseTimeInput(raw){const text=raw.trim().replace(/\s/g,'');const match=text.match(/^(?:(\d{1,3}):)?(\d{1,5})(?:[,.](\d{0,3}))?$/);if(!match)return null;let minutes,seconds;if(match[1]!==undefined){minutes=Number(match[1]);seconds=Number(match[2]);}else{const digits=match[2].padStart(4,'0');minutes=Number(digits.slice(0,-2));seconds=Number(digits.slice(-2));}if(seconds>59)return null;const fraction=match[3]||'';const ms=(minutes*60+seconds)*1000+Number(fraction.padEnd(3,'0'));return{ms,formatted:`${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}${fraction?','+fraction.padEnd(3,'0'):''}`};}
  function formatShortTime(ms){const total=Math.floor(ms/1000);return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;}
  function timeDisplay(l){const value=records[l.id],label=value===undefined?'Keine eigene Zeit eingetragen':`Eigene Zeit ${formatTime(value)}`;return `<span class="level-time" title="${escape(label)}" aria-label="${escape(label)}">${value===undefined?'00:00':formatShortTime(value)}</span>`;}
  function recordPanel(l){const best=records[l.id];return `<section class="record-panel" aria-label="Persönliche Bestzeit für ${escape(l.name)}"><div class="record-current"><div><span class="record-kicker">DEIN PERSÖNLICHER REKORD</span><strong data-record-value>${best===undefined?'Noch keine Zeit gespeichert':formatTime(best)}</strong></div><button type="button" class="record-button" data-record-toggle>Eigene Zeit Eintragen</button></div><form class="record-form" data-record-form hidden><label for="record-time">Zeit <span>(Minuten:Sekunden,Millisekunden)</span></label><div class="record-input-row"><input id="record-time" data-record-time-input name="time" type="text" inputmode="decimal" placeholder="0234,567" maxlength="12" aria-describedby="record-help record-status" required><button type="submit" class="record-save">Speichern</button></div><p id="record-help" class="record-help">Gib Ziffern ein, z. B. 0234,567. Der Doppelpunkt wird automatisch ergänzt.</p><p id="record-status" class="record-status" role="status" aria-live="polite"></p></form></section>`;}
  const mountainKey=(regionId,name)=>`${regionId}:${name}`;
  const favoriteNames={
    regions:new Map(regions.map(r=>[r.id,r.name])),
    mountains:new Map(levels.map(l=>[mountainKey(l.region.id,l.mountain),l.mountain]))
  };
  let favorites={regions:new Set(),mountains:new Set()};
  let storageNotice='';
  function readFavorites(){
    try{
      const raw=window.localStorage.getItem(storageKey);
      const saved=raw===null?{}:JSON.parse(raw);
      if(!saved||typeof saved!=='object'||Array.isArray(saved))throw new Error('Invalid favorites');
      for(const kind of ['regions','mountains']){
        favorites[kind]=new Set((Array.isArray(saved[kind])?saved[kind]:[]).filter(id=>typeof id==='string'&&favoriteNames[kind].has(id)));
      }
      storageNotice='';
    }catch(error){
      storageNotice=error instanceof SyntaxError||error.message==='Invalid favorites'
        ?'Die gespeicherten Favoriten konnten nicht gelesen werden. Du kannst sie neu auswählen.'
        :'Speichern ist in diesem Browser nicht verfügbar. Favoriten bleiben nur bis zum Neuladen erhalten.';
    }
  }
  function saveFavorites(){
    try{
      window.localStorage.setItem(storageKey,JSON.stringify({version:1,regions:[...favorites.regions],mountains:[...favorites.mountains]}));
      storageNotice='';
    }catch{
      storageNotice='Favoriten konnten nicht dauerhaft gespeichert werden. Sie bleiben nur bis zum Neuladen erhalten.';
    }
  }
  function star(kind,key,extraClass=''){
    const active=favorites[kind].has(key);
    const name=favoriteNames[kind].get(key);
    const label=`${kind==='regions'?'Region':'Berg'} ${name} ${active?'aus Favoriten entfernen':'als Favorit speichern'}`;
    return `<button type="button" class="favorite-star ${extraClass}" data-favorite-kind="${kind}" data-favorite-key="${escape(key)}" aria-pressed="${active}" aria-label="${escape(label)}" title="${escape(label)}"><span aria-hidden="true">${active?'★':'☆'}</span></button>`;
  }
  function favoritesInfo(message=''){
    const regionCount=favorites.regions.size,mountainCount=favorites.mountains.size;
    $('favorites-filter').setAttribute('aria-pressed',String(state.favoritesOnly));
    $('favorites-count').textContent=regionCount+mountainCount;
    $('favorites-summary').textContent=regionCount+mountainCount
      ?`${regionCount} ${regionCount===1?'Region':'Regionen'} · ${mountainCount} ${mountainCount===1?'Berg':'Berge'} gespeichert`
      :'Noch keine Favoriten gespeichert.';
    $('favorites-status').textContent=storageNotice||message;
    $('favorites-status').classList.toggle('storage-warning',Boolean(storageNotice));
  }
  function toggleFavorite(button){
    const kind=button.dataset.favoriteKind,key=button.dataset.favoriteKey;
    if(!favoriteNames[kind]?.has(key))return;
    const added=!favorites[kind].has(key);
    if(added)favorites[kind].add(key);else favorites[kind].delete(key);
    saveFavorites();
    const inDialog=$('detail').contains(button);
    render();
    // Update the dialog in place so focus and scroll position stay intact.
    $('detail-body').querySelectorAll('[data-favorite-kind]').forEach(b=>{
      const active=favorites[b.dataset.favoriteKind].has(b.dataset.favoriteKey);
      const label=`${b.dataset.favoriteKind==='regions'?'Region':'Berg'} ${favoriteNames[b.dataset.favoriteKind].get(b.dataset.favoriteKey)} ${active?'aus Favoriten entfernen':'als Favorit speichern'}`;
      b.setAttribute('aria-pressed',String(active));b.setAttribute('aria-label',label);b.title=label;b.firstElementChild.textContent=active?'★':'☆';
    });
    const scope=inDialog?$('detail-body'):$('cards');
    const replacement=[...scope.querySelectorAll('[data-favorite-kind]')].find(b=>b.dataset.favoriteKind===kind&&b.dataset.favoriteKey===key);
    (replacement||$('favorites-filter')).focus({preventScroll:true});
    favoritesInfo(`${favoriteNames[kind].get(key)} ${added?'zu Favoriten hinzugefügt.':'aus Favoriten entfernt.'}`);
  }
  readFavorites();readRecords();
  let filtered=[],lastTrigger;
  function highlight(value){const q=state.query.trim();if(!q)return escape(value);const i=value.toLocaleLowerCase().indexOf(q.toLocaleLowerCase());return i<0?escape(value):escape(value.slice(0,i))+'<mark>'+escape(value.slice(i,i+q.length))+'</mark>'+escape(value.slice(i+q.length));}
  function matchesBase(r){return(state.continent==='all'||r.continent===state.continent)&&(state.content==='all'||r.content===state.content);}
  function matches(l){const r=l.region;return matchesBase(r)&&(!state.favoritesOnly||favorites.regions.has(r.id)||favorites.mountains.has(mountainKey(r.id,l.mountain)))&&(state.region==='all'||r.id===state.region)&&(state.mountain==='all'||l.mountain===state.mountain)&&normalize([l.name,l.mountain,r.name,r.gameName,r.country,r.continent,contentNames[r.content]].join(' ')).includes(normalize(state.query));}
  function options(){const available=regions.filter(matchesBase);if(!available.some(r=>r.id===state.region))state.region='all';$('region').innerHTML='<option value="all">Alle Regionen</option>'+available.map(r=>`<option value="${r.id}">${escape(r.name)}</option>`).join('');$('region').value=state.region;const mountains=available.filter(r=>state.region==='all'||r.id===state.region).flatMap(r=>Object.keys(r.mountains)).sort((a,b)=>a.localeCompare(b));if(!mountains.includes(state.mountain))state.mountain='all';$('mountain').innerHTML='<option value="all">Alle Berge</option>'+mountains.map(m=>`<option>${escape(m)}</option>`).join('');$('mountain').value=state.mountain;}
  function navigation(){const values=['all',...continents];$('continents').innerHTML=values.map((c,i)=>`<button type="button" class="continent-button" data-continent="${c}" aria-pressed="${state.continent===c}"><span class="nav-icon" aria-hidden="true">${i===0?'◎':i===8?'◇':'⊙'}</span><span>${c==='all'?'Alle Kontinente':c==='Fiktiv'?'Mt. Eddie / DLC':c}</span><span class="continent-count">${levels.filter(l=>c==='all'||l.region.continent===c).length}</span></button>`).join('');}
  function picture(r,detail=false){const img=images[r.id];if(!img)return `<div class="fallback-picture">${escape(r.gameName)} · SSX 2012</div>`;return `<img ${detail?'class="detail-picture"':'loading="lazy"'} src="${escape(img.url)}" alt="${escape(img.caption)}" ${detail?'':'width="640" height="360"'}>`;}
  function gallery(l,r){
    const track=(dropImages[l.id]||[]).map(url=>({url,caption:`${l.name} · Screenshot`})),mountain=mountainImages[mountainKey(r.id,l.mountain)]||[],source=images[r.id];
    const photos=track.length?track:mountain.length?mountain.map(url=>({url,caption:`${l.mountain} · Bergansicht`})):source?[{url:source.url,caption:source.caption,source:source.source,credit:true}]:[];
    if(!photos.length)return `<div class="fallback-picture detail-fallback">${escape(r.gameName)} · SSX 2012</div>`;
    const label=track.length?'Screenshot des Levels':mountain.length?'Screenshot des Berges':'Regionsansicht';
    const credit=photos.find(photo=>photo.credit);
    return `<section class="drop-gallery" data-gallery data-level-id="${l.id}" data-gallery-count="${photos.length}" aria-label="${label} für ${escape(l.name)}"><div class="gallery-frame"><img class="detail-picture is-visible" src="${escape(photos[0].url)}" alt="${escape(photos[0].caption||l.name)}" data-gallery-image><span class="gallery-label">${label}</span>${photos.length>1?'<button type="button" class="gallery-control gallery-prev" data-gallery-prev aria-label="Vorheriges Bild">‹</button><button type="button" class="gallery-control gallery-next" data-gallery-next aria-label="Nächstes Bild">›</button>':''}</div><div class="detail-caption"><span data-gallery-caption>${escape(photos[0].caption||l.name)}</span>${photos.length>1?`<span class="gallery-counter" data-gallery-counter>1 / ${photos.length}</span>`:''}${credit?`<a href="${escape(credit.source)}" target="_blank" rel="noopener noreferrer">Bildquelle ↗</a>`:''}</div>${photos.length>1?`<div class="gallery-dots" role="group" aria-label="Bild auswählen">${photos.map((_,i)=>`<button type="button" class="gallery-dot${i===0?' is-active':''}" data-gallery-dot="${i}" aria-label="Bild ${i+1} von ${photos.length} anzeigen" aria-pressed="${i===0}"></button>`).join('')}</div>`:''}</section>`;
  }
  let galleryTransitionTimer;
  function showGallerySlide(index){
    const root=$('detail-body').querySelector('[data-gallery]');if(!root)return;
    const level=levels.find(item=>item.id===root.dataset.levelId);if(!level)return;
    const r=level.region,track=(dropImages[level.id]||[]).map(url=>({url,caption:`${level.name} · Screenshot`})),mountain=mountainImages[mountainKey(r.id,level.mountain)]||[],source=images[r.id];
    const photos=track.length?track:mountain.length?mountain.map(url=>({url,caption:`${level.mountain} · Bergansicht`})):source?[{url:source.url,caption:source.caption}]:[];
    if(photos.length<2)return;
    const next=(index+photos.length)%photos.length,photo=photos[next];
    const img=root.querySelector('[data-gallery-image]');
    if(galleryTransitionTimer)clearTimeout(galleryTransitionTimer);
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reducedMotion){img.src=photo.url;img.alt=photo.caption||level.name;}
    else{img.classList.remove('is-visible');galleryTransitionTimer=setTimeout(()=>{img.src=photo.url;img.alt=photo.caption||level.name;requestAnimationFrame(()=>img.classList.add('is-visible'));galleryTransitionTimer=undefined;},180);}
    root.querySelector('[data-gallery-caption]').textContent=photo.caption||level.name;
    root.querySelector('[data-gallery-counter]').textContent=`${next+1} / ${photos.length}`;
    root.querySelectorAll('[data-gallery-dot]').forEach(dot=>{const active=Number(dot.dataset.galleryDot)===next;dot.classList.toggle('is-active',active);dot.setAttribute('aria-pressed',String(active));});
  }
  let galleryTimer;
  function stopGallery(){if(galleryTimer){clearInterval(galleryTimer);galleryTimer=undefined;}if(galleryTransitionTimer){clearTimeout(galleryTransitionTimer);galleryTransitionTimer=undefined;}}
  function startGallery(){stopGallery();const root=$('detail-body').querySelector('[data-gallery]');if(!root||Number(root.dataset.galleryCount)<2||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;galleryTimer=setInterval(()=>{if(document.hidden||!$('detail').open)return;const index=Number(root.querySelector('[data-gallery-counter]').textContent.split(' ')[0]);showGallerySlide(index);},3000);}
  function render(){
    filtered=levels.filter(matches);
    const shown=regions.filter(r=>filtered.some(l=>l.region===r));
    $('result-count').textContent=`${filtered.length} von ${levels.length} Leveln · ${shown.length} ${shown.length===1?'Region':'Regionen'}`;
    $('results-title').textContent=state.favoritesOnly?'Meine Favoriten':state.query?'Suchergebnisse':state.region!=='all'?regions.find(r=>r.id===state.region).name:state.continent==='all'?'Alle Regionen':state.continent==='Fiktiv'?'Mt. Eddie / DLC':state.continent;
    const noFavorites=state.favoritesOnly&&!favorites.regions.size&&!favorites.mountains.size;
    $('empty').hidden=filtered.length>0;
    $('empty-title').textContent=noFavorites?'Deine Favoriten warten auf dich.':'Kein Drop gefunden.';
    $('empty-description').textContent=noFavorites?'Markiere eine Region oder einen Berg mit dem Stern. Hier findest du dann die dazugehörigen Level.':state.favoritesOnly?'Keine deiner Lieblingsstrecken passt zu den aktiven Filtern. Ändere die Suche oder zeige wieder alle Level.':'Versuche einen anderen Namen oder setze die Filter zurück.';
    favoritesInfo();
    $('cards').innerHTML=shown.map(r=>{
      const list=filtered.filter(l=>l.region===r),img=images[r.id];
      const mountainGroups=Object.keys(r.mountains).filter(m=>list.some(l=>l.mountain===m));
      const groups=mountainGroups.map(mountain=>`<section class="mountain-group" aria-label="${escape(mountain)}"><div class="mountain-heading"><h4>${highlight(mountain)}</h4>${star('mountains',mountainKey(r.id,mountain))}</div><ul class="level-list">${list.filter(l=>l.mountain===mountain).map(l=>`<li><button type="button" class="level-row" data-level="${l.id}" aria-label="${escape(l.name)} – ${escape(l.mountain)}: Details"><span class="level-number">${String(list.indexOf(l)+1).padStart(2,'0')}</span><span class="level-text"><span class="level-name">${highlight(l.name)}${r.deadly===l.name?'<span class="deadly-icon" title="Deadly Descent" aria-label="Deadly Descent">◆</span>':''}</span></span>${timeDisplay(l)}<span class="level-cue" aria-hidden="true">＋</span></button></li>`).join('')}</ul></section>`).join('');
      return `<article class="region-card"><div class="card-image">${picture(r)}<span class="image-label">${img?'SPIEL-SCREENSHOT':'SSX 2012'}</span>${star('regions',r.id,'region-star')}<div class="image-heading"><div><span class="continent-label">${escape(r.continent==='Fiktiv'?'Fiktive Region':r.continent)}</span><h3>${escape(r.name)}</h3></div><span class="level-pill">${list.length} Level</span></div></div>${img?`<div class="image-source"><span>${escape(img.shortCaption||'Regionsansicht')}</span><a href="${escape(img.source)}" target="_blank" rel="noopener noreferrer">Bildquelle ↗</a></div>`:''}<div class="card-info"><span>${Object.keys(r.mountains).length} ${Object.keys(r.mountains).length===1?'Berg':'Berge'} · ${escape(r.country)}</span><span class="tag ${r.content==='dlc'?'dlc':''}">${contentNames[r.content]}</span></div>${groups}<div class="card-end"><span class="dot" aria-hidden="true"></span>${r.hazard?`Deadly Descent · ${escape(r.hazard)}`:r.content==='dlc'?'5 Strecken · 9 Race- / Trick-Events':'Mount Fuji · ursprünglich PS3-exklusiv'}</div></article>`;
    }).join('');
    $('cards').querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const note=document.createElement('div');note.className='fallback-picture';note.textContent='Bild nicht verfügbar · Quelle öffnen';img.replaceWith(note)},{once:true}));
  }
  function update(){options();navigation();render();}
  function reset(){Object.assign(state,{query:'',continent:'all',region:'all',mountain:'all',content:'all',favoritesOnly:false});$('search').value='';$('content').value='all';update();}
  function detail(id,trigger){const l=levels.find(l=>l.id===id);if(!l)return;const r=l.region,img=images[r.id];lastTrigger=trigger;$('detail-body').innerHTML=`${gallery(l,r)}${recordPanel(l)}<div class="detail-content"><div class="breadcrumbs">${escape(r.continent)} / ${escape(r.name)} / ${escape(l.mountain)}</div><h2 id="detail-title">${escape(l.name)}</h2><div class="detail-favorites"><div>${star('regions',r.id)}<span>Region merken</span></div><div>${star('mountains',mountainKey(r.id,l.mountain))}<span>Berg merken</span></div></div><dl class="detail-grid"><div><dt>Kontinent</dt><dd>${escape(r.continent==='Fiktiv'?'Fiktiv / nicht zugeordnet':r.continent)}</dd></div><div><dt>Region im Spiel</dt><dd>${escape(r.gameName)}</dd></div><div><dt>Berg</dt><dd>${escape(l.mountain)}</dd></div><div><dt>Spielinhalt</dt><dd>${contentNames[r.content]}</dd></div></dl><p>${escape(r.description)}</p>${r.deadly===l.name?`<p class="detail-note">◆ <strong>Deadly Descent: ${escape(r.hazard)}</strong><br>Ausrüstung: ${escape(r.gear)}.</p>`:l.name==='Death Zone'?'<p class="detail-note">World-Tour-Finale: Grudge Match gegen Griff an der Lhotse.</p>':r.content==='dlc'?`<p class="detail-note">Mt.-Eddie-Erweiterung. ${l.name==='The Kid’s Corner'?'Big-Air-Strecke mit Trick-Event.':'Race- und Trick-Event auf derselben Strecke.'}</p>`:''}<p class="detail-source">Streckenzuordnung: <a href="${r.content==='dlc'?sources.eddie:sources.tracks}" target="_blank" rel="noopener noreferrer">${r.content==='dlc'?'Mt.-Eddie-Streckenliste':'SSX Wiki'}</a>.</p></div>`;$('detail').showModal();startGallery();$('close-detail').focus();}
  $('search').addEventListener('input',e=>{state.query=e.target.value;render()});
  ['region','mountain','content'].forEach(key=>$(key).addEventListener('change',e=>{state[key]=e.target.value;if(key==='content')state.region=state.mountain='all';if(key==='region')state.mountain='all';update()}));
  $('continents').addEventListener('click',e=>{const b=e.target.closest('[data-continent]');if(b){state.continent=b.dataset.continent;state.region=state.mountain='all';update()}});
  $('cards').addEventListener('click',e=>{const favorite=e.target.closest('[data-favorite-kind]');if(favorite){toggleFavorite(favorite);return;}const b=e.target.closest('[data-level]');if(b)detail(b.dataset.level,b)});
  $('detail-body').addEventListener('click',e=>{const favorite=e.target.closest('[data-favorite-kind]');if(favorite){toggleFavorite(favorite);return;}const toggle=e.target.closest('[data-record-toggle]');if(toggle){const form=$('detail-body').querySelector('[data-record-form]');form.hidden=!form.hidden;if(!form.hidden)form.querySelector('input').focus();startGallery();return;}const root=e.target.closest('[data-gallery]');if(!root)return;const counter=root.querySelector('[data-gallery-counter]');const index=counter?Number(counter.textContent.split(' ')[0]):1;if(e.target.closest('[data-gallery-prev]'))showGallerySlide(index-2);else if(e.target.closest('[data-gallery-next]'))showGallerySlide(index);else{const dot=e.target.closest('[data-gallery-dot]');if(dot)showGallerySlide(Number(dot.dataset.galleryDot));}startGallery();});
  $('detail-body').addEventListener('focusout',e=>{const input=e.target.closest('[data-record-time-input]');if(!input||!input.value.trim())return;const parsed=parseTimeInput(input.value);if(parsed){input.value=parsed.formatted;input.removeAttribute('aria-invalid');}else input.setAttribute('aria-invalid','true');});
  $('detail-body').addEventListener('submit',e=>{const form=e.target.closest('[data-record-form]');if(!form)return;e.preventDefault();const input=form.querySelector('[name="time"]'),status=form.querySelector('[data-record-status]')||form.querySelector('.record-status'),parsed=parseTimeInput(input.value);if(!parsed){status.textContent='Bitte gib eine gültige Zeit ein, z. B. 0234,567. Die letzten zwei Ziffern vor dem Komma sind die Sekunden (00–59).';input.setAttribute('aria-invalid','true');return;}input.value=parsed.formatted;const levelId=form.closest('#detail-body').querySelector('[data-gallery]')?.dataset.levelId||levels.find(l=>l.name===$('detail-title').textContent)?.id;if(!levelId){status.textContent='Level konnte nicht zugeordnet werden.';return;}const ms=parsed.ms;records[levelId]=ms;let persisted=true;try{window.localStorage.setItem(recordStorageKey,JSON.stringify(records));}catch{persisted=false;}$('detail-body').querySelector('[data-record-value]').textContent=formatTime(ms);document.querySelectorAll(`[data-level="${levelId}"] .level-time`).forEach(el=>{el.textContent=formatShortTime(ms);el.title=`Eigene Zeit ${formatTime(ms)}`;el.setAttribute('aria-label',`Eigene Zeit ${formatTime(ms)}`);});status.textContent=persisted?'Deine Zeit wurde auf diesem Gerät gespeichert.':'Speichern ist in diesem Browser nicht verfügbar; die Zeit bleibt bis zum Neuladen erhalten.';input.removeAttribute('aria-invalid');input.value='';});
  $('favorites-filter').addEventListener('click',()=>{state.favoritesOnly=!state.favoritesOnly;render()});
  window.addEventListener('storage',e=>{if(e.key===storageKey||e.key===null){readFavorites();render();if($('detail').open){$('detail-body').querySelectorAll('[data-favorite-kind]').forEach(b=>{b.outerHTML=star(b.dataset.favoriteKind,b.dataset.favoriteKey)});}}if(e.key===recordStorageKey||e.key===null){readRecords();render();if($('detail').open){const levelId=$('detail-body').querySelector('[data-gallery]')?.dataset.levelId;const value=records[levelId];const el=$('detail-body').querySelector('[data-record-value]');if(el)el.textContent=value===undefined?'Noch keine Zeit gespeichert':formatTime(value);}}});
  $('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);$('close-detail').addEventListener('click',()=>$('detail').close());$('detail').addEventListener('click',e=>{if(e.target===$('detail')){const box=$('detail').getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)$('detail').close()}});$('detail').addEventListener('close',()=>{stopGallery();const target=lastTrigger?.isConnected?lastTrigger:[...$('cards').querySelectorAll('[data-level]')].find(b=>b.dataset.level===lastTrigger?.dataset.level);(target||$('favorites-filter')).focus({preventScroll:true})});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)&&!$('detail').open){e.preventDefault();$('search').focus()}});
  $('total-levels').textContent=levels.length;update();
  if(document.modelContext?.registerTool){
    const lifecycle=new AbortController();
    const tool={name:'search_ssx_levels',title:'SSX-Level suchen',description:'Sucht SSX-Level und zeigt die Ergebnisse mit Kontinent-, Regions- und Inhaltsfilter im Atlas.',inputSchema:{type:'object',properties:{query:{type:'string'},continent:{type:'string',enum:['all',...continents]},content:{type:'string',enum:['all','base','bonus','dlc']}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['query','continent','content'].includes(k))||(input.query!==undefined&&typeof input.query!=='string')||(input.continent!==undefined&&!['all',...continents].includes(input.continent))||(input.content!==undefined&&!['all','base','bonus','dlc'].includes(input.content)))throw new Error('Ungültige Suchparameter.');Object.assign(state,{query:input.query||'',continent:input.continent||'all',content:input.content||'all',region:'all',mountain:'all',favoritesOnly:false});$('search').value=state.query;$('content').value=state.content;update();return{count:filtered.length,levels:filtered.map(l=>({name:l.name,mountain:l.mountain,region:l.region.name,continent:l.region.continent}))};}};
    try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
})();
