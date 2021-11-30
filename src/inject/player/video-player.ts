import { VideoPlaybackRate } from "./VideoPlaybackRate";
import { PictureInPicture } from './PictureInPicture';
import { VideoNavigator } from "./VideoNavigator";


declare global {
  interface HTMLVideoElement {
    requestPictureInPicture?: () => void,
    disablePictureInPicture?: boolean,
  }
  interface Document {
    pictureInPictureElement?: HTMLElement,
    exitPictureInPicture?: () => Promise<void>,
    pictureInPictureEnabled?: boolean,
  }
}

export const initVideoPlayer = () => {
  new VideoPlaybackRate();
  new PictureInPicture();
  new VideoNavigator();
}
