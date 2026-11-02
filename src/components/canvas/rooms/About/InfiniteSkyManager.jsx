import {useLanguage} from '../../../../i18n.jsx';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Text, PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import SkyChunk, { CHUNK_LENGTH, ROOM_Z } from './SkyChunk';
import { useScene } from '../../../../context/SceneContext';
import '../../shaders/RevealBasicMaterial'; // Registers brush-stroke reveal for BasicMaterial
import { isTouchDevice } from '../../../../utils/deviceDetect';
import { useAwards } from '../../../../hooks/useSanityData';

// Reusable Vector3 to avoid allocations in event handlers
const _tempVec3 = new THREE.Vector3();

/**
 * InfiniteSkyManager Component
 * 
 * Manages dynamic generation/removal of sky chunks for infinite scroll.
 * World group moves with scroll, chunks stay at fixed positions relative to group.
 * Includes Story Milestones that loop with the content!
 */

import { useAudio } from '../../../../context/AudioManager';

export const BALLOON_AUDIO_SETTINGS = {
    volume: 1.0,
    distance: 2,
    rolloff: 2
};

/**
 * Reusable Button Component with Hover Effect + Brush-Stroke Reveal
 */
const STORY_CYCLE_LENGTH = 160;

// === TWARDA LINIA ZANIKANIA DLA MILESTONES (WORLD SPACE) ===
// Pokój About jest na Z = -25, więc -25 to drzwi pokoju
// -27 = 2 metry za drzwiami (w głąb pokoju) - musi matchować CORRIDOR_CLIP_Z w SkyChunk
const MILESTONE_CORRIDOR_CLIP_Z = -8.0;

const InfiniteSkyManager = ({ scrollProgressRef }) => {
    // PRE-CALCULATED FOR scrolProgress = 0
    // currentChunk = floor(0/40) = 0 -> [-1, 0, 1, 2]
    const [activeChunks, setActiveChunks] = useState([-1, 0, 1, 2]);
    // currentStoryCycle = floor(0/160) = 0 -> [-1, 0, 1]
    const [activeStoryCycles, setActiveStoryCycles] = useState([-1, 0, 1]);
    const worldRef = useRef();

    // Track current chunk for recycling
    const getCurrentChunk = (worldZ) => {
        return Math.floor(worldZ / CHUNK_LENGTH);
    };

    // Track current story cycle
    const getCurrentStoryCycle = (worldZ) => {
        return Math.floor(worldZ / STORY_CYCLE_LENGTH);
    };

    // Update chunks based on world position
    useFrame(() => {
        if (!worldRef.current) return;

        const scrollProgress = scrollProgressRef?.current || 0;

        // Move world directly
        worldRef.current.position.z = scrollProgress;

        // Figure out which chunk we're in
        const currentChunk = getCurrentChunk(scrollProgress);
        const shouldBeActiveChunks = [
            currentChunk - 1,
            currentChunk,
            currentChunk + 1,
            currentChunk + 2,
        ];

        const chunksNeedUpdate = shouldBeActiveChunks.some(c => !activeChunks.includes(c)) ||
            activeChunks.some(c => !shouldBeActiveChunks.includes(c));

        if (chunksNeedUpdate) {
            setActiveChunks(shouldBeActiveChunks);
        }

        // Update story cycles
        const currentStoryCycle = getCurrentStoryCycle(scrollProgress);
        const shouldBeActiveCycles = [
            currentStoryCycle - 1,
            currentStoryCycle,
            currentStoryCycle + 1,
        ];

        const cyclesNeedUpdate = shouldBeActiveCycles.some(c => !activeStoryCycles.includes(c)) ||
            activeStoryCycles.some(c => !shouldBeActiveCycles.includes(c));

        if (cyclesNeedUpdate) {
            setActiveStoryCycles(shouldBeActiveCycles);
        }
    });

    return (
        <group ref={worldRef}>
            {/* === SKY CHUNKS WITH CLOUDS === */}
            {activeChunks.map((chunkIndex) => (
                <SkyChunk
                    key={`sky-chunk-${chunkIndex}`}
                    chunkIndex={chunkIndex}
                    seed={42}
                    scrollProgressRef={scrollProgressRef}
                />
            ))}

            {/* === STORY MILESTONES (loop every 160 units) === */}
            {activeStoryCycles.map((cycleIndex) => (
                <group key={`story-cycle-${cycleIndex}`}>
                    {/* === INTRO MILESTONE === */}
                    <IntroMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 15)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* === AWARDS MILESTONE === */}
                    <AwardsMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 55)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* === JOURNEY MILESTONE === */}
                    <JourneyMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 95)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* === SKILLS MILESTONE === */}

                    <SkillsMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 135)}
                        scrollProgressRef={scrollProgressRef}
                    />
                </group>
            ))}
        </group>
    );
};

