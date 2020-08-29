
interface HTMLPipWindow extends HTMLVideoElement {
  requestPictureInPicture: Function,
}


export class VideoPictureInPicture {
  _video?: HTMLVideoElement;
  _pipFixer?: PictureInPictureFixer;
  pipWindow?: HTMLPipWindow;
  retryTheatreModeTimeout: any;
  pipButton?: HTMLButtonElement;

  get video(): HTMLVideoElement {
    if (!this._video) { throw new Error("Video not found"); }
    return this._video;
  }
  get pipFixer(): PictureInPictureFixer {
    if (!this._pipFixer) { throw new Error("VideoFixer not found"); }
    return this._pipFixer;
  }

  async requestPipOpen() {
    this.video.requestPictureInPicture && await this.video.requestPictureInPicture();
  }

  async requestPipExit() {
    document.exitPictureInPicture && await document.exitPictureInPicture();
  }

  async foundVideoPlayer(video: HTMLVideoElement) {
    this._video = video;
    this._pipFixer = new PictureInPictureFixer(video);
    this.setupPip();
    await this.handleNewVideo();
  }

  /** When video changes, close active PIP, and open new one */
  handleNewVideo = async () => {
    if (this.pipWindow) {
      await this.requestPipExit()
        .catch(err => {
          console.log("Could not close PiP", err);
        });
      this.video.onloadedmetadata = async () => {
        await this.requestPipOpen()
          .catch(err => {
            console.log("Could not open PiP", err);
          });
      }
    }
  }

  removedVideoPlayer(video: HTMLVideoElement) {
    if (!this.pipButton) { return; }
    this.pipButton.remove();
  }

  setupPip() {
    if ('pictureInPictureEnabled' in document) {
      this.video.addEventListener('loadedmetadata', this.setPipButton);
      this.video.addEventListener('emptied', this.setPipButton);

      this.video.addEventListener('enterpictureinpicture', this.onEnterPictureInPicture);
      this.video.addEventListener('leavepictureinpicture', this.onLeavePictureInPicture);

      this.addPipButton();
    }
  }

  addPipButton() {
    const theatreModeButton = document.querySelector("button[data-purpose='theatre-mode-toggle-button']") as HTMLButtonElement;
    if (!theatreModeButton) {
      this.retryTheatreModeTimeout = setTimeout(this.addPipButton, 1000);
      return;
    }
    clearTimeout(this.retryTheatreModeTimeout);

    this.pipButton = theatreModeButton.cloneNode(true) as HTMLButtonElement;
    this.pipButton.addEventListener("click", this.togglePip);

    this.pipButton.classList.add("up-pip-button");

    this.pipButton.setAttribute("aria-label", "");
    this.pipButton.setAttribute("aria-labelledby", "");
    this.pipButton.setAttribute("aria-describedby", "");

    const pipButtonSpan = this.pipButton.querySelector("span");
    if (pipButtonSpan) {
      pipButtonSpan.classList.remove("udi-horizontal-expand");
      pipButtonSpan.style.background = `url("${chrome.runtime.getURL(`icons/pip-icon.png`)}") center center no-repeat`;
    }



    theatreModeButton.insertAdjacentElement("afterend", this.pipButton);

    this.setPipButton();
  }

  setPipButton = () => {
    if (!this.pipButton) { return; } // whenever pipButton will be added, this function will be called

    this.pipButton.disabled = !!(this.video.readyState === 0 || !document.pictureInPictureEnabled || this.video.disablePictureInPicture);
  }

  togglePip = async () => {
    if (!this.pipButton) { return; }

    this.pipButton.disabled = true;
    try {
      if (this.video !== document.pictureInPictureElement) {
        this.requestPipOpen();
      }
      else {
        this.requestPipExit();
      }
    } catch (error) {
      console.log(`UdemyPlus Picture in Picture error! ${error}`);
    } finally {
      this.pipButton.disabled = false;
    }
  }

  onEnterPictureInPicture = (event: any) => {
    this.pipWindow = event.pictureInPictureWindow as HTMLPipWindow;
    this.pipFixer.onEnterPipMode();
  }

  onLeavePictureInPicture = (event: any) => {
    this.pipFixer.onLeavelPipMode();
    this.pipWindow = null;
  }
}


class PictureInPictureFixer {
  stateChangeCounter: number;
  lastStateChange: Date;
  INTERVAL_TO_FIX_STATE_CHANGE: number = 1000;
  constructor(private video: HTMLVideoElement) { }

  onEnterPipMode() {
    this.stateChangeCounter = 0;
    this.lastStateChange = new Date;
    this.onLeavelPipMode();

    this.video.addEventListener('play', this.stateChange);
    this.video.addEventListener('pause', this.stateChange);
  }
  onLeavelPipMode() {
    this.video.removeEventListener('play', this.stateChange);
    this.video.removeEventListener('pause', this.stateChange);
  }


  private stateChange = (e) => {
    this.stateChangeCounter++;

    // @ts-ignore
    const intervalTime = new Date - this.lastStateChange;
    if (intervalTime > this.INTERVAL_TO_FIX_STATE_CHANGE) {
      this.stateChangeCounter = 1;
    }
    else if (this.stateChangeCounter % 2 == 0) {
      this.video.dispatchEvent(new Event("mousedown"));
    }

    this.lastStateChange = new Date;
  }
}
