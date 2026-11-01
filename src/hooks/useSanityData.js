import albums from '../data/albums.json';
import data from '../data/xinshu.json';
export const isSanityConfigured = false;
export const loadSanityData = () => Promise.resolve(data);
export const isSanityDataLoaded = () => true;
export const useGalleryProjects = () => albums;
export const useStudioContent = () => data.projects;
export const useAwards = () => ({});
