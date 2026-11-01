import sharp from 'sharp';import fs from 'node:fs/promises';
const albums=JSON.parse(await fs.readFile('src/data/albums.json','utf8'));
for(const a of albums){const src=a.front;const dest='/xinshu/covers/'+a.id+'.webp';await sharp('public'+src).rotate().resize(600,800,{fit:'contain',background:'#eeeeea'}).webp({quality:82}).toFile('public'+dest);a.front=dest;a.painted=dest;if(!a.sourceFolder)a.photos[0].src=dest;}
await fs.writeFile('src/data/albums.json',JSON.stringify(albums,null,2));console.log('19 album covers optimized');
