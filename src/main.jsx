import { StrictMode, lazy, Suspense } from 'react';
import './styles/Language.css';
import { createRoot } from 'react-dom/client';
const Page = lazy(() => location.pathname.startsWith('/projects') ? import('./ProjectsApp.jsx') : location.pathname.startsWith('/cv') ? import('./CVApp.jsx') : location.pathname.startsWith('/albums') ? import('./AlbumApp.jsx') : import('./App.jsx'));
createRoot(document.getElementById('root')).render(<StrictMode><Suspense fallback={<p style={{padding:40,fontFamily:'sans-serif'}}>Opening Xin Shu’s world…</p>}><Page /></Suspense></StrictMode>);
