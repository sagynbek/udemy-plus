export interface IConstant {
  key: string,
  default: boolean | number,
}

export const SECTION_COMPLETE_TOGGLE_ENABLED = { key: "SECTION_COMPLETE_TOGGLE_ENABLED", default: true };
export const EXTENDED_VIDEO_PLAYBACK_RATE_ENABLED = { key: "EXTENDED_VIDEO_PLAYBACK_RATE_ENABLED", default: true };
export const PREFERRED_VIDEO_PLAYBACK_RATE = { key: "PREFERRED_VIDEO_PLAYBACK_RATE", default: 1 };
export const EXTENDED_VIDEO_PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];