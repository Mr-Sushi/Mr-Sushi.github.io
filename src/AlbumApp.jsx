import SiteHeader from './SiteHeader.jsx';
import {useLanguage,placeNames} from './i18n.jsx';
import {useState,useEffect,useRef} from 'react';
import albums from './data/albums.json';
import './styles/Albums.css';
function Photo({photo,tile=false,...props}) {
 const [src,setSrc]=useState(photo.src),[failed,setFailed]=useState(false);
 if(failed)return <span className="photo-error">This photograph could not load.{tile?<span>Open to try again</span>:<button onClick={()=>{setFailed(false);setSrc(photo.src);}}>Retry</button>}</span>;
 return <img {...props} src={src} alt={photo.alt} onError={()=>{if(photo.fallback&&src!==photo.fallback)setSrc(photo.fallback);else setFailed(true);}}/>;
}
export default function AlbumApp(){
 const {t,zh}=useLanguage();const title=a=>zh?(placeNames[a.title]||a.title):a.title;
 const slug=decodeURIComponent(location.pathname.split('/').filter(Boolean)[1]||'');
 const album=albums.find(a=>a.id===slug);
 const [selected,setSelected]=useState(null);const closeRef=useRef(null), opener=useRef(null);
 useEffect(()=>{document.title=(album?.title||'Albums')+' — Xin Shu Photography';},[album]);
 useEffect(()=>{if(selected===null)return;opener.current=document.activeElement;closeRef.current?.focus();const prev=document.body.style.overflow;document.body.style.overflow='hidden';
 const key=e=>{if(e.key==='Escape')setSelected(null);if(e.key==='ArrowRight')setSelected(i=>(i+1)%album.photos.length);if(e.key==='ArrowLeft')setSelected(i=>(i-1+album.photos.length)%album.photos.length);if(e.key==='Tab'){const els=Array.from(document.querySelectorAll('.lightbox button'));const idx=els.indexOf(document.activeElement);e.preventDefault();els[(idx+(e.shiftKey?-1:1)+els.length)%els.length]?.focus();}};
 window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);document.body.style.overflow=prev;opener.current?.focus();};},[selected===null,album]);
 return <main className="photography">
  <SiteHeader/>
  {album?<><div className="album-heading"><div><p className="eyebrow">{t("PLACES, PEOPLE & LITTLE MOMENTS","旅途、人物与日常片刻")}</p><h1>{title(album)}</h1></div><p>{album.photos.length} {t(album.photos.length===1?'photograph':'photographs','张照片')}<br/><span>{t("Through my lens.","透过我的镜头。")}</span></p></div>
  <div className="photo-grid">{album.photos.map((photo,i)=><button className={'photo-tile tile-'+i%10} key={photo.src} aria-label={`View ${album.title} photograph ${i+1}`} onClick={()=>setSelected(i)}><Photo tile photo={photo} loading={i<5?'eager':'lazy'} decoding="async"/><span className="photo-number">{String(i+1).padStart(2,'0')} ↗</span></button>)}</div>
  <div className="album-footer"><a href="/albums">{t("← ALL ALBUMS","← 全部相册")}</a><a href={'/albums/'+albums[(albums.indexOf(album)+1)%albums.length].id}>NEXT: {albums[(albums.indexOf(album)+1)%albums.length].title.toUpperCase()} →</a></div></>:<><div className="album-heading"><h1>{t("Moments","片刻")}</h1><p>{t("A collection of places and everyday life.","记录走过的地方与日常生活。")}</p></div><div className="album-index">{albums.map(a=><a href={'/albums/'+a.id} key={a.id}><img src={a.front} alt={a.title} loading="lazy"/><h2>{title(a)}</h2><span>{a.photos.length} {t(a.photos.length===1?'photograph':'photographs','张照片')} ↗</span></a>)}</div></>}
  <footer>© {new Date().getFullYear()} Xin Shu · <a href="https://xinshu.info">xinshu.info</a></footer>
  {selected!==null&&<div className="lightbox" role="dialog" aria-modal="true" aria-label={album.title+' photo viewer'} onClick={()=>setSelected(null)}><button ref={closeRef} className="lightbox-close" onClick={()=>setSelected(null)} aria-label="Close photo">×</button><button className="lightbox-prev" aria-label="Previous photo" onClick={e=>{e.stopPropagation();setSelected(i=>(i-1+album.photos.length)%album.photos.length);}}>←</button><div className="lightbox-image" onClick={e=>e.stopPropagation()}><Photo key={selected} photo={album.photos[selected]}/></div><button className="lightbox-next" aria-label="Next photo" onClick={e=>{e.stopPropagation();setSelected(i=>(i+1)%album.photos.length);}}>→</button><p>{album.title} · {selected+1} / {album.photos.length}</p></div>}
 </main>;
}
