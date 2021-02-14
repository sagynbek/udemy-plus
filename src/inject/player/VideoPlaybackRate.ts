import { BaseModel } from "inject/models/base-model";
import { EXTENDED_VIDEO_PLAYBACK_RATE_ENABLED, PREFERRED_VIDEO_PLAYBACK_RATE, EXTENDED_VIDEO_PLAYBACK_RATES } from "inject/constants";


export class VideoPlaybackRate<T extends HTMLVideoElement> extends BaseModel<T> {
  permitted = true;
  allRates: Array<number> = EXTENDED_VIDEO_PLAYBACK_RATES;
  preferredVideoPlaybackRate = 1;
  videoPlayer?: HTMLVideoElement;

  constructor() {
    super();

    this.init();
  }

  private async init() {
    await this.subscribeToPreference(EXTENDED_VIDEO_PLAYBACK_RATE_ENABLED.key, EXTENDED_VIDEO_PLAYBACK_RATE_ENABLED.default, this.setPermition);
    await this.subscribeToPreference(PREFERRED_VIDEO_PLAYBACK_RATE.key, PREFERRED_VIDEO_PLAYBACK_RATE.default, this.setPreferredVideoPlaybackRate);
    this.onDomAdd(this.validate, this.action);
    this.onDomAdd(this.validatePlaybackRateBtn, this.actionOnPlaybackRateBtn);
  }

  private setPermition = (permission) => {
    this.permitted = permission;
  }

  private setPreferredVideoPlaybackRate = (rate) => {
    this.preferredVideoPlaybackRate = parseFloat(rate);
  }

  private validate = (element: T) => {
    return this.permitted
      && element.nodeName === "VIDEO"
  }
  private action = (videoEl: T) => {
    try {
      this.videoPlayer = videoEl as HTMLVideoElement;
      this.videoPlayer.addEventListener("ratechange", (e) => {
        this.updatePlaybackRate(); // if playing video, changes playRate, I need to change it back to my settings
      });
    } catch (err) {
      console.warn("Error occured on PlaybackRate modification");
    }
  }

  private validatePlaybackRateBtn = (element: T) => {
    return this.permitted
      && element.nodeName === "DIV"
      && !!element.querySelector("button[data-purpose='playback-rate-button']")
  }
  private actionOnPlaybackRateBtn = (element: T) => {
    this.updatePlaybackRate();
    this.addNewPlaybackRates(element);
  }

  private updatePlaybackRate = () => {
    const buttonRateIndicator = document.querySelector("button[data-purpose='playback-rate-button']") as HTMLElement;
    if (!buttonRateIndicator) { return; }

    if (buttonRateIndicator.innerText) {
      buttonRateIndicator.innerText = this.preferredVideoPlaybackRate.toString();
    }
    if (this.videoPlayer && this.videoPlayer.playbackRate !== this.preferredVideoPlaybackRate) {
      this.videoPlayer.playbackRate = this.preferredVideoPlaybackRate;
    }
    this.addPlaybackRateToListIfNotExists(this.preferredVideoPlaybackRate);
  }

  addNewPlaybackRates = (element: T) => {
    const playbackRateMenuUl = element.querySelector("div[data-purpose='playback-rate-menu'] ul[role='menu']") as HTMLUListElement;
    if (!playbackRateMenuUl) { return; }

    const allLiRates = playbackRateMenuUl.querySelectorAll("li");
    const rateLiTemplate = allLiRates[0].cloneNode(true) as HTMLElement;
    playbackRateMenuUl.innerHTML = ""; // clears all existing items

    this.allRates.forEach(rate => {
      const itemToAdd = (rateLiTemplate.cloneNode(true) as HTMLElement);

      itemToAdd.addEventListener("click", this.handleChangeVideoPlaybackRate);
      (itemToAdd.querySelector("span") as HTMLSpanElement).innerText = rate.toString();
      playbackRateMenuUl.appendChild(itemToAdd);
    });

    this.markPreferredRateActive();
  }

  handleChangeVideoPlaybackRate = (e: any) => {
    const newRate = parseFloat(e.target.innerText);

    if (isNaN(newRate)) {
      console.error("Change video playback rate", e.target.innerText, "not a number");
      return;
    }
    this.preferredVideoPlaybackRate = newRate;
    this.updatePlaybackRate();
    this.markPreferredRateActive();

    this.setPreference(PREFERRED_VIDEO_PLAYBACK_RATE.key, newRate);
  }

  markPreferredRateActive = () => {
    const allLiRates = document.querySelectorAll("div[data-purpose='playback-rate-menu'] ul[role='menu'] li");

    allLiRates.forEach((liRate) => {
      const rate = parseFloat((liRate as HTMLElement).innerText);
      liRate.classList.remove("active");
      if (rate === this.preferredVideoPlaybackRate) {
        liRate.classList.add("active");
      }
    });
  }

  addPlaybackRateToListIfNotExists = (newPlaybackRate: number) => {
    if (!this.allRates.includes(newPlaybackRate)) {
      this.allRates.push(newPlaybackRate);
      this.allRates.sort((a, b) => a - b);
    }
  }
}
