import { initCourseContent } from "./course-content/course-content";
import { runMutationObserver } from "./utils/dom";
// import { themeRunner } from './theme/site-theme';


initCourseContent();

runMutationObserver();
// themeRunner();
chrome.runtime.sendMessage({ "message": "activate_icon" });
