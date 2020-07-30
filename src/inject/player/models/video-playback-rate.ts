
export class VideoPlaybackRate {
  allRates: Array<number>;
  videoPlayer?: HTMLVideoElement;
  activeVideoPlaybackRate: number = 1;
  useVideoPlaybackRateAsDefault: boolean = false; // Used when extension first loaded, and we want to use users' settings

  constructor() {
    this.allRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];
    this.fetchUserPreferences();
  }

  fetchUserPreferences() {
    chrome.storage.sync.get(['videoPlaybackRate'], (result) => {
      if (!result.videoPlaybackRate) {
        this.useVideoPlaybackRateAsDefault = true;
        return;
      }
      this.activeVideoPlaybackRate = parseFloat(result.videoPlaybackRate);
    });
  }

  foundVideoPlayer(videoPlayer: HTMLVideoElement) {
    this.videoPlayer = videoPlayer;
    this.videoPlayer.addEventListener("ratechange", (e) => {
      this.updatePlaybackRate(); // if playing video, changes playRate, I need to change it back to my settings
    })

    this.updatePlaybackRate();
    this.addNewPlaybackRates();
  }

  addNewPlaybackRates() {
    const playbackRateMenuUl = document.querySelector("div[data-purpose='playback-rate-menu'] ul[role='menu']") as HTMLUListElement;
    if (!playbackRateMenuUl) { return; }

    const allLiRates = playbackRateMenuUl.querySelectorAll("li");
    const rateLiTemplate = allLiRates[0].cloneNode(true) as HTMLElement;
    playbackRateMenuUl.innerHTML = ""; // clears all existing items

    this.allRates.forEach(rate => {
      const itemToAdd = (rateLiTemplate.cloneNode(true) as HTMLElement);

      (itemToAdd.querySelector("a") as HTMLAnchorElement).addEventListener('click', this.handleChangeVideoPlaybackRate);
      (itemToAdd.querySelector("span") as HTMLSpanElement).innerText = rate.toString();
      playbackRateMenuUl.appendChild(itemToAdd);
    });

    this.setActivePlaybackRate();
  }

  setActivePlaybackRate() {
    const allLiRates = document.querySelectorAll("div[data-purpose='playback-rate-menu'] ul[role='menu'] li");

    allLiRates.forEach((liRate) => {
      const rate = parseFloat((liRate as HTMLElement).innerText);
      liRate.classList.remove('active');
      if (rate === this.activeVideoPlaybackRate) {
        liRate.classList.add('active');
      }
    })
  }

  handleChangeVideoPlaybackRate = (e: any) => {
    const newRate = parseFloat(e.target.innerText);

    if (isNaN(newRate)) {
      console.error("Change video playback rate", e.target.innerText, "not a number");
      return;
    }
    this.activeVideoPlaybackRate = newRate;
    this.useVideoPlaybackRateAsDefault = false;
    this.updatePlaybackRate();
    this.setActivePlaybackRate();

    chrome.storage.sync.set({ videoPlaybackRate: newRate });
  }

  updatePlaybackRate() {
    const buttonRateIndicator = document.querySelector("button[data-purpose='playback-rate-button']") as HTMLElement;

    if (this.useVideoPlaybackRateAsDefault && buttonRateIndicator && !isNaN(parseFloat(buttonRateIndicator.innerText))) {
      this.activeVideoPlaybackRate = parseFloat(buttonRateIndicator.innerText);
    }
    if (buttonRateIndicator.innerText) {
      buttonRateIndicator.innerText = this.activeVideoPlaybackRate.toString();
    }
    if (this.videoPlayer && this.videoPlayer.playbackRate !== this.activeVideoPlaybackRate) {
      this.videoPlayer.playbackRate = this.activeVideoPlaybackRate;
    }
    this.addPlaybackRateToList(this.activeVideoPlaybackRate);
  }

  addPlaybackRateToList(newPlaybackRate: number) {
    if (!this.allRates.includes(newPlaybackRate)) {
      this.allRates.push(newPlaybackRate);
      this.allRates.sort((a, b) => a - b);
    }
  }
}
