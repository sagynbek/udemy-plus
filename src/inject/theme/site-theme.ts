type TTheme = | "dark" | "default";

// Helpers
function applyTheme(theme: TTheme) {
  // if (theme === "dark") {
  //   enableDarkMode({});
  //   followSystemColorScheme({});
  // }
  // else {
  //   disableDarkMode();
  //   followSystemColorScheme(false);
  // }
  const darkThemePath = chrome.runtime.getURL(`ui/themes/${theme}.css`);
  const darkThemeStyleEl = document.createElement("link");
  darkThemeStyleEl.setAttribute("rel", "stylesheet");
  darkThemeStyleEl.setAttribute("type", "text/css");
  darkThemeStyleEl.setAttribute("id", `udemy-plus-${theme}`);
  darkThemeStyleEl.setAttribute("href", darkThemePath);

  document.head.appendChild(darkThemeStyleEl);
}
function discardTheme(theme: TTheme) {
  const targetElement = document.getElementById(`udemy-plus-${theme}`);
  if (targetElement) {
    targetElement.remove();
  }
}

// // Add Playback speeds
// setInterval(() => {
//   if (document.getElementsByTagName('video').length > 0) {
//     if (document.getElementById("playback-rate-menu").parentElement.getElementsByTagName("ul").length > 0) {
//       const ulEl = document.getElementById("playback-rate-menu").parentElement.getElementsByTagName("ul")[0];
//       ulEl.innerHTML = "";
//       <li role="presentation" class=" menu--menu--2Pw42 menu--item--2IgLt active"><a role="menuitem" tabindex="-1" href="javascript:void(0)"><span class="playback-rate--playback-rate--1XOKO">1.75</span></a></li>
//     }
//   }
// }, 1000);

const run = () => {
  // Event listeners
  chrome.storage.onChanged.addListener(function (changes) {
    // Listen for theme change
    if (changes.theme.oldValue !== changes.theme.newValue) {
      discardTheme(changes.theme.oldValue);
      applyTheme(changes.theme.newValue);
    }
  });



  chrome.storage.sync.get(["theme"], (result) => {
    const activeTheme = result.theme || "dark";
    applyTheme(activeTheme);
  });
};

// run();

export { run as themeRunner };
