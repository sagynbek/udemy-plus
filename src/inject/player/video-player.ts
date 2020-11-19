import { VideoPlaybackRate } from "./models/video-playback-rate";
import { VideoPictureInPicture } from "./models/picture-in-picture";

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


const videoPlaybackRate = new VideoPlaybackRate();
const videoPictureInPicture = new VideoPictureInPicture();

const addedNodeListeners = [addedCourseVideoPlayer];
const removedNodeListeners = [removedCourseVideoPlayer];

function emitAddedNode(addedNode: Node, mutation: MutationRecord) {
  addedNodeListeners.forEach(listener => listener(addedNode, mutation));
}
function emitRemovedNode(removedNode: Node, mutation: MutationRecord) {
  removedNodeListeners.forEach(listener => listener(removedNode, mutation));
}


function addedCourseVideoPlayer(addedNode: Node, mutation: MutationRecord) {
  if (addedNode.nodeName === "VIDEO") {
    videoPlaybackRate.foundVideoPlayer(addedNode as HTMLVideoElement);
    videoPictureInPicture.foundVideoPlayer(addedNode as HTMLVideoElement);
  }
}
function removedCourseVideoPlayer(removedNode: Node, mutation: MutationRecord) {
  if (removedNode.nodeName === "VIDEO") {
    videoPictureInPicture.removedVideoPlayer(removedNode as HTMLVideoElement);
  }
}


export {
  emitAddedNode as emitAddedVideoPlayer,
  emitRemovedNode as emitRemovedVideoPlayer,
};
