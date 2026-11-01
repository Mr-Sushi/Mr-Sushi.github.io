import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
export default function Avatar({position=[0,0,0]}) {
 const map=useTexture('/xinshu/cartoon-xin.png');const group=useRef();const world=useMemo(()=>new THREE.Vector3(),[]);
 useFrame(({camera,clock},delta)=>{if(!group.current)return;group.current.getWorldPosition(world);const near=THREE.MathUtils.clamp(1-(camera.position.z-world.z)/3,0,1);group.current.position.x=THREE.MathUtils.damp(group.current.position.x,position[0]+near*1.8,5,delta);group.current.rotation.z=Math.sin(clock.elapsedTime*.8)*.008;});
 return <group ref={group} position={position}><mesh><planeGeometry args={[1.533,2.3]}/><meshBasicMaterial map={map} transparent alphaTest={0.01} depthWrite={false}/></mesh></group>;
}
