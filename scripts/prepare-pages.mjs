import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
const albums=JSON.parse(await readFile('src/data/albums.json','utf8'));
const html=await readFile('dist/index.html','utf8');
const paths=['cv','projects','albums','about','gallery','studio','contact',...albums.map(a=>'albums/'+a.id)];
for(const route of paths){await mkdir('dist/'+route,{recursive:true});await writeFile('dist/'+route+'/index.html',html.replace('https://xinshu.info/"','https://xinshu.info/'+route+'"'));}
// Pages resolves extensionless URLs to matching .html files before directories.
// Serve the app in these aliases to avoid self-redirect loops.
for(const route of ['cv','projects'])await writeFile('dist/'+route+'.html',html.replace('https://xinshu.info/"','https://xinshu.info/'+route+'"'));
for(const [old,to] of Object.entries({'insights.html':'/albums/','about.html':'/cv/'})){await writeFile('dist/'+old,`<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="https://xinshu.info${to}"><a href="${to}">Continue</a>`);}
await writeFile('dist/404.html',html);
await writeFile('dist/.nojekyll','');
await writeFile('dist/CNAME','xinshu.info\n');
await writeFile('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['',...paths].map(p=>'<url><loc>https://xinshu.info/'+p+'</loc></url>').join('')+'</urlset>');
for(const p of ['fonts/ArialUnicode.ttf','xinshu/Xin-Shu-CV.pdf'])await rm('dist/'+p,{force:true});
console.log('Prepared '+paths.length+' direct routes, redirects, sitemap and domain.');
