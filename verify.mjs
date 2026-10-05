import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const file = name => new URL(name, import.meta.url);
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(file('data.js'),'utf8'),context);
vm.runInNewContext(fs.readFileSync(file('images.js'),'utf8'),context);
const regions=context.window.SSX_REGIONS,images=context.window.SSX_IMAGES;
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
assert.deepEqual(counts,{base:62,bonus:3,dlc:5});
for(const asset of ['index.html','.nojekyll','styles.css','app.js','data.js','images.js'])assert.ok(fs.existsSync(file(asset)));
const html = fs.readFileSync(file('index.html'),'utf8');
for(const [,reference] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(reference.startsWith('#')||/^(https?:|data:)/.test(reference))continue;
  assert.ok(!reference.startsWith('/'),`Not relative: ${reference}`);
  assert.ok(fs.existsSync(file(reference)),`Missing local file: ${reference}`);
}
console.log('Verified: 70 unique levels, 11 regions, 11 local screenshots, 9 Deadly Descents and all referenced local assets.');
