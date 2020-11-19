import { runMutationObserver } from "./utils/dom";
// import { themeRunner } from './theme/site-theme';


runMutationObserver();
// themeRunner();
chrome.runtime.sendMessage({ "message": "activate_icon" });