/**
 * INTRO Milestone - Special detailed layout
 * Elements spread apart as they approach camera
 */
const sections = {
 intro: ['XIN SHU', 'HCI researcher · music · creative technology', 'PhD, Newcastle University · 2023–present\nOpenLab, School of Computing\nAI · multimodal interaction · learning'],
 awards: ['EXPERIENCE', 'Research & product design', 'Visiting PhD · Zhejiang University · Jun–Oct 2026\nVisiting PhD · NYU Abu Dhabi · 2025\nProduct roles · Shopee / Kuaishou / DiDi / NetEase'],
 journey: ['A JOURNEY OF LEARNING', 'China → Finland → Sweden → United Kingdom', 'MSc Design Informatics · Edinburgh · 2022–2023\nBEng Information Systems · Dalarna · 2020–2021\nComputer Science exchange · Oulu · 2019–2020\nBEng Software Engineering · JUFE · 2017–2021'],
 skills: ['TOOLS & CURIOSITY', 'Build. Make music. See the world.', 'Python · JavaScript · Java · C++ · SQL\nUnity / VR · Arduino · Git\nFigma · Axure · Photoshop · Lightroom\nPhotography · guitar · travel · fitness']
};
function CVMilestone({z, kind}) {
 const {zh,t}=useLanguage();
 const chinese={intro:['舒心','人机交互研究 · 音乐 · 创意技术','纽卡斯尔大学博士生 · 2023 至今\n计算机学院 · OpenLab\n人工智能 · 多模态交互 · 学习'],awards:['研究与产品经历','探索、设计与实践','浙江大学访问博士生 · 2026年6–10月\n纽约大学阿布扎比分校访问博士生 · 2025\n产品经历 · Shopee / 快手 / 滴滴 / 网易'],journey:['学习之旅','中国 → 芬兰 → 瑞典 → 英国','爱丁堡大学 · 设计信息学硕士\n达拉纳大学 · 信息系统学士\n奥卢大学 · 计算机科学交换\n江西财经大学 · 软件工程学士'],skills:['工具与好奇心','创造、音乐与看世界','Python · JavaScript · Java · C++ · SQL\nUnity / VR · Arduino · Git\nFigma · Axure · Photoshop · Lightroom\n摄影 · 吉他 · 旅行 · 健身']};
 const content=zh?chinese[kind]:sections[kind];
 return <group position={[0,2,z]}>
   <Text position={[0,2.3,0]} font={zh?"/fonts/ArialUnicode.ttf":"/fonts/CabinSketch-Bold.ttf"} fontSize={0.62} maxWidth={10} textAlign="center" color="#242424">{content[0]}</Text>
   <Text position={[0,1.35,0]} font={zh?"/fonts/ArialUnicode.ttf":"/fonts/CabinSketch-Regular.ttf"} fontSize={0.32} maxWidth={10} textAlign="center" color="#4f7775">{content[1]}</Text>
   <Text position={[0,-0.4,0]} font={zh?"/fonts/ArialUnicode.ttf":"/fonts/CabinSketch-Regular.ttf"} fontSize={0.31} maxWidth={10} textAlign="center" lineHeight={1.7} color="#333">{content[2]}</Text>
   <Text position={[0,-2.3,0]} font={zh?"/fonts/ArialUnicode.ttf":"/fonts/CabinSketch-Bold.ttf"} fontSize={0.28} color="#9b603b" onClick={()=>window.open('/cv','_blank','noopener,noreferrer')}>{t("Explore my full CV ↗","查看完整简历 ↗")}</Text>
 </group>;
}
const IntroMilestone = props => <CVMilestone {...props} kind="intro"/>;
const AwardsMilestone = props => <CVMilestone {...props} kind="awards"/>;
const JourneyMilestone = props => <CVMilestone {...props} kind="journey"/>;
const SkillsMilestone = props => <CVMilestone {...props} kind="skills"/>;
export default InfiniteSkyManager;
