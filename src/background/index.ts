(() => {
  function styleThemeSwitch(theme) {
    theme = theme || "dark";

    if (theme === "dark") {
      document.getElementById('enableDarkTheme').classList.add('active');
      document.getElementById('disableDarkTheme').classList.remove('active');
    }
    else {
      document.getElementById('enableDarkTheme').classList.remove('active');
      document.getElementById('disableDarkTheme').classList.add('active');
    }
  }

  function toggleDarkTheme(enabled) {
    const theme = enabled ? "dark" : "default"
    chrome.storage.sync.set({ theme }, () => {
      styleThemeSwitch(theme);
    });
  }


  chrome.storage.sync.get(['theme'], function (result) {
    styleThemeSwitch(result.theme);
  });

  document.getElementById('enableDarkTheme').addEventListener('click', function () { toggleDarkTheme(true); });
  document.getElementById('disableDarkTheme').addEventListener('click', function () { toggleDarkTheme(false); });

})();
