from pathlib import Path
import json
from bs4 import BeautifulSoup
soup=BeautifulSoup(Path('../reference-downloads/cv-current.html').read_text(),'html.parser')
translations=json.loads(Path('../reference-downloads/cv-zh.json').read_text())
for el in soup.select('[data-translate]'):
 if el['data-translate'] in translations:el.string=translations[el['data-translate']]
for el in soup.select('[data-cfemail]'):
 h=el['data-cfemail'];key=int(h[:2],16);email=''.join(chr(int(h[i:i+2],16)^key) for i in range(2,len(h),2));el.string=email;el['href']='mailto:'+email
sections=[]
for section in soup.select('section.cv-section'):
 if section.get('id')=='profile':continue
 title=section.find('h2').get_text(' ',strip=True)
 entries=[]
 for li in section.select(':scope > ul > li'):
  item={}
  for name in ['title','meta','year']:
   el=li.select_one(':scope > .'+name)
   if el:
    for sub in el.find_all(True):
     sub.attrs={k:v for k,v in sub.attrs.items() if k in ['href']}
    item[name]=el.decode_contents()
  item['details']=[e.get_text(' ',strip=True) for e in li.select('ul.detail > li') if e.get_text(strip=True)]
  entries.append(item)
 sections.append({'id':section['id'],'title':title,'entries':entries})
profile=soup.select_one('#profile .intro-text')
contacts=[el.get_text(' ',strip=True) for el in profile.select('.meta')]
Path('src/data/cv-zh.json').write_text(json.dumps({'sections':sections,'contacts':contacts},ensure_ascii=False,indent=2))
print([(s['title'],len(s['entries'])) for s in sections])
