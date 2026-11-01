from pathlib import Path
import re, json, html, urllib.request, urllib.parse, concurrent.futures
root=Path(__file__).resolve().parents[1]
source=root.parent/'reference-downloads'
out=root/'public/xinshu'; out.mkdir(exist_ok=True)
def clean(s): return html.unescape(re.sub('<[^>]+>','',s)).strip().replace('\xa0',' ')
def grab(task):
 url,dest=task
 if not dest.exists():
  req=urllib.request.Request(urllib.parse.quote(url,safe=":/"),headers={'User-Agent':'Mozilla/5.0'})
  with urllib.request.urlopen(req,timeout=40) as r: dest.write_bytes(r.read())
 return dest.name
projects=[]; jobs=[]
for i,article in enumerate(re.findall(r'<article\b.*?</article>',(source/'projects.html').read_text(),re.S)):
 img=re.search(r'<img[^>]+src="([^"]+)',article); title=re.search(r'<h2[^>]*>(.*?)</h2>',article,re.S)
 if not img or not title: continue
 def field(cls):
  m=re.search(r'<p class="'+cls+r'"[^>]*>(.*?)</p>',article,re.S); return clean(m.group(1)) if m else ''
 url=re.search(r'<a href="([^"]+)',article).group(1)
 name='project-'+str(i)+Path(img.group(1)).suffix
 jobs.append(('https://xinshu.info/'+img.group(1),out/name))
 projects.append(dict(id='project-'+str(i),title=clean(title.group(1)),platform='research',description='\n\n'.join(filter(None,[field('work-authors'),field('work-conf'),field('work-desc')])),url=html.unescape(url),date=field('work-year')+'-01-01',frontTexture='/xinshu/'+name,paintedFrontTexture='/xinshu/'+name,thumbnail='/xinshu/'+name))
jobs += [('https://xinshu.info/assets/images/XinShu.jpg',out/'portrait.jpg'),('https://xinshu.info/assets/images/sx-icon.png',out/'favicon.png')]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
 for result in ex.map(grab,jobs): print(result,flush=True)
def moment(i):
 for ext in ['jpeg','jpg']:
  try:
   name=f'moment-{i}.{ext}'; grab((f'https://xinshu.info/assets/InsightImage/Moments/0{i}.{ext}',out/name))
   return dict(id=f'moment-{i}',title=f'Moments / {i:02}',front='/xinshu/'+name,painted='/xinshu/'+name,url='https://xinshu.info/insights.html',description='A moment photographed by Xin Shu. From the Moments collection.',techStack=[])
  except Exception as e: err=str(e)
 raise RuntimeError(f'Moment {i}: {err}')
moments=[]
for i in range(1,80):
 matches=list(out.glob(f'moment-{i}.jpeg'))+list(out.glob(f'moment-{i}.jpg'))
 if matches and matches[0].stat().st_size>1000:
  name=matches[0].name
  moments.append(dict(id=f'moment-{i}',title=f'Moments / {i:02}',front='/xinshu/'+name,painted='/xinshu/'+name,url='https://xinshu.info/insights.html',description='A moment photographed by Xin Shu. From the Moments collection.',techStack=[]))
(root/'src/data').mkdir(exist_ok=True)
(root/'src/data/xinshu.json').write_text(json.dumps(dict(projects=projects,moments=moments),ensure_ascii=False,indent=2))
print(f'Imported {len(projects)} projects and {len(moments)} moments.')
