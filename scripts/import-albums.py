from pathlib import Path
import re,html,json,urllib.request,urllib.parse,concurrent.futures
root=Path(__file__).resolve().parents[1]; src=root.parent/'reference-downloads'; out=root/'public/xinshu/covers';out.mkdir(exist_ok=True)
manifest=json.loads(re.search(r'<script id="gallery-manifest"[^>]*>(.*?)</script>',(src/'insights.html').read_text(),re.S).group(1))
cards=re.findall(r'<div class="insight-card hover-3d">(.*?)</div>',(src/'home.html').read_text(),re.S)
albums=[]
for card in cards:
 path=re.search(r'src="([^"]+)"',card).group(1); name=html.unescape(re.search(r'<p[^>]*>(.*?)</p>',card,re.S).group(1)).strip();slug=re.sub('[^a-z0-9]+','-',name.lower()).strip('-')
 folder='Oxford' if name=='Cambridge & Oxford' else name
 cover='/xinshu/covers/'+slug+Path(path).suffix
 photos=[{'src':f'https://xinshu.info/assets/InsightImage/{urllib.parse.quote(folder)}/0{i}.jpeg','fallback':f'https://xinshu.info/assets/InsightImage/{urllib.parse.quote(folder)}/0{i}.jpg','alt':f'{name} — photograph {i}'} for i in range(1,manifest.get(folder,0)+1)]
 if not photos: photos=[{'src':cover,'alt':name}]
 albums.append(dict(id=slug,title=name,front=cover,painted=cover,url='/albums/'+slug,description=f'Photographs by Xin Shu — {name}.',techStack=[],photos=photos,sourceFolder=folder if folder in manifest else None,sourceCover='https://xinshu.info/'+path))
def download(a):
 dest=root/'public'/a['front'].lstrip('/')
 if not dest.exists():
  with urllib.request.urlopen(urllib.request.Request(a['sourceCover'],headers={'User-Agent':'Mozilla/5.0'}),timeout=45) as r: content=r.read()
  dest.write_bytes(content)
 return a['title']
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
 for name in ex.map(download,albums): print(name,flush=True)
(root/'src/data/albums.json').write_text(json.dumps(albums,ensure_ascii=False,indent=2))
print('Albums:',len(albums),'Photos:',sum(len(a['photos']) for a in albums))
