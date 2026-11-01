from pathlib import Path
import re
r=Path(__file__).resolve().parents[1]
def edit(name,fn):
 p=r/name;p.write_text(fn(p.read_text()))
(r/'src/hooks/useSanityData.js').write_text('''import data from '../data/xinshu.json';
export const isSanityConfigured = false;
export const loadSanityData = () => Promise.resolve(data);
export const isSanityDataLoaded = () => true;
export const useGalleryProjects = () => data.moments;
export const useStudioContent = () => data.projects;
export const useAwards = () => ({});
''')
(r/'src/components/canvas/rooms/Studio/contentData.js').write_text('''import data from '../../../../data/xinshu.json';
export const PLATFORM_CONFIG = {research: {color:'#497c80', accentColor:'#a27448',icon:'↗',label:'Research project',shape:'monitor'}};
export const CONTENT_DATA = data.projects;
export const getContentByPlatform = () => CONTENT_DATA;
export const getLatestContent = () => CONTENT_DATA[0];
''')
edit('src/components/canvas/rooms/Gallery/GalleryRoom.jsx',lambda s:re.sub(r'const FALLBACK_PROJECTS = \[.*?\n\];','const FALLBACK_PROJECTS = [];',s,flags=re.S).replace('const PROJECT_COUNT = 10','const PROJECT_COUNT = 79'))
edit('src/App.jsx',lambda s:re.sub(r"import posthog from 'posthog-js';",'',re.sub(r'posthog.init\(.*?\n\}\);','',s,flags=re.S)))
(r/'src/main.jsx').write_text("import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App.jsx';\ncreateRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);\n")
(r/'vite.config.js').write_text("import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({plugins:[react()],server:{host:'127.0.0.1'}});\n")
(r/'index.html').write_text('''<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><meta name="description" content="Xin Shu — HCI research, music, photography and creative technology."/><meta name="robots" content="noindex,nofollow"/><link rel="icon" href="/xinshu/favicon.png"/><title>Xin Shu — A Little World</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>''')
edit('src/hooks/useDocumentMeta.js',lambda s:re.sub(r'const ROOM_META = \{.*?\n\};',"""const ROOM_META = Object.fromEntries([
 ['null','/','A Little World','HCI research, music, photography and creative technology.'],
 ['about','/about','About Room','Education, experience and skills from Xin Shu’s CV.'],
 ['gallery','/gallery','Gallery Room','Moments photographed by Xin Shu.'],
 ['studio','/studio','Studio Room','Research projects and publications by Xin Shu.'],
 ['contact','/contact','Contact Room','Connect with Xin Shu.']
].map(([key,path,title,description])=>[key,{path,title:title+' — Xin Shu',description}]));""",s,flags=re.S).replace('https://itomdev.com','${window.location.origin}'))
edit('src/components/canvas/corridor/HeroText.jsx',lambda s: re.sub(r'const letters = useMemo\(\(\) => \[.*?\], \[\]\);',"const letters = useMemo(() => [...'XIN SHU'].map((char,i)=>({char,baseX:(i-3)*0.40,splitDir:(i-3)*0.5,delay:0})), []);",s,flags=re.S).replace("text: 'creative'","text: 'HCI'").replace("text: 'developer'","text: 'researcher'").replace('fontSize={0.85}','fontSize={0.65}'))
# Use an original personal photograph instead of the author's animated portrait.
(r/'src/components/canvas/corridor/Avatar.jsx').write_text('''import { useTexture } from '@react-three/drei';
export default function Avatar({position=[0,0,0],scale=1}) {const map=useTexture('/xinshu/portrait.jpg');return <mesh position={position} scale={scale}><planeGeometry args={[1.3,1.6]}/><meshBasicMaterial map={map}/></mesh>;}
''')
edit('src/components/canvas/entrance/EntranceDoors.jsx',lambda s:s.replace("'/textures/entrance/avatar_window.webp'","'/xinshu/portrait.jpg'"))
edit('src/components/canvas/rooms/Contact/ContactRoom.jsx',lambda s:s.replace('https://www.linkedin.com/in/tomasz-szmajda-259337305/','https://www.linkedin.com/in/sushi-shuxin/').replace('https://github.com/ITomPoland','https://github.com/Mr-Sushi').replace('https://www.facebook.com/people/ITom/61586563487664/','https://xinshu.info').replace('label="FACEBOOK"','label="WEBSITE"').replace('https://www.instagram.com/itom.dev/','https://www.instagram.com/sushishuxin26/'))
p=r/'src/components/canvas/rooms/Contact/MessagePaper.jsx';s=p.read_text();start=s.index('    const handleButtonClick');end=s.index('    // Input handlers',start)
s=s[:start]+'''    const handleButtonClick = useCallback((e) => {
        e?.preventDefault();
        if (!validateForm()) return;
        const body = `From: ${email}\\n\\n${message}`;
        window.location.href = `mailto:x.shu6@newcastle.ac.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setSubmitStatus('success');
    }, [message, email, subject, validateForm]);

'''+s[end:];s=s.replace('Message sent! ✓','Email draft opened — send it in your mail app.');p.write_text(s)
edit('src/components/ui/ScreenReaderOverlay.jsx',lambda s:s.replace('ITom','Xin Shu').replace('Creative Developer Portfolio','HCI Research & Photography').replace('My projects and work','My Moments photography').replace('Technologies and experience','Research projects and publications'))
edit('src/context/AchievementsContext.jsx',lambda s:s.replace('itom_achievements','xinshu_rooms_achievements'))
# Keep the original cloud journey, replace its biographical milestones completely.
p=r/'src/components/canvas/rooms/About/InfiniteSkyManager.jsx';s=p.read_text();s=s[:s.index('const IntroMilestone =')]+'''const sections = {
 intro: ['XIN SHU', 'HCI researcher · music · creative technology', 'PhD, Newcastle University · 2023–present\\nOpenLab, School of Computing\\nAI · multimodal interaction · learning'],
 awards: ['EXPERIENCE', 'Research & product design', 'Visiting PhD · Zhejiang University · 2026–present\\nVisiting PhD · NYU Abu Dhabi · 2025\\nProduct roles · Shopee / Kuaishou / DiDi / NetEase\\nBest Paper Award · Quiz Traveller · GamiFIN 2026'],
 journey: ['A JOURNEY OF LEARNING', 'China → Finland → Sweden → United Kingdom', 'MSc Design Informatics · Edinburgh · 2022–2023\\nBEng Information Systems · Dalarna · 2020–2021\\nComputer Science exchange · Oulu · 2019–2020\\nBEng Software Engineering · JUFE · 2017–2021'],
 skills: ['TOOLS & CURIOSITY', 'Build. Make music. See the world.', 'Python · JavaScript · Java · C++ · SQL\\nUnity / VR · Arduino · Git\\nFigma · Axure · Photoshop · Lightroom\\nPhotography · guitar · travel · fitness']
};
function CVMilestone({z, kind}) {
 const content=sections[kind];
 return <group position={[0,2,z]}>
   <Text position={[0,2.3,0]} font="/fonts/CabinSketch-Bold.ttf" fontSize={0.62} maxWidth={10} textAlign="center" color="#242424">{content[0]}</Text>
   <Text position={[0,1.35,0]} font="/fonts/CabinSketch-Regular.ttf" fontSize={0.32} maxWidth={10} textAlign="center" color="#4f7775">{content[1]}</Text>
   <Text position={[0,-0.4,0]} font="/fonts/CabinSketch-Regular.ttf" fontSize={0.31} maxWidth={10} textAlign="center" lineHeight={1.7} color="#333">{content[2]}</Text>
   <Text position={[0,-2.3,0]} font="/fonts/CabinSketch-Bold.ttf" fontSize={0.28} color="#9b603b" onClick={()=>window.open('https://xinshu.info/cv.html','_blank','noopener,noreferrer')}>Explore my full CV ↗</Text>
 </group>;
}
const IntroMilestone = props => <CVMilestone {...props} kind="intro"/>;
const AwardsMilestone = props => <CVMilestone {...props} kind="awards"/>;
const JourneyMilestone = props => <CVMilestone {...props} kind="journey"/>;
const SkillsMilestone = props => <CVMilestone {...props} kind="skills"/>;
export default InfiniteSkyManager;
''';p.write_text(s)
# Remove unused original award component code/imports above manager.
s=p.read_text();start=s.index('const AwardButton =');end=s.index('const STORY_CYCLE_LENGTH');s=s[:start]+s[end:];p.write_text(s)
print('Personalization applied')
