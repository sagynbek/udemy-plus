import { initCourseContent } from "./course-content/course-content";
import { initVideoPlayer } from "./player/video-player";
// import { themeRunner } from './theme/site-theme';


initCourseContent();
initVideoPlayer();

// themeRunner();
chrome.runtime.sendMessage({ "message": "activate_icon" });
