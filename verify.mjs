import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const file = name => new URL(name, import.meta.url);
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(file('data.js'),'utf8'),context);
vm.runInNewContext(fs.readFileSync(file('images.js'),'utf8'),context);
vm.runInNewContext(fs.readFileSync(file('drop-images.js'),'utf8'),context);
const regions=context.window.SSX_REGIONS,images=context.window.SSX_IMAGES,dropImages=context.window.SSX_DROP_IMAGES,mountainImages=context.window.SSX_MOUNTAIN_IMAGES;
assert.equal(regions.length,11);
const names=[]; const counts={base:0,bonus:0,dlc:0};
for(const region of regions){
  const drops=Object.values(region.mountains).flat();
  names.push(...drops); counts[region.content]+=drops.length;
  assert.ok(images[region.id],`Missing image: ${region.id}`);
  assert.ok(fs.statSync(file(images[region.id].url)).size>10000);
  assert.ok(images[region.id].source.startsWith('https://'));
  if(region.deadly)assert.ok(drops.includes(region.deadly));
}
assert.equal(names.length,70); assert.equal(new Set(names).size,70);
for(const name of ['Wrecking Crew','Invincible','One Step Ahead','Hard Currency','Wächter','The Monster','Fall from Grace','Death Zone','Critical Mass'])assert.ok(names.includes(name),`Missing survival drop: ${name}`);
assert.ok(!names.includes('Sentinel'));

assert.deepEqual(counts,{base:62,bonus:3,dlc:5});
let galleryAssets=0;
for(const [id,photos] of Object.entries(dropImages)){assert.ok(names.some(name=>{const region=regions.find(r=>Object.values(r.mountains).flat().includes(name));return region&&id===region.id+'-'+name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘']/g,'').replace(/[-–]/g,' ').trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}),`Unknown level gallery: ${id}`);for(const asset of photos){assert.ok(fs.existsSync(file(asset)),`Missing drop screenshot: ${asset}`);galleryAssets++;}}
for(const [key,photos] of Object.entries(mountainImages)){assert.ok(key.includes(':'),`Invalid mountain key: ${key}`);for(const asset of photos){assert.ok(fs.existsSync(file(asset)),`Missing mountain screenshot: ${asset}`);galleryAssets++;}}
assert.equal(galleryAssets,76);
for(const asset of ['index.html','.nojekyll','styles.css','app.js','data.js','images.js','drop-images.js'])assert.ok(fs.existsSync(file(asset)));
const app=fs.readFileSync(file('app.js'),'utf8');
const helperStart=app.indexOf('function formatRace');
const helperEnd=app.indexOf('function timeDisplay',helperStart);
assert.ok(helperStart>=0&&helperEnd>helperStart,'Record helpers exist');
const helpers=new Function(app.slice(helperStart,helperEnd)+'\nreturn {parseRaceInput,parseMetersInput,parsePointsInput};')();
assert.equal(helpers.parseRaceInput('053').formatted,'00:53,00');
assert.equal(helpers.parseRaceInput('0053,25').ms,53250);
assert.equal(helpers.parseMetersInput('11876,24').formatted,'11.876,24 m');
assert.equal(helpers.parsePointsInput('54333300').formatted,'54.333.300');
const html = fs.readFileSync(file('index.html'),'utf8');
for(const [,reference] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(reference.startsWith('#')||/^(https?:|data:)/.test(reference))continue;
  assert.ok(!reference.startsWith('/'),`Not relative: ${reference}`);
  assert.ok(fs.existsSync(file(reference)),`Missing local file: ${reference}`);
}
assert.match(html,/id="export-backup"/);assert.match(html,/id="import-backup"/);
console.log('Verified: 70 levels, 11 regions, 76 gallery images, time parsing/formatting, JSON backup controls and local assets.');
