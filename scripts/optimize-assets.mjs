import sharp from 'sharp';
import fs from 'node:fs/promises';
const data = JSON.parse(await fs.readFile('src/data/xinshu.json','utf8'));
for(const item of data.moments){
 const original=item.front; const target=original.replace(/\.(jpeg|jpg)$/,'.webp');
 await sharp('public'+original).rotate().resize(600,800,{fit:'contain',background:'#f4f1eb'}).webp({quality:80}).toFile('public'+target);
 item.front=target; item.painted=target;
}
for(const item of data.projects){
 const original=item.frontTexture; const target=original.replace(/\.(jpg|png|jpeg)$/,'.webp');
 await sharp('public'+original).rotate().resize(960,640,{fit:'contain',background:'#f4f1eb'}).webp({quality:82}).toFile('public'+target);
 item.frontTexture=target;item.paintedFrontTexture=target;item.thumbnail=target;
}
await fs.writeFile('src/data/xinshu.json',JSON.stringify(data,null,2));
console.log(`Optimized ${data.moments.length} photos and ${data.projects.length} covers.`);
