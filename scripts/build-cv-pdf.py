import json,re
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from pypdf import PdfReader
cv=json.loads(Path('src/data/cv.json').read_text());sections={s['id']:s for s in cv['sections']}
W,H=A4;M=35;gap=22;col=(W-2*M-gap)/2
# Keep all entries; compact styling is independent of the full web CV.
columns=[['education','skills','campus'],['projects','teaching'],['internship'],['awards']]
def clean(s):
 s=re.sub(r'<a[^>]*>(.*?)</a>',r'\1',s,flags=re.S);s=re.sub(r'<span[^>]*>|</span>','',s);return s.replace('🏆','').replace('\u202f',' ').replace('\u2011','-')
def blocks(ids,size):
 normal=ParagraphStyle('body',fontName='Helvetica',fontSize=size,leading=size*1.25,textColor=HexColor('#333333'),spaceAfter=4)
 bold=ParagraphStyle('entry',parent=normal,fontName='Helvetica-Bold',spaceAfter=2)
 heading=ParagraphStyle('section',parent=bold,fontSize=11,leading=14,spaceBefore=10,spaceAfter=9)
 result=[]
 for id in ids:
  s=sections[id];result.append((Paragraph(s['title'].upper(),heading),10,8))
  for e in s['entries']:
   result.append((Paragraph(clean(e.get('title','')),bold),0,2))
   meta=' · '.join(clean(e.get(k,'')) for k in ['meta','year'] if e.get(k));
   if meta:result.append((Paragraph(meta,normal),0,3))
   for d in e.get('details',[]):result.append((Paragraph('• '+clean(d),normal),0,3))
   result.append((None,0,5))
 return result
out='public/xinshu/Xin-Shu-CV.pdf';c=canvas.Canvas(out,pagesize=A4);c.setTitle('Xin Shu — Curriculum Vitae');c.setAuthor('Xin Shu')
for page in range(2):
 c.setFillColor(HexColor('#222222'));c.setFont('Helvetica-Bold',25);c.drawString(M,H-44,'XIN SHU');c.setFont('Helvetica',8.5);c.drawString(M,H-61,'Human–Computer Interaction · Newcastle University · PhD in progress')
 c.setFont('Helvetica',8);c.drawString(M,H-76,'x.shu6@newcastle.ac.uk   |   sushishuxin@gmail.com   |   +44 7536 205 983')
 c.setStrokeColor(HexColor('#222222'));c.line(M,H-87,W-M,H-87)
 for ci in range(2):
  ids=columns[page*2+ci];size=8.5
  while True:
   bs=blocks(ids,size);height=sum((p.wrap(col,1000)[1] if p else 0)+before+after for p,before,after in bs)
   if height<=H-135:break
   size-=.1
   if size<7.4:raise Exception('Content needs editorial shortening')
  print(page+1,ids,'font',round(size,1),'height',round(height))
  y=H-100;x=M+ci*(col+gap)
  for p,before,after in bs:
   y-=before
   if p:
    _,h=p.wrap(col,1000);y-=h;p.drawOn(c,x,y)
   y-=after
 c.setFont('Helvetica',7);c.setFillColor(HexColor('#777777'));c.drawString(M,22,'Xin Shu · Curriculum Vitae');c.drawRightString(W-M,22,f'{page+1} / 2');c.showPage()
c.save();assert len(PdfReader(out).pages)==2
print(out,'2 pages verified')
