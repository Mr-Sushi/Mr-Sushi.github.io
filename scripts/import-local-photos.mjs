import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {execFileSync} from 'node:child_process';
const source='/Users/c3071293/Documents/Documents - MAC-535132/pw_sushi/assets/InsightImage';
const albums=JSON.parse(await fs.readFile('src/data/albums.json','utf8'));
for(const folder of ['Highland','Other Places in UK']){const id=folder.toLowerCase().replaceAll(' ','-');albums.push({id,title:folder,sourceFolder:folder,url:'/albums/'+id,description:'Photographs by Xin Shu — '+folder+'.',techStack:[]});}
let count=0;
for(const a of albums){
 const folder=a.sourceFolder||a.title;
 let files;try{files=(await fs.readdir(path.join(source,folder))).filter(n=>/\.(jpe?g|png|webp)$/i.test(n)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));}catch{continue;}
 await fs.mkdir('public/xinshu/photos/'+a.id,{recursive:true});a.sourceFolder=folder;a.photos=[];
 for(const [i,name] of files.entries()) {const url='/xinshu/photos/'+a.id+'/'+String(i+1).padStart(3,'0')+'.webp';if(!(await fs.stat('public'+url).catch(()=>null))?.size){let input=path.join(source,folder,name);try{await sharp(input).rotate().resize({width:2200,height:2200,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toFile('public'+url);}catch{const tmp='/tmp/xinshu-photo-convert.jpg';execFileSync('/tmp/xinshu-image-tools/bin/python3',['-c',"import sys; from PIL import Image; import pillow_heif; pillow_heif.register_heif_opener(); Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2])",input,tmp]);await sharp(tmp).rotate().resize({width:2200,height:2200,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toFile('public'+url);}}a.photos.push({src:url,alt:a.title+' — photograph '+(i+1)});count++;}
 if(!a.front){a.front=a.photos[0].src;a.painted=a.front;}
 console.log(folder+': '+files.length);
}
await fs.writeFile('src/data/albums.json',JSON.stringify(albums,null,2));console.log('Imported '+count+' local photographs across '+albums.length+' albums.');
