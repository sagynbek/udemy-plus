import { initCourseContent } from "./course-content/course-content";
import { initVideoPlayer } from "./player/video-player";
import { runMutationObserver } from "./utils/dom";
// import { themeRunner } from './theme/site-theme';


initCourseContent();
initVideoPlayer();

runMutationObserver();
// themeRunner();
chrome.runtime.sendMessage({ "message": "activate_icon" });
