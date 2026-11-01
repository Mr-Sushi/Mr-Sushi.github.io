import {useMemo,useRef,useEffect} from 'react';
import {useFrame} from '@react-three/fiber';
import {useTexture} from '@react-three/drei';
import * as THREE from 'three';

// Two complete hand-drawn poses, with independently animated eyes and feathered tail.
export default function Dachshund({position}) {
 const source=useTexture('/xinshu/dachshund-poses.png');const front=useTexture('/xinshu/dachshund-front.png');
 const active=useRef(false),standing=useRef(false),pose=useRef(0),geometry=useRef();
 const reduced=useMemo(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches,[]);
 const {canvas,ctx,texture}=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=750;const ctx=canvas.getContext('2d');const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return {canvas,ctx,texture};},[]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 useFrame(({pointer,clock},delta)=>{
  const t=pose.current=THREE.MathUtils.damp(pose.current,active.current?1:0,12,delta);standing.current=t>.5;
  const [sx,sy,sw,sh,dx,dy,dw,dh,ex,ey]=standing.current?[710,220,826,580,80,88,800,562,1375,332]:[0,200,700,600,175,93,650,557,527,298];
  ctx.clearRect(0,0,1000,750);ctx.save();ctx.filter='grayscale(1)';if(standing.current)ctx.drawImage(front.image,0,0,1254,1254,175,45,610,610);else ctx.drawImage(source.image,sx,sy,sw,sh,dx,dy,dw,dh);ctx.restore();
  const eyes=standing.current?[[497,169],[574,174]]:[[dx+(ex-sx)*dw/sw,dy+(ey-sy)*dh/sh]];
  for(const [x,y] of eyes){ctx.fillStyle='#f6f5f2';ctx.beginPath();ctx.ellipse(x,y,11,17,-.12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#292929';ctx.beginPath();ctx.ellipse(x+pointer.x*4,y-pointer.y*4,7,11,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(x+pointer.x*4-2,y-pointer.y*4-4,2,3,0,0,Math.PI*2);ctx.fill();}texture.needsUpdate=true;
  if(geometry.current){const a=geometry.current.attributes.position,uv=geometry.current.attributes.uv;for(let i=0;i<a.count;i++){const u=uv.getX(i),v=uv.getY(i);const tailWeight=Math.max(0,1-u/.43)*Math.max(0,Math.min(1,(v-.13)*4));a.setX(i,(u-.5)*2.0+(active.current&&!reduced?Math.sin(clock.elapsedTime*12)*.10*tailWeight:0));}a.needsUpdate=true;}
 });
 return <mesh scale={0.9} position={[position[0]+0.18,position[1]-0.07,position[2]+0.02]} onPointerOver={e=>{e.stopPropagation();active.current=true;document.body.style.cursor='pointer';}} onPointerOut={()=>{active.current=false;document.body.style.cursor='auto';}} onClick={e=>{e.stopPropagation();active.current=true;}}>
  <planeGeometry ref={geometry} args={[2,1.5,48,24]}/><meshBasicMaterial map={texture} transparent alphaTest={0.85} depthWrite={false} toneMapped={false}/>
 </mesh>;
}
