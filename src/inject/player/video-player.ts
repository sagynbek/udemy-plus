import { VideoPlaybackRate } from "./VideoPlaybackRate";
import { PictureInPicture } from './PictureInPicture';


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
}
