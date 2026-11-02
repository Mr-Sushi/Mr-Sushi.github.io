import SiteHeader from './SiteHeader.jsx';
import {useEffect} from 'react';
import enCV from './data/cv.json';
import zhCV from './data/cv-zh.json';
import {useLanguage} from './i18n.jsx';
import './styles/Albums.css';
import './styles/CV.css';
const Inline=({html})=><span dangerouslySetInnerHTML={{__html:html||''}}/>;
export default function CVApp(){
 const {t,zh}=useLanguage();const cv=zh?zhCV:enCV;
 useEffect(()=>{document.title='Curriculum Vitae — Xin Shu';},[]);
 return <main className="photography cv-page">
 <SiteHeader/>
 <section className="cv-intro"><div><p className="eyebrow">{t("CURRICULUM VITAE","个人简历")}</p><h1>{t('Xin Shu','舒心')}</h1><p className="cv-role">{t("PhD Student, Human–Computer Interaction","人机交互博士生")}</p><p>{t("School of Computing, Newcastle University","纽卡斯尔大学 · 计算机学院")}</p></div><div className="cv-contact"><a href="mailto:x.shu6@newcastle.ac.uk">x.shu6@newcastle.ac.uk ↗︎</a><a href="mailto:sushishuxin@gmail.com">sushishuxin@gmail.com ↗︎</a><a href={'tel:'+cv.contacts[2]?.replaceAll(' ','')}>{cv.contacts[2]}</a><a href="https://scholar.google.com/citations?user=M9Lst2EAAAAJ" target="_blank" rel="noreferrer">Google Scholar ↗︎</a><a className="cv-pdf-link" href="/xinshu/CV_AIED.pdf" download="CV_AIED.pdf">{t("PRINT / DOWNLOAD CV ↗︎","打印 / 下载简历 PDF ↗︎")}</a></div></section>
 <div className="cv-layout"><aside aria-label="CV sections">{cv.sections.map((s,i)=><a href={'#'+s.id} key={s.id}><span>{String(i+1).padStart(2,'0')}</span>{s.title}</a>)}</aside><div>{cv.sections.map((s,i)=><section className="cv-section" id={s.id} key={s.id}><div className="cv-section-heading"><span>{String(i+1).padStart(2,'0')}</span><h2>{s.title}</h2></div><div className={s.id==="education"?"education-columns":["skills","campus","awards","teaching"].includes(s.id)?"cv-entries cv-entries-grid":"cv-entries"}>{s.id==="education"?["degree","visit"].map(group=><div key={group}><h3 className="education-label">{group==="degree"?t("Degree programmes","学位课程"):t("Visiting & exchange","访问与交换")}</h3>{s.entries.filter(e=>e.educationGroup===group).map((e,j)=><article className="cv-entry" key={j}><div className="cv-entry-top"><h3><Inline html={e.title}/></h3>{e.year&&<p className="cv-date"><Inline html={e.year}/></p>}</div>{e.meta&&<p className="cv-meta"><Inline html={e.meta}/></p>}{e.details.length>0&&<ul>{e.details.map((d,k)=><li key={k}>{d}</li>)}</ul>}</article>)}</div>):s.entries.map((e,j)=><article className="cv-entry" key={j}><div className="cv-entry-top"><h3><Inline html={e.title}/></h3>{e.year&&<p className="cv-date"><Inline html={e.year}/></p>}</div>{e.meta&&<p className="cv-meta"><Inline html={e.meta}/></p>}{e.details.length>0&&<ul>{e.details.map((d,k)=><li key={k}>{d}</li>)}</ul>}</article>)}</div></section>)}</div></div>
 <footer>© {new Date().getFullYear()} Xin Shu · <a href="/albums">Photography</a> · <a href="/">Back to my little world ↗︎</a></footer></main>;
}
