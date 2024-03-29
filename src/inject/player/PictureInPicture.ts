import { BaseModel } from "inject/models/base-model";
import { PICTURE_IN_PICTURE_ENABLED } from "inject/constants";


export class PictureInPicture<T extends HTMLVideoElement> extends BaseModel<T> {
  permitted = true;
  private pipWindow?: PipWindow;

  constructor() {
    super();

    this.init();
  }

  private async init() {
    await this.subscribeToPreference(PICTURE_IN_PICTURE_ENABLED.key, PICTURE_IN_PICTURE_ENABLED.default, this.setPermition);
    this.onDomAdd(this.validate, this.action);
    this.onDomRemove(this.validate, this.actionOnRemove);
  }

  private setPermition = (permission) => {
    this.permitted = permission && "pictureInPictureEnabled" in document;
  }

  private validate = (element: T) => {
    return this.permitted
      && element.nodeName === "VIDEO";
  }

  private action = async (videoEl: T) => {
    const prevState: IState = this.pipWindow?.state || "None";
    const immediatelyOpenPip = prevState === "ClosedOnVideoFinish";

    this.pipWindow = new PipWindow(videoEl, { immediatelyOpenPip });
  }

  private actionOnRemove = async (videoEl: T) => {
    this.exitPipWindow();
  }

  private exitPipWindow = () => {
    this.pipWindow?.exit("ClosedOnVideoFinish");
  }
}


type IState = | "Waiting" | "Open" | "ManuallyClosed" | "ClosedOnVideoFinish" | "None";
type IExitType = | "ManuallyClosed" | "ClosedOnVideoFinish";
interface IConfig {
  immediatelyOpenPip?: boolean,
}
class PipWindow {
  private pipButton?: HTMLButtonElement;
  private videoPlayer: HTMLVideoElement;
  public state: IState = "Waiting";

  constructor(videoEl: HTMLVideoElement, config: IConfig) {
    this.videoPlayer = videoEl;

    this.init(config);
  }

  public exit = (exitState: IExitType) => {
    this.requestPipExit(exitState);
    this.pipButton?.remove();
  }

  private init = (config: IConfig) => {
    this.videoPlayer.addEventListener("loadedmetadata", this.updatePipButtonState);
    this.videoPlayer.addEventListener("emptied", this.updatePipButtonState);


    this.videoPlayer.addEventListener("enterpictureinpicture", () => {
      this.state = "Open";
    });
    this.videoPlayer.addEventListener("leavepictureinpicture", () => {
      if (this.state === "Open") {
        this.state = "ManuallyClosed";
      }
    });

    this.addPipButton();
    if (config.immediatelyOpenPip) {
      this.immediatelyRequestPip();
    }
  }

  /** When video changes, open new one */
  private immediatelyRequestPip = () => {
    this.videoPlayer.onloadedmetadata = async () => {
      await this.requestPipOpen()
        .catch(err => {
          // If failed to open pip, then listen for user trusted gesture and request again
          console.log("Could not open PiP");
          document.addEventListener("click", this.requestPipOpenOnUserGesture);
        });
    };
  }

  private requestPipOpenOnUserGesture = () => {
    document.removeEventListener("click", this.requestPipOpenOnUserGesture);
    this.requestPipOpen();
  }

  private requestPipOpen = async () => {
    this.videoPlayer.requestPictureInPicture && await this.videoPlayer.requestPictureInPicture();
  }

  private requestPipExit = async (exitState: IExitType) => {
    if (this.state === "Open") {
      this.state = exitState;
      document.exitPictureInPicture && await document.exitPictureInPicture();
    }
  }

  private updatePipButtonState = () => {
    if (!this.pipButton) { return; } // whenever pipButton will be added, this function will be called

    this.pipButton.disabled = !!(this.videoPlayer.readyState === 0 || !document.pictureInPictureEnabled || this.videoPlayer.disablePictureInPicture);
  }

  private addPipButton = () => {
    const playPauseButton = document.querySelector("button[data-purpose='play-button']") || document.querySelector("button[data-purpose='pause-button']") as HTMLButtonElement;

    if (!playPauseButton) {
      setTimeout(this.addPipButton, 1000);
      return;
    }
    // already added
    if (document.querySelector("button[data-purpose='pip-button']")) { return; }

    this.pipButton = playPauseButton.cloneNode(true) as HTMLButtonElement;
    this.pipButton.addEventListener("click", this.togglePip);

    this.pipButton.classList.add("up-pip-button");

    this.pipButton.setAttribute("data-purpose", "pip-button");
    this.pipButton.setAttribute("aria-label", "");
    this.pipButton.setAttribute("aria-labelledby", "");
    this.pipButton.setAttribute("aria-describedby", "");

    this.pipButton.innerHTML = "";
    const pipSpan = document.createElement("span");
    this.pipButton.appendChild(pipSpan);
    pipSpan.style.background = `url("${chrome.runtime.getURL(`icons/pip-icon.png`)}") center center no-repeat`;

    const videoControls = document.querySelector("div[data-purpose='video-controls']") as HTMLDivElement;
    videoControls.appendChild(this.pipButton);

    this.updatePipButtonState();
  }


  private togglePip = async () => {
    if (!this.pipButton) { return; }

    this.pipButton.disabled = true;
    try {
      if (this.videoPlayer !== document.pictureInPictureElement) {
        this.requestPipOpen();
      }
      else {
        this.requestPipExit("ManuallyClosed");
      }
    } catch (error) {
      console.log(`UdemyPlus Picture in Picture error! ${error}`);
    } finally {
      this.pipButton.disabled = false;
    }
  }
}
