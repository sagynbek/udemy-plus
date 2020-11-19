import { VideoPlaybackRate } from "./models/video-playback-rate";
import { VideoPictureInPicture } from "./models/picture-in-picture";

declare global {
  interface HTMLVideoElement {
    requestPictureInPicture?: Function,
    disablePictureInPicture?: boolean,
  }
  interface Document {
    pictureInPictureElement?: HTMLElement,
    exitPictureInPicture?: () => Promise<void>,
    pictureInPictureEnabled?: boolean,
  }
}


const videoPlaybackRate = new VideoPlaybackRate();
const videoPictureInPicture = new VideoPictureInPicture();

const addedNodeListeners = [addedCourseVideoPlayer];
const removedNodeListeners = [removedCourseVideoPlayer];

function emitAddedNode(addedNode: HTMLElement, mutation: MutationRecord) {
  addedNodeListeners.forEach(listener => listener(addedNode, mutation));
}
function emitRemovedNode(removedNode: HTMLElement, mutation: MutationRecord) {
  removedNodeListeners.forEach(listener => listener(removedNode, mutation));
}


function addedCourseVideoPlayer(addedNode: HTMLElement, mutation: MutationRecord) {
  if (addedNode.localName === "video") {
    videoPlaybackRate.foundVideoPlayer(addedNode as HTMLVideoElement);
    videoPictureInPicture.foundVideoPlayer(addedNode as HTMLVideoElement);
  }
}
function removedCourseVideoPlayer(removedNode: HTMLElement, mutation: MutationRecord) {
  if (removedNode.localName === "video") {
    videoPictureInPicture.removedVideoPlayer(removedNode as HTMLVideoElement);
  }
}


export {
  emitAddedNode as emitAddedVideoPlayer,
  emitRemovedNode as emitRemovedVideoPlayer,
};
