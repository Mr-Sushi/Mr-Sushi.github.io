import data from '../../../../data/xinshu.json';
export const PLATFORM_CONFIG = {research: {color:'#497c80', accentColor:'#a27448',icon:'↗',label:'Research project',shape:'monitor'}};
export const CONTENT_DATA = data.projects;
export const getContentByPlatform = () => CONTENT_DATA;
export const getLatestContent = () => CONTENT_DATA[0];
