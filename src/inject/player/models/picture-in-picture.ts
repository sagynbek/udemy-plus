
interface HTMLPipWindow extends HTMLVideoElement {
  requestPictureInPicture: Function,
}


export class VideoPictureInPicture {
  _video?: HTMLVideoElement;
  pipWindow?: HTMLPipWindow;
  retryTheatreModeTimeout: any;
  pipButton?: HTMLButtonElement;

  get video(): HTMLVideoElement {
    if (!this._video) { throw new Error("Video not found"); }
    return this._video;
  }

  foundVideoPlayer(video: HTMLVideoElement) {
    this._video = video;

    debugger
    this.setupPip();
  }

  removedVideoPlayer(video: HTMLVideoElement) {
    this.pipButton?.remove();
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

    // console.log('Toggling Picture-in-Picture...');
    this.pipButton.disabled = true;
    try {

      if (this.video !== document.pictureInPictureElement) {
        this.video.requestPictureInPicture && await this.video.requestPictureInPicture();
      }
      else {
        document.exitPictureInPicture && await document.exitPictureInPicture();
      }

    } catch (error) {
      console.log(`UdemyPlus Picture in Picture error! ${error}`);
    } finally {
      this.pipButton.disabled = false;
    }
  }

  onEnterPictureInPicture = (event: any) => {
    // console.log('> Video entered Picture-in-Picture');

    this.pipWindow = event.pictureInPictureWindow as HTMLPipWindow;
  }

  onLeavePictureInPicture = (event: any) => {
    // console.log('> Video left Picture-in-Picture');
  }
}
