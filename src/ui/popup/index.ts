function localizeHtmlPage() {
  // Localize by replacing __MSG_***__ meta tags
  const objects = document.getElementsByTagName("html");
  for (let j = 0; j < objects.length; j++) {
    const obj = objects[j];

    const valStrH = obj.innerHTML.toString();
    const valNewH = valStrH.replace(/__MSG_(\w+)__/g, function (match, v1) {
      return v1 ? chrome.i18n.getMessage(v1) : "";
    });

    if (valNewH != valStrH) {
      obj.innerHTML = valNewH;
    }
  }
}

function styleThemeSwitch(theme) {
  theme = theme || "dark";

  if (theme === "dark") {
    document.getElementById("enableDarkTheme").classList.add("active");
    document.getElementById("disableDarkTheme").classList.remove("active");
  }
  else {
    document.getElementById("enableDarkTheme").classList.remove("active");
    document.getElementById("disableDarkTheme").classList.add("active");
  }
}

function toggleDarkTheme(enabled) {
  const theme = enabled ? "dark" : "default";
  console.log(theme);
  chrome.storage.sync.set({ theme }, () => {
    styleThemeSwitch(theme);
  });
}

(() => {
  chrome.storage.sync.get(["theme"], function (result) {
    console.log(result);
    styleThemeSwitch(result.theme);
  });

  localizeHtmlPage();

  document.getElementById("enableDarkTheme").addEventListener("click", function () { toggleDarkTheme(true); });
  document.getElementById("disableDarkTheme").addEventListener("click", function () { toggleDarkTheme(false); });
})();
