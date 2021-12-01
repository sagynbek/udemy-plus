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

  private parseRate = (rate: string) => {
    return parseFloat(rate.split("x")[0]);
  }
  private convertRate = (rate: number) => {
    return rate + "x";
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

    this.updatePlaybackButtonContent(buttonRateIndicator);

    if (this.videoPlayer && this.videoPlayer.playbackRate !== this.preferredVideoPlaybackRate) {
      this.videoPlayer.playbackRate = this.preferredVideoPlaybackRate;
    }
    this.addPlaybackRateToListIfNotExists(this.preferredVideoPlaybackRate);
  }

  private updatePlaybackButtonContent = (buttonRateIndicator: HTMLElement) => {
    const newInnerText = this.preferredVideoPlaybackRate.toString() + "x";
    let nestedButton = buttonRateIndicator;
    while (nestedButton.children.length > 0) {
      nestedButton = nestedButton.children[0] as HTMLElement;
    }

    if (nestedButton.innerText) {
      nestedButton.innerText = newInnerText;
    }
    else if (buttonRateIndicator.innerText) {
      buttonRateIndicator.innerText = newInnerText;
    }
  }

  addNewPlaybackRates = (element: T) => {
    const playbackRateMenuUl = element.querySelector("ul[data-purpose='playback-rate-menu']") as HTMLUListElement;
    if (!playbackRateMenuUl) { return; }

    const allLiRates = playbackRateMenuUl.querySelectorAll("li");
    const rateLiTemplate = allLiRates[0].cloneNode(true) as HTMLElement;
    playbackRateMenuUl.innerHTML = ""; // clears all existing items

    this.allRates.forEach(rate => {
      const itemToAdd = (rateLiTemplate.cloneNode(true) as HTMLElement);

      itemToAdd.addEventListener("click", this.handleChangeVideoPlaybackRate);
      (itemToAdd.querySelector("span") as HTMLSpanElement).innerText = this.convertRate(rate);
      playbackRateMenuUl.appendChild(itemToAdd);
    });

    this.markPreferredRateActive();
  }

  handleChangeVideoPlaybackRate = (e: any) => {
    const newRate = this.parseRate(e.target.innerText);

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
    const allRates = document.querySelectorAll("ul[data-purpose='playback-rate-menu'] li button");

    allRates.forEach((el) => {
      const rate = this.parseRate((el as HTMLElement).innerText);
      el.setAttribute("aria-checked", "false");
      if (rate === this.preferredVideoPlaybackRate) {
        el.setAttribute("aria-checked", "true");
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
